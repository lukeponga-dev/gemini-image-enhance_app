import React from 'react';

const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.321l5.478.399a.562.562 0 0 1 .313.952l-4.224 3.622a.563.563 0 0 0-.162.522l1.285 5.328a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0l-4.725 2.885a.562.562 0 0 1-.84-.61l1.285-5.328a.562.562 0 0 0-.162-.522L1.172 10.28a.562.562 0 0 1 .313-.952l5.478-.399a.563.563 0 0 0 .475-.321L11.48 3.5Z" />
    </svg>
);

const InstallIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const MenuIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

interface HeaderProps {
    onInstallClick?: () => void;
    showInstallButton?: boolean;
    onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onInstallClick, showInstallButton, onMenuClick }) => {
  return (
    <header className="bg-slate-950/50 backdrop-blur-lg p-4 shadow-lg border-b border-slate-800 sticky top-0 z-20">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button onClick={onMenuClick} className="md:hidden p-2 -ml-2 text-slate-300 hover:text-white">
              <MenuIcon className="w-6 h-6" />
          </button>
          <div className="flex items-center space-x-3">
            <SparklesIcon className="h-8 w-8 text-cyan-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Gemini Image Enhancer</h1>
          </div>
        </div>
        <div className="flex items-center space-x-4">
            {showInstallButton && (
                <button
                    onClick={onInstallClick}
                    className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-semibold rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500 transition-all transform hover:scale-105"
                >
                    <InstallIcon className="w-5 h-5" />
                    <span>Install App</span>
                </button>
            )}
            <p className="text-slate-400 text-sm hidden md:block">Powered by Gemini & Imagen</p>
        </div>
      </div>
    </header>
  );
};

export default Header;