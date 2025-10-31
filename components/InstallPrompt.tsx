import React from 'react';

const InstallIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

interface InstallPromptProps {
  show: boolean;
  onInstall: () => void;
  onDismiss: () => void;
}

const InstallPrompt: React.FC<InstallPromptProps> = ({ show, onInstall, onDismiss }) => {
  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 p-4 transition-transform duration-500 ease-in-out ${
        show ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="container mx-auto max-w-lg">
        <div className="bg-slate-800/80 backdrop-blur-lg rounded-xl shadow-2xl p-4 flex items-center justify-between gap-4 border border-slate-700/50">
            <div className="flex items-center gap-4">
                 <img src="/icon-192.svg" alt="App Icon" className="w-12 h-12 hidden sm:block" />
                 <div>
                    <p className="font-bold text-white">Get the Full Experience</p>
                    <p className="text-sm text-slate-300">Install our app for quick access from your home screen.</p>
                 </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
                <button
                    onClick={onInstall}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-semibold rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500 transition-all transform hover:scale-105 text-sm"
                >
                    <InstallIcon className="w-4 h-4" />
                    <span>Install</span>
                </button>
                <button onClick={onDismiss} className="p-2 rounded-full text-slate-400 hover:bg-slate-700/50 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-slate-600">
                    <CloseIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;