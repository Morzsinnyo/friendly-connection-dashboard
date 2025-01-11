import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContactFormFields } from "./form/ContactFormFields";
import { AvatarUpload } from "./form/AvatarUpload";

const statusOptions = [
  "Family Member",
  "Close Friend",
  "Business Contact",
  "Acquaintance",
  "Other",
];

export function CreateContact() {
  const [isLoading, setIsLoading] = useState(false);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    businessPhone: "",
    mobilePhone: "",
    status: "",
    birthday: null as Date | null,
    notes: "",
  });
  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      fullName: "",
      email: "",
    };

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
      isValid = false;
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatar(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please check the form for errors",
      });
      return;
    }

    setIsLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("No user found");

      let avatarUrl = null;
      if (avatar) {
        const fileExt = avatar.name.split(".").pop();
        const fileName = `${Math.random()}.${fileExt}`;

        const { error: uploadError, data } = await supabase.storage
          .from("avatars")
          .upload(fileName, avatar);

        if (uploadError) throw uploadError;
        if (data) avatarUrl = data.path;
      }

      const formattedBirthday = formData.birthday
        ? formData.birthday.toISOString().split('T')[0]
        : null;

      const { error } = await supabase.from("contacts").insert({
        user_id: user.id,
        full_name: formData.fullName,
        email: formData.email,
        business_phone: formData.businessPhone,
        mobile_phone: formData.mobilePhone,
        status: formData.status,
        birthday: formattedBirthday,
        notes: formData.notes,
        avatar_url: avatarUrl,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Contact created successfully",
      });

      navigate("/");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F2FCE2] p-6">
      <Card className="max-w-2xl mx-auto bg-white border-green-100 shadow-sm">
        <CardHeader className="border-b border-green-50">
          <CardTitle className="text-2xl font-bold text-center text-green-800">
            Create New Contact
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <AvatarUpload 
              avatar={avatar}
              handleImageChange={handleImageChange}
            />

            <ContactFormFields
              formData={formData}
              errors={errors}
              setFormData={setFormData}
              statusOptions={statusOptions}
            />

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/")}
                className="w-full bg-white border-green-200 text-green-700 hover:bg-green-50"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading} 
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Contact
                  </>
                ) : (
                  "Create Contact"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}