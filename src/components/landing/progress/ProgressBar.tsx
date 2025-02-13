
import React from 'react';

const avatars = [
  "https://images.unsplash.com/photo-1649972904349-6e44c42644a7",
  "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
  "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952",
  "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e"
];

export function ProgressBar() {
  return (
    <div className="space-y-3">
      <div className="relative w-[500px] h-[48px] bg-stone-300 bg-opacity-90 rounded-[35px] p-1.5 border border-white/30 shadow-inner">
        <div 
          className="absolute inset-0 m-1.5 rounded-[35px] bg-gradient-to-r from-[#A7FF83] to-[#83FFA3] animate-pulse"
          style={{ 
            width: 'calc(81% - 12px)',
            boxShadow: 'inset 0 2px 4px rgba(255, 255, 255, 0.25)'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent rounded-[35px]" />
        </div>
      </div>
      <div className="flex items-center gap-6 mt-3">
        <div className="flex -space-x-3">
          {avatars.map((avatar, i) => (
            <img
              key={i}
              src={`${avatar}?w=100&h=100&fit=crop`}
              alt={`User ${i + 1}`}
              className="w-10 h-10 rounded-full border-2 border-white object-cover"
            />
          ))}
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-[#A7FF83] px-4 py-1 rounded-full">
            <span className="text-lg font-semibold text-[#071A52]">81/100</span>
          </div>
          <span className="text-xs text-[#071A52]">Spots filled</span>
        </div>
      </div>
    </div>
  );
}
