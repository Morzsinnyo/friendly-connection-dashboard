
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Contact } from "@/api/types/contacts";
import { FileUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface FileUploaderProps {
  onFileProcessed: (contacts: Partial<Contact>[]) => void;
}

export function FileUploader({ onFileProcessed }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const processVCFFile = async (file: File) => {
    try {
      // TODO: Implement actual VCF parsing
      // This is a placeholder to demonstrate the UI flow
      const dummyContacts: Partial<Contact>[] = [
        {
          id: '1',
          full_name: 'John Doe',
          email: 'john@example.com',
          mobile_phone: '+1234567890'
        },
        {
          id: '2',
          full_name: 'Jane Smith',
          email: 'jane@example.com',
          business_phone: '+0987654321'
        }
      ];
      
      onFileProcessed(dummyContacts);
    } catch (error) {
      console.error('Error processing VCF file:', error);
      toast.error('Error processing contact file');
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.vcf')) {
      processVCFFile(file);
    } else {
      toast.error('Please upload a valid VCF file');
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith('.vcf')) {
      processVCFFile(file);
    } else {
      toast.error('Please upload a valid VCF file');
    }
  };

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
            Drag and drop your VCF file here, or click to select
          </p>
          <p className="text-sm text-muted-foreground">
            Supports .vcf files exported from Apple Contacts or other services
          </p>
        </div>
        <Input
          type="file"
          accept=".vcf"
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
