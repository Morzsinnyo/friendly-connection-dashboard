
import { Header } from "@/components/landing/Header";
import { HeroSection } from "@/components/landing/HeroSection";
import { ProgressBar } from "@/components/landing/ProgressBar";
import { EmailCollectionForm } from "@/components/landing/EmailCollectionForm";
import { Shield } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
      <div className="w-full max-w-[1280px] mx-auto p-6">
        <div className="max-w-[768px]">
          <Header />
          <HeroSection />
          <ProgressBar />
          <div className="relative mt-8">
            <EmailCollectionForm />
            <div className="absolute -right-16 bottom-0 transform translate-y-1/2">
              <svg
                width="83"
                height="119"
                viewBox="0 0 83 119"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M82.0409 118.041L0.999979 37M0.999979 37V90.5777M0.999979 37H54.5777"
                  stroke="#071A52"
                  strokeWidth="2"
                />
              </svg>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-12">
            <Shield className="w-6 h-6 text-[#071A52]" />
            <span className="text-lg font-semibold text-[#071A52]">
              100% Free for the first 100 Users.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
