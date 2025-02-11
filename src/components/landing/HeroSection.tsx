
import React from 'react';

export const HeroSection = () => {
  return (
    <div className="flex flex-col pt-9 pb-1.5 pl-12 w-full max-md:pl-5 max-md:max-w-full">
      <div className="flex flex-col items-start self-center ml-8 w-full max-w-[1053px] max-md:max-w-full">
        <h1 className="self-stretch text-8xl font-semibold leading-[130px] text-[#071A52] max-md:max-w-full max-md:text-4xl max-md:leading-[57px]">
          Your Network is your Net worth.
        </h1>
        <p className="mt-28 text-4xl font-medium text-[#071A52] max-md:mt-10 max-md:max-w-full">
          Stay connected effortlessly. Set reminders and{" "}
          <span className="inline-block bg-[#A7FF83]/20 px-4 py-2 rounded-[35px]">
            Never Lose a Connection Again.
          </span>
        </p>
      </div>
    </div>
  );
};
