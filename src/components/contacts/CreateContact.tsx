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
import { CalendarIcon, Loader2 } from "lucide-react";

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
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-6">
      <div>
        <Label htmlFor="avatar">Profile Image (Optional)</Label>
        <Input
          id="avatar"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          required
          value={formData.fullName}
          onChange={(e) =>
            setFormData({ ...formData, fullName: e.target.value })
          }
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="businessPhone">Business Phone</Label>
        <Input
          id="businessPhone"
          value={formData.businessPhone}
          onChange={(e) =>
            setFormData({ ...formData, businessPhone: e.target.value })
          }
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="mobilePhone">Mobile Phone</Label>
        <Input
          id="mobilePhone"
          value={formData.mobilePhone}
          onChange={(e) =>
            setFormData({ ...formData, mobilePhone: e.target.value })
          }
          className="mt-1"
        />
      </div>

      <div>
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

      <div>
        <Label>Birthday</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !formData.birthday && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formData.birthday ? (
                format(formData.birthday, "PPP")
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={formData.birthday || undefined}
              onSelect={(date) => setFormData({ ...formData, birthday: date })}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="mt-1"
          rows={4}
        />
      </div>

      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/")}
          className="w-full"
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading} className="w-full">
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
  );
}