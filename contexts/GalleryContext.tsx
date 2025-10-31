import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';

export interface GalleryItem {
  id: string;
  src: string;
  alt: string;
  prompt: string;
}

interface GalleryContextType {
  galleryItems: GalleryItem[];
  addImageToGallery: (item: Omit<GalleryItem, 'id'>) => void;
  clearGallery: () => void;
}

const GalleryContext = createContext<GalleryContextType | undefined>(undefined);

const GALLERY_STORAGE_KEY = 'gemini-image-gallery';

export const GalleryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);

  useEffect(() => {
    try {
      const storedItems = localStorage.getItem(GALLERY_STORAGE_KEY);
      if (storedItems) {
        setGalleryItems(JSON.parse(storedItems));
      }
    } catch (error) {
      console.error("Failed to load gallery from localStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(galleryItems));
    } catch (error) {
      console.error("Failed to save gallery to localStorage", error);
    }
  }, [galleryItems]);

  const addImageToGallery = (item: Omit<GalleryItem, 'id'>) => {
    // Prevent adding duplicates based on src
    if (galleryItems.some(existingItem => existingItem.src === item.src)) {
        console.log("Image already in gallery.");
        return;
    }
    const newItem: GalleryItem = { ...item, id: Date.now().toString() };
    setGalleryItems(prevItems => [newItem, ...prevItems]);
  };

  const clearGallery = () => {
    setGalleryItems([]);
  };

  return (
    <GalleryContext.Provider value={{ galleryItems, addImageToGallery, clearGallery }}>
      {children}
    </GalleryContext.Provider>
  );
};

export const useGallery = (): GalleryContextType => {
  const context = useContext(GalleryContext);
  if (context === undefined) {
    throw new Error('useGallery must be used within a GalleryProvider');
  }
  return context;
};
