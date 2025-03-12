
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Contact } from "@/api/types/contacts";
import { FileUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { processVCFFile } from "@/api/services/contacts/import/vcfParser";
import { processCSVFile } from "@/api/services/contacts/import/csvParser";
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

  const handleFile = async (file: File) => {
    try {
      setIsProcessing(true);
      setError(null);
      
      let contacts: Partial<Contact>[] = [];
      
      // Process the file based on its extension
      if (file.name.endsWith('.vcf')) {
        contacts = await processVCFFile(file);
      } else if (file.name.endsWith('.csv')) {
        contacts = await processCSVFile(file);
      } else {
        throw new Error('Unsupported file format');
      }
      
      if (contacts.length === 0) {
        console.error('No valid contacts found in the file');
        
        // Set a more specific error message based on file type
        if (file.name.endsWith('.csv')) {
          setError(`No valid contacts found in the CSV file. This might be because:
          - The file format doesn't match our expected format
          - Required fields (like names) are missing
          - Column headers don't match expected patterns
          
          Please check your CSV file and try again. LinkedIn exports and standard CSV formats with name fields should work.`);
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
          />
          <Button variant="outline" asChild>
            <label htmlFor="file-upload" className="cursor-pointer">
              Select File
            </label>
          </Button>
        </div>
      </div>
    </div>
  );
}
