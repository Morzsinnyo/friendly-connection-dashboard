
import { CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function ThankYou() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#FAFAFA] p-6">
      <div className="w-full max-w-[1280px]">
        <div className="w-full">
          {/* Logo Section */}
          <div className="text-[#071A52] font-bold text-2xl md:text-[64px] md:mb-24">
            LinkUp
          </div>
          
          {/* Content Section */}
          <div className="flex flex-col items-center text-center">
            <CheckCircle className="w-16 h-16 md:w-[80px] md:h-[80px] text-[#A7FF83] mb-6" />
            <h1 className="text-4xl font-bold text-[#071A52] mb-4">
              Thanks for registering for Early Access.
            </h1>
            <p className="text-lg text-[#071A52]/80 mb-8">
              Create an account to lock in your Early Access.
            </p>
            <Button 
              onClick={() => navigate("/auth")}
              className="px-8 py-6 text-lg font-semibold bg-[#A7FF83] text-[#071A52] rounded-full hover:bg-[#A7FF83]/90"
            >
              Create your account
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
