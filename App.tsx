import React, { useState, useEffect } from 'react';
import ImageEditor from './components/ImageEditor';
import ImageGenerator from './components/ImageGenerator';
import Header from './components/Header';
import ObjectRemover from './components/ObjectRemover';
import StyleTransfer from './components/StyleTransfer';
import ImageUpscaler from './components/ImageUpscaler';
import Gallery from './components/Gallery';
import InstallPrompt from './components/InstallPrompt';
import { GalleryProvider } from './contexts/GalleryContext';
import { ToolChainProvider, useToolChain } from './contexts/ToolChainContext';
import { Mode } from './components/Header';


const AppContent: React.FC = () => {
  const [mode, setMode] = useState<Mode>('generate');
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showInstallPopup, setShowInstallPopup] = useState(false);
  const { chainState } = useToolChain();

  useEffect(() => {
    if (chainState) {
      setMode(chainState.targetTool);
    }
  }, [chainState]);

  useEffect(() => {
    // PWA Install Prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      // Show prompt only if it hasn't been dismissed in the current session
      if (!sessionStorage.getItem('installPromptDismissed')) {
          setInstallPrompt(e);
          setShowInstallPopup(true);
      }
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Service Worker Registration
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        const swUrl = `${window.location.origin}/sw.js`;
        navigator.serviceWorker.register(swUrl)
          .then(registration => {
            console.log('Service Worker registration successful with scope: ', registration.scope);
          })
          .catch(err => {
            console.error('Service Worker registration failed: ', err);
          });
      });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (!installPrompt) {
      return;
    }
    installPrompt.prompt();
    setShowInstallPopup(false); // Hide our custom popup
    installPrompt.userChoice.then((choiceResult: { outcome: 'accepted' | 'dismissed' }) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      setInstallPrompt(null);
    });
  };

  const handleDismissInstall = () => {
    setShowInstallPopup(false);
    sessionStorage.setItem('installPromptDismissed', 'true');
  };

  return (
    <>
      <div className="min-h-screen text-slate-100 font-sans flex flex-col">
        <Header 
          currentMode={mode}
          onModeChange={setMode}
          onInstallClick={handleInstallClick}
          showInstallButton={!!installPrompt}
        />
        <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
          <div className="transition-opacity duration-300 w-full">
            {mode === 'generate' && <ImageGenerator />}
            {mode === 'edit' && <ImageEditor />}
            {mode === 'remove' && <ObjectRemover />}
            {mode === 'style' && <StyleTransfer />}
            {mode === 'upscale' && <ImageUpscaler />}
            {mode === 'gallery' && <Gallery />}
          </div>
        </main>
      </div>
      <InstallPrompt
        show={showInstallPopup}
        onInstall={handleInstallClick}
        onDismiss={handleDismissInstall}
       />
    </>
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