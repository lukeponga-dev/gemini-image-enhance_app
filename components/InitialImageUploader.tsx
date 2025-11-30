import React, { useState, useEffect, useCallback, useRef } from 'react';
import ImageDropzone from './ImageDropzone';
import Button from './Button';
import GeneratedImage from './GeneratedImage';
import { useToolChain } from '../contexts/ToolChainContext';
import { Mode } from './Sidebar';
import {
    EditorIcon, RemoveIcon, StyleIcon, UpscaleIcon, UnblurIcon,
    Upscale8KIcon, RestoreIcon, BgRemoverIcon, ImageSearchIcon, ChatIcon
} from './Icons';
import { fileToBase64 } from '../utils/imageUtils';

interface ActionTool {
    id: Mode;
    label: string;
    icon: React.FC<{ className?: string }>;
}

const actionTools: ActionTool[] = [
    { id: 'enhancer', label: 'Enhancer', icon: UpscaleIcon },
    { id: 'unblur', label: 'Unblur Image', icon: UnblurIcon },
    { id: 'upscale8k', label: 'Upscale to 8K', icon: Upscale8KIcon },
    { id: 'restore', label: 'Restore Photo', icon: RestoreIcon },
    { id: 'bg-remover', label: 'Background Remover', icon: BgRemoverIcon },
    { id: 'remove', label: 'Remove Objects', icon: RemoveIcon },
    { id: 'edit', label: 'Manual Editor', icon: EditorIcon },
    { id: 'style', label: 'Style Transfer', icon: StyleIcon },
    { id: 'analyze-image', label: 'Analyze Image', icon: ImageSearchIcon },
    { id: 'chatbot', label: 'Chat with Image', icon: ChatIcon }, // New: Added Chatbot
];

const InitialImageUploader: React.FC = () => {
    const [originalImage, setOriginalImage] = useState<{ file: File; url: string; base64: string; mimeType: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { sendImageToTool } = useToolChain();

    const originalImageRef = useRef(originalImage);
    useEffect(() => {
        originalImageRef.current = originalImage;
    }, [originalImage]);

    const handleImageDrop = useCallback(async (file: File) => {
        if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
            setError('Invalid file type. Please upload a PNG, JPG, or WEBP image.');
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const url = URL.createObjectURL(file);
            const { base64, mimeType } = await fileToBase64(file);
            if (originalImageRef.current) URL.revokeObjectURL(originalImageRef.current.url);
            setOriginalImage({ file, url, base64, mimeType });
        } catch (e) {
            console.error("Error processing file:", e);
            setError("There was an error processing your file. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, []); // Dependencies: empty, relies on ref for previous image

    const handleSendToTool = (tool: Mode, label: string) => {
        if (originalImage) {
            sendImageToTool({ dataUrl: originalImage.url, prompt: `Uploaded image for ${label}` }, tool, `Sending image to ${label}...`);
        }
    };

    const resetState = () => {
        if (originalImageRef.current) { // Use ref for cleanup
            URL.revokeObjectURL(originalImageRef.current.url);
        }
        setOriginalImage(null);
        setError(null);
    };

    return (
        <div className="w-full max-w-5xl mx-auto">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-extrabold text-blue-50 tracking-tight">Start with Image</h2>
                <p className="mt-2 text-lg text-blue-300">Upload your image and choose an AI tool to get started.</p>
            </div>

            <div className="bg-blue-900/80 rounded-2xl p-4 sm:p-6 md:p-8 border border-blue-800 shadow-2xl shadow-black/30">
                {!originalImage ? (
                    <ImageDropzone onImageDrop={handleImageDrop} isLoading={isLoading} />
                ) : (
                    <div className="animate-fade-in space-y-8">
                        <div className="flex flex-col items-center">
                            <h3 className="text-xl font-semibold mb-4 text-center text-blue-200">Your Uploaded Image</h3>
                            <GeneratedImage src={originalImage.url} alt="Uploaded for processing" prompt="initial-upload" />
                        </div>
                        <div className="text-center">
                            <Button onClick={resetState} variant="secondary" title="Upload a different image">
                                Upload New Image
                            </Button>
                        </div>

                        <div className="mt-8 pt-4 border-t border-blue-700/60">
                            <p className="text-sm font-semibold text-center text-blue-300 mb-3">Send to an AI tool:</p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                {actionTools.map(tool => {
                                    const Icon = tool.icon;
                                    return (
                                        <button
                                            key={tool.id}
                                            onClick={() => handleSendToTool(tool.id, tool.label)}
                                            title={`Send image to ${tool.label}`}
                                            className="flex flex-col items-center justify-center gap-2 px-3 py-3 text-sm text-blue-100 bg-blue-800/60 hover:bg-blue-700/80 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-900 focus:ring-rose-500 transition-colors h-24"
                                        >
                                            <Icon className="w-6 h-6" />
                                            <span className="text-center">{tool.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
                {error && (
                    <div className="mt-4 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-center">
                        <p><strong>Error:</strong> {error}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InitialImageUploader;