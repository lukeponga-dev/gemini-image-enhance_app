import React from 'react';
import { 
    GeneratorIcon, EditorIcon, RemoveIcon, StyleIcon, UpscaleIcon, GalleryIcon, SparklesIcon
} from './Icons';

export type Mode = 'generate' | 'edit' | 'remove' | 'style' | 'upscale' | 'gallery';

const modes: { id: Mode; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'generate', label: 'Generator', icon: GeneratorIcon },
  { id: 'edit', label: 'Editor', icon: EditorIcon },
  { id: 'remove', label: 'Object Remover', icon: RemoveIcon },
  { id: 'style', label: 'Style Transfer', icon: StyleIcon },
  { id: 'upscale', label: 'Enhancer', icon: UpscaleIcon },
  { id: 'gallery', label: 'My Gallery', icon: GalleryIcon },
];

const InstallIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

interface HeaderProps {
    currentMode: Mode;
    onModeChange: (mode: Mode) => void;
    onInstallClick?: () => void;
    showInstallButton?: boolean;
}

const Header: React.FC<HeaderProps> = ({ currentMode, onModeChange, onInstallClick, showInstallButton }) => {
  
  const handleModeClick = (mode: Mode) => {
    onModeChange(mode);
  };
  
  return (
    <header className="bg-slate-950/70 backdrop-blur-lg shadow-lg border-b border-slate-800 sticky top-0 z-20">
      <div className="container mx-auto">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <SparklesIcon className="h-8 w-8 text-cyan-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Gemini Image Enhancer</h1>
          </div>
          <div className="flex items-center space-x-4">
              {showInstallButton && (
                  <button
                      onClick={onInstallClick}
                      className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-semibold rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500 transition-all transform hover:scale-105"
                  >
                      <InstallIcon className="w-5 h-5" />
                      <span className="hidden sm:inline">Install</span>
                  </button>
              )}
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="flex items-center justify-center p-2 border-t border-slate-800/60 overflow-x-auto no-scrollbar">
          <div className="flex items-center space-x-1 bg-slate-800/60 p-1.5 rounded-full border border-slate-700">
            {modes.map((item) => {
                const Icon = item.icon;
                const isActive = currentMode === item.id;
                return (
                <button
                    key={item.id}
                    onClick={() => handleModeClick(item.id)}
                    className={`relative flex items-center space-x-2 px-4 py-1.5 text-sm font-semibold rounded-full transition-colors duration-300 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:ring-cyan-500 ${
                    isActive
                        ? 'text-white'
                        : 'text-slate-300 hover:text-white'
                    }`}
                >
                     {isActive && (
                        <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full z-0"/>
                     )}
                     <span className="relative z-10 flex items-center gap-2">
                         <Icon className="w-4 h-4" />
                         <span>{item.label}</span>
                    </span>
                </button>
                );
            })}
            </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;