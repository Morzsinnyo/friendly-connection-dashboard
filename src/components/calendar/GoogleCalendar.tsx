import React from 'react';

export const GoogleCalendar = () => {
  return (
    <div className="w-full h-[600px] bg-background">
      <iframe
        src="https://calendar.google.com/calendar/embed?src=morzsi812%40gmail.com&ctz=local"
        style={{ border: 0 }}
        width="100%"
        height="100%"
        frameBorder="0"
        scrolling="no"
        className="rounded-lg shadow-sm"
      ></iframe>
    </div>
  );
};