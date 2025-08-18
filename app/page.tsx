'use client'

import { compress } from "@thaparoyal/image-compression";
import { Download, FileImage, ImageIcon, Settings, Upload, Zap } from "lucide-react";
import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { ThemeToggle } from "../src/app/components/ThemeToggle";

interface CompressionOptions {
  maxSizeMB: number;
  format: 'webp' | 'jpeg' | 'png' | 'avif';
  resize: 'contain' | 'cover' | 'fill' | 'inside' | 'outside';
  maxWidth: number;
  maxHeight: number;
  quality: number;
  progressive: boolean;
}


export default function Home() {
   const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [compressedFile, setCompressedFile] = useState<File | null>(null);
  const [originalPreview, setOriginalPreview] = useState<string>('');
  const [compressedPreview, setCompressedPreview] = useState<string>('');
  const [isCompressing, setIsCompressing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [options, setOptions] = useState<CompressionOptions>({
    maxSizeMB: 1,
    format: 'webp',
    resize: 'contain',
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 0.8,
    progressive: false,
  });

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const createPreviewUrl = (file: File): string => {
    return URL.createObjectURL(file);
  };

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setOriginalFile(file);
    setOriginalPreview(createPreviewUrl(file));
    setCompressedFile(null);
    setCompressedPreview('');
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleCompress = async () => {
    if (!originalFile) return;

    setIsCompressing(true);
    try {
      const compressionOptions = {
        maxSizeMB: options.maxSizeMB,
        format: options.format,
        resize: options.resize,
        maxWidth: options.maxWidth,
        maxHeight: options.maxHeight,
        quality: options.quality,
        progressive: options.progressive,
      };

      const compressed = await compress(originalFile, compressionOptions);
      setCompressedFile(compressed);
      setCompressedPreview(createPreviewUrl(compressed));
    } catch (error) {
      console.error('Compression failed:', error);
      alert('Compression failed. Please try again.');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleDownload = () => {
    if (!compressedFile) return;

    const url = URL.createObjectURL(compressedFile);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compressed-${compressedFile.name}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const compressionRatio = originalFile && compressedFile 
    ? ((1 - compressedFile.size / originalFile.size) * 100).toFixed(1)
    : '0';
  return (
     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-950 transition-colors duration-300 flex flex-col">
      {/* Header */}
      <header className="relative bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800">
        {/* <ThemeToggle /> */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-700 dark:to-indigo-900 rounded-lg shadow">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Image Compressor</h1>
              <p className="text-base text-gray-600 dark:text-gray-300 mt-1">Compress images with advanced options, entirely in your browser</p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Upload Panel */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-950 rounded-2xl shadow-xl p-8 transition-colors duration-300">
                <div className="flex items-center space-x-2 mb-6">
                  <Upload className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Upload Image</h2>
                </div>
                <div
                  className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors duration-200 cursor-pointer ${
                    isDragOver
                      ? 'border-blue-400 bg-blue-50 dark:bg-blue-950'
                      : originalFile
                      ? 'border-green-400 bg-green-50 dark:bg-green-950'
                      : 'border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500'
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileInputChange}
                    accept="image/*"
                    className="hidden"
                  />
                  {originalFile ? (
                    <div className="space-y-3">
                      <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center shadow">
                        <ImageIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-base font-medium text-gray-900 dark:text-white">{originalFile.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{formatFileSize(originalFile.size)}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center shadow">
                        <Upload className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                      </div>
                      <div>
                        <p className="text-base font-medium text-gray-900 dark:text-white">Drop your image here</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">or click to browse files</p>
                      </div>
                    </div>
                  )}
                </div>
                {originalFile && originalPreview && (
                  <div className="mt-6">
                    <img
                      src={originalPreview}
                      alt="Original preview"
                      className="w-full h-48 object-cover rounded-xl border border-gray-200 dark:border-gray-800 shadow"
                    />
                  </div>
                )}
              </div>
            </div>
            {/* Compression Options Panel */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-950 rounded-2xl shadow-xl p-8 transition-colors duration-300">
                <div className="flex items-center space-x-2 mb-6">
                  <Settings className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Compression Options</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Max File Size */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Max File Size (MB)</label>
                    <input
                      type="number"
                      min="0.1"
                      max="50"
                      step="0.1"
                      value={options.maxSizeMB}
                      onChange={(e) => setOptions({ ...options, maxSizeMB: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  {/* Output Format */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Output Format</label>
                    <select
                      value={options.format}
                      onChange={(e) => setOptions({ ...options, format: e.target.value as CompressionOptions['format'] })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="webp">WebP</option>
                      <option value="jpeg">JPEG</option>
                      <option value="png">PNG</option>
                      <option value="avif">AVIF</option>
                    </select>
                  </div>
                  {/* Resize Mode */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Resize Mode</label>
                    <select
                      value={options.resize}
                      onChange={(e) => setOptions({ ...options, resize: e.target.value as CompressionOptions['resize'] })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="contain">Contain</option>
                      <option value="cover">Cover</option>
                      <option value="fill">Fill</option>
                      <option value="inside">Inside</option>
                      <option value="outside">Outside</option>
                    </select>
                  </div>
                  {/* Quality */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quality ({options.quality})</label>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.05"
                      value={options.quality}
                      onChange={(e) => setOptions({ ...options, quality: parseFloat(e.target.value) })}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>
                  {/* Max Width */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Max Width (px)</label>
                    <input
                      type="number"
                      min="100"
                      max="4000"
                      value={options.maxWidth}
                      onChange={(e) => setOptions({ ...options, maxWidth: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  {/* Max Height */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Max Height (px)</label>
                    <input
                      type="number"
                      min="100"
                      max="4000"
                      value={options.maxHeight}
                      onChange={(e) => setOptions({ ...options, maxHeight: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                {/* Progressive JPEG Toggle */}
                <div className="mt-8">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={options.progressive}
                      onChange={(e) => setOptions({ ...options, progressive: e.target.checked })}
                      className="w-4 h-4 text-blue-600 dark:text-blue-400 bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">Progressive JPEG</span>
                  </label>
                </div>
                {/* Compress Button */}
                <div className="mt-10">
                  <button
                    onClick={handleCompress}
                    disabled={!originalFile || isCompressing}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-900 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 dark:hover:from-blue-800 dark:hover:to-indigo-950 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg"
                  >
                    {isCompressing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Compressing...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="h-5 w-5" />
                        <span>Compress Image</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* Results Panel */}
          {(compressedFile || isCompressing) && (
            <div className="mt-12 bg-white dark:bg-gray-950 rounded-2xl shadow-xl p-8 transition-colors duration-300">
              <div className="flex items-center space-x-2 mb-8">
                <FileImage className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Compression Results</h2>
              </div>
              {isCompressing ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center space-x-4">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 dark:border-blue-400"></div>
                    <span className="text-gray-600 dark:text-gray-300 text-lg">Compressing your image...</span>
                  </div>
                </div>
              ) : compressedFile ? (
                <div>
                  {/* Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 text-center transition-colors duration-300 shadow">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatFileSize(originalFile!.size)}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Original Size</p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-950 rounded-xl p-6 text-center transition-colors duration-300 shadow">
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatFileSize(compressedFile.size)}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Compressed Size</p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-950 rounded-xl p-6 text-center transition-colors duration-300 shadow">
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{compressionRatio}%</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Size Reduction</p>
                    </div>
                  </div>
                  {/* Preview Comparison */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Original</h3>
                      <img
                        src={originalPreview}
                        alt="Original"
                        className="w-full h-64 object-cover rounded-xl border border-gray-200 dark:border-gray-800 shadow"
                      />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Compressed</h3>
                      <img
                        src={compressedPreview}
                        alt="Compressed"
                        className="w-full h-64 object-cover rounded-xl border border-gray-200 dark:border-gray-800 shadow"
                      />
                    </div>
                  </div>
                  {/* Download Button */}
                  <div className="flex justify-center">
                    <button
                      onClick={handleDownload}
                      className="bg-green-600 dark:bg-green-700 text-white py-4 px-8 rounded-xl font-semibold hover:bg-green-700 dark:hover:bg-green-800 transition-colors duration-200 flex items-center space-x-2 shadow-lg"
                    >
                      <Download className="h-5 w-5" />
                      <span>Download Compressed Image</span>
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
