
import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeedbackModal } from "./FeedbackModal";

export function FeedbackButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 shadow-lg rounded-full h-12 w-12 p-0 z-50"
      >
        <MessageSquare className="h-5 w-5" />
        <span className="sr-only">Give Feedback</span>
      </Button>
      
      <FeedbackModal open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}
