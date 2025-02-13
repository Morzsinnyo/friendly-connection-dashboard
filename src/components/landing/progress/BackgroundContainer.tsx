
import React from 'react';

interface BackgroundContainerProps {
  backgroundColor: string;
  children: React.ReactNode;
}

const BackgroundContainer: React.FC<BackgroundContainerProps> = ({ backgroundColor, children }) => {
  return (
    <div className="flex overflow-hidden flex-col pr-28 bg-stone-300 max-w-[716px] rounded-[35px] max-md:pr-5">
      <div className={`flex overflow-hidden flex-col flex-1 justify-center px-10 py-1 w-full ${backgroundColor} rounded-[35px] max-md:px-5 max-md:max-w-full h-16`}>
        {children}
      </div>
    </div>
  );
};

export default BackgroundContainer;
