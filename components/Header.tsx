import React from 'react';
import { Mode, modes } from './Sidebar';

interface HeaderProps {
  currentMode: Mode;
}

const Header: React.FC<HeaderProps> = ({ currentMode }) => {
  const currentTool = modes.find(m => m.id === currentMode);
  const title = currentTool ? currentTool.label : 'Image Tools';

  return (
    <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-zinc-950/70 backdrop-blur-xl border-b border-zinc-800/80 z-30 flex items-center justify-center">
        <h1 className="text-lg font-bold text-white tracking-tight">{title}</h1>
    </header>
  );
};

export default Header;