import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Mode } from '../components/Sidebar';

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
  notification: string | null;
  sendImageToTool: (image: ChainedImage, tool: Mode, message?: string) => void;
  consumeChainedImage: () => ChainState | null;
}

const ToolChainContext = createContext<ToolChainContextType | undefined>(undefined);

export const ToolChainProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [chainState, setChainState] = useState<ChainState | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  // Fix: Use ReturnType<typeof setTimeout> for browser compatibility instead of NodeJS.Timeout.
  const [notificationTimeout, setNotificationTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Cleanup timeout on unmount
    return () => {
        if (notificationTimeout) {
            clearTimeout(notificationTimeout);
        }
    }
  }, [notificationTimeout]);

  const sendImageToTool = (image: ChainedImage, tool: Mode, message?: string) => {
    setChainState({ image, targetTool: tool });
    if (message) {
        if (notificationTimeout) {
            clearTimeout(notificationTimeout);
        }
        setNotification(message);
        const timeout = setTimeout(() => {
            setNotification(null);
        }, 3000); // Notification visible for 3 seconds
        setNotificationTimeout(timeout);
    }
  };

  const consumeChainedImage = (): ChainState | null => {
    if (!chainState) return null;
    const consumedState = { ...chainState };
    setChainState(null); // Clear after consumption
    return consumedState;
  };

  return (
    <ToolChainContext.Provider value={{ chainState, notification, sendImageToTool, consumeChainedImage }}>
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
