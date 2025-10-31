import React from 'react';
import { 
    GeneratorIcon, EditorIcon, RemoveIcon, StyleIcon, GalleryIcon, SparklesIcon, CloseIcon,
    UnblurIcon, Upscale8KIcon, RestoreIcon, BgRemoverIcon, UpscaleIcon,
    // FIX: Import AnalystIcon to be used for the Pro Analyst tool.
    AnalystIcon
} from './Icons';

// FIX: Add 'analyst' to the Mode type to support the Pro Analyst tool.
export type Mode = 'generate' | 'edit' | 'remove' | 'style' | 'enhancer' | 'gallery' | 'unblur' | 'upscale8k' | 'restore' | 'bg-remover' | 'analyst';

interface Tool {
    id: Mode;
    label: string;
    icon: React.FC<{ className?: string }>;
}

const mainTools: Tool[] = [
  { id: 'enhancer', label: 'Photo Enhancer', icon: UpscaleIcon },
  { id: 'unblur', label: 'Unblur Image', icon: UnblurIcon },
  { id: 'upscale8k', label: 'Upscale to 8K', icon: Upscale8KIcon },
  { id: 'restore', label: 'Restore Old Photo', icon: RestoreIcon },
];

const aiTools: Tool[] = [
  { id: 'bg-remover', label: 'Background Remover', icon: BgRemoverIcon },
  { id: 'remove', label: 'Remove Objects', icon: RemoveIcon },
  { id: 'generate', label: 'AI Image Generator', icon: GeneratorIcon },
  { id: 'edit', label: 'Manual Editor', icon: EditorIcon },
  { id: 'style', label: 'Style Transfer', icon: StyleIcon },
  // FIX: Add Pro Analyst to the list of AI tools in the sidebar.
  { id: 'analyst', label: 'Pro Analyst', icon: AnalystIcon },
];

const appFeatures: Tool[] = [
  { id: 'gallery', label: 'My Gallery', icon: GalleryIcon },
];

export const allTools = [...mainTools, ...aiTools, ...appFeatures];

interface SidebarProps {
  currentMode: Mode;
  onModeChange: (mode: Mode) => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentMode, onModeChange, isOpen, onClose }) => {
  const handleModeClick = (mode: Mode) => {
    onModeChange(mode);
    onClose();
  };
    
  const renderToolList = (tools: Tool[]) => tools.map((item) => {
    const Icon = item.icon;
    const isActive = currentMode === item.id;
    return (
      <button
        key={item.id}
        onClick={() => handleModeClick(item.id)}
        title={`Switch to ${item.label}`}
        className={`w-full flex items-center space-x-3 px-4 py-2.5 text-left text-sm font-medium rounded-lg transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-900 focus-visible:ring-rose-500 relative ${
          isActive
            ? 'bg-gradient-to-r from-rose-600/20 to-pink-500/20 text-white shadow-inner'
            : 'text-blue-200 hover:bg-blue-800/60 hover:text-white'
        }`}
      >
         <div className={`absolute left-0 h-6 w-1 rounded-r-full bg-rose-400 transition-transform duration-300 ${isActive ? 'scale-y-100' : 'scale-y-0'}`} />
         <Icon className="w-5 h-5 flex-shrink-0 ml-1" />
         <span>{item.label}</span>
      </button>
    );
  });

  return (
    <>
      <div 
        className={`md:hidden fixed inset-0 bg-black/60 z-30 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className={`fixed top-0 h-full w-64 bg-blue-950/80 backdrop-blur-xl border-r border-blue-800/80 z-40 flex flex-col transition-transform transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:flex`}>
        <div className="flex items-center justify-between p-4 border-b border-blue-800/80">
           <div className="flex items-center space-x-3">
             <SparklesIcon className="h-7 w-7 text-rose-400" />
             <h2 className="text-lg font-bold text-white tracking-tight">Lets Enhance</h2>
           </div>
           <button onClick={onClose} className="md:hidden p-1 text-blue-300 hover:text-white" title="Close menu">
              <CloseIcon className="w-6 h-6" />
           </button>
        </div>
        <nav className="flex-1 p-2 space-y-2 overflow-y-auto no-scrollbar">
            <div className="p-2">
                {renderToolList(mainTools)}
            </div>
            <div className="p-2">
                <h3 className="px-4 py-2 text-xs font-semibold text-blue-400 uppercase tracking-wider">AI Tools</h3>
                {renderToolList(aiTools)}
            </div>
             <div className="p-2">
                <h3 className="px-4 py-2 text-xs font-semibold text-blue-400 uppercase tracking-wider">App Features</h3>
                {renderToolList(appFeatures)}
            </div>
        </nav>
        <div className="p-4 border-t border-blue-800/80">
            <p className="text-blue-500 text-xs text-center">Powered by Google Gemini</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;