import React, { useCallback, useState } from 'react';

interface ImageDropzoneProps {
  onImageDrop: (file: File) => void;
}

const ImageDropzone: React.FC<ImageDropzoneProps> = ({ onImageDrop }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
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
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onImageDrop(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  }, [onImageDrop]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onImageDrop(e.target.files[0]);
    }
  };
  
  const openFileDialog = () => {
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
      className={`relative w-full p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-all duration-300 ${isDragging ? 'border-cyan-400 bg-slate-800/50 scale-105 shadow-2xl shadow-cyan-500/10' : 'border-slate-700 hover:border-slate-600 bg-transparent'}`}
    >
      <input
        type="file"
        id="file-upload"
        className="hidden"
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/webp"
      />
      <div className="flex flex-col items-center justify-center space-y-3 text-slate-400 transition-transform duration-300 transform group-hover:scale-110">
         <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p className="text-lg font-semibold">
          <span className="text-cyan-400">Click to upload</span> or drag and drop
        </p>
        <p className="text-sm">PNG, JPG, or WEBP</p>
      </div>
    </div>
  );
};

export default ImageDropzone;