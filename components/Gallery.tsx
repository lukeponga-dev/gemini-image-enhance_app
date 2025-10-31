import React from 'react';
import { useGallery } from '../contexts/GalleryContext';
import GeneratedImage from './GeneratedImage';

const Gallery: React.FC = () => {
  const { galleryItems, clearGallery } = useGallery();

  const handleClearGallery = () => {
    if (window.confirm('Are you sure you want to clear the entire gallery? This action cannot be undone.')) {
      clearGallery();
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
       <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white tracking-tight">My Gallery ({galleryItems.length})</h2>
        <p className="mt-2 text-lg text-slate-400">Browse, manage, and reuse your saved creations.</p>
      </div>

      {galleryItems.length > 0 && (
          <div className="flex justify-center mb-8">
            <button
              onClick={handleClearGallery}
              title="Permanently delete all images from your gallery"
              className="px-5 py-2 text-sm bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-semibold rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-red-500 transition-all transform hover:scale-105"
            >
              Clear Gallery
            </button>
          </div>
        )}

      {galleryItems.length === 0 ? (
        <div className="text-center py-16 px-4 bg-slate-900/50 rounded-2xl border border-slate-800">
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="mt-4 text-xl font-semibold text-white">Your gallery is empty</h3>
          <p className="mt-2 text-base text-slate-400">Generate or edit an image and click the 'Save' button to see it here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {galleryItems.map(item => (
            <GeneratedImage key={item.id} src={item.src} alt={item.alt} prompt={item.prompt} context="gallery" />
          ))}
        </div>
      )}
    </div>
  );
};

export default Gallery;