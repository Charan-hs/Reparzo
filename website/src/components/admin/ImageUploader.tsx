import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, Loader2, Sparkles, Image as ImageIcon, X } from 'lucide-react';
import { compressImageToWebP, uploadImageToR2, formatBytes, type CompressionResult } from '../../lib/imageOptimizer';
import { toast } from 'sonner';

export const AVAILABLE_BANNERS = [
  { label: 'AC Service Banner', url: '/banners/ac-service.jpg' },
  { label: 'Bike Periodic Service', url: '/banners/bike-service.jpg' },
  { label: 'Home Shifting & Movers', url: '/banners/home-shifting.jpg' },
  { label: 'Electrical & Wiring', url: '/banners/electrical-service.jpg' },
  { label: 'Plumbing Services', url: '/banners/plumbing-service.jpg' },
  { label: 'Refrigerator Care', url: '/banners/refrigerator-service.jpg' },
  { label: 'Washing Machines', url: '/banners/washing-machine-service.jpg' },
  { label: 'Water Tank Cleaning', url: '/banners/water-tank-service.jpg' },
  { label: 'Promotional Banner 1', url: '/banners/banner-1.png' },
  { label: 'Promotional Banner 2', url: '/banners/banner-2.png' },
  { label: 'Promotional Banner 3', url: '/banners/banner-3.png' },
];

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  value,
  onChange,
  label = 'Banner Image',
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'library'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [compressionStats, setCompressionStats] = useState<CompressionResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file (JPG, PNG, WebP).');
      return;
    }

    try {
      setIsProcessing(true);
      // High-fidelity WebP compression with bicubic resampling
      const result = await compressImageToWebP(file, {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.90,
      });

      setCompressionStats(result);
      setIsProcessing(false);

      // Persist optimized banner
      setIsUploading(true);
      const uploaded = await uploadImageToR2(result.blob, result.originalName);
      setIsUploading(false);

      onChange(uploaded.url);
      toast.success(`Banner optimized & saved successfully! (${result.compressionRatio}% size reduction)`);
    } catch (err: any) {
      setIsProcessing(false);
      setIsUploading(false);
      console.error('[Image upload error]', err);
      toast.error(err?.message || 'Failed to optimize or upload image.');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      handleFile(droppedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleClear = () => {
    setCompressionStats(null);
    onChange(AVAILABLE_BANNERS[0].url);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-bold text-slate-700 block">{label}</label>

        {/* Tab Switcher: Upload vs Preset Library */}
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[10px] font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
              activeTab === 'upload'
                ? 'bg-white text-[#2563EB] shadow-2xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UploadCloud className="w-3 h-3" />
            <span>Upload New</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('library')}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
              activeTab === 'library'
                ? 'bg-white text-[#2563EB] shadow-2xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ImageIcon className="w-3 h-3" />
            <span>Preset Library</span>
          </button>
        </div>
      </div>

      {activeTab === 'upload' ? (
        <div className="space-y-2.5">
          {/* Upload Drop Area */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all duration-200 select-none ${
              isDragging
                ? 'border-[#2563EB] bg-blue-50/80 scale-[1.01]'
                : 'border-slate-300 hover:border-slate-400 bg-slate-50/70 hover:bg-slate-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/avif"
              className="hidden"
              onChange={(e) => {
                const selected = e.target.files?.[0];
                if (selected) handleFile(selected);
              }}
            />

            <div className="flex flex-col items-center justify-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-white shadow-xs border border-slate-200 flex items-center justify-center text-[#2563EB]">
                {isProcessing || isUploading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-[#2563EB]" />
                ) : (
                  <UploadCloud className="w-5 h-5" />
                )}
              </div>

              <div>
                <p className="text-xs font-bold text-slate-800">
                  {isProcessing
                    ? 'Optimizing image quality...'
                    : isUploading
                    ? 'Saving banner...'
                    : 'Click to upload or drag & drop banner'}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  PNG, JPG, WebP up to 15MB • Auto-optimized for high quality & fast loading
                </p>
              </div>

              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50/80 border border-blue-200/60 text-[#2563EB] text-[10px] font-semibold">
                <Sparkles className="w-3 h-3 text-[#2563EB]" />
                <span>HD Visual Lossless Compression</span>
              </div>
            </div>
          </div>

          {/* Optimization Metric Pill */}
          {compressionStats && (
            <div className="p-2.5 rounded-xl bg-slate-900 text-white flex items-center justify-between text-[11px] shadow-sm animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="flex items-center gap-2 min-w-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <div className="truncate text-[11px]">
                  <span className="text-slate-400">Original: </span>
                  <span className="font-semibold">{formatBytes(compressionStats.originalSize)}</span>
                  <span className="text-slate-500 mx-1.5">→</span>
                  <span className="text-emerald-400 font-bold">{formatBytes(compressionStats.compressedSize)}</span>
                  <span className="text-[10px] text-slate-400 ml-1.5 font-mono">
                    ({compressionStats.width}×{compressionStats.height}px)
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-extrabold text-[10px]">
                  -{compressionStats.compressionRatio}%
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClear();
                  }}
                  className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors cursor-pointer"
                  title="Remove"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Clean Active Image Preview */}
          {value && (
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-2xs group">
              <img
                src={value}
                alt="Active Banner Preview"
                className="w-full h-24 sm:h-28 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70" />
              <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-white text-[11px]">
                <span className="text-[10px] text-white/90 font-medium truncate max-w-[220px]">
                  Current Banner Preview
                </span>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full shadow-2xs border border-white/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>Active</span>
                </span>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Preset Library Tab */
        <div className="space-y-2.5">
          <div className="flex gap-2 items-center">
            <select
              value={value || AVAILABLE_BANNERS[0].url}
              onChange={(e) => onChange(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 font-semibold text-xs outline-none focus:border-[#2563EB]"
            >
              {AVAILABLE_BANNERS.map((b) => (
                <option key={b.url} value={b.url}>
                  {b.label}
                </option>
              ))}
            </select>

            {value && (
              <img
                src={value}
                alt="Selected preview"
                className="w-10 h-10 rounded-xl object-cover border border-slate-200 flex-shrink-0 shadow-2xs"
              />
            )}
          </div>

          {/* Preset Thumbnail Grid */}
          <div className="grid grid-cols-4 gap-1.5 pt-1">
            {AVAILABLE_BANNERS.map((b) => {
              const isSelected = value === b.url;
              return (
                <button
                  type="button"
                  key={b.url}
                  onClick={() => onChange(b.url)}
                  className={`relative rounded-xl overflow-hidden border transition-all cursor-pointer h-14 ${
                    isSelected
                      ? 'border-[#2563EB] ring-2 ring-blue-500/30'
                      : 'border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={b.url} alt={b.label} className="w-full h-full object-cover" />
                  <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[8px] font-bold truncate px-1 text-center py-0.5">
                    {b.label.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
