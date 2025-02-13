
import React from 'react';

interface BackgroundContainerProps {
  backgroundColor: string;
  children: React.ReactNode;
}

const BackgroundContainer: React.FC<BackgroundContainerProps> = ({ backgroundColor, children }) => {
  return (
    <div className="flex overflow-hidden flex-col px-3 py-3 bg-stone-300 w-full max-w-[716px] rounded-[35px]">
      <div className={`flex overflow-hidden items-center px-6 py-3 w-full ${backgroundColor} rounded-[35px]`}>
        {children}
      </div>
    </div>
  );
};

export default BackgroundContainer;
