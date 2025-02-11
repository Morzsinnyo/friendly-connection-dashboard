
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { landingMutations } from "@/api/services/landing/mutations";

export function EmailCollectionForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await landingMutations.subscribeEmail(email);
      
      if (error) throw error;
      
      toast({
        title: "Thank you for subscribing!",
        description: "You've been successfully added to our mailing list.",
      });
      
      setEmail("");
    } catch (error) {
      console.error('Error subscribing:', error);
      toast({
        title: "Subscription failed",
        description: "This email may already be subscribed or there was an error. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          type="email"
          placeholder="Your Email..."
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 h-12 text-lg rounded-full border-2 border-gray-200 focus:border-[#17B978] px-6"
          disabled={isLoading}
          required
        />
        <Button 
          type="submit" 
          disabled={isLoading}
          className="h-12 px-8 text-lg font-medium bg-[#A7FF83] text-[#071A52] hover:bg-[#A7FF83]/90 rounded-full"
        >
          {isLoading ? "Processing..." : "Join Free"}
        </Button>
      </div>
    </form>
  );
}
