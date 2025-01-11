import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, Upload } from "lucide-react";

interface AvatarUploadProps {
  avatar: File | null;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function AvatarUpload({ avatar, handleImageChange }: AvatarUploadProps) {
  return (
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
  );
}