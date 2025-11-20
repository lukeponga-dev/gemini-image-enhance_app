import React, { useState } from 'react';
import { generateVideo } from '../services/geminiService';
import Spinner from './Spinner';
import Button from './Button';

type AspectRatio = "16:9" | "9:16";

const VideoGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkApiKey = async () => {
      if (window.aistudio && window.aistudio.hasSelectedApiKey) {
          const hasKey = await window.aistudio.hasSelectedApiKey();
          if (!hasKey && window.aistudio.openSelectKey) {
             await window.aistudio.openSelectKey();
             return await window.aistudio.hasSelectedApiKey();
          }
          return hasKey;
      }
      return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setError('Please enter a prompt for the video.');
      return;
    }

    setError(null);
    
    try {
        const hasKey = await checkApiKey();
        if (!hasKey) {
            setError("An API key from a paid project is required for Veo. Please select a key.");
            return;
        }
    } catch (e) {
        console.error("API Key check failed", e);
    }

    setIsLoading(true);
    setVideoUrl(null);

    try {
      const base64Data = await generateVideo(prompt, aspectRatio);
      setVideoUrl(base64Data);
    } catch (err: any) {
        if (err.message && err.message.includes("Requested entity was not found")) {
            setError("API Key issue detected. Please try selecting your key again.");
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
        <h2 className="text-3xl font-extrabold text-blue-50 tracking-tight">Veo Video Creator</h2>
        <p className="mt-2 text-lg text-blue-300">Turn text into stunning videos with Veo 3.</p>
      </div>
      <div className="bg-blue-900/80 rounded-2xl p-4 sm:p-6 md:p-8 border border-blue-800 shadow-2xl shadow-black/30">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="prompt-video" className="block text-lg font-medium text-blue-100 mb-2">
              Describe the video you want to create
            </label>
            <textarea
              id="prompt-video"
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., A neon hologram of a cat driving at top speed in a cyberpunk city"
              className="w-full bg-blue-800 border border-blue-700 rounded-lg p-4 text-white placeholder-blue-400 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition shadow-inner"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-200 mb-2">
              Aspect Ratio
            </label>
            <div className="flex gap-4">
                <button 
                  type="button"
                  onClick={() => setAspectRatio("16:9")}
                  className={`flex-1 py-3 rounded-lg border transition-all ${aspectRatio === "16:9" ? 'bg-rose-600 border-rose-500 text-white' : 'bg-blue-800 border-blue-700 text-blue-300 hover:bg-blue-700'}`}
                >
                    <div className="w-8 h-5 border-2 border-current mx-auto mb-1 rounded-sm"></div>
                    Landscape (16:9)
                </button>
                <button 
                  type="button"
                  onClick={() => setAspectRatio("9:16")}
                  className={`flex-1 py-3 rounded-lg border transition-all ${aspectRatio === "9:16" ? 'bg-rose-600 border-rose-500 text-white' : 'bg-blue-800 border-blue-700 text-blue-300 hover:bg-blue-700'}`}
                >
                    <div className="w-5 h-8 border-2 border-current mx-auto mb-1 rounded-sm"></div>
                    Portrait (9:16)
                </button>
            </div>
          </div>

          <div className="text-center pt-2">
              <Button type="submit" isLoading={isLoading} disabled={!prompt.trim()} title="Generate video">
                  Generate Video
              </Button>
          </div>
        </form>
        
        <div className="mt-8 min-h-[20rem] flex items-center justify-center">
          {isLoading && (
              <div className="flex flex-col items-center justify-center p-8 bg-blue-800/50 rounded-lg w-full h-96 text-center">
                  <Spinner />
                  <p className="mt-4 text-lg font-semibold text-blue-200">Creating your video...</p>
                  <p className="text-sm text-blue-400 mt-2">This typically takes a minute or two. Please stay on this page.</p>
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
          {videoUrl && (
              <div className="w-full animate-fade-in">
                  <video 
                    controls 
                    autoPlay 
                    loop 
                    src={videoUrl} 
                    className="w-full rounded-lg shadow-lg border border-blue-800"
                  />
                   <div className="mt-4 flex justify-center">
                        <a 
                            href={videoUrl} 
                            download={`veo-video-${Date.now()}.mp4`}
                            className="flex items-center gap-2 px-6 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-full shadow-md transition-transform hover:scale-105"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download Video
                        </a>
                   </div>
              </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoGenerator;