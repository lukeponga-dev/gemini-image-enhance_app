import React, { useState } from 'react';
import { analyzeMedia } from '../services/geminiService';
import Button from './Button';
import Spinner from './Spinner';
import { marked } from 'marked';
import { VideoSearchIcon } from './Icons';

const VideoAnalyzer: React.FC = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (!file.type.startsWith('video/')) {
          setError("Please upload a valid video file.");
          return;
      }
      setVideoFile(file);
      setResult(null);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoFile) {
      setError('Please upload a video.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      // Convert video file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(videoFile);
        reader.onload = () => {
            const result = reader.result as string;
            const [, data] = result.split(',', 2);
            resolve(data);
        };
        reader.onerror = reject;
      });

      const analysisResult = await analyzeMedia(prompt, base64, videoFile.type);
      setResult(analysisResult);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during analysis.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-blue-50 tracking-tight">Video Analyzer</h2>
        <p className="mt-2 text-lg text-blue-300">Extract insights and understand video content with Gemini.</p>
      </div>

      <div className="bg-blue-900/80 rounded-2xl p-4 sm:p-6 md:p-8 border border-blue-800 shadow-2xl shadow-black/30">
        
        <div className="flex flex-col items-center justify-center w-full">
            <label htmlFor="video-upload" className="flex flex-col items-center justify-center w-full h-64 border-2 border-blue-700 border-dashed rounded-lg cursor-pointer bg-blue-800/50 hover:bg-blue-700/50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {videoFile ? (
                         <div className="text-center">
                            <VideoSearchIcon className="w-12 h-12 text-green-400 mb-3 mx-auto" />
                            <p className="text-sm text-green-300 font-semibold">{videoFile.name}</p>
                            <p className="text-xs text-blue-400 mt-1">{(videoFile.size / (1024*1024)).toFixed(2)} MB</p>
                        </div>
                    ) : (
                        <>
                            <svg className="w-10 h-10 mb-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                            <p className="mb-2 text-sm text-blue-300"><span className="font-semibold">Click to upload video</span> or drag and drop</p>
                            <p className="text-xs text-blue-400">MP4, WebM, MOV (Max 20MB recommended for browser speed)</p>
                        </>
                    )}
                </div>
                <input id="video-upload" type="file" className="hidden" accept="video/*" onChange={handleFileChange} disabled={isLoading} />
            </label>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
             <div>
                <label htmlFor="prompt-video-analysis" className="block text-sm font-medium text-blue-200 mb-2">
                    What should I look for? (Optional)
                </label>
                <input
                    id="prompt-video-analysis"
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., Summarize the events, describe the environment, find the key moment..."
                    className="w-full bg-blue-800 border border-blue-700 rounded-lg p-3 text-white placeholder-blue-400 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition shadow-inner"
                    disabled={isLoading}
                />
            </div>

            {error && (
              <div className="p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-center">
                <p><strong>Error:</strong> {error}</p>
              </div>
            )}

            <div className="text-center">
                <Button type="submit" isLoading={isLoading} disabled={!videoFile} title="Analyze the uploaded video">
                    Analyze Video
                </Button>
            </div>
        </form>
        
        {isLoading && (
             <div className="flex flex-col items-center justify-center mt-8">
                <Spinner />
                <p className="mt-4 text-blue-300">Processing video frames...</p>
            </div>
        )}

        {result && (
            <div className="mt-8 animate-fade-in bg-blue-800/50 border border-blue-700/50 rounded-lg p-6">
                 <div className="flex items-center gap-3 mb-4 border-b border-blue-700 pb-2">
                    <VideoSearchIcon className="w-6 h-6 text-rose-400" />
                    <h3 className="text-xl font-semibold text-blue-100">Video Insights</h3>
                </div>
                <div
                    className="prose prose-custom max-w-none"
                    dangerouslySetInnerHTML={{ __html: marked.parse(result) as string }}
                />
            </div>
        )}
      </div>
    </div>
  );
};

export default VideoAnalyzer;