import React, { useState, useEffect } from 'react';
import { editImage } from '../services/geminiService';
import ImageDropzone from './ImageDropzone';
import Button from './Button';
import GeneratedImage from './GeneratedImage';
import Spinner from './Spinner';
import { fileToBase64, dataUrlToFile } from '../utils/imageUtils';
import ImageComparator from './ImageComparator';
import { useToolChain } from '../contexts/ToolChainContext';

const ImageEditor: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<{ file: File; url: string } | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { consumeChainedImage } = useToolChain();

  useEffect(() => {
    const chainedData = consumeChainedImage();
    if (chainedData?.targetTool === 'edit') {
      const { image } = chainedData;
      const processChainedImage = async () => {
        try {
            const fileName = image.prompt.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50) || 'chained-image';
            const file = await dataUrlToFile(image.dataUrl, `${fileName}.png`);
            if (originalImage) URL.revokeObjectURL(originalImage.url);
            handleImageDrop(file);
        } catch (e) {
            console.error("Failed to process chained image", e);
            setError("Could not load the image from the previous tool.");
        }
      };
      processChainedImage();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
    <div className="w-full max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-blue-50 tracking-tight">AI Image Editor</h2>
        <p className="mt-2 text-lg text-blue-300">Edit your images using natural language commands.</p>
      </div>
      {!originalImage && (
         <div className="bg-blue-900/80 rounded-2xl p-4 sm:p-6 md:p-8 border border-blue-800 shadow-2xl shadow-black/30">
            <ImageDropzone onImageDrop={handleImageDrop} />
         </div>
      )}

      {error && !originalImage && (
        <div className="mt-4 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-center">
            <p><strong>Error:</strong> {error}</p>
        </div>
      )}

      {originalImage && (
        <div className="bg-blue-900/80 rounded-2xl p-4 sm:p-6 md:p-8 border border-blue-800 shadow-2xl shadow-black/30">
          {!editedImage && !isLoading ? (
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="flex flex-col items-center">
                <h3 className="text-xl font-semibold mb-4 text-center text-blue-200">Original Image</h3>
                <img src={originalImage.url} alt="Original upload" className="rounded-lg shadow-lg max-w-full h-auto" />
              </div>
              <div className="flex flex-col items-center justify-center h-full">
                 <p className="text-blue-400">Your edited image will appear here.</p>
              </div>
            </div>
          ) : (
            <div className="animate-fade-in space-y-8">
              <div>
                <h3 className="text-2xl font-semibold mb-4 text-center text-blue-200">Compare Before & After</h3>
                <ImageComparator 
                  before={originalImage.url} 
                  after={editedImage || originalImage.url}
                  beforeAlt="Original image"
                  afterAlt={prompt}
                />
              </div>
              {editedImage && (
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-center text-blue-200">Final Result</h3>
                  <GeneratedImage src={editedImage} alt={prompt} prompt={prompt} />
                </div>
              )}
               {isLoading && (
                    <div className="flex flex-col items-center text-center p-8">
                      <Spinner />
                      <p className="mt-4 text-blue-300">Applying your edits...</p>
                    </div>
                )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
             <div>
              <label htmlFor="prompt-editor" className="block text-sm font-medium text-blue-200 mb-2">
                Describe how you want to edit the image
              </label>
              <input
                id="prompt-editor"
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Add a retro filter, remove the person in the background"
                className="w-full bg-blue-800 border border-blue-700 rounded-lg p-3 text-white placeholder-blue-400 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition shadow-inner"
                disabled={isLoading}
              />
            </div>
            {error && (
                <div className="p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-center">
                    <p><strong>Error:</strong> {error}</p>
                </div>
            )}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
                 <Button type="submit" isLoading={isLoading} disabled={!prompt.trim()} className="w-full sm:w-auto" title="Apply the described edits to your image">
                    Generate Edit
                </Button>
                <Button type="button" onClick={resetState} variant="secondary" className="w-full sm:w-auto" title="Start over with a different image">
                    Upload New Image
                </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ImageEditor;