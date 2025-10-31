import React from 'react';
import { 
    GeneratorIcon, EditorIcon, RemoveIcon, StyleIcon, UpscaleIcon, GalleryIcon, SparklesIcon, AnalystIcon, ToolsIcon
} from './Icons';

export type Mode = 'generate' | 'edit' | 'remove' | 'style' | 'upscale' | 'gallery' | 'analyst' | 'tools';

const modes: { id: Mode; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'generate', label: 'Generator', icon: GeneratorIcon },
  { id: 'edit', label: 'Editor', icon: EditorIcon },
  { id: 'upscale', label: 'Enhancer', icon: UpscaleIcon },
  { id: 'remove', label: 'Object Remover', icon: RemoveIcon },
  { id: 'style', label: 'Style Transfer', icon: StyleIcon },
  { id: 'tools', label: 'More Tools', icon: ToolsIcon },
  { id: 'gallery', label: 'My Gallery', icon: GalleryIcon },
  { id: 'analyst', label: 'Pro Analyst', icon: AnalystIcon },
];

interface SidebarProps {
  currentMode: Mode;
  onModeChange: (mode: Mode) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentMode, onModeChange }) => {
  const handleModeClick = (mode: Mode) => {
    onModeChange(mode);
  };
    
  return (
    <aside className="hidden md:flex fixed top-0 left-0 h-full w-64 bg-slate-900/70 backdrop-blur-xl border-r border-slate-800/80 z-40 flex-col">
      <div className="flex items-center justify-between p-4 border-b border-slate-800/80">
         <div className="flex items-center space-x-3">
           <SparklesIcon className="h-7 w-7 text-cyan-400" />
           <h2 className="text-lg font-bold text-white tracking-tight">Image Tools</h2>
         </div>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {modes.map((item) => {
          const Icon = item.icon;
          const isActive = currentMode === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleModeClick(item.id)}
              title={`Switch to ${item.label}`}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 text-left text-sm font-medium rounded-lg transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:ring-cyan-500 relative ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600/20 to-cyan-500/20 text-white shadow-inner'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
               <div className={`absolute left-0 h-6 w-1 rounded-r-full bg-cyan-400 transition-transform duration-300 ${isActive ? 'scale-y-100' : 'scale-y-0'}`} />
               <Icon className="w-5 h-5 flex-shrink-0 ml-1" />
               <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-800/80">
          <p className="text-slate-500 text-xs text-center">Powered by Google Gemini</p>
      </div>
    </aside>
  );
};

export default Sidebar;