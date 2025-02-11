
import { useState } from "react";
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
    <form onSubmit={handleSubmit} className="w-full max-w-[1125px] mx-auto">
      <div className="flex gap-5 max-md:flex-col">
        <div className="flex-1">
          <input
            type="email"
            placeholder="Your Email..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-16 py-9 text-3xl font-semibold text-gray-400 bg-white border-4 border-[#071A52] rounded-[51px] focus:outline-none focus:border-[#17B978] max-md:px-5"
            disabled={isLoading}
            required
          />
        </div>
        <div className="w-[27%] max-md:w-full">
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full px-16 py-8 text-3xl font-semibold bg-[#A7FF83] text-[#071A52] rounded-[100px] hover:bg-[#A7FF83]/90 max-md:px-5"
          >
            {isLoading ? "Processing..." : "Join Free"}
          </button>
        </div>
      </div>
    </form>
  );
}
