
import { Header } from "@/components/landing/Header";
import { HeroSection } from "@/components/landing/HeroSection";
import { ProgressBar } from "@/components/landing/ProgressBar";
import { EmailCollectionForm } from "@/components/landing/EmailCollectionForm";

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col items-center p-4 bg-background">
      <Header />
      <div className="max-w-[1125px] w-full space-y-8">
        <HeroSection />
        <ProgressBar />
        <div className="relative">
          <EmailCollectionForm />
          <div className="absolute right-10 bottom-0 transform translate-y-1/2">
            <svg
              width="83"
              height="119"
              viewBox="0 0 83 119"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="max-md:mt-10"
            >
              <path
                d="M82.0409 118.041L0.999979 37M0.999979 37V90.5777M0.999979 37H54.5777"
                stroke="#071A52"
                strokeWidth="2"
              />
            </svg>
          </div>
        </div>
        <div className="flex items-center gap-6 justify-center mt-5 text-3xl font-semibold text-[#071A52]">
          <div className="flex-auto text-center">
            100% Free for the first 100 Users.
          </div>
        </div>
      </div>
    </div>
  );
}
