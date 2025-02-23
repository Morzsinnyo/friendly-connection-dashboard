
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { FileUploader } from "./FileUploader";
import { ContactPreviewList } from "./ContactPreviewList";
import { Contact } from "@/api/types/contacts";

interface ImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ImportStep = 'upload' | 'preview';

export function ImportModal({ open, onOpenChange }: ImportModalProps) {
  const [currentStep, setCurrentStep] = useState<ImportStep>('upload');
  const [parsedContacts, setParsedContacts] = useState<Partial<Contact>[]>([]);

  const handleFileProcessed = (contacts: Partial<Contact>[]) => {
    setParsedContacts(contacts);
    setCurrentStep('preview');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'upload':
        return <FileUploader onFileProcessed={handleFileProcessed} />;
      case 'preview':
        return (
          <ContactPreviewList
            contacts={parsedContacts}
            onContactsSelected={async (selectedIds) => {
              const selectedContacts = parsedContacts.filter(c => 
                selectedIds.includes(c.id || '')
              );
              // Close modal after selection
              onOpenChange(false);
              // Reset state
              setCurrentStep('upload');
              setParsedContacts([]);
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {currentStep === 'upload' && "Import Contacts"}
            {currentStep === 'preview' && "Select Contacts"}
          </DialogTitle>
        </DialogHeader>
        {renderStep()}
      </DialogContent>
    </Dialog>
  );
}
