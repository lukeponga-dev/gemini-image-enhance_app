import React from 'react';
import { Mode } from './Sidebar';
import { SparklesIcon, EditorIcon, GeneratorIcon, RemoveIcon, GalleryIcon } from './Icons';

const navItems: { id: Mode; label: string; icon: React.FC<{ className?: string }> }[] = [
  // FIX: Changed 'upscale' to 'enhancer' to match a valid Mode.
  { id: 'enhancer', label: 'Enhance', icon: SparklesIcon },
  { id: 'edit', label: 'Editor', icon: EditorIcon },
  { id: 'generate', label: 'Generate', icon: GeneratorIcon },
  // FIX: Replaced invalid 'tools' mode with 'remove' and updated label and icon.
  { id: 'remove', label: 'Remove', icon: RemoveIcon },
  { id: 'gallery', label: 'Gallery', icon: GalleryIcon },
];

interface BottomNavBarProps {
  currentMode: Mode;
  onModeChange: (mode: Mode) => void;
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({ currentMode, onModeChange }) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40">
      <div className="bg-zinc-950/70 backdrop-blur-xl border-t border-zinc-800">
        <nav className="flex items-center justify-around h-20">
          {navItems.map((item) => {
            const isActive = currentMode === item.id;
            const Icon = item.icon;

            if (item.id === 'generate') {
                return (
                    <button
                        key={item.id}
                        onClick={() => onModeChange(item.id)}
                        aria-label={item.label}
                        title={item.label}
                        className={`relative -translate-y-4 h-16 w-16 flex items-center justify-center rounded-full text-white shadow-lg transition-all duration-300 transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-950 focus:ring-violet-500 ${
                            isActive 
                            ? 'bg-gradient-to-br from-purple-500 to-violet-400 shadow-violet-500/30 scale-110' 
                            : 'bg-gradient-to-br from-purple-600 to-violet-500 hover:scale-105'
                        }`}
                    >
                        <Icon className="w-8 h-8"/>
                    </button>
                )
            }
            
            return (
              <button
                key={item.id}
                onClick={() => onModeChange(item.id)}
                aria-label={item.label}
                title={item.label}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-200 outline-none focus:bg-zinc-800/50 rounded-md ${
                  isActive ? 'text-violet-400' : 'text-zinc-400 hover:text-zinc-100'
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default BottomNavBar;