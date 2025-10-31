import React from 'react';
import { Mode } from './Sidebar';
import { RemoveIcon, StyleIcon, AnalystIcon } from './Icons';

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
    {
        id: 'analyst',
        label: 'Pro Analyst',
        description: 'Tackle complex problems with AI',
        icon: AnalystIcon
    },
];

interface ToolsProps {
    onModeChange: (mode: Mode) => void;
}

const Tools: React.FC<ToolsProps> = ({ onModeChange }) => {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-zinc-50 tracking-tight">More Tools</h2>
        <p className="mt-2 text-lg text-zinc-400">Explore specialized AI-powered utilities.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map(tool => {
            const Icon = tool.icon;
            return (
                <button
                    key={tool.id}
                    onClick={() => onModeChange(tool.id)}
                    className="group bg-zinc-900/80 p-6 rounded-2xl border border-zinc-800 text-left hover:border-violet-500/50 hover:bg-zinc-900 transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                    <div className="flex items-center gap-4">
                        <div className="bg-zinc-800 group-hover:bg-gradient-to-br group-hover:from-purple-600 group-hover:to-violet-500 p-3 rounded-lg transition-colors">
                            <Icon className="w-6 h-6 text-violet-400 group-hover:text-white transition-colors" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-zinc-50">{tool.label}</h3>
                            <p className="text-sm text-zinc-400">{tool.description}</p>
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