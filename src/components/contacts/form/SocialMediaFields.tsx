import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";

interface SocialMediaFieldsProps {
  formData: {
    instagramUrl?: string;
    linkedinUrl?: string;
    twitterUrl?: string;
    facebookUrl?: string;
  };
  setFormData: (data: any) => void;
}

export function SocialMediaFields({ formData, setFormData }: SocialMediaFieldsProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-green-700">
          <Instagram className="w-4 h-4 inline mr-2" />
          Instagram URL
        </Label>
        <Input
          value={formData.instagramUrl || ""}
          onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
          placeholder="https://instagram.com/username"
          className="bg-white border-green-200 text-green-900 focus-visible:ring-green-400"
        />
      </div>

      <div>
        <Label className="text-green-700">
          <Linkedin className="w-4 h-4 inline mr-2" />
          LinkedIn URL
        </Label>
        <Input
          value={formData.linkedinUrl || ""}
          onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
          placeholder="https://linkedin.com/in/username"
          className="bg-white border-green-200 text-green-900 focus-visible:ring-green-400"
        />
      </div>

      <div>
        <Label className="text-green-700">
          <Twitter className="w-4 h-4 inline mr-2" />
          Twitter URL
        </Label>
        <Input
          value={formData.twitterUrl || ""}
          onChange={(e) => setFormData({ ...formData, twitterUrl: e.target.value })}
          placeholder="https://twitter.com/username"
          className="bg-white border-green-200 text-green-900 focus-visible:ring-green-400"
        />
      </div>

      <div>
        <Label className="text-green-700">
          <Facebook className="w-4 h-4 inline mr-2" />
          Facebook URL
        </Label>
        <Input
          value={formData.facebookUrl || ""}
          onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
          placeholder="https://facebook.com/username"
          className="bg-white border-green-200 text-green-900 focus-visible:ring-green-400"
        />
      </div>
    </div>
  );
}