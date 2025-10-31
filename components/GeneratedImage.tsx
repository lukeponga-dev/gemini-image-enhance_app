import React, { useState, useEffect } from 'react';
import { useGallery } from '../contexts/GalleryContext';

interface GeneratedImageProps {
  src: string;
  alt: string;
  prompt: string;
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


const GeneratedImage: React.FC<GeneratedImageProps> = ({ src, alt, prompt }) => {
  const { addImageToGallery, galleryItems } = useGallery();
  const [isSaved, setIsSaved] = useState(false);

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

  return (
    <div className="relative group bg-gray-900/50 rounded-lg overflow-hidden shadow-lg border border-gray-700/50">
      <img src={src} alt={alt} className="w-full h-full object-contain" />
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition-all duration-300 flex items-center justify-center gap-4">
        <button
          onClick={handleSaveToGallery}
          disabled={isSaved}
          className="opacity-0 group-hover:opacity-100 transition-all duration-300 delay-100 transform group-hover:scale-100 scale-90 flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
            <SaveIcon className="w-5 h-5" />
            {isSaved ? 'Saved' : 'Save'}
        </button>
        <button
          onClick={handleDownload}
          className="opacity-0 group-hover:opacity-100 transition-all duration-300 delay-200 transform group-hover:scale-100 scale-90 flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500"
        >
          <DownloadIcon className="w-5 h-5" />
          Download
        </button>
      </div>
    </div>
  );
};

export default GeneratedImage;