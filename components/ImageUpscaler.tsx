import React, { useState } from 'react';
import { upscaleImage } from '../services/geminiService';
import ImageDropzone from './ImageDropzone';
import Button from './Button';
import GeneratedImage from './GeneratedImage';
import Spinner from './Spinner';
import { fileToBase64 } from '../utils/imageUtils';

const ImageUpscaler: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<{ file: File; url: string } | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState<number>(2);

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
      setError('Please upload an image to upscale.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setResultImage(null);

    try {
      const { base64, mimeType } = await fileToBase64(originalImage.file);
      const newImageBase64 = await upscaleImage(base64, mimeType, scale);
      setResultImage(`data:${mimeType};base64,${newImageBase64}`);
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
    setResultImage(null);
    setError(null);
    setScale(2);
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
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div className="flex flex-col items-center">
              <h3 className="text-xl font-semibold mb-4 text-center text-gray-300">Original Image</h3>
              <img src={originalImage.url} alt="Original for upscaling" className="rounded-lg shadow-lg max-w-full h-auto" />
            </div>
            <div className="flex flex-col items-center">
              <h3 className="text-xl font-semibold mb-4 text-center text-gray-300">Upscaled Image</h3>
              <div className="w-full aspect-square bg-gray-900/50 rounded-lg flex items-center justify-center border border-gray-700">
                {isLoading && (
                  <div className="flex flex-col items-center text-center">
                    <Spinner />
                    <p className="mt-4 text-gray-400">Enhancing image...</p>
                  </div>
                )}
                {!isLoading && !resultImage && (
                  <p className="text-gray-500">Your upscaled image will appear here.</p>
                )}
                {resultImage && (
                   <div className="w-full animate-fade-in">
                    <GeneratedImage src={resultImage} alt={`Upscaled image at ${scale}x`} prompt={`upscaled-image-${scale}x`} />
                   </div>
                )}
              </div>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <label className="block text-base font-medium text-gray-300 mb-3 text-center">
                Select Upscale Factor
              </label>
              <div className="flex justify-center bg-gray-900/50 p-1.5 rounded-full mx-auto max-w-xs">
                {[2, 4, 8].map(factor => (
                  <button
                    key={factor}
                    type="button"
                    onClick={() => setScale(factor)}
                    disabled={isLoading}
                    className={`relative w-full py-2 text-sm font-semibold rounded-full transition-colors duration-300 outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                        scale === factor ? 'text-white' : 'text-gray-300 hover:text-white'
                    }`}
                  >
                     {scale === factor && (
                        <span className="absolute inset-0 bg-blue-600 rounded-full z-0"/>
                     )}
                     <span className="relative z-10">{factor}x</span>
                  </button>
                ))}
              </div>
            </div>
            {error && (
              <div className="p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-300 text-center">
                <p><strong>Error:</strong> {error}</p>
              </div>
            )}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-2">
              <Button type="submit" isLoading={isLoading} className="w-full sm:w-auto">
                Upscale Image
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

export default ImageUpscaler;