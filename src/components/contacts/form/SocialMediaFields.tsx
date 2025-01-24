import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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
      <Label className="text-green-700">Social Media Links</Label>
      <div className="flex gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" className="text-pink-500 hover:text-pink-600">
              <Instagram className="h-5 w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-2">
              <Label>Instagram URL</Label>
              <Input
                value={formData.instagramUrl || ""}
                onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                placeholder="https://instagram.com/username"
              />
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" className="text-blue-500 hover:text-blue-600">
              <Linkedin className="h-5 w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-2">
              <Label>LinkedIn URL</Label>
              <Input
                value={formData.linkedinUrl || ""}
                onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                placeholder="https://linkedin.com/in/username"
              />
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" className="text-blue-400 hover:text-blue-500">
              <Twitter className="h-5 w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-2">
              <Label>Twitter URL</Label>
              <Input
                value={formData.twitterUrl || ""}
                onChange={(e) => setFormData({ ...formData, twitterUrl: e.target.value })}
                placeholder="https://twitter.com/username"
              />
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" className="text-blue-600 hover:text-blue-700">
              <Facebook className="h-5 w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-2">
              <Label>Facebook URL</Label>
              <Input
                value={formData.facebookUrl || ""}
                onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
                placeholder="https://facebook.com/username"
              />
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}