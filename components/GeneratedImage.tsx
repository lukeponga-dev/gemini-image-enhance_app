import React, { useState, useEffect } from 'react';
import { useGallery } from '../contexts/GalleryContext';
import { useToolChain } from '../contexts/ToolChainContext';
import { Mode } from './Sidebar';
import { EditorIcon, RemoveIcon, StyleIcon, UpscaleIcon, ImageSearchIcon, ChatIcon } from './Icons'; // New: Import ChatIcon

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

const actionTools: { id: Mode; label: string; icon: React.FC<{className?: string}> }[] = [
    { id: 'edit', label: 'Editor', icon: EditorIcon },
    { id: 'remove', label: 'Object Remover', icon: RemoveIcon },
    { id: 'style', label: 'Style Transfer', icon: StyleIcon },
    { id: 'enhancer', label: 'Enhancer', icon: UpscaleIcon },
    { id: 'analyze-image', label: 'Analyze', icon: ImageSearchIcon },
    { id: 'chatbot', label: 'Chatbot', icon: ChatIcon }, // New: Added Chatbot
];

const GeneratedImage: React.FC<GeneratedImageProps> = ({ src, alt, prompt, context = 'result' }) => {
  const { addImageToGallery, galleryItems } = useGallery();
  const { sendImageToTool } = useToolChain();
  const [isSaved, setIsSaved] = useState(false);
  const showActions = context === 'result';

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
    const toolName = actionTools.find(t => t.id === tool)?.label || 'tool';
    sendImageToTool({ dataUrl: src, prompt }, tool, `Sending image to ${toolName}...`);
  };


  return (
    <div className="bg-blue-900/80 rounded-lg overflow-hidden shadow-lg border border-blue-800 flex flex-col">
      <div className="relative group">
         <img src={src} alt={alt} className="w-full h-auto object-contain" />
         { context === 'gallery' && (
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition-all duration-300 flex items-center justify-center gap-2 sm:gap-4">
                <button
                  onClick={handleSaveToGallery}
                  disabled={isSaved}
                  title={isSaved ? 'This image is already in your gallery' : 'Save this image to your personal gallery'}
                  className="opacity-0 group-hover:opacity-100 transition-all duration-300 delay-100 transform group-hover:scale-100 scale-90 flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-900 focus:ring-green-500 disabled:bg-blue-600 disabled:cursor-not-allowed"
                >
                    <SaveIcon className="w-5 h-5" />
                    <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
                </button>
                <button
                  onClick={handleDownload}
                  title="Download this image to your device"
                  className="opacity-0 group-hover:opacity-100 transition-all duration-300 delay-200 transform group-hover:scale-100 scale-90 flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-900 focus:ring-sky-500"
                >
                  <DownloadIcon className="w-5 h-5" />
                  <span className="hidden sm:inline">Download</span>
                </button>
             </div>
          )}
      </div>
     
      {showActions && (
          <div className="p-4 bg-blue-900 border-t border-blue-800">
             {/* Primary Actions */}
             <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                 <button
                    onClick={handleSaveToGallery}
                    disabled={isSaved}
                    title={isSaved ? 'This image is already in your gallery' : 'Save this image to your personal gallery'}
                    className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-900 focus:ring-green-500 disabled:bg-blue-600 disabled:cursor-not-allowed transition-all transform hover:scale-105"
                    >
                    <SaveIcon className="w-5 h-5" />
                    <span>{isSaved ? 'Saved to Gallery' : 'Save to Gallery'}</span>
                </button>
                 <button
                    onClick={handleDownload}
                    title="Download this image to your device"
                    className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-900 focus:ring-sky-500 transition-all transform hover:scale-105"
                    >
                    <DownloadIcon className="w-5 h-5" />
                    <span>Download</span>
                </button>
             </div>
             
             {/* Tool Chaining Actions */}
             <div className="mt-4 pt-4 border-t border-blue-700/60">
                 <p className="text-sm font-semibold text-center text-blue-300 mb-3">Send to another tool:</p>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                     {actionTools.map(tool => {
                         const Icon = tool.icon;
                         return (
                            <button
                                key={tool.id}
                                onClick={() => handleSendTo(tool.id)}
                                title={`Send image to ${tool.label}`}
                                className="flex items-center justify-center gap-2 px-3 py-2 text-sm text-blue-100 bg-blue-800/60 hover:bg-blue-700/80 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-900 focus:ring-rose-500 transition-colors"
                            >
                                <Icon className="w-4 h-4" />
                                <span>{tool.label}</span>
                            </button>
                         )
                    })}
                 </div>
             </div>
          </div>
      )}
    </div>
  );
};

export default GeneratedImage;