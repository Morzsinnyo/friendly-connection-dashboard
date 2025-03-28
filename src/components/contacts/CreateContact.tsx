
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContactFormFields } from "./form/ContactFormFields";
import { AvatarUpload } from "./form/AvatarUpload";
import { useQuery } from "@tanstack/react-query";
import { SocialMediaFields } from "./form/SocialMediaFields";
import { getNoteContent } from "@/api/types/contacts";
import { notesToJson, createNote } from "@/api/types/notes";
import { useContactMutations } from "@/hooks/contacts/useContactMutations";

const statusOptions = [
  "Family Member",
  "Close Friend",
  "Friend",
  "Business Contact",
  "Acquaintance",
  "Other",
];

interface FormData {
  fullName: string;
  email: string;
  businessPhone: string;
  mobilePhone: string;
  status: string;
  birthday: string | null;
  notes: string;
  jobTitle: string;
  company: string;
  instagramUrl: string;
  linkedinUrl: string;
  twitterUrl: string;
  facebookUrl: string;
}

export function CreateContact() {
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const [isLoading, setIsLoading] = useState(false);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    businessPhone: "",
    mobilePhone: "",
    status: "",
    birthday: null,
    notes: "",
    jobTitle: "",
    company: "",
    instagramUrl: "",
    linkedinUrl: "",
    twitterUrl: "",
    facebookUrl: "",
  });
  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
  });
  const { toast } = useToast();
  const navigate = useNavigate();
  const { updateBirthdayMutation } = useContactMutations(editId || '');
  const [isFromOnboarding, setIsFromOnboarding] = useState(false);

  useEffect(() => {
    // Check if we're coming from onboarding flow
    const returnToOnboarding = sessionStorage.getItem('returnToOnboarding');
    
    if (returnToOnboarding) {
      setIsFromOnboarding(true);
    }
    
    // Clean up the session storage
    if (returnToOnboarding) {
      sessionStorage.removeItem('returnToOnboarding');
    }
  }, [navigate]);

  // Fetch contact data if in edit mode
  const { data: contactData } = useQuery({
    queryKey: ['contact', editId],
    queryFn: async () => {
      if (!editId) return null;
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('id', editId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!editId,
  });

  // Populate form data when editing
  useEffect(() => {
    if (contactData) {
      const notes = getNoteContent(contactData.notes);
      setFormData({
        fullName: contactData.full_name,
        email: contactData.email || '',
        businessPhone: contactData.business_phone || '',
        mobilePhone: contactData.mobile_phone || '',
        status: contactData.status || '',
        birthday: contactData.birthday || null,
        notes: notes.length > 0 ? notes[0].content : '',
        jobTitle: contactData.job_title || '',
        company: contactData.company || '',
        instagramUrl: contactData.instagram_url || '',
        linkedinUrl: contactData.linkedin_url || '',
        twitterUrl: contactData.twitter_url || '',
        facebookUrl: contactData.facebook_url || '',
      });
    }
  }, [contactData]);

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

  const handleBirthdayChange = (birthday: string | null) => {
    if (editId) {
      updateBirthdayMutation.mutate(birthday);
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

      const notesJson = formData.notes ? notesToJson([createNote(formData.notes)]) : [];

      const contactData = {
        user_id: user.id,
        full_name: formData.fullName,
        email: formData.email,
        business_phone: formData.businessPhone,
        mobile_phone: formData.mobilePhone,
        status: formData.status,
        birthday: formData.birthday,
        notes: notesJson,
        job_title: formData.jobTitle,
        company: formData.company,
        instagram_url: formData.instagramUrl,
        linkedin_url: formData.linkedinUrl,
        twitter_url: formData.twitterUrl,
        facebook_url: formData.facebookUrl,
        ...(avatarUrl && { avatar_url: avatarUrl }),
      };

      if (editId) {
        const { error } = await supabase
          .from("contacts")
          .update(contactData)
          .eq('id', editId);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Contact updated successfully",
        });
      } else {
        const { error } = await supabase
          .from("contacts")
          .insert([contactData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Contact created successfully",
        });
      }

      // Check if we need to return to the onboarding flow
      if (isFromOnboarding) {
        navigate("/onboarding");
      } else {
        navigate("/dashboard");
      }
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
    <div className="min-h-screen bg-background p-6">
      <Card className="max-w-2xl mx-auto border-border">
        <CardHeader className="border-b border-border relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2"
            onClick={() => isFromOnboarding ? navigate("/onboarding") : navigate("/dashboard")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <CardTitle className="text-2xl font-bold text-center text-foreground">
            {editId ? 'Edit Contact' : 'Create New Contact'}
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
              onBirthdayChange={handleBirthdayChange}
              isEditMode={!!editId}
            />

            <SocialMediaFields
              formData={formData}
              setFormData={setFormData}
            />

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => isFromOnboarding ? navigate("/onboarding") : navigate("/dashboard")}
                className="w-full"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editId ? 'Updating Contact' : 'Creating Contact'}
                  </>
                ) : (
                  editId ? 'Update Contact' : 'Create Contact'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
