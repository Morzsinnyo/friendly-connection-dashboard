import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Facebook, Instagram, Linkedin, Twitter, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

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
  const { toast } = useToast();
  const [tempUrls, setTempUrls] = useState({
    instagramUrl: formData.instagramUrl || "",
    linkedinUrl: formData.linkedinUrl || "",
    twitterUrl: formData.twitterUrl || "",
    facebookUrl: formData.facebookUrl || "",
  });

  const handleAdd = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    toast({
      title: "Success",
      description: `Social media link added successfully`,
    });
  };

  return (
    <div className="space-y-4">
      <Label className="text-foreground">Social Media Links</Label>
      <div className="flex gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" className="text-pink-500 hover:text-pink-600">
              <Instagram className="h-5 w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-2">
              <Label className="text-foreground">Instagram URL</Label>
              <div className="flex gap-2">
                <Input
                  value={tempUrls.instagramUrl}
                  onChange={(e) => setTempUrls({ ...tempUrls, instagramUrl: e.target.value })}
                  placeholder="https://instagram.com/username"
                  className="bg-background border-border text-foreground"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleAdd('instagramUrl', tempUrls.instagramUrl)}
                  className="shrink-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
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
              <Label className="text-foreground">LinkedIn URL</Label>
              <div className="flex gap-2">
                <Input
                  value={tempUrls.linkedinUrl}
                  onChange={(e) => setTempUrls({ ...tempUrls, linkedinUrl: e.target.value })}
                  placeholder="https://linkedin.com/in/username"
                  className="bg-background border-border text-foreground"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleAdd('linkedinUrl', tempUrls.linkedinUrl)}
                  className="shrink-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
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
              <Label className="text-foreground">Twitter URL</Label>
              <div className="flex gap-2">
                <Input
                  value={tempUrls.twitterUrl}
                  onChange={(e) => setTempUrls({ ...tempUrls, twitterUrl: e.target.value })}
                  placeholder="https://twitter.com/username"
                  className="bg-background border-border text-foreground"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleAdd('twitterUrl', tempUrls.twitterUrl)}
                  className="shrink-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" className="text-blue-600 hover:text-blue-700">
              <Facebook className="h-5 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-2">
              <Label className="text-foreground">Facebook URL</Label>
              <div className="flex gap-2">
                <Input
                  value={tempUrls.facebookUrl}
                  onChange={(e) => setTempUrls({ ...tempUrls, facebookUrl: e.target.value })}
                  placeholder="https://facebook.com/username"
                  className="bg-background border-border text-foreground"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleAdd('facebookUrl', tempUrls.facebookUrl)}
                  className="shrink-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}