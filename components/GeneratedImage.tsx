import React, { useState, useEffect, useRef } from 'react';
import { useGallery } from '../contexts/GalleryContext';
import { useToolChain } from '../contexts/ToolChainContext';
import { Mode } from './Header';
import { SendToIcon } from './Icons';

interface GeneratedImageProps {
  src: string;
  alt: string;
  prompt: string;
  context?: 'result' | 'gallery';
}

const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const SaveIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const actionTools: { id: Mode; label: string }[] = [
    { id: 'edit', label: 'Editor' },
    { id: 'remove', label: 'Object Remover' },
    { id: 'style', label: 'Style Transfer' },
    { id: 'upscale', label: 'Enhancer' },
];

const GeneratedImage: React.FC<GeneratedImageProps> = ({ src, alt, prompt, context = 'result' }) => {
  const { addImageToGallery, galleryItems } = useGallery();
  const { sendImageToTool } = useToolChain();
  const [isSaved, setIsSaved] = useState(false);
  const [showSendToMenu, setShowSendToMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const showSendToButton = context === 'result';

  useEffect(() => {
    setIsSaved(galleryItems.some(item => item.src === src));
  }, [galleryItems, src]);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = src;
    
    const sanitizedPrompt = prompt.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
    link.download = `gemini-image-${sanitizedPrompt || 'download'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveToGallery = () => {
    if (!isSaved) {
        addImageToGallery({ src, alt, prompt });
    }
  };

  const handleSendTo = (tool: Mode) => {
    sendImageToTool({ dataUrl: src, prompt }, tool);
    setShowSendToMenu(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowSendToMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative group bg-slate-900/50 rounded-lg overflow-hidden shadow-lg border border-slate-800">
      <img src={src} alt={alt} className="w-full h-full object-contain" />
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition-all duration-300 flex items-center justify-center gap-2 sm:gap-4">
        <button
          onClick={handleSaveToGallery}
          disabled={isSaved}
          className="opacity-0 group-hover:opacity-100 transition-all duration-300 delay-100 transform group-hover:scale-100 scale-90 flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-green-500 disabled:bg-slate-600 disabled:cursor-not-allowed"
        >
            <SaveIcon className="w-5 h-5" />
            <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
        </button>
        <button
          onClick={handleDownload}
          className="opacity-0 group-hover:opacity-100 transition-all duration-300 delay-200 transform group-hover:scale-100 scale-90 flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500"
        >
          <DownloadIcon className="w-5 h-5" />
          <span className="hidden sm:inline">Download</span>
        </button>

        {showSendToButton && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowSendToMenu(!showSendToMenu)}
              className="opacity-0 group-hover:opacity-100 transition-all duration-300 delay-300 transform group-hover:scale-100 scale-90 flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-slate-500"
            >
              <SendToIcon className="w-5 h-5" />
              <span className="hidden sm:inline">Send To</span>
            </button>
            {showSendToMenu && (
              <div className="absolute bottom-full mb-2 w-48 bg-slate-800 rounded-md shadow-lg z-10 border border-slate-700 animate-fade-in-up">
                <div className="py-1">
                  {actionTools.map(tool => (
                    <button
                      key={tool.id}
                      onClick={() => handleSendTo(tool.id)}
                      className="block w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-slate-700/80 transition-colors"
                    >
                      {tool.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GeneratedImage;