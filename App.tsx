import React, { useState, useEffect } from 'react';
import ImageEditor from './components/ImageEditor';
import ImageGenerator from './components/ImageGenerator';
import ObjectRemover from './components/ObjectRemover';
import StyleTransfer from './components/StyleTransfer';
import ImageUpscaler from './components/ImageUpscaler';
import Gallery from './components/Gallery';
import Tools from './components/Tools';
import ProAnalyst from './components/ProAnalyst';
import Chatbot from './components/Chatbot';
import Sidebar, { Mode } from './components/Sidebar';
import Header from './components/Header';
import BottomNavBar from './components/BottomNavBar';
import Notification from './components/Notification';
import InstallPrompt from './components/InstallPrompt';
import { GalleryProvider } from './contexts/GalleryContext';
import { ToolChainProvider, useToolChain } from './contexts/ToolChainContext';

// PWA Install prompt event type
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}


const AppContent: React.FC = () => {
  const [mode, setMode] = useState<Mode>('generate');
  const { chainState, notification } = useToolChain();
  
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
      // Show prompt only if it hasn't been dismissed before in this session
      if (!sessionStorage.getItem('pwa_install_dismissed')) {
        setShowInstallPrompt(true);
      }
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstall = () => {
    if (!installEvent) return;
    installEvent.prompt();
    installEvent.userChoice.then(() => {
      setInstallEvent(null);
      setShowInstallPrompt(false);
    });
  };

  const handleDismissInstall = () => {
    setShowInstallPrompt(false);
    sessionStorage.setItem('pwa_install_dismissed', 'true');
  };


  useEffect(() => {
    if (chainState) {
      // Ensure the target tool from the chain is a valid mode.
      const validModes: Mode[] = ['generate', 'edit', 'remove', 'style', 'upscale', 'gallery', 'tools', 'analyst', 'chat'];
      if(validModes.includes(chainState.targetTool as Mode)) {
        setMode(chainState.targetTool as Mode);
      }
    }
  }, [chainState]);

  const renderContent = () => {
    switch (mode) {
      case 'generate': return <ImageGenerator />;
      case 'edit': return <ImageEditor />;
      case 'remove': return <ObjectRemover />;
      case 'style': return <StyleTransfer />;
      case 'upscale': return <ImageUpscaler />;
      case 'gallery': return <Gallery />;
      case 'tools': return <Tools onModeChange={setMode} />;
      case 'analyst': return <ProAnalyst />;
      case 'chat': return <Chatbot />;
      default: return <ImageGenerator />;
    }
  }

  return (
    <div className="min-h-screen text-zinc-100 font-sans flex bg-zinc-950">
        <Sidebar 
            currentMode={mode}
            onModeChange={setMode}
        />
        <div className="flex-1 flex flex-col md:ml-64">
            <Header currentMode={mode} />
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pt-20 md:pt-8 pb-24 md:pb-8">
              <div className="transition-opacity duration-300 w-full">
                {renderContent()}
              </div>
            </main>
        </div>
        <BottomNavBar
            currentMode={mode}
            onModeChange={setMode}
        />
        <Notification message={notification} />
        <InstallPrompt 
            show={showInstallPrompt} 
            onInstall={handleInstall}
            onDismiss={handleDismissInstall}
        />
    </div>
  );
}

const App: React.FC = () => {
  return (
    <GalleryProvider>
      <ToolChainProvider>
        <AppContent />
      </ToolChainProvider>
    </GalleryProvider>
  );
};

export default App;