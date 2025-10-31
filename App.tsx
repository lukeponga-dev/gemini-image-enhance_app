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
import Sidebar, { Mode } from './components/Sidebar';

const App: React.FC = () => {
  const [mode, setMode] = useState<Mode>('generate');
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showInstallPopup, setShowInstallPopup] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
    <GalleryProvider>
      <div className="min-h-screen text-slate-100 font-sans flex">
        <Sidebar 
          currentMode={mode} 
          onModeChange={setMode} 
          isOpen={isSidebarOpen} 
          setIsOpen={setIsSidebarOpen} 
        />
        <div className="flex-1 flex flex-col md:pl-64">
          <Header 
            onInstallClick={handleInstallClick}
            showInstallButton={!!installPrompt}
            onMenuClick={() => setIsSidebarOpen(true)}
          />
          <main className="flex flex-1 items-center justify-center p-4 md:p-8">
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
      </div>
      <InstallPrompt
        show={showInstallPopup}
        onInstall={handleInstallClick}
        onDismiss={handleDismissInstall}
       />
    </GalleryProvider>
  );
};

export default App;