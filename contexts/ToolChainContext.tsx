import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Mode } from '../components/Header';

export interface ChainedImage {
  dataUrl: string;
  prompt: string;
}

export interface ChainState {
    image: ChainedImage;
    targetTool: Mode;
}

interface ToolChainContextType {
  chainState: ChainState | null;
  sendImageToTool: (image: ChainedImage, tool: Mode) => void;
  consumeChainedImage: () => ChainState | null;
}

const ToolChainContext = createContext<ToolChainContextType | undefined>(undefined);

export const ToolChainProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [chainState, setChainState] = useState<ChainState | null>(null);

  const sendImageToTool = (image: ChainedImage, tool: Mode) => {
    setChainState({ image, targetTool: tool });
  };

  const consumeChainedImage = (): ChainState | null => {
    if (!chainState) return null;
    const consumedState = { ...chainState };
    setChainState(null); // Clear after consumption
    return consumedState;
  };

  return (
    <ToolChainContext.Provider value={{ chainState, sendImageToTool, consumeChainedImage }}>
      {children}
    </ToolChainContext.Provider>
  );
};

export const useToolChain = (): ToolChainContextType => {
  const context = useContext(ToolChainContext);
  if (context === undefined) {
    throw new Error('useToolChain must be used within a ToolChainProvider');
  }
  return context;
};