import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  isLoading?: boolean;
  variant?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({ children, isLoading = false, variant = 'primary', ...props }) => {
  const primaryClasses = "bg-gradient-to-r from-rose-600 to-pink-500 hover:from-rose-700 hover:to-pink-600 focus:ring-rose-500 text-white shadow-lg hover:shadow-rose-500/20";
  const secondaryClasses = "bg-blue-800/60 hover:bg-blue-700/80 text-blue-100 border border-blue-700 hover:border-blue-600 focus:ring-blue-500";
  
  return (
    <button
      {...props}
      disabled={isLoading || props.disabled}
      className={`relative inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-900 disabled:from-blue-700 disabled:to-blue-600 disabled:text-blue-400 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-300 transform hover:scale-105 ${
        variant === 'primary' ? primaryClasses : secondaryClasses
      } ${props.className || ''}`}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      <span className={isLoading ? 'opacity-0' : 'opacity-100'}>{children}</span>
       {isLoading && <span className="absolute">{children}</span>}
    </button>
  );
};

export default Button;