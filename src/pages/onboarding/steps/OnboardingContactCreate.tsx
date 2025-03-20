
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, User, Mail, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { notesToJson, createNote } from "@/api/types/notes";

export function OnboardingContactCreate() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    status: "Friend",
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName.trim()) {
      toast.error("Full name is required");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("You must be logged in to create contacts");
        return;
      }
      
      const notesJson = formData.fullName ? notesToJson([createNote(`Initial contact created during onboarding`)]) : [];
      
      const contactData = {
        user_id: user.id,
        full_name: formData.fullName,
        email: formData.email,
        mobile_phone: formData.phone,
        status: formData.status,
        notes: notesJson,
      };
      
      const { error } = await supabase
        .from("contacts")
        .insert([contactData]);
      
      if (error) throw error;
      
      toast.success("Contact created successfully");
      navigate("/onboarding");
    } catch (error: any) {
      console.error("Error creating contact:", error);
      toast.error(error.message || "Failed to create contact");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
        <div className="mb-6 flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/onboarding")}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold">Add a New Contact</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">
              <User className="w-4 h-4 inline mr-2" />
              Full Name *
            </Label>
            <Input
              id="fullName"
              placeholder="John Doe"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">
              <Mail className="w-4 h-4 inline mr-2" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">
              <Phone className="w-4 h-4 inline mr-2" />
              Phone Number
            </Label>
            <Input
              id="phone"
              placeholder="+1 (555) 123-4567"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          
          <div className="pt-4 flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate("/onboarding")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Save Contact"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
