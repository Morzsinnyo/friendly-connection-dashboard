
import React from 'react';

export function HeroSection() {
  return (
    <div className="py-12 text-left">
      <h2 className="text-6xl font-semibold leading-tight text-[#071A52] mb-3">
        Your Network is your<br />
        Net worth.
      </h2>
      <p className="text-2xl text-[#071A52] mb-8">
        Stay connected effortlessly. Set reminders and{" "}
        <span className="inline-block bg-[#A7FF83] px-4 py-1 rounded-full">
          Never Lose a Connection Again.
        </span>
      </p>
    </div>
  );
}
