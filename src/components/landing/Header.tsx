
import React from 'react';
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function Header() {
  const navigate = useNavigate();
  
  return (
    <div className="w-full border-b">
      <div className="py-4 px-4 md:px-6 flex justify-between items-center max-w-[1280px] mx-auto">
        <h1 className="text-2xl font-semibold text-[#071A52]">LinkUp</h1>
        <Button 
          variant="outline" 
          className="h-11 px-4 md:px-6 text-sm md:text-base border-[#071A52] text-[#071A52] hover:bg-[#071A52] hover:text-white transition-colors"
          onClick={() => navigate("/auth")}
        >
          Login
        </Button>
      </div>
    </div>
  );
}
