
import { Header } from "@/components/landing/Header";
import { HeroSection } from "@/components/landing/HeroSection";
import { ProgressBar } from "@/components/landing/progress/ProgressBar";
import { EmailCollectionForm } from "@/components/landing/EmailCollectionForm";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
      <div className="w-full max-w-[1280px] mx-auto p-6">
        <div className="w-full">
          <Header />
          <HeroSection />
          <div className="mb-3">
            <ProgressBar />
          </div>
          <div className="mt-8">
            <EmailCollectionForm />
          </div>
          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-[#071A52]" />
              <span className="text-xs font-semibold text-[#071A52]">
                100% Free for the first 100 Users.
              </span>
            </div>
            <Button 
              className="bg-[#071A52] text-white hover:bg-[#071A52]/90"
              onClick={() => navigate("/auth")}
            >
              Sign In / Register
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
