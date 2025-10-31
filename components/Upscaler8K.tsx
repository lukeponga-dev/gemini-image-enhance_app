import React, { useState, useEffect } from 'react';
import { upscaleImage } from '../services/geminiService';
import ImageDropzone from './ImageDropzone';
import Button from './Button';
import GeneratedImage from './GeneratedImage';
import Spinner from './Spinner';
import { fileToBase64, dataUrlToFile } from '../utils/imageUtils';
import ImageComparator from './ImageComparator';
import { useToolChain } from '../contexts/ToolChainContext';

const Upscaler8K: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<{ file: File; url: string } | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { consumeChainedImage } = useToolChain();

  useEffect(() => {
    const chainedData = consumeChainedImage();
    if (chainedData?.targetTool === 'upscale8k') {
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
      setError('Please upload an image to upscale.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setResultImage(null);

    try {
      const { base64, mimeType } = await fileToBase64(originalImage.file);
      const newImageBase64 = await upscaleImage(base64, mimeType, 8);
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
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-blue-50 tracking-tight">Upscale to 8K</h2>
        <p className="mt-2 text-lg text-blue-300">Massively increase your image's resolution and quality.</p>
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
          {!resultImage && !isLoading ? (
             <div className="flex flex-col items-center">
               <h3 className="text-xl font-semibold mb-4 text-center text-blue-200">Your Image</h3>
               <img src={originalImage.url} alt="Original for 8K upscaling" className="rounded-lg shadow-lg max-w-full h-auto" />
             </div>
          ) : (
            <div className="animate-fade-in space-y-8">
              <div>
                <h3 className="text-2xl font-semibold mb-4 text-center text-blue-200">Compare Before & After</h3>
                <ImageComparator
                  before={originalImage.url}
                  after={resultImage || originalImage.url}
                  beforeAlt="Original image"
                  afterAlt="8K Upscaled image"
                />
              </div>
              {resultImage && (
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-center text-blue-200">Final Result</h3>
                  <GeneratedImage src={resultImage} alt="8K Upscaled image" prompt="upscaled-8k" />
                </div>
              )}
               {isLoading && (
                  <div className="flex flex-col items-center text-center p-8">
                      <Spinner />
                      <p className="mt-4 text-blue-300">Upscaling to 8K...</p>
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
              <Button type="submit" isLoading={isLoading} className="w-full sm:w-auto" title="Upscale the image to 8K resolution">
                Upscale to 8K
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

export default Upscaler8K;