
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { ImportModal } from "./ImportModal";
import { useState } from "react";

export function ImportContactsButton() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Button 
        variant="outline" 
        onClick={() => setShowModal(true)}
        className="gap-2"
      >
        <Upload className="h-4 w-4" />
        Import Contacts
      </Button>
      <ImportModal 
        open={showModal} 
        onOpenChange={setShowModal}
      />
    </>
  );
}
