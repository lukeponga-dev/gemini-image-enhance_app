import React, { useState, useEffect } from 'react';
import ImageEditor from './components/ImageEditor';
import ImageGenerator from './components/ImageGenerator';
import Header from './components/Header';
import ObjectRemover from './components/ObjectRemover';
import StyleTransfer from './components/StyleTransfer';
import ImageUpscaler from './components/ImageUpscaler';
import Gallery from './components/Gallery';
import { GalleryProvider } from './contexts/GalleryContext';

type Mode = 'generate' | 'edit' | 'remove' | 'style' | 'upscale' | 'gallery';

const modes: { id: Mode; label: string }[] = [
  { id: 'generate', label: 'Generator' },
  { id: 'edit', label: 'Editor' },
  { id: 'remove', label: 'Object Remover' },
  { id: 'style', label: 'Style Transfer' },
  { id: 'upscale', label: 'Enhancer' },
  { id: 'gallery', label: 'My Gallery' },
];


const App: React.FC = () => {
  const [mode, setMode] = useState<Mode>('generate');
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (!installPrompt) {
      return;
    }
    installPrompt.prompt();
    installPrompt.userChoice.then((choiceResult: { outcome: 'accepted' | 'dismissed' }) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      setInstallPrompt(null);
    });
  };

  return (
    <GalleryProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 text-gray-100 font-sans">
        <Header 
          onInstallClick={handleInstallClick}
          showInstallButton={!!installPrompt}
        />
        <main className="container mx-auto p-4 md:p-8">
          <div className="mb-8 flex justify-center">
            <div className="bg-gray-800/60 p-1.5 rounded-full flex items-center space-x-1 overflow-x-auto no-scrollbar max-w-full">
              {modes.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setMode(item.id)}
                  className={`relative flex-shrink-0 px-3 sm:px-4 py-1.5 sm:py-2 text-sm font-medium transition-colors duration-300 outline-none rounded-full ${
                    mode === item.id
                      ? 'text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {mode === item.id && (
                    <span
                      // layoutId="active-pill"
                      className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full z-0"
                      // transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{item.label}</span>
                </button>
              ))}
            </div>
          </div>


          <div className="transition-opacity duration-300">
            {mode === 'generate' && <ImageGenerator />}
            {mode === 'edit' && <ImageEditor />}
            {mode === 'remove' && <ObjectRemover />}
            {mode === 'style' && <StyleTransfer />}
            {mode === 'upscale' && <ImageUpscaler />}
            {mode === 'gallery' && <Gallery />}
          </div>
        </main>
      </div>
    </GalleryProvider>
  );
};

export default App;