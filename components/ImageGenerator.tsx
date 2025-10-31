import React, { useState } from 'react';
import { generateImage } from '../services/geminiService';
import Spinner from './Spinner';
import Button from './Button';
import GeneratedImage from './GeneratedImage';

type AspectRatio = "1:1" | "3:4" | "4:3" | "9:16" | "16:9";

const aspectRatios: AspectRatio[] = ["1:1", "16:9", "9:16", "4:3", "3:4"];

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setError('Please enter a prompt.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const imageBase64 = await generateImage(prompt, aspectRatio);
      setGeneratedImage(`data:image/png;base64,${imageBase64}`);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-gray-800/30 rounded-2xl p-6 md:p-8 border border-gray-700/50 shadow-2xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="prompt-generator" className="block text-lg font-medium text-gray-200 mb-2">
            Describe the image you want to create
          </label>
          <textarea
            id="prompt-generator"
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., A photorealistic image of a majestic lion wearing a crown, sitting on a throne in a futuristic city"
            className="w-full bg-gray-900/50 border border-gray-600 rounded-lg p-4 text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition shadow-inner"
            disabled={isLoading}
          />
        </div>

        <div>
           <label htmlFor="aspect-ratio" className="block text-sm font-medium text-gray-300 mb-2">
            Aspect Ratio
          </label>
          <div className="flex flex-wrap gap-2">
            {aspectRatios.map(ratio => (
              <button 
                key={ratio}
                type="button"
                onClick={() => setAspectRatio(ratio)}
                disabled={isLoading}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-900 transform hover:scale-105 ${
                    aspectRatio === ratio ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {ratio}
              </button>
            ))}
          </div>
        </div>

        <div className="text-center pt-2">
            <Button type="submit" isLoading={isLoading} disabled={!prompt.trim()}>
                Generate Image
            </Button>
        </div>
      </form>
      
      <div className="mt-8 min-h-[24rem] flex items-center justify-center">
        {isLoading && (
            <div className="flex flex-col items-center justify-center p-8 bg-gray-800/50 rounded-lg w-full h-96">
                <Spinner />
                <p className="mt-4 text-gray-400">Generating your masterpiece... this may take a moment.</p>
            </div>
        )}
        {error && (
            <div className="p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-300 text-center">
                <p><strong>Error:</strong> {error}</p>
            </div>
        )}
        {generatedImage && (
            <div className="w-full animate-fade-in">
                <GeneratedImage src={generatedImage} alt={prompt} prompt={prompt} />
            </div>
        )}
      </div>
    </div>
  );
};

export default ImageGenerator;