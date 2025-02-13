
import { Header } from "@/components/landing/Header";
import { HeroSection } from "@/components/landing/HeroSection";
import { ProgressBar } from "@/components/landing/progress/ProgressBar";
import { EmailCollectionForm } from "@/components/landing/EmailCollectionForm";
import { Shield } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
      <div className="w-full max-w-[1280px] mx-auto p-6">
        <div className="max-w-[768px]">
          <Header />
          <HeroSection />
          <div className="mb-8">
            <ProgressBar />
          </div>
          <div className="mt-8">
            <EmailCollectionForm />
          </div>
          <div className="flex items-center gap-2 mt-3">
            <Shield className="w-6 h-6 text-[#071A52]" />
            <span className="text-xs font-semibold text-[#071A52]">
              100% Free for the first 100 Users.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
