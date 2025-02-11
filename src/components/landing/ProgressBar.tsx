
import React from 'react';
import { Shield } from "lucide-react";

const avatars = [
  "https://images.unsplash.com/photo-1649972904349-6e44c42644a7",
  "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
  "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952",
  "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e"
];

export const ProgressBar = () => {
  return (
    <div className="flex flex-col items-start ml-16 mt-8 max-w-full">
      <div className="flex items-center gap-5 mb-6">
        <div className="flex -space-x-3 overflow-hidden">
          {avatars.map((avatar, i) => (
            <img
              key={i}
              src={avatar}
              alt={`User ${i + 1}`}
              className="inline-block h-10 w-10 rounded-full border-2 border-white object-cover"
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="overflow-hidden px-6 py-2 bg-[#A7FF83] rounded-full">
            <span className="text-2xl font-bold text-[#071A52]">81/100</span>
          </div>
          <span className="text-xl font-semibold text-[#071A52]">
            Spots filled
          </span>
        </div>
      </div>
    </div>
  );
};
