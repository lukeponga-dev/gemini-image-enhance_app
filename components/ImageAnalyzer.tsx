import React, { useState } from 'react';
import { analyzeMedia } from '../services/geminiService';
import ImageDropzone from './ImageDropzone';
import Button from './Button';
import Spinner from './Spinner';
import { fileToBase64 } from '../utils/imageUtils';
import { marked } from 'marked';
import { ImageSearchIcon } from './Icons';

const ImageAnalyzer: React.FC = () => {
  const [image, setImage] = useState<{ file: File; url: string } | null>(null);
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageDrop = (file: File) => {
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setError('Invalid file type. Please upload a PNG, JPG, or WEBP image.');
      return;
    }
    setImage({ file, url: URL.createObjectURL(file) });
    setResult(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) {
      setError('Please upload an image.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const { base64, mimeType } = await fileToBase64(image.file);
      const analysisResult = await analyzeMedia(prompt, base64, mimeType);
      setResult(analysisResult);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-blue-50 tracking-tight">Image Analyzer</h2>
        <p className="mt-2 text-lg text-blue-300">Understand and analyze visual content with Gemini 3 Pro.</p>
      </div>

      <div className="bg-blue-900/80 rounded-2xl p-4 sm:p-6 md:p-8 border border-blue-800 shadow-2xl shadow-black/30">
        {!image ? (
            <ImageDropzone onImageDrop={handleImageDrop} />
        ) : (
            <div className="flex flex-col items-center mb-6">
                <div className="relative group">
                    <img src={image.url} alt="To analyze" className="rounded-lg shadow-lg max-h-64 w-auto object-contain" />
                    <button 
                        onClick={() => { setImage(null); setResult(null); }}
                        className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                        title="Remove image"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
             <div>
                <label htmlFor="prompt-analysis" className="block text-sm font-medium text-blue-200 mb-2">
                    Specific questions (Optional)
                </label>
                <input
                    id="prompt-analysis"
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., Describe the scene, detect text, analyze emotions..."
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
                <Button type="submit" isLoading={isLoading} disabled={!image} title="Analyze the uploaded image">
                    Analyze Image
                </Button>
            </div>
        </form>
        
        {isLoading && (
             <div className="flex flex-col items-center justify-center mt-8">
                <Spinner />
                <p className="mt-4 text-blue-300">Analyzing image content...</p>
            </div>
        )}

        {result && (
            <div className="mt-8 animate-fade-in bg-blue-800/50 border border-blue-700/50 rounded-lg p-6">
                 <div className="flex items-center gap-3 mb-4 border-b border-blue-700 pb-2">
                    <ImageSearchIcon className="w-6 h-6 text-rose-400" />
                    <h3 className="text-xl font-semibold text-blue-100">Analysis Result</h3>
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

export default ImageAnalyzer;