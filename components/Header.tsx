import React from 'react';
import { Mode, allTools } from './Sidebar';
import { MenuIcon } from './Icons';

interface HeaderProps {
  currentMode: Mode;
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentMode, onMenuClick }) => {
  const currentTool = allTools.find(m => m.id === currentMode);
  const title = currentTool ? currentTool.label : 'Lets Enhance';

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-blue-950/70 backdrop-blur-xl border-b border-blue-800/80 z-20 flex items-center justify-between px-4 md:hidden">
        <button onClick={onMenuClick} className="p-2 text-blue-200 hover:text-white" title="Open menu">
            <MenuIcon className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold text-white tracking-tight absolute left-1/2 -translate-x-1/2">{title}</h1>
        <div className="w-8 h-8"></div> {/* Spacer to balance the title */}
    </header>
  );
};

export default Header;