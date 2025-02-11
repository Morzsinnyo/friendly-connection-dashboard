
import { EmailCollectionForm } from "@/components/landing/EmailCollectionForm";
import { Shield } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      {/* Logo */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-[#071A52]">NetworkPro</h2>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl w-full space-y-8 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
          Your Network is your Net worth
        </h1>

        {/* Progress Section */}
        <div className="relative py-8">
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
            <div 
              className="bg-[#17B978] h-full rounded-full" 
              style={{ width: '81%' }}
            />
          </div>

          {/* Counter Pill */}
          <div className="absolute top-0 right-0 -translate-y-1/2">
            <span className="bg-[#A7FF83] text-[#071A52] px-4 py-1 rounded-full font-semibold">
              81/100
            </span>
          </div>

          {/* Static Avatars */}
          <div className="flex -space-x-2 justify-center mt-6">
            {[...Array(5)].map((_, i) => (
              <div 
                key={i}
                className="w-10 h-10 rounded-full bg-gray-300 border-2 border-white"
              />
            ))}
          </div>
        </div>

        {/* Email Collection Form */}
        <div className="py-8">
          <EmailCollectionForm />
        </div>

        {/* Free Badge */}
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Shield className="w-5 h-5" />
          <span className="font-medium">100% Free</span>
        </div>
      </div>
    </div>
  );
}
