
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { FileUploader } from "./FileUploader";
import { ContactPreviewList } from "./ContactPreviewList";
import { VCardFieldMapping } from "./VCardFieldMapping";
import { Contact } from "@/api/types/contacts";

interface ImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ImportStep = 'upload' | 'preview' | 'mapping';

export function ImportModal({ open, onOpenChange }: ImportModalProps) {
  const [currentStep, setCurrentStep] = useState<ImportStep>('upload');
  const [parsedContacts, setParsedContacts] = useState<Partial<Contact>[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);

  const handleFileProcessed = (contacts: Partial<Contact>[]) => {
    setParsedContacts(contacts);
    setCurrentStep('preview');
  };

  const handleContactsSelected = (selectedIds: string[]) => {
    setSelectedContacts(selectedIds);
    setCurrentStep('mapping');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'upload':
        return <FileUploader onFileProcessed={handleFileProcessed} />;
      case 'preview':
        return (
          <ContactPreviewList
            contacts={parsedContacts}
            onContactsSelected={handleContactsSelected}
          />
        );
      case 'mapping':
        return (
          <VCardFieldMapping
            contacts={parsedContacts.filter(c => 
              selectedContacts.includes(c.id || '')
            )}
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
            {currentStep === 'mapping' && "Review Fields"}
          </DialogTitle>
        </DialogHeader>
        {renderStep()}
      </DialogContent>
    </Dialog>
  );
}
