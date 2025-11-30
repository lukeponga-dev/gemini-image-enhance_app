import React, { useState } from 'react';
import { generateImage } from '../services/geminiService';
import Spinner from './Spinner';
import Button from './Button';
import GeneratedImage from './GeneratedImage';

type AspectRatio = "1:1" | "3:4" | "4:3" | "9:16" | "16:9"; // Updated supported aspect ratios
type ImageSize = "1K" | "2K" | "4K";

const aspectRatios: AspectRatio[] = ["1:1", "16:9", "9:16", "4:3", "3:4"]; // Updated aspect ratios to match model capabilities
const imageSizes: ImageSize[] = ["1K", "2K", "4K"];

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [imageSize, setImageSize] = useState<ImageSize>('1K');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkApiKey = async () => {
      if (window.aistudio && window.aistudio.hasSelectedApiKey) {
          const hasKey = await window.aistudio.hasSelectedApiKey();
          if (!hasKey && window.aistudio.openSelectKey) {
             await window.aistudio.openSelectKey();
             // Re-check after dialog closes
             return await window.aistudio.hasSelectedApiKey();
          }
          return hasKey;
      }
      return true; // Assume true if window.aistudio is not present (dev mode)
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setError('Please enter a prompt.');
      return;
    }

    setError(null);
    
    // Check API Key for High Quality generation
    try {
        const hasKey = await checkApiKey();
        if (!hasKey) {
            setError("An API key from a paid project is required for this feature. Please select a key.");
            return;
        }
    } catch (e) {
        console.error("API Key check failed", e);
    }

    setIsLoading(true);
    setGeneratedImage(null);

    try {
      const imageBase64 = await generateImage(prompt, aspectRatio, imageSize);
      setGeneratedImage(`data:image/png;base64,${imageBase64}`);
    } catch (err: any) {
      if (err.message && err.message.includes("Requested entity was not found")) {
           setError("API Key issue detected. Please try selecting your key again.");
           // Optionally reset key here if we had a method
      } else {
           setError(err.message || 'An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-blue-50 tracking-tight">Nano Banana Pro</h2>
        <p className="mt-2 text-lg text-blue-300">Generate high-quality images with Gemini 3 Pro.</p>
      </div>
      <div className="bg-blue-900/80 rounded-2xl p-4 sm:p-6 md:p-8 border border-blue-800 shadow-2xl shadow-black/30">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="prompt-generator" className="block text-lg font-medium text-blue-100 mb-2">
              Describe the image you want to create
            </label>
            <textarea
              id="prompt-generator"
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., A photorealistic image of a majestic lion wearing a crown, sitting on a throne in a futuristic city"
              className="w-full bg-blue-800 border border-blue-700 rounded-lg p-4 text-white placeholder-blue-400 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition shadow-inner"
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">
                  Aspect Ratio
                </label>
                <div className="flex flex-wrap gap-2">
                  {aspectRatios.map(ratio => (
                    <button 
                      key={ratio}
                      type="button"
                      onClick={() => setAspectRatio(ratio)}
                      disabled={isLoading}
                      className={`px-3 py-2 text-xs font-medium rounded-md transition-all duration-200 outline-none focus:ring-2 focus:ring-rose-500 ${
                          aspectRatio === ratio ? 'bg-rose-600 text-white shadow-md' : 'bg-blue-700/80 text-blue-200 hover:bg-blue-700'
                      }`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">
                  Image Size
                </label>
                <div className="flex flex-wrap gap-2">
                  {imageSizes.map(size => (
                    <button 
                      key={size}
                      type="button"
                      onClick={() => setImageSize(size)}
                      disabled={isLoading}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 outline-none focus:ring-2 focus:ring-rose-500 ${
                          imageSize === size ? 'bg-rose-600 text-white shadow-md' : 'bg-blue-700/80 text-blue-200 hover:bg-blue-700'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
          </div>

          <div className="text-center pt-2">
              <Button type="submit" isLoading={isLoading} disabled={!prompt.trim()} title="Create a new image based on your prompt">
                  Generate Image
              </Button>
          </div>
        </form>
        
        <div className="mt-8 min-h-[20rem] sm:min-h-[24rem] flex items-center justify-center">
          {isLoading && (
              <div className="flex flex-col items-center justify-center p-8 bg-blue-800/50 rounded-lg w-full h-96">
                  <Spinner />
                  <p className="mt-4 text-blue-300">Generating your masterpiece... this may take a moment.</p>
              </div>
          )}
          {error && (
              <div className="p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-center w-full">
                  <p><strong>Error:</strong> {error}</p>
                  {error.includes("API key") && (
                      <button 
                        onClick={() => window.aistudio.openSelectKey()}
                        className="mt-2 text-sm underline text-rose-300 hover:text-rose-200"
                      >
                          Select API Key
                      </button>
                  )}
              </div>
          )}
          {generatedImage && (
              <div className="w-full animate-fade-in">
                  <GeneratedImage src={generatedImage} alt={prompt} prompt={prompt} />
              </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageGenerator;