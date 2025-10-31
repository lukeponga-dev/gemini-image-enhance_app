import React, { useState, useEffect } from 'react';
import { SparklesIcon } from './Icons';

interface NotificationProps {
  message: string | null;
}

const Notification: React.FC<NotificationProps> = ({ message }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [message]);

  return (
    <div
      className={`fixed top-5 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 ease-in-out ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0 pointer-events-none'
      }`}
    >
      <div className="bg-blue-800/80 backdrop-blur-lg rounded-full shadow-2xl p-1 flex items-center justify-between gap-4 border border-blue-700/50">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-rose-600 to-pink-500 rounded-full p-2">
            <SparklesIcon className="w-5 h-5 text-white" />
          </div>
          <p className="font-semibold text-white text-sm pr-4">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default Notification;