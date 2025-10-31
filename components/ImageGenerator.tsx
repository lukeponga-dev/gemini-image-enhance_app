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
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-zinc-50 tracking-tight">AI Image Generator</h2>
        <p className="mt-2 text-lg text-zinc-400">Create stunning visuals from simple text descriptions.</p>
      </div>
      <div className="bg-zinc-900/80 rounded-2xl p-4 sm:p-6 md:p-8 border border-zinc-800 shadow-2xl shadow-black/30">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="prompt-generator" className="block text-lg font-medium text-zinc-200 mb-2">
              Describe the image you want to create
            </label>
            <textarea
              id="prompt-generator"
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., A photorealistic image of a majestic lion wearing a crown, sitting on a throne in a futuristic city"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-4 text-white placeholder-zinc-500 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition shadow-inner"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Aspect Ratio
            </label>
            <div className="flex flex-wrap gap-2">
              {aspectRatios.map(ratio => (
                <button 
                  key={ratio}
                  type="button"
                  onClick={() => setAspectRatio(ratio)}
                  disabled={isLoading}
                  title={`Set aspect ratio to ${ratio}`}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-zinc-900 transform hover:scale-105 ${
                      aspectRatio === ratio ? 'bg-gradient-to-r from-purple-600 to-violet-500 text-white shadow-md' : 'bg-zinc-700/80 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  {ratio}
                </button>
              ))}
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
              <div className="flex flex-col items-center justify-center p-8 bg-zinc-800/50 rounded-lg w-full h-96">
                  <Spinner />
                  <p className="mt-4 text-zinc-400">Generating your masterpiece... this may take a moment.</p>
              </div>
          )}
          {error && (
              <div className="p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-center">
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
    </div>
  );
};

export default ImageGenerator;