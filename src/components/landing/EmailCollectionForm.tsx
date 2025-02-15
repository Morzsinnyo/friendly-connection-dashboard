
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { landingMutations } from "@/api/services/landing/mutations";

export function EmailCollectionForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

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
      const { success, error } = await landingMutations.subscribeEmail(email);
      
      if (success) {
        toast({
          title: "Thank you for subscribing!",
          description: "You've been successfully added to our mailing list.",
        });
        setEmail("");
        // For now, we'll redirect to /dashboard. You can change this route later
        navigate("/dashboard");
      } else {
        throw error;
      }
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
    <form onSubmit={handleSubmit} className="w-full max-w-2xl">
      <div className="flex gap-4">
        <Input
          type="email"
          placeholder="Your Email..."
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 px-6 py-6 text-lg border-2 border-[#071A52] rounded-full focus:ring-[#A7FF83]"
          disabled={isLoading}
          required
        />
        <Button 
          type="submit" 
          disabled={isLoading}
          className="px-8 py-6 text-lg font-semibold bg-[#A7FF83] text-[#071A52] rounded-full hover:bg-[#A7FF83]/90"
        >
          {isLoading ? "Processing..." : "Join Free"}
        </Button>
      </div>
    </form>
  );
}
