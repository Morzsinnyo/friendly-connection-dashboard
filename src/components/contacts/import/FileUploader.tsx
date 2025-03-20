import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Contact } from "@/api/types/contacts";
import { FileUp } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { processVCFFile } from "@/api/services/contacts/import/vcfParser";
import { processCSVFile } from "@/api/services/contacts/import/csvParser";
import { processLinkedInCSV } from "@/api/services/contacts/import/linkedinParser";
import { LoadingState } from "@/components/common/LoadingState";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface FileUploaderProps {
  onFileProcessed: (contacts: Partial<Contact>[], fileName: string) => void;
}

export function FileUploader({ onFileProcessed }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if a CSV file is likely a LinkedIn export
  const isLikelyLinkedInCSV = async (file: File): Promise<boolean> => {
    try {
      // Read the first few lines of the file
      const reader = new FileReader();
      const firstChunk = await new Promise<string>((resolve) => {
        reader.onload = (e) => resolve(e.target?.result as string || "");
        // Read just the beginning of the file to search for headers
        const blob = file.slice(0, 3000); // Increased to capture more potential rows
        reader.readAsText(blob);
      });
      
      const firstLines = firstChunk.split('\n').slice(0, 10); // Check first 10 lines
      
      // LinkedIn exports typically have these headers
      const linkedInMarkers = [
        "First Name",
        "Last Name",
        "Email Address",
        "Company",
        "Position",
        "Connected On",
        "Profile URL",
        "URL"  // Adding "URL" as an alternative for profile URL
      ];
      
      // Look for LinkedIn headers in any of the first 10 lines
      for (const line of firstLines) {
        if (!line.trim()) continue;
        
        // Count how many LinkedIn markers are present in this line
        let markerCount = 0;
        for (const marker of linkedInMarkers) {
          if (line.includes(marker)) markerCount++;
        }
        
        // If we have at least 3 of the markers, it's likely a LinkedIn export
        if (markerCount >= 3) {
          console.log("Detected LinkedIn CSV format headers");
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error("Error checking for LinkedIn CSV:", error);
      return false;
    }
  };

  const handleFile = async (file: File) => {
    try {
      setIsProcessing(true);
      setError(null);
      
      let contacts: Partial<Contact>[] = [];
      
      // Process the file based on its extension
      if (file.name.endsWith('.vcf')) {
        contacts = await processVCFFile(file);
      } else if (file.name.endsWith('.csv')) {
        // Check if this is a LinkedIn export
        const isLinkedIn = await isLikelyLinkedInCSV(file);
        
        if (isLinkedIn) {
          console.log("Using LinkedIn CSV parser");
          contacts = await processLinkedInCSV(file);
        } else {
          console.log("Using generic CSV parser");
          contacts = await processCSVFile(file);
        }
      } else {
        throw new Error('Unsupported file format');
      }
      
      if (contacts.length === 0) {
        console.error('No valid contacts found in the file');
        
        // Set a more specific error message based on file type
        if (file.name.endsWith('.csv')) {
          setError(`No valid contacts found in the CSV file. 

For LinkedIn exports, please make sure:
- The file contains "First Name" and "Last Name" columns
- These columns have data for at least some rows
- Note that the parser now scans the first 10 rows for headers

For other CSV files:
- Make sure the file has clear column headers
- Columns for name information are present`);
        } else {
          setError('No valid contacts found in the file. Please make sure your VCF file contains valid contact information.');
        }
        return;
      }
      
      toast.success(`Found ${contacts.length} contacts`);
      onFileProcessed(contacts, file.name);
    } catch (error) {
      console.error('Error processing file:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(`Error processing ${file.name.endsWith('.csv') ? 'CSV' : 'VCF'} file: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);
    
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.vcf') || file.name.endsWith('.csv'))) {
      handleFile(file);
    } else {
      toast.error('Please upload a valid VCF or CSV file');
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.name.endsWith('.vcf') || file.name.endsWith('.csv')) {
        handleFile(file);
      } else {
        toast.error('Please upload a valid VCF or CSV file');
      }
      
      // Reset the input value so the same file can be selected again
      e.target.value = '';
    }
  };

  const handleSelectFileClick = () => {
    fileInputRef.current?.click();
  };

  if (isProcessing) {
    return <LoadingState message="Processing contacts..." />;
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error processing file</AlertTitle>
          <AlertDescription className="whitespace-pre-line">
            {error}
          </AlertDescription>
        </Alert>
      )}
      
      <div
        className={`
          border-2 border-dashed rounded-lg p-8
          ${isDragging ? 'border-primary bg-primary/5' : 'border-border'}
          transition-colors duration-200
        `}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <FileUp className="h-12 w-12 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">
              Drag and drop your contact file here, or click to select
            </p>
            <p className="text-sm text-muted-foreground">
              Supports LinkedIn exports (.csv) and VCF files (.vcf) from Apple Contacts or other services
            </p>
          </div>
          <Input
            type="file"
            accept=".vcf,.csv"
            onChange={handleFileInput}
            className="hidden"
            id="file-upload"
            ref={fileInputRef}
          />
          <Button variant="outline" onClick={handleSelectFileClick}>
            Select File
          </Button>
        </div>
      </div>
    </div>
  );
}
