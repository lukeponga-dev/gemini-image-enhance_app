import React, { useCallback, useState } from 'react';
import Spinner from './Spinner';

interface ImageDropzoneProps {
  onImageDrop: (file: File) => void;
  isLoading?: boolean;
}

const ImageDropzone: React.FC<ImageDropzoneProps> = ({ onImageDrop, isLoading = false }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoading) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (!isLoading && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onImageDrop(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  }, [onImageDrop, isLoading]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isLoading && e.target.files && e.target.files.length > 0) {
      onImageDrop(e.target.files[0]);
    }
  };
  
  const openFileDialog = () => {
    if (isLoading) return;
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    fileInput?.click();
  };


  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={openFileDialog}
      title={isLoading ? "Processing your image..." : "Click or drag and drop an image file here"}
      className={`relative w-full p-8 border-2 border-dashed rounded-lg text-center transition-all duration-300 ${isDragging ? 'border-rose-400 bg-blue-800/50 scale-105 shadow-2xl shadow-rose-500/10' : 'border-blue-700 bg-transparent'} ${isLoading ? 'cursor-wait' : 'cursor-pointer hover:border-blue-600'}`}
    >
      <input
        type="file"
        id="file-upload"
        className="hidden"
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/webp"
        disabled={isLoading}
      />
      {isLoading ? (
        <div className="flex flex-col items-center justify-center space-y-4 text-blue-200">
            <Spinner />
            <p className="text-lg font-semibold">Processing Image...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center space-y-3 text-blue-300 transition-transform duration-300 transform group-hover:scale-110">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-lg font-semibold">
            <span className="text-rose-400">Click to upload</span> or drag and drop
          </p>
          <p className="text-sm">PNG, JPG, or WEBP</p>
        </div>
      )}
    </div>
  );
};

export default ImageDropzone;