import React, { useState, useEffect } from 'react';
import { upscaleImage } from '../services/geminiService';
import ImageDropzone from './ImageDropzone';
import Button from './Button';
import GeneratedImage from './GeneratedImage';
import Spinner from './Spinner';
import { fileToBase64, dataUrlToFile } from '../utils/imageUtils';
import { useToolChain } from '../contexts/ToolChainContext';

const ImageUpscaler: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<{ file: File; url: string } | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState<number>(2);
  const { consumeChainedImage } = useToolChain();

  useEffect(() => {
    const chainedData = consumeChainedImage();
    if (chainedData?.targetTool === 'upscale') {
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
      setError('Please upload an image to enhance.');
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
    <div className="w-full max-w-5xl mx-auto">
       <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white tracking-tight">AI Image Enhancer</h2>
        <p className="mt-2 text-lg text-slate-400">Improve quality, increase resolution, and enhance details automatically.</p>
      </div>
      {!originalImage && (
        <div className="bg-slate-900/50 rounded-2xl p-4 sm:p-6 md:p-8 border border-slate-800 shadow-2xl shadow-black/30">
            <ImageDropzone onImageDrop={handleImageDrop} />
        </div>
      )}

      {error && !originalImage && (
        <div className="mt-4 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-center">
          <p><strong>Error:</strong> {error}</p>
        </div>
      )}

      {originalImage && (
        <div className="bg-slate-900/50 rounded-2xl p-4 sm:p-6 md:p-8 border border-slate-800 shadow-2xl shadow-black/30">
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div className="flex flex-col items-center">
              <h3 className="text-xl font-semibold mb-4 text-center text-slate-300">Original Image</h3>
              <img src={originalImage.url} alt="Original for upscaling" className="rounded-lg shadow-lg max-w-full h-auto" />
            </div>
            <div className="flex flex-col items-center">
              <h3 className="text-xl font-semibold mb-4 text-center text-slate-300">Enhanced Image</h3>
              <div className="w-full aspect-square bg-slate-900/80 rounded-lg flex items-center justify-center border border-slate-700">
                {isLoading && (
                  <div className="flex flex-col items-center text-center">
                    <Spinner />
                    <p className="mt-4 text-slate-400">Enhancing image...</p>
                  </div>
                )}
                {!isLoading && !resultImage && (
                  <p className="text-slate-500">Your enhanced image will appear here.</p>
                )}
                {resultImage && (
                   <div className="w-full animate-fade-in">
                    <GeneratedImage src={resultImage} alt={`Enhanced image at ${scale}x`} prompt={`enhanced-image-${scale}x`} />
                   </div>
                )}
              </div>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <label className="block text-base font-medium text-slate-300 mb-3 text-center">
                Select Enhancement Factor
              </label>
              <div className="flex justify-center bg-slate-800/60 p-1.5 rounded-full mx-auto max-w-xs border border-slate-700">
                {[2, 4, 8].map(factor => (
                  <button
                    key={factor}
                    type="button"
                    onClick={() => setScale(factor)}
                    disabled={isLoading}
                    className={`relative w-full py-2 text-sm font-semibold rounded-full transition-colors duration-300 outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                        scale === factor ? 'text-white' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                     {scale === factor && (
                        <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full z-0"/>
                     )}
                     <span className="relative z-10">{factor}x</span>
                  </button>
                ))}
              </div>
            </div>
            {error && (
              <div className="p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-center">
                <p><strong>Error:</strong> {error}</p>
              </div>
            )}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-2">
              <Button type="submit" isLoading={isLoading} className="w-full sm:w-auto">
                Enhance Image
              </Button>
               <Button type="button" onClick={resetState} variant="secondary" className="w-full sm:w-auto">
                Upload New Image
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ImageUpscaler;