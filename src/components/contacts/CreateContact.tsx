import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon, Loader2, Phone, Mail, User, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
          <CardTitle className="text-2xl font-bold text-center text-green-800">Create New Contact</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center justify-center mb-8">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-green-50 flex items-center justify-center mb-2 overflow-hidden">
                  {avatar ? (
                    <img
                      src={URL.createObjectURL(avatar)}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-16 h-16 text-green-400" />
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
                  className="mt-2 w-full text-sm flex items-center justify-center gap-2 border-green-200 hover:bg-green-50"
                  onClick={() => document.getElementById("avatar")?.click()}
                >
                  <Upload className="w-4 h-4" />
                  Upload Photo
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName" className="text-green-700">
                  <User className="w-4 h-4 inline mr-2" />
                  Full Name *
                </Label>
                <Input
                  id="fullName"
                  required
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  className={cn(
                    "bg-white border-green-200 text-green-900 focus-visible:ring-green-400",
                    errors.fullName && "border-red-500"
                  )}
                />
                {errors.fullName && (
                  <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email" className="text-green-700">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={cn(
                    "bg-white border-green-200 text-green-900 focus-visible:ring-green-400",
                    errors.email && "border-red-500"
                  )}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <Label htmlFor="businessPhone" className="text-green-700">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Business Phone
                </Label>
                <Input
                  id="businessPhone"
                  value={formData.businessPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, businessPhone: e.target.value })
                  }
                  className="bg-white border-green-200 text-green-900 focus-visible:ring-green-400"
                />
              </div>

              <div>
                <Label htmlFor="mobilePhone" className="text-green-700">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Mobile Phone
                </Label>
                <Input
                  id="mobilePhone"
                  value={formData.mobilePhone}
                  onChange={(e) =>
                    setFormData({ ...formData, mobilePhone: e.target.value })
                  }
                  className="bg-white border-green-200 text-green-900 focus-visible:ring-green-400"
                />
              </div>

              <div>
                <Label htmlFor="status" className="text-green-700">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger className="bg-white border-green-200 text-green-900">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-green-200">
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status} className="text-green-900">
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-green-700">
                  <CalendarIcon className="w-4 h-4 inline mr-2" />
                  Birthday
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-white border-green-200",
                        !formData.birthday && "text-muted-foreground"
                      )}
                    >
                      {formData.birthday ? (
                        format(formData.birthday, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white">
                    <Calendar
                      mode="single"
                      selected={formData.birthday || undefined}
                      onSelect={(date) => setFormData({ ...formData, birthday: date })}
                      initialFocus
                      className="bg-white"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label htmlFor="notes" className="text-green-700">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="bg-white border-green-200 text-green-900 focus-visible:ring-green-400 min-h-[100px]"
                />
              </div>
            </div>

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