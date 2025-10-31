import React, { useState } from 'react';
import { editImage } from '../services/geminiService';
import ImageDropzone from './ImageDropzone';
import Button from './Button';
import GeneratedImage from './GeneratedImage';
import Spinner from './Spinner';
import { fileToBase64 } from '../utils/imageUtils';
import ImageComparator from './ImageComparator';

const ImageEditor: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<{ file: File; url: string } | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageDrop = (file: File) => {
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
        setError('Invalid file type. Please upload a PNG, JPG, or WEBP image.');
        return;
    }
    setOriginalImage({ file, url: URL.createObjectURL(file) });
    setEditedImage(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!originalImage || !prompt.trim()) {
      setError('Please upload an image and provide an editing prompt.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setEditedImage(null);

    try {
      const { base64, mimeType } = await fileToBase64(originalImage.file);
      const newImageBase64 = await editImage(prompt, base64, mimeType);
      setEditedImage(`data:${mimeType};base64,${newImageBase64}`);
      // FIX: Added curly braces to the catch block to fix syntax and cascading scope errors.
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetState = () => {
    if (originalImage) {
        URL.revokeObjectURL(originalImage.url);
    }
    setOriginalImage(null);
    setEditedImage(null);
    setError(null);
    setPrompt('');
  };

  return (
    <div className="max-w-5xl mx-auto">
      {!originalImage && (
         <div className="bg-gray-800/30 rounded-2xl p-6 md:p-8 border border-gray-700/50 shadow-2xl">
            <ImageDropzone onImageDrop={handleImageDrop} />
         </div>
      )}

      {error && !originalImage && (
        <div className="mt-4 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-300 text-center">
            <p><strong>Error:</strong> {error}</p>
        </div>
      )}

      {originalImage && (
        <div className="bg-gray-800/30 rounded-2xl p-6 md:p-8 border border-gray-700/50 shadow-2xl">
          {!editedImage && !isLoading ? (
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="flex flex-col items-center">
                <h3 className="text-xl font-semibold mb-4 text-center text-gray-300">Original Image</h3>
                <img src={originalImage.url} alt="Original upload" className="rounded-lg shadow-lg max-w-full h-auto" />
              </div>
              <div className="flex flex-col items-center justify-center h-full">
                 <p className="text-gray-400">Your edited image will appear here.</p>
              </div>
            </div>
          ) : (
            <div className="animate-fade-in space-y-8">
              <div>
                <h3 className="text-2xl font-semibold mb-4 text-center text-gray-300">Compare Before & After</h3>
                <ImageComparator 
                  before={originalImage.url} 
                  after={editedImage || originalImage.url}
                  beforeAlt="Original image"
                  afterAlt={prompt}
                />
              </div>
              {editedImage && (
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-center text-gray-300">Final Result</h3>
                  <GeneratedImage src={editedImage} alt={prompt} prompt={prompt} />
                </div>
              )}
               {isLoading && (
                    <div className="flex flex-col items-center text-center p-8">
                      <Spinner />
                      <p className="mt-4 text-gray-400">Applying your edits...</p>
                    </div>
                )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
             <div>
              <label htmlFor="prompt-editor" className="block text-sm font-medium text-gray-300 mb-2">
                Describe how you want to edit the image
              </label>
              <input
                id="prompt-editor"
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Add a retro filter, remove the person in the background"
                className="w-full bg-gray-900/50 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition shadow-inner"
                disabled={isLoading}
              />
            </div>
            {error && (
                <div className="p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-300 text-center">
                    <p><strong>Error:</strong> {error}</p>
                </div>
            )}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
                 <Button type="submit" isLoading={isLoading} disabled={!prompt.trim()} className="w-full sm:w-auto">
                    Generate Edit
                </Button>
                <button type="button" onClick={resetState} className="w-full sm:w-auto px-6 py-3 border border-gray-600/80 text-base font-medium rounded-md shadow-sm text-gray-300 bg-gray-700/50 hover:bg-gray-700 transition-colors">
                    Upload New Image
                </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ImageEditor;