import React, { useState, useEffect } from 'react';
import { upscaleImage, correctColors } from '../services/geminiService';
import ImageDropzone from './ImageDropzone';
import Button from './Button';
import GeneratedImage from './GeneratedImage';
import Spinner from './Spinner';
import { fileToBase64, dataUrlToFile } from '../utils/imageUtils';
import { useToolChain } from '../contexts/ToolChainContext';

type EnhancementType = 'upscale' | 'color';

const PhotoEnhancer: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<{ file: File; url: string } | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState<number>(2);
  const [enhancementType, setEnhancementType] = useState<EnhancementType>('upscale');
  const [imageAspectRatio, setImageAspectRatio] = useState('1');
  const { consumeChainedImage } = useToolChain();

  useEffect(() => {
    const chainedData = consumeChainedImage();
    if (chainedData?.targetTool === 'enhancer') {
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
    const url = URL.createObjectURL(file);
    setOriginalImage({ file, url });
    setResultImage(null);
    setError(null);

    const img = new Image();
    img.onload = () => {
        setImageAspectRatio(`${img.naturalWidth} / ${img.naturalHeight}`);
    };
    img.src = url;
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
      let newImageBase64;
      if (enhancementType === 'upscale') {
        newImageBase64 = await upscaleImage(base64, mimeType, scale);
      } else {
        newImageBase64 = await correctColors(base64, mimeType);
      }
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
    setImageAspectRatio('1');
    setEnhancementType('upscale');
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
       <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-blue-50 tracking-tight">AI Photo Enhancer</h2>
        <p className="mt-2 text-lg text-blue-300">Improve quality, increase resolution, correct colors, and enhance details automatically.</p>
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
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div className="flex flex-col items-center">
              <h3 className="text-xl font-semibold mb-4 text-center text-blue-200">Original Image</h3>
              <img src={originalImage.url} alt="Original for upscaling" className="rounded-lg shadow-lg max-w-full h-auto" />
            </div>
            <div className="flex flex-col items-center">
              <h3 className="text-xl font-semibold mb-4 text-center text-blue-200">Enhanced Image</h3>
              <div className="w-full">
                {isLoading && (
                  <div style={{ aspectRatio: imageAspectRatio }} className="w-full bg-blue-900/80 rounded-lg flex items-center justify-center border border-blue-700">
                    <div className="flex flex-col items-center text-center">
                        <Spinner />
                        <p className="mt-4 text-blue-300">{enhancementType === 'upscale' ? 'Enhancing image...' : 'Correcting colors...'}</p>
                    </div>
                  </div>
                )}
                {!isLoading && !resultImage && (
                  <div style={{ aspectRatio: imageAspectRatio }} className="w-full bg-blue-900/80 rounded-lg flex items-center justify-center border border-blue-700">
                    <p className="text-blue-500">Your enhanced image will appear here.</p>
                  </div>
                )}
                {resultImage && (
                   <div className="w-full animate-fade-in">
                    <GeneratedImage 
                      src={resultImage} 
                      alt={enhancementType === 'upscale' ? `Enhanced image at ${scale}x` : 'Color corrected image'} 
                      prompt={enhancementType === 'upscale' ? `enhanced-image-${scale}x` : 'color-corrected-image'} 
                    />
                   </div>
                )}
              </div>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <label className="block text-base font-medium text-blue-200 mb-3 text-center">
                Select Enhancement Type
              </label>
              <div className="flex justify-center bg-blue-800 p-1.5 rounded-full mx-auto max-w-xs border border-blue-700">
                {(['upscale', 'color'] as EnhancementType[]).map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setEnhancementType(type)}
                    disabled={isLoading}
                    title={`Switch to ${type === 'upscale' ? 'Upscale' : 'Color Correction'}`}
                    className={`relative w-full py-2 text-sm font-semibold rounded-full transition-colors duration-300 outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 focus:ring-offset-blue-900 ${
                        enhancementType === type ? 'text-white' : 'text-blue-200 hover:text-white'
                    }`}
                  >
                     {enhancementType === type && (
                        <span className="absolute inset-0 bg-gradient-to-r from-rose-600 to-pink-500 rounded-full z-0"/>
                     )}
                     <span className="relative z-10 capitalize">{type === 'upscale' ? 'Upscale' : 'Color Correct'}</span>
                  </button>
                ))}
              </div>
            </div>

            {enhancementType === 'upscale' && (
              <div className="animate-fade-in">
                <label className="block text-base font-medium text-blue-200 mb-3 text-center">
                  Select Enhancement Factor
                </label>
                <div className="flex justify-center bg-blue-800 p-1.5 rounded-full mx-auto max-w-xs border border-blue-700">
                  {[2, 4, 8].map(factor => (
                    <button
                      key={factor}
                      type="button"
                      onClick={() => setScale(factor)}
                      disabled={isLoading}
                      title={`Set enhancement factor to ${factor}x`}
                      className={`relative w-full py-2 text-sm font-semibold rounded-full transition-colors duration-300 outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 focus:ring-offset-blue-900 ${
                          scale === factor ? 'text-white' : 'text-blue-200 hover:text-white'
                      }`}
                    >
                      {scale === factor && (
                          <span className="absolute inset-0 bg-gradient-to-r from-rose-600 to-pink-500 rounded-full z-0"/>
                      )}
                      <span className="relative z-10">{factor}x</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {error && (
              <div className="p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-center">
                <p><strong>Error:</strong> {error}</p>
              </div>
            )}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-2">
              <Button type="submit" isLoading={isLoading} className="w-full sm:w-auto" title={enhancementType === 'upscale' ? 'Increase the image resolution and quality' : 'Automatically correct image colors'}>
                {enhancementType === 'upscale' ? 'Enhance Image' : 'Correct Colors'}
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

export default PhotoEnhancer;