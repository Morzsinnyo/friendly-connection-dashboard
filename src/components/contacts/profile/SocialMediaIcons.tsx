import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Contact } from "@/api/types/contacts";

interface SocialMediaIconsProps {
  contact: Contact;
}

export function SocialMediaIcons({ contact }: SocialMediaIconsProps) {
  const socialLinks = [
    {
      url: contact.instagram_url,
      icon: Instagram,
      label: "Instagram",
      color: "text-pink-500 hover:text-pink-600",
    },
    {
      url: contact.linkedin_url,
      icon: Linkedin,
      label: "LinkedIn",
      color: "text-blue-500 hover:text-blue-600",
    },
    {
      url: contact.twitter_url,
      icon: Twitter,
      label: "Twitter",
      color: "text-blue-400 hover:text-blue-500",
    },
    {
      url: contact.facebook_url,
      icon: Facebook,
      label: "Facebook",
      color: "text-blue-600 hover:text-blue-700",
    },
  ];

  return (
    <div className="flex space-x-2">
      {socialLinks.map(
        ({ url, icon: Icon, label, color }) =>
          url && (
            <Button
              key={label}
              variant="ghost"
              size="icon"
              className={color}
              onClick={() => window.open(url, "_blank")}
              title={label}
            >
              <Icon className="h-5 w-5" />
            </Button>
          )
      )}
    </div>
  );
}