import React, { useState, useEffect } from 'react';
import { editImage } from '../services/geminiService';
import ImageDropzone from './ImageDropzone';
import Button from './Button';
import GeneratedImage from './GeneratedImage';
import Spinner from './Spinner';
import { fileToBase64, dataUrlToFile } from '../utils/imageUtils';
import ImageComparator from './ImageComparator';
import { useToolChain } from '../contexts/ToolChainContext';

const PhotoRestorer: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<{ file: File; url: string } | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { consumeChainedImage } = useToolChain();

  useEffect(() => {
    const chainedData = consumeChainedImage();
    if (chainedData?.targetTool === 'restore') {
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
    setResultImage(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!originalImage) {
      setError('Please upload an image to restore.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setResultImage(null);

    try {
      const { base64, mimeType } = await fileToBase64(originalImage.file);
      const fullPrompt = "Restore this old photo. Fix scratches, tears, and discoloration. Enhance details, improve sharpness, and correct colors to make it look like a high-quality modern photograph.";
      const newImageBase64 = await editImage(fullPrompt, base64, mimeType);
      setResultImage(`data:${mimeType};base64,${newImageBase64}`);
    } catch (err: any) {
      console.error("Photo restoration failed:", err);
      setError("Could not restore the photo. The model may not be able to process this image. Try another one.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetState = () => {
    if (originalImage) {
      URL.revokeObjectURL(originalImage.url);
    }
    setOriginalImage(null);
    setResultImage(null);
    setError(null);
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-zinc-50 tracking-tight">AI Old Photo Restorer</h2>
        <p className="mt-2 text-lg text-zinc-400">Bring your old, damaged photos back to life.</p>
      </div>

      {!originalImage && (
        <div className="bg-zinc-900/80 rounded-2xl p-4 sm:p-6 md:p-8 border border-zinc-800 shadow-2xl shadow-black/30">
           <ImageDropzone onImageDrop={handleImageDrop} />
        </div>
      )}

      {error && !originalImage && (
        <div className="mt-4 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-center">
          <p><strong>Error:</strong> {error}</p>
        </div>
      )}

      {originalImage && (
        <div className="bg-zinc-900/80 rounded-2xl p-4 sm:p-6 md:p-8 border border-zinc-800 shadow-2xl shadow-black/30">
          {!resultImage && !isLoading ? (
             <div className="flex flex-col items-center">
               <h3 className="text-xl font-semibold mb-4 text-center text-zinc-300">Your Photo</h3>
               <img src={originalImage.url} alt="Original for photo restoration" className="rounded-lg shadow-lg max-w-md h-auto" />
             </div>
          ) : (
            <div className="animate-fade-in space-y-8">
              <div>
                <h3 className="text-2xl font-semibold mb-4 text-center text-zinc-300">Compare Before & After</h3>
                <ImageComparator
                  before={originalImage.url}
                  after={resultImage || originalImage.url}
                  beforeAlt="Original photo"
                  afterAlt="Restored photo"
                />
              </div>
              {resultImage && (
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-center text-zinc-300">Final Result</h3>
                  <GeneratedImage src={resultImage} alt="Restored photo" prompt="photo-restored" />
                </div>
              )}
               {isLoading && (
                  <div className="flex flex-col items-center text-center p-8">
                      <Spinner />
                      <p className="mt-4 text-zinc-400">Restoring photo...</p>
                  </div>
                )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {error && (
              <div className="p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-center">
                <p><strong>Error:</strong> {error}</p>
              </div>
            )}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
              <Button type="submit" isLoading={isLoading} className="w-full sm:w-auto" title="Restore the uploaded photo">
                Restore Photo
              </Button>
              <Button type="button" onClick={resetState} variant="secondary" className="w-full sm:w-auto" title="Start over with a different photo">
                Upload New Photo
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default PhotoRestorer;
