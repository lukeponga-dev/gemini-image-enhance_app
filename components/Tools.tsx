import React from 'react';
import { Mode } from './Sidebar';
import { RemoveIcon, StyleIcon } from './Icons';

const tools: { id: Mode; label: string; description: string; icon: React.FC<{ className?: string }> }[] = [
    {
        id: 'remove',
        label: 'Object Remover',
        description: 'Erase unwanted objects from photos',
        icon: RemoveIcon
    },
    {
        id: 'style',
        label: 'Style Transfer',
        description: 'Combine the style of two images',
        icon: StyleIcon
    },
];

interface ToolsProps {
    onModeChange: (mode: Mode) => void;
}

const Tools: React.FC<ToolsProps> = ({ onModeChange }) => {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white tracking-tight">More Tools</h2>
        <p className="mt-2 text-lg text-slate-400">Explore specialized AI-powered utilities.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map(tool => {
            const Icon = tool.icon;
            return (
                <button
                    key={tool.id}
                    onClick={() => onModeChange(tool.id)}
                    className="group bg-slate-900/50 p-6 rounded-2xl border border-slate-800 text-left hover:border-cyan-500/50 hover:bg-slate-900 transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                    <div className="flex items-center gap-4">
                        <div className="bg-slate-800 group-hover:bg-gradient-to-br group-hover:from-blue-600 group-hover:to-cyan-500 p-3 rounded-lg transition-colors">
                            <Icon className="w-6 h-6 text-cyan-400 group-hover:text-white transition-colors" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white">{tool.label}</h3>
                            <p className="text-sm text-slate-400">{tool.description}</p>
                        </div>
                    </div>
                </button>
            )
        })}
      </div>
    </div>
  );
};

export default Tools;