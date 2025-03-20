
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, User, Mail, Phone, Briefcase, CalendarIcon, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { notesToJson, createNote } from "@/api/types/notes";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";

export function OnboardingContactCreate() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    businessPhone: "",
    mobilePhone: "",
    status: "",
    birthday: null as string | null,
    notes: "",
    jobTitle: "",
    company: "",
  });
  
  const statusOptions = [
    "Family Member",
    "Close Friend",
    "Friend",
    "Business Contact",
    "Acquaintance",
    "Other",
  ];
  
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
        ...(avatarUrl && { avatar_url: avatarUrl }),
      };
      
      const { error } = await supabase
        .from("contacts")
        .insert([contactData]);
      
      if (error) throw error;
      
      toast.success("Contact created successfully");
      // Return to the contacts step in onboarding
      navigate("/onboarding", { state: { currentStep: "contacts" } });
    } catch (error: any) {
      console.error("Error creating contact:", error);
      toast.error(error.message || "Failed to create contact");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatar(e.target.files[0]);
    }
  };

  // Generate years from 1900 to current year
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => (currentYear - i).toString());
  
  // Parse the current birthday if it exists
  const parsedDate = formData.birthday ? parseISO(formData.birthday) : null;
  
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow">
          <div className="flex items-center border-b p-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate("/onboarding")}
              className="mr-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-xl font-bold text-center flex-1 pr-8">Create New Contact</h1>
          </div>
          
          <form onSubmit={handleSubmit} className="p-4 space-y-6">
            {/* Avatar Upload */}
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center mb-2 overflow-hidden">
                  {avatar ? (
                    <img
                      src={URL.createObjectURL(avatar)}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-16 h-16 text-muted-foreground" />
                  )}
                </div>
                <Input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="mt-2 w-full text-sm flex items-center justify-center gap-2"
                  onClick={() => document.getElementById("avatar")?.click()}
                >
                  <Upload className="w-4 h-4" />
                  Upload Photo
                </Button>
              </div>
            </div>
            
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="flex items-center">
                <User className="w-4 h-4 mr-2" />
                Full Name *
              </Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
            </div>
            
            {/* Job Title */}
            <div className="space-y-2">
              <Label htmlFor="jobTitle" className="flex items-center">
                <Briefcase className="w-4 h-4 mr-2" />
                Job Title
              </Label>
              <Input
                id="jobTitle"
                value={formData.jobTitle}
                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
              />
            </div>
            
            {/* Company */}
            <div className="space-y-2">
              <Label htmlFor="company" className="flex items-center">
                <Briefcase className="w-4 h-4 mr-2" />
                Company
              </Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              />
            </div>
            
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            
            {/* Mobile Phone */}
            <div className="space-y-2">
              <Label htmlFor="mobilePhone" className="flex items-center">
                <Phone className="w-4 h-4 mr-2" />
                Mobile Phone
              </Label>
              <Input
                id="mobilePhone"
                value={formData.mobilePhone}
                onChange={(e) => setFormData({ ...formData, mobilePhone: e.target.value })}
              />
            </div>
            
            {/* Business Phone */}
            <div className="space-y-2">
              <Label htmlFor="businessPhone" className="flex items-center">
                <Phone className="w-4 h-4 mr-2" />
                Business Phone
              </Label>
              <Input
                id="businessPhone"
                value={formData.businessPhone}
                onChange={(e) => setFormData({ ...formData, businessPhone: e.target.value })}
              />
            </div>
            
            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Birthday */}
            <div className="space-y-2">
              <Label className="flex items-center">
                <CalendarIcon className="w-4 h-4 mr-2" />
                Birthday
              </Label>
              <div className="flex flex-col space-y-2">
                <Select
                  value={parsedDate ? format(parsedDate, 'yyyy') : ""}
                  onValueChange={(year) => {
                    if (!year) {
                      setFormData({ ...formData, birthday: null });
                      return;
                    }
                    
                    let newDate;
                    if (parsedDate) {
                      newDate = new Date(parsedDate);
                      newDate.setFullYear(parseInt(year));
                    } else {
                      newDate = new Date(parseInt(year), 0, 1);
                    }
                    
                    setFormData({ ...formData, birthday: format(newDate, 'yyyy-MM-dd') });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {years.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.birthday && "text-muted-foreground"
                      )}
                    >
                      {formData.birthday ? (
                        format(parseISO(formData.birthday), "MMMM d")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={parsedDate}
                      onSelect={(date) => {
                        if (!date) {
                          setFormData({ ...formData, birthday: null });
                          return;
                        }
                        
                        // Preserve the selected year if one was chosen
                        if (parsedDate) {
                          const newDate = new Date(date);
                          const selectedYear = parsedDate.getFullYear();
                          newDate.setFullYear(selectedYear);
                          setFormData({ ...formData, birthday: format(newDate, 'yyyy-MM-dd') });
                        } else {
                          setFormData({ ...formData, birthday: format(date, 'yyyy-MM-dd') });
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="min-h-[100px]"
              />
            </div>
            
            {/* Social Media Links */}
            <div className="space-y-2">
              <Label>Social Media Links</Label>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" className="text-pink-500">
                  <Instagram className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="icon" className="text-blue-500">
                  <Linkedin className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="icon" className="text-blue-400">
                  <Twitter className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="icon" className="text-blue-600">
                  <Facebook className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/onboarding")}
                className="w-full"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Creating Contact...' : 'Create Contact'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
