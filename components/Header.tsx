import React from 'react';

const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.321l5.478.399a.562.562 0 0 1 .313.952l-4.224 3.622a.563.563 0 0 0-.162.522l1.285 5.328a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0l-4.725 2.885a.562.562 0 0 1-.84-.61l1.285-5.328a.562.562 0 0 0-.162-.522L1.172 10.28a.562.562 0 0 1 .313-.952l5.478-.399a.563.563 0 0 0 .475-.321L11.48 3.5Z" />
    </svg>
);


const Header: React.FC = () => {
  return (
    <header className="bg-slate-900/50 backdrop-blur-lg p-4 shadow-lg border-b border-gray-700/50 sticky top-0 z-10">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <SparklesIcon className="h-8 w-8 text-cyan-400" />
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Gemini Image Enhancer</h1>
        </div>
        <p className="text-gray-400 text-sm hidden md:block">Powered by Gemini & Imagen</p>
      </div>
    </header>
  );
};

export default Header;