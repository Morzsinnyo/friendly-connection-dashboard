
import React from 'react';

export const ProgressBar = () => {
  return (
    <div className="flex flex-wrap gap-10 self-center mt-8 ml-16 max-w-full w-[605px]">
      <div className="flex flex-auto gap-5">
        <div className="flex flex-col grow shrink-0 justify-center px-2 py-1 text-6xl font-bold text-center whitespace-nowrap basis-0 text-[#071A52] w-fit max-md:text-4xl">
          <div className="overflow-hidden px-14 py-3 bg-[#A7FF83] rounded-full max-md:px-5 max-md:text-4xl">
            81/100
          </div>
        </div>
        <div className="z-10 pt-0 my-auto text-3xl font-semibold text-[#071A52]">
          Spots filled
        </div>
      </div>
      <div className="flex -space-x-3 justify-center mt-8">
        {[...Array(5)].map((_, i) => (
          <div 
            key={i}
            className="w-12 h-12 rounded-full bg-gray-300 border-2 border-white ring-2 ring-gray-100"
          />
        ))}
      </div>
    </div>
  );
};
