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
  galleryNotification: string | null;
}

const GalleryContext = createContext<GalleryContextType | undefined>(undefined);

const GALLERY_STORAGE_KEY = 'gemini-image-gallery';
const GALLERY_MAX_ITEMS = 20; // Limit the number of items in the gallery

export const GalleryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [galleryNotification, setGalleryNotification] = useState<string | null>(null);
  const [notificationTimeout, setNotificationTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  const showGalleryNotification = (message: string) => {
    if (notificationTimeout) {
      clearTimeout(notificationTimeout);
    }
    setGalleryNotification(message);
    const timeout = setTimeout(() => {
      setGalleryNotification(null);
    }, 3000); // Notification visible for 3 seconds
    setNotificationTimeout(timeout);
  };

  useEffect(() => {
    try {
      const storedItems = localStorage.getItem(GALLERY_STORAGE_KEY);
      if (storedItems) {
        let parsedItems: GalleryItem[] = JSON.parse(storedItems);
        // Trim gallery if it exceeds max items on load
        if (parsedItems.length > GALLERY_MAX_ITEMS) {
          parsedItems = parsedItems.slice(0, GALLERY_MAX_ITEMS);
          try {
            localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(parsedItems));
            showGalleryNotification(`Gallery trimmed to ${GALLERY_MAX_ITEMS} most recent items.`);
          } catch (error) {
            console.error("Failed to save truncated gallery to localStorage", error);
            // If even saving truncated gallery fails, it implies a more severe storage issue.
            showGalleryNotification("Storage full! Please clear browser data if issues persist.");
          }
        }
        setGalleryItems(parsedItems);
      }
    } catch (error) {
      console.error("Failed to load gallery or parse JSON from localStorage", error);
      showGalleryNotification("Failed to load saved images. Storage might be corrupt or full.");
      // Optionally, clear local storage to try and recover
      // localStorage.removeItem(GALLERY_STORAGE_KEY);
      setGalleryItems([]);
    }
  }, []);

  // Effect to save gallery items to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(galleryItems));
    } catch (error) {
      console.error("Failed to save gallery to localStorage:", error);
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        showGalleryNotification("Storage full! Cannot save new images. Please clear some space.");
      } else {
        showGalleryNotification("Failed to save images.");
      }
    }
  }, [galleryItems]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (notificationTimeout) {
        clearTimeout(notificationTimeout);
      }
    };
  }, [notificationTimeout]);

  const addImageToGallery = (item: Omit<GalleryItem, 'id'>) => {
    // Prevent adding duplicates based on src
    if (galleryItems.some(existingItem => existingItem.src === item.src)) {
        showGalleryNotification("Image already in gallery.");
        return;
    }
    const newItem: GalleryItem = { ...item, id: Date.now().toString() };
    setGalleryItems(prevItems => {
        let newItems = [...prevItems];
        if (newItems.length >= GALLERY_MAX_ITEMS) {
            newItems.pop(); // Remove the oldest item (last one in the array)
            showGalleryNotification("Gallery full. Oldest image removed.");
        }
        newItems.unshift(newItem); // Add new item to the beginning
        return newItems;
    });
  };

  const clearGallery = () => {
    try {
      localStorage.removeItem(GALLERY_STORAGE_KEY);
      setGalleryItems([]);
      showGalleryNotification("Gallery cleared.");
    } catch (error) {
      console.error("Failed to clear gallery from localStorage", error);
      showGalleryNotification("Failed to clear gallery.");
    }
  };

  return (
    <GalleryContext.Provider value={{ galleryItems, addImageToGallery, clearGallery, galleryNotification }}>
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