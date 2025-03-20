
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileUploader } from "@/components/contacts/import/FileUploader";
import { ImportModal } from "@/components/contacts/import/ImportModal";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Upload, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface OnboardingContactsProps {
  onNext: () => void;
  onBack: () => void;
}

export function OnboardingContacts({ onNext, onBack }: OnboardingContactsProps) {
  const [showImport, setShowImport] = useState(false);
  const navigate = useNavigate();
  
  const handleCreateContact = () => {
    // Store the fact that we're in onboarding flow to return back here
    sessionStorage.setItem('returnToOnboarding', 'true');
    navigate('/dashboard/contact/create');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="bg-primary/10 p-4 rounded-full mb-4">
          <Users className="h-12 w-12 text-primary" />
        </div>
        
        <h2 className="text-2xl font-bold">Add your contacts</h2>
        <p className="text-muted-foreground">
          Import your existing contacts or create new ones to get started.
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowImport(true)}>
          <CardContent className="p-6 flex flex-col items-center text-center">
            <Upload className="h-10 w-10 text-primary mb-4" />
            <h3 className="font-medium text-lg">Import Contacts</h3>
            <p className="text-sm text-muted-foreground">
              Import from CSV, vCard, or LinkedIn
            </p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleCreateContact}>
          <CardContent className="p-6 flex flex-col items-center text-center">
            <Plus className="h-10 w-10 text-primary mb-4" />
            <h3 className="font-medium text-lg">Create Contact</h3>
            <p className="text-sm text-muted-foreground">
              Add a new contact manually
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext}>
          Continue
        </Button>
      </div>
      
      <ImportModal 
        open={showImport} 
        onOpenChange={(open) => {
          setShowImport(open);
          // If closing and we have contacts, move to next step
          if (!open) {
            // We could check if contacts were added here
            // For now, just let the user proceed manually
          }
        }} 
      />
    </div>
  );
}
