import React, { useState, useEffect } from 'react';
import ImageEditor from './components/ImageEditor';
import ImageGenerator from './components/ImageGenerator';
import ObjectRemover from './components/ObjectRemover';
import StyleTransfer from './components/StyleTransfer';
import PhotoEnhancer from './components/PhotoEnhancer';
import Gallery from './components/Gallery';
import Sidebar, { Mode } from './components/Sidebar';
import Header from './components/Header';
import Notification from './components/Notification';
import InstallPrompt from './components/InstallPrompt';
import { GalleryProvider, useGallery } from './contexts/GalleryContext';
import { ToolChainProvider, useToolChain } from './contexts/ToolChainContext';

// New components for specialized tasks
import BackgroundRemover from './components/BackgroundRemover';
import Unblurrer from './components/Unblurrer';
import Upscaler8K from './components/Upscaler8K';
import PhotoRestorer from './components/PhotoRestorer';
import ProAnalyst from './components/ProAnalyst';
import VideoGenerator from './components/VideoGenerator';
import ImageAnalyzer from './components/ImageAnalyzer';
import VideoAnalyzer from './components/VideoAnalyzer';

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
  const [mode, setMode] = useState<Mode>('enhancer');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { chainState, notification: toolChainNotification } = useToolChain();
  const { galleryNotification } = useGallery();
  
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
      const validModes: Mode[] = ['generate', 'edit', 'remove', 'style', 'enhancer', 'gallery', 'unblur', 'upscale8k', 'restore', 'bg-remover', 'analyst', 'video', 'analyze-image', 'analyze-video'];
      if(validModes.includes(chainState.targetTool as Mode)) {
        setMode(chainState.targetTool as Mode);
      }
    }
  }, [chainState]);

  const renderContent = () => {
    switch (mode) {
      case 'generate': return <ImageGenerator />;
      case 'video': return <VideoGenerator />;
      case 'analyze-image': return <ImageAnalyzer />;
      case 'analyze-video': return <VideoAnalyzer />;
      case 'edit': return <ImageEditor />;
      case 'remove': return <ObjectRemover />;
      case 'style': return <StyleTransfer />;
      case 'enhancer': return <PhotoEnhancer />;
      case 'gallery': return <Gallery />;
      case 'unblur': return <Unblurrer />;
      case 'upscale8k': return <Upscaler8K />;
      case 'restore': return <PhotoRestorer />;
      case 'analyst': return <ProAnalyst />;
      case 'bg-remover': return <BackgroundRemover />;
      default: return <PhotoEnhancer />;
    }
  }

  // Determine which notification to show
  const activeNotification = toolChainNotification || galleryNotification;

  return (
    <div className="min-h-screen text-blue-50 font-sans flex bg-blue-950">
        <Sidebar 
            currentMode={mode}
            onModeChange={setMode}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
        />
        <div className="flex-1 flex flex-col md:ml-64">
            <Header currentMode={mode} onMenuClick={() => setIsSidebarOpen(true)} />
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pt-20 md:pt-8 pb-8">
              <div className="transition-opacity duration-300 w-full">
                {renderContent()}
              </div>
            </main>
        </div>
        <Notification message={activeNotification} />
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