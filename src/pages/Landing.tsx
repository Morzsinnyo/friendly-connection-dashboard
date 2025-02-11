
import { EmailCollectionForm } from "@/components/landing/EmailCollectionForm";
import { ArrowRight } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      {/* Logo */}
      <div className="mb-16">
        <h2 className="text-4xl font-bold text-[#071A52]">LinkUp</h2>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl w-full space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#071A52]">
            Your Network is your Net worth.
          </h1>
          <p className="text-lg text-gray-600">
            Stay connected effortlessly. Set reminders and
          </p>
          <div className="inline-block bg-[#A7FF83]/20 px-4 py-2 rounded-full">
            <span className="text-lg font-medium text-[#071A52]">
              Never Lose a Connection Again.
            </span>
          </div>
        </div>

        {/* Progress Section */}
        <div className="relative py-12">
          {/* Progress Bar */}
          <div className="w-full bg-gray-100 h-4 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-[#17B978] to-[#17B978]/80 h-full rounded-full" 
              style={{ width: '81%' }}
            />
          </div>

          {/* Counter with Text */}
          <div className="absolute top-0 right-0 -translate-y-1/2 flex items-center gap-2">
            <span className="bg-[#A7FF83] text-[#071A52] px-4 py-1.5 rounded-full font-bold">
              81/100
            </span>
            <span className="text-gray-600 font-medium">
              Spots filled
            </span>
          </div>

          {/* Static Avatars */}
          <div className="flex -space-x-3 justify-center mt-8">
            {[...Array(5)].map((_, i) => (
              <div 
                key={i}
                className="w-12 h-12 rounded-full bg-gray-300 border-2 border-white ring-2 ring-gray-100"
              />
            ))}
          </div>
        </div>

        {/* Email Collection Form */}
        <div className="py-8 relative">
          <EmailCollectionForm />
          {/* Arrow pointing to join button */}
          <div className="absolute right-10 bottom-0 transform translate-y-1/2">
            <ArrowRight className="w-12 h-12 text-black -rotate-45" />
          </div>
        </div>

        {/* Free Text */}
        <div className="text-center">
          <p className="text-lg font-medium text-gray-600">
            100% Free for the first 100 Users.
          </p>
        </div>
      </div>
    </div>
  );
}
