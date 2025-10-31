import React, { useState } from 'react';
import { getProResponse } from '../services/geminiService';
import { marked } from 'marked';
import Spinner from './Spinner';
import Button from './Button';
import { AnalystIcon } from './Icons';

const ProAnalyst: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setError('Please enter a query.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setResponse(null);

    // FIX: Corrected the malformed try-catch-finally block.
    try {
      const result = await getProResponse(prompt);
      setResponse(result);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const parsedResponse = response ? marked.parse(response) : '';

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white tracking-tight">Pro Analyst</h2>
        <p className="mt-2 text-lg text-slate-400">Tackle complex problems with advanced AI reasoning.</p>
      </div>
      <div className="bg-slate-900/50 rounded-2xl p-4 sm:p-6 md:p-8 border border-slate-800 shadow-2xl shadow-black/30">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="prompt-analyst" className="block text-lg font-medium text-slate-200 mb-2">
              Enter your complex query
            </label>
            <textarea
              id="prompt-analyst"
              rows={5}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., Explain the theory of relativity as if I'm a high school student, including its key postulates, main consequences, and a simple real-world analogy."
              className="w-full bg-slate-800/60 border border-slate-700 rounded-lg p-4 text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition shadow-inner"
              disabled={isLoading}
            />
          </div>

          <div className="text-center pt-2">
            <Button 
              type="submit" 
              isLoading={isLoading} 
              disabled={!prompt.trim()} 
              title="Submit your query for in-depth analysis"
              className="w-full sm:w-auto"
            >
              Analyze with Pro Model
            </Button>
          </div>
        </form>

        <div className="mt-8 min-h-[12rem] flex items-center justify-center">
          {isLoading && (
            <div className="flex flex-col items-center justify-center p-8 bg-slate-800/50 rounded-lg w-full">
              <Spinner />
              <p className="mt-4 text-slate-400 font-semibold">Thinking on your complex query...</p>
              <p className="mt-1 text-sm text-slate-500">This may take a bit longer for detailed analysis.</p>
            </div>
          )}
          {error && (
            <div className="p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-center">
              <p><strong>Error:</strong> {error}</p>
            </div>
          )}
          {response && (
            <div className="w-full animate-fade-in bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 sm:p-6">
                 <div className="flex items-center gap-3 mb-4">
                    <div className="flex-shrink-0 bg-gradient-to-r from-blue-600 to-cyan-500 p-2 rounded-full">
                        <AnalystIcon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-200">Analysis Result</h3>
                </div>
              <div
                className="prose prose-custom max-w-none"
                dangerouslySetInnerHTML={{ __html: parsedResponse as string }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProAnalyst;