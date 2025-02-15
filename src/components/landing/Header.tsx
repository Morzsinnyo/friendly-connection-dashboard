
import React from 'react';
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function Header() {
  const navigate = useNavigate();

  return (
    <div className="py-4 px-6 flex justify-between items-center">
      <h1 className="text-2xl font-semibold text-[#071A52]">LinkUp</h1>
      <Button 
        variant="outline" 
        className="border-[#071A52] text-[#071A52] hover:bg-[#071A52] hover:text-white transition-colors"
        onClick={() => navigate("/auth")}
      >
        Login
      </Button>
    </div>
  );
}
