
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Contact } from "@/api/types/contacts";
import { FileUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { processVCFFile } from "@/api/services/contacts/import/vcfParser";
import { processCSVFile } from "@/api/services/contacts/import/csvParser";
import { LoadingState } from "@/components/common/LoadingState";

interface FileUploaderProps {
  onFileProcessed: (contacts: Partial<Contact>[], fileName: string) => void;
}

export function FileUploader({ onFileProcessed }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFile = async (file: File) => {
    try {
      setIsProcessing(true);
      
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
        toast.error('No valid contacts found in the file');
        return;
      }
      
      toast.success(`Found ${contacts.length} contacts`);
      onFileProcessed(contacts, file.name);
    } catch (error) {
      console.error('Error processing file:', error);
      toast.error(`Error processing ${file.name.endsWith('.csv') ? 'CSV' : 'VCF'} file`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.vcf') || file.name.endsWith('.csv'))) {
      handleFile(file);
    } else {
      toast.error('Please upload a valid VCF or CSV file');
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.name.endsWith('.vcf') || file.name.endsWith('.csv'))) {
      handleFile(file);
    } else {
      toast.error('Please upload a valid VCF or CSV file');
    }
  };

  if (isProcessing) {
    return <LoadingState message="Processing contacts..." />;
  }

  return (
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
  );
}
