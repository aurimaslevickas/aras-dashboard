import React, { useState, useRef } from 'react';
import { Upload, Image, X, FolderOpen, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { compressImage } from '../../utils/imageUtils';
import MediaPickerModal from './MediaPickerModal';

interface ImageUploadFieldProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  required?: boolean;
}

const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  value,
  onChange,
  label = 'Nuotrauka',
  required = false,
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File) => {
    setUploading(true);
    try {
      const compressed = await compressImage(file);
      const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}_${compressed.name}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filename, compressed);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('media')
        .getPublicUrl(filename);

      await supabase.from('media_library').insert({
        filename: file.name,
        url: urlData.publicUrl,
        type: 'image',
        size: compressed.size,
      });

      onChange(urlData.publicUrl);
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadFile(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith('image/')) return;
    await uploadFile(file);
  };

  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>

        {value ? (
          <div className="relative rounded-xl overflow-hidden border border-gray-200">
            <img
              src={value}
              alt="Preview"
              className="w-full h-48 object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-white text-gray-800 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Pakeisti
              </button>
              <button
                type="button"
                onClick={() => setShowPicker(true)}
                className="px-4 py-2 bg-white text-gray-800 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors flex items-center gap-2"
              >
                <FolderOpen className="w-4 h-4" />
                Biblioteka
              </button>
              <button
                type="button"
                onClick={() => onChange('')}
                className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl transition-colors ${
              dragOver ? 'border-amber-400 bg-amber-50' : 'border-gray-200 hover:border-amber-300 hover:bg-amber-50/30'
            }`}
          >
            {uploading ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                <p className="text-sm text-amber-600 font-medium">Optimizuojama ir keliama...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <Image className="w-10 h-10 text-gray-300" />
                <p className="text-sm text-gray-500">Tempkite nuotrauką arba:</p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Įkelti failą
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPicker(true)}
                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <FolderOpen className="w-4 h-4" />
                    Iš bibliotekos
                  </button>
                </div>
                <p className="text-xs text-gray-400">Automatiškai sumažinama iki 1920px, WebP</p>
              </div>
            )}
          </div>
        )}

        {uploading && value && (
          <div className="mt-2 flex items-center gap-2 text-sm text-amber-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            Optimizuojama ir keliama...
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {showPicker && (
        <MediaPickerModal
          onSelect={(url) => { onChange(url); setShowPicker(false); }}
          onClose={() => setShowPicker(false)}
        />
      )}
    </>
  );
};

export default ImageUploadField;
