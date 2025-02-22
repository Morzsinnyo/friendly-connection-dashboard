
import { Button } from "@/components/ui/button";
import { Contact, ContactInsert } from "@/api/types/contacts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { LoadingState } from "@/components/common/LoadingState";

interface VCardFieldMappingProps {
  contacts: Partial<Contact>[];
}

export function VCardFieldMapping({ contacts }: VCardFieldMappingProps) {
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({
    FN: 'full_name',
    EMAIL: 'email',
    TEL: 'mobile_phone',
    ORG: 'company',
  });
  const [isImporting, setIsImporting] = useState(false);
  const queryClient = useQueryClient();

  const availableFields = [
    { value: 'full_name', label: 'Full Name' },
    { value: 'email', label: 'Email' },
    { value: 'mobile_phone', label: 'Mobile Phone' },
    { value: 'business_phone', label: 'Business Phone' },
    { value: 'company', label: 'Company' },
    { value: 'job_title', label: 'Job Title' },
  ];

  const handleImport = async () => {
    try {
      setIsImporting(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Prepare contacts for insert - ensure they match ContactInsert type
      const contactsToInsert: ContactInsert[] = contacts.map(contact => {
        // Ensure full_name is present and valid
        if (!contact.full_name) {
          throw new Error('Contact is missing required full_name field');
        }

        // Create a properly typed contact object
        const newContact: ContactInsert = {
          full_name: contact.full_name,
          user_id: user.id,
          email: contact.email || null,
          business_phone: contact.business_phone || null,
          mobile_phone: contact.mobile_phone || null,
          company: contact.company || null,
          job_title: contact.job_title || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        return newContact;
      });

      // Insert contacts
      const { data, error } = await supabase
        .from('contacts')
        .insert(contactsToInsert)
        .select();

      if (error) throw error;

      // Invalidate contacts query to refresh the list
      await queryClient.invalidateQueries({ queryKey: ['contacts'] });
      
      toast.success(`Successfully imported ${contacts.length} contacts`);
    } catch (error) {
      console.error('Error importing contacts:', error);
      toast.error('Failed to import contacts');
    } finally {
      setIsImporting(false);
    }
  };

  if (isImporting) {
    return <LoadingState message="Importing contacts..." />;
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {Object.entries(fieldMapping).map(([vcfField, dbField]) => (
          <div key={vcfField} className="flex items-center gap-4">
            <p className="w-32 text-sm font-medium">{vcfField}</p>
            <Select
              value={dbField}
              onValueChange={(value) =>
                setFieldMapping(prev => ({ ...prev, [vcfField]: value }))
              }
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableFields.map(field => (
                  <SelectItem key={field.value} value={field.value}>
                    {field.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button onClick={handleImport}>
          Import {contacts.length} Contacts
        </Button>
      </div>
    </div>
  );
}
