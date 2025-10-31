import React, { useState, useEffect } from 'react';
import { transferStyle } from '../services/geminiService';
import ImageDropzone from './ImageDropzone';
import Button from './Button';
import GeneratedImage from './GeneratedImage';
import Spinner from './Spinner';
import { fileToBase64, dataUrlToFile } from '../utils/imageUtils';
import { useToolChain } from '../contexts/ToolChainContext';

type ImageState = { file: File; url: string; base64: string; mimeType: string } | null;

const StyleTransfer: React.FC = () => {
  const [contentImage, setContentImage] = useState<ImageState>(null);
  const [styleImage, setStyleImage] = useState<ImageState>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { consumeChainedImage } = useToolChain();

  useEffect(() => {
    const chainedData = consumeChainedImage();
    if (chainedData?.targetTool === 'style') {
      const { image } = chainedData;
      const processChainedImage = async () => {
        try {
            const fileName = image.prompt.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50) || 'chained-image';
            const file = await dataUrlToFile(image.dataUrl, `${fileName}.png`);
            if (contentImage) URL.revokeObjectURL(contentImage.url);
            handleImageDrop(file, 'content');
        } catch (e) {
            console.error("Failed to process chained image", e);
            setError("Could not load the image from the previous tool.");
        }
      };
      processChainedImage();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  
  const handleImageDrop = async (file: File, type: 'content' | 'style') => {
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setError('Invalid file type. Please upload a PNG, JPG, or WEBP image.');
      return;
    }
    setError(null);
    setResultImage(null);
    const url = URL.createObjectURL(file);
    const { base64, mimeType } = await fileToBase64(file);
    const imageState = { file, url, base64, mimeType };

    if (type === 'content') {
      if (contentImage) URL.revokeObjectURL(contentImage.url);
      setContentImage(imageState);
    } else {
      if (styleImage) URL.revokeObjectURL(styleImage.url);
      setStyleImage(imageState);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contentImage || !styleImage) {
      setError('Please upload both a content and a style image.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setResultImage(null);

    try {
      const newImageBase64 = await transferStyle(
        contentImage.base64,
        contentImage.mimeType,
        styleImage.base64,
        styleImage.mimeType
      );
      setResultImage(`data:${contentImage.mimeType};base64,${newImageBase64}`);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white tracking-tight">AI Style Transfer</h2>
        <p className="mt-2 text-lg text-slate-400">Combine the style of one image with the content of another.</p>
      </div>
      <div className="bg-slate-900/50 rounded-2xl p-4 sm:p-6 md:p-8 border border-slate-800 shadow-2xl shadow-black/30">
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-semibold mb-4 text-center text-slate-300">Content Image</h3>
            {contentImage ? (
              <img src={contentImage.url} alt="Content" className="rounded-lg shadow-lg w-full h-auto" />
            ) : (
              <ImageDropzone onImageDrop={(file) => handleImageDrop(file, 'content')} />
            )}
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4 text-center text-slate-300">Style Image</h3>
            {styleImage ? (
              <img src={styleImage.url} alt="Style" className="rounded-lg shadow-lg w-full h-auto" />
            ) : (
              <ImageDropzone onImageDrop={(file) => handleImageDrop(file, 'style')} />
            )}
          </div>
        </div>

        {error && (
          <div className="my-4 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-center">
            <p><strong>Error:</strong> {error}</p>
          </div>
        )}

        {contentImage && styleImage && (
          <div className="text-center my-8">
            <Button onClick={handleSubmit} isLoading={isLoading} disabled={!contentImage || !styleImage} title="Apply the style image's aesthetic to the content image">
              Transfer Style
            </Button>
          </div>
        )}

        {(isLoading || resultImage) && (
          <div className="animate-fade-in">
            <h3 className="text-2xl font-semibold mb-4 text-center text-slate-300">Result</h3>
            <div className="max-w-2xl mx-auto flex items-center justify-center">
              {isLoading && (
                <div className="flex flex-col items-center text-center p-8">
                  <Spinner />
                  <p className="mt-4 text-slate-400">Applying style...</p>
                </div>
              )}
              {resultImage && (
                <GeneratedImage src={resultImage} alt="Style transfer result" prompt="style-transfer-result" />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StyleTransfer;