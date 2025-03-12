import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { FileUploader } from "./FileUploader";
import { ContactPreviewList } from "./ContactPreviewList";
import { Contact, ContactInsert } from "@/api/types/contacts";
import { contactMutations } from "@/api/services/contacts";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { LoadingState } from "@/components/common/LoadingState";

interface ImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ImportStep = 'upload' | 'preview' | 'importing';

export function ImportModal({ open, onOpenChange }: ImportModalProps) {
  const [currentStep, setCurrentStep] = useState<ImportStep>('upload');
  const [parsedContacts, setParsedContacts] = useState<Partial<Contact>[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importSource, setImportSource] = useState<'vcf' | 'csv' | 'linkedin' | ''>('');

  const handleFileProcessed = (contacts: Partial<Contact>[], fileName: string) => {
    setParsedContacts(contacts);
    
    // Detect file type
    if (fileName.endsWith('.vcf')) {
      setImportSource('vcf');
    } else if (fileName.endsWith('.csv')) {
      // Try to determine if it's a LinkedIn export based on the data
      const hasLinkedInFields = contacts.some(c => c.company || c.job_title);
      setImportSource(hasLinkedInFields ? 'linkedin' : 'csv');
    }
    
    setCurrentStep('preview');
  };

  const importContacts = async (selectedIds: string[]) => {
    try {
      setIsImporting(true);
      setCurrentStep('importing');
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("You must be logged in to import contacts");
        setIsImporting(false);
        return;
      }
      
      // Filter the selected contacts
      const selectedContacts = parsedContacts.filter(c => 
        selectedIds.includes(c.id || '')
      );
      
      // Use a counter to track progress
      let successCount = 0;
      let errorCount = 0;
      
      // Insert contacts one by one to handle errors better
      for (const contact of selectedContacts) {
        // Skip contacts without a full name (required field)
        if (!contact.full_name) {
          console.error("Skipping contact without full name:", contact);
          errorCount++;
          continue;
        }
        
        // Create a properly typed ContactInsert object
        const contactToInsert: ContactInsert = {
          full_name: contact.full_name,
          user_id: user.id,
          email: contact.email || null,
          mobile_phone: contact.mobile_phone || null,
          business_phone: contact.business_phone || null,
          company: contact.company || null,
          job_title: contact.job_title || null,
          linkedin_url: contact.linkedin_url || null
          // Other fields will use their default values from the database
        };
        
        const result = await contactMutations.create(contactToInsert);
        if (result.data) {
          successCount++;
        } else {
          errorCount++;
          console.error("Error importing contact:", result.error);
        }
      }
      
      // Show success or error message
      if (successCount > 0) {
        toast.success(`Successfully imported ${successCount} contacts`);
      }
      
      if (errorCount > 0) {
        toast.error(`Failed to import ${errorCount} contacts`);
      }
      
      // Close modal and reset state
      onOpenChange(false);
      setCurrentStep('upload');
      setParsedContacts([]);
      setImportSource('');
      
    } catch (error) {
      console.error("Error during import:", error);
      toast.error("An error occurred while importing contacts");
    } finally {
      setIsImporting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'upload':
        return <FileUploader onFileProcessed={(contacts, fileName) => handleFileProcessed(contacts, fileName)} />;
      case 'preview':
        return (
          <ContactPreviewList
            contacts={parsedContacts}
            onContactsSelected={importContacts}
            importSource={importSource}
          />
        );
      case 'importing':
        return <LoadingState message="Importing contacts..." />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      // Prevent closing during import
      if (isImporting && !isOpen) {
        return;
      }
      onOpenChange(isOpen);
    }}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {currentStep === 'upload' && "Import Contacts"}
            {currentStep === 'preview' && importSource === 'linkedin' && "Select LinkedIn Contacts"}
            {currentStep === 'preview' && importSource === 'csv' && "Select CSV Contacts"}
            {currentStep === 'preview' && importSource === 'vcf' && "Select Contacts"}
            {currentStep === 'importing' && "Importing Contacts"}
          </DialogTitle>
        </DialogHeader>
        {renderStep()}
      </DialogContent>
    </Dialog>
  );
}
