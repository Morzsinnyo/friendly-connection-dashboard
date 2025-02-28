
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FeedbackModal } from "./FeedbackModal";

export function RandomFeedbackPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  
  useEffect(() => {
    // Check if we've shown the prompt recently
    const lastPrompt = localStorage.getItem('lastFeedbackPrompt');
    const hasSeenPrompt = lastPrompt && 
      (Date.now() - parseInt(lastPrompt) < 7 * 24 * 60 * 60 * 1000); // 7 days
    
    if (!hasSeenPrompt) {
      // Show prompt after random delay between 1-3 minutes
      const delay = Math.floor(Math.random() * (3 * 60 * 1000 - 1 * 60 * 1000) + 1 * 60 * 1000);
      const timer = setTimeout(() => {
        setShowPrompt(true);
        localStorage.setItem('lastFeedbackPrompt', Date.now().toString());
      }, delay);
      
      return () => clearTimeout(timer);
    }
  }, []);
  
  const handleResponse = (isHappy: boolean) => {
    setShowPrompt(false);
    
    if (!isHappy) {
      // Show feedback form if user isn't happy
      setShowFeedback(true);
    }
  };
  
  return (
    <>
      <Dialog open={showPrompt} onOpenChange={setShowPrompt}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogTitle>Enjoying the app?</DialogTitle>
          <DialogDescription>
            We'd love to know if you're having a good experience.
          </DialogDescription>
          
          <div className="flex justify-center space-x-8 py-6">
            <Button 
              variant="outline" 
              onClick={() => handleResponse(false)}
              className="h-16 w-16 rounded-full"
            >
              No 😕
            </Button>
            <Button 
              onClick={() => handleResponse(true)}
              className="h-16 w-16 rounded-full bg-green-500 hover:bg-green-600"
            >
              Yes 😊
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <FeedbackModal 
        open={showFeedback} 
        onOpenChange={setShowFeedback} 
      />
    </>
  );
}
