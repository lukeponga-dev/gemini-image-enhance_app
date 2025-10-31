import React, { useState, useEffect } from 'react';
import { upscaleImage, correctColors, UpscaleStyle } from '../services/geminiService';
import ImageDropzone from './ImageDropzone';
import Button from './Button';
import GeneratedImage from './GeneratedImage';
import Spinner from './Spinner';
import { fileToBase64, dataUrlToFile } from '../utils/imageUtils';
import { useToolChain } from '../contexts/ToolChainContext';
import ImageComparator from './ImageComparator';


interface EnhancementCardProps {
  mode: string;
  description: string;
  before: string;
  after: string;
  onApply: () => void;
  isLoading?: boolean;
  isDisabled?: boolean;
  isColorMode?: boolean;
}

const EnhancementCard: React.FC<EnhancementCardProps> = ({
  mode,
  description,
  before,
  after,
  onApply,
  isLoading = false,
  isDisabled = false,
  isColorMode = false,
}) => {
  return (
    <div className={`bg-blue-800/50 rounded-xl shadow-md p-5 transition hover:shadow-lg border border-blue-700 ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <h3 className="text-lg font-semibold mb-2 text-blue-50">{mode}</h3>
      <p className="text-sm text-blue-300 mb-4 min-h-[2.5rem]">{description}</p>
      {!isColorMode && (
        <>
          <div className="text-xs text-blue-400 mb-1">Before: {before}</div>
          <div className="text-xs text-green-400 font-medium">After: {after}</div>
        </>
      )}
      <Button
        onClick={onApply}
        isLoading={isLoading}
        disabled={isDisabled || isLoading}
        className="mt-4 w-full"
        title={`Apply ${mode} enhancement`}
      >
        Apply
      </Button>
    </div>
  );
};


type EnhancementModeId = 'balanced' | 'gentle' | 'ultra' | 'color';

interface EnhancementMode {
  id: EnhancementModeId;
  title: string;
  description: string;
  factor: number;
  type: 'upscale' | 'color';
}

const enhancementModes: EnhancementMode[] = [
    { id: 'balanced', title: 'Balanced x4', description: 'General-purpose upscale with smooth detail preservation.', factor: 4, type: 'upscale' },
    { id: 'gentle', title: 'Gentle x4', description: 'Subtle enhancement that preserves the natural look.', factor: 4, type: 'upscale' },
    { id: 'ultra', title: 'Ultra x4', description: 'Maximum detail generation for high-end results.', factor: 4, type: 'upscale' },
    { id: 'color', title: 'Color Correction', description: 'Fix brightness, contrast, and color balance.', factor: 1, type: 'color' }
];

const PhotoEnhancer: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<{ file: File; url: string; width: number; height: number; } | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState<EnhancementModeId | null>(null);
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
    const img = new Image();
    img.onload = () => {
        setOriginalImage({ file, url, width: img.naturalWidth, height: img.naturalHeight });
        setResultImage(null);
        setError(null);
        setActiveMode(null);
    };
    img.onerror = () => {
        setError("Could not load image file. It may be corrupt.");
    };
    img.src = url;
  };

  const handleApplyEnhancement = async (mode: EnhancementMode) => {
    if (!originalImage) return;

    setIsLoading(true);
    setError(null);
    setResultImage(null);
    setActiveMode(mode.id);

    try {
        const { base64, mimeType } = await fileToBase64(originalImage.file);
        let newImageBase64;

        if (mode.type === 'upscale') {
            newImageBase64 = await upscaleImage(base64, mimeType, mode.factor, mode.id as UpscaleStyle);
        } else {
            newImageBase64 = await correctColors(base64, mimeType);
        }
        setResultImage(`data:${mimeType};base64,${newImageBase64}`);
    } catch (err: any) {
        setError(err.message || 'An unexpected error occurred.');
    } finally {
        setIsLoading(false);
        setActiveMode(null);
    }
  };


  const resetState = () => {
    if (originalImage) {
      URL.revokeObjectURL(originalImage.url);
    }
    setOriginalImage(null);
    setResultImage(null);
    setError(null);
    setActiveMode(null);
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
       <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-blue-50 tracking-tight">AI Photo Enhancer</h2>
        <p className="mt-2 text-lg text-blue-300">Improve quality, increase resolution, correct colors, and enhance details automatically.</p>
      </div>
      
      {!originalImage ? (
        <div className="bg-blue-900/80 rounded-2xl p-4 sm:p-6 md:p-8 border border-blue-800 shadow-2xl shadow-black/30">
            <ImageDropzone onImageDrop={handleImageDrop} />
             {error && (
                <div className="mt-4 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-center">
                    <p><strong>Error:</strong> {error}</p>
                </div>
            )}
        </div>
      ) : resultImage ? (
         <div className="animate-fade-in space-y-8">
            <div className="max-w-4xl mx-auto">
              <h3 className="text-2xl font-semibold mb-4 text-center text-blue-200">Compare Before & After</h3>
              <ImageComparator
                  before={originalImage.url}
                  after={resultImage}
                  beforeAlt="Original image"
                  afterAlt="Enhanced image"
              />
            </div>
            <div>
                <h3 className="text-xl font-semibold mb-4 text-center text-blue-200">Final Result</h3>
                <GeneratedImage src={resultImage} alt="Enhanced image" prompt="enhanced-image" />
            </div>
            <div className="text-center pt-4">
                <Button onClick={resetState} variant="secondary" title="Start over with a new image">
                    Enhance Another Image
                </Button>
            </div>
        </div>
      ) : (
        <div className="bg-blue-900/80 rounded-2xl p-4 sm:p-6 md:p-8 border border-blue-800 shadow-2xl shadow-black/30">
            <div className="grid md:grid-cols-2 gap-8 items-start">
                <div className="flex flex-col items-center">
                    <h3 className="text-xl font-semibold mb-4 text-center text-blue-200">Original Image</h3>
                    <img src={originalImage.url} alt="Original to enhance" className="rounded-lg shadow-lg max-w-full h-auto" />
                </div>
                <div className="flex flex-col">
                    <h3 className="text-xl font-semibold mb-4 text-center text-blue-200">Choose Enhancement</h3>
                    {error && (
                        <div className="mb-4 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-center">
                            <p><strong>Error:</strong> {error}</p>
                        </div>
                    )}
                    <div className="grid grid-cols-1 gap-4">
                        {enhancementModes.map(mode => (
                            <EnhancementCard
                                key={mode.id}
                                mode={mode.title}
                                description={mode.description}
                                before={`${originalImage.width} × ${originalImage.height} px`}
                                after={mode.type !== 'color' ? `${originalImage.width * mode.factor} × ${originalImage.height * mode.factor} px` : ''}
                                onApply={() => handleApplyEnhancement(mode)}
                                isLoading={isLoading && activeMode === mode.id}
                                isDisabled={isLoading && activeMode !== mode.id}
                                isColorMode={mode.type === 'color'}
                            />
                        ))}
                    </div>
                </div>
            </div>
             <div className="text-center mt-8 border-t border-blue-800 pt-6">
                <Button onClick={resetState} variant="secondary" title="Start over with a different image">
                    Upload New Image
                </Button>
            </div>
        </div>
      )}
    </div>
  );
};

export default PhotoEnhancer;