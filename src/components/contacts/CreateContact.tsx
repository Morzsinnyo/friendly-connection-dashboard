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
import { CalendarIcon, Loader2, Phone, Mail, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

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
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatar(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

      // Convert the birthday Date to ISO string if it exists
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
    <div className="min-h-screen bg-black text-white p-6">
      <Card className="max-w-2xl mx-auto bg-zinc-900 border-zinc-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-center mb-8">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-zinc-800 flex items-center justify-center mb-2">
                {avatar ? (
                  <img
                    src={URL.createObjectURL(avatar)}
                    alt="Preview"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-zinc-400" />
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
                className="mt-2 w-full text-sm"
                onClick={() => document.getElementById("avatar")?.click()}
              >
                Upload Photo
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName" className="text-zinc-400">Full Name</Label>
                <Input
                  id="fullName"
                  required
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-zinc-400">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>

              <div>
                <Label htmlFor="businessPhone" className="text-zinc-400">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Business Phone
                </Label>
                <Input
                  id="businessPhone"
                  value={formData.businessPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, businessPhone: e.target.value })
                  }
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>

              <div>
                <Label htmlFor="mobilePhone" className="text-zinc-400">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Mobile Phone
                </Label>
                <Input
                  id="mobilePhone"
                  value={formData.mobilePhone}
                  onChange={(e) =>
                    setFormData({ ...formData, mobilePhone: e.target.value })
                  }
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>

              <div>
                <Label htmlFor="status" className="text-zinc-400">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status} className="text-white">
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-zinc-400">
                  <CalendarIcon className="w-4 h-4 inline mr-2" />
                  Birthday
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-zinc-800 border-zinc-700",
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
                  <PopoverContent className="w-auto p-0 bg-zinc-800">
                    <Calendar
                      mode="single"
                      selected={formData.birthday || undefined}
                      onSelect={(date) => setFormData({ ...formData, birthday: date })}
                      initialFocus
                      className="bg-zinc-800"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label htmlFor="notes" className="text-zinc-400">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white min-h-[100px]"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/")}
                className="w-full bg-zinc-800 border-zinc-700 hover:bg-zinc-700"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading} 
                className="w-full bg-blue-600 hover:bg-blue-700"
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