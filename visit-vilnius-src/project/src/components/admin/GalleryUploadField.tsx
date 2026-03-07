import React, { useState, useRef } from 'react';
import { Upload, X, FolderOpen, Plus, Loader2, Images } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { compressImage } from '../../utils/imageUtils';
import MediaPickerModal from './MediaPickerModal';

interface GalleryUploadFieldProps {
  images: string[];
  onChange: (images: string[]) => void;
  label?: string;
}

const GalleryUploadField: React.FC<GalleryUploadFieldProps> = ({
  images,
  onChange,
  label = 'Papildomos nuotraukos (galerija)',
}) => {
  const [uploading, setUploading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFiles = async (files: File[]) => {
    setUploading(true);
    const newUrls: string[] = [];
    try {
      for (const file of files) {
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

        newUrls.push(urlData.publicUrl);
      }
      onChange([...images, ...newUrls]);
    } catch (err) {
      console.error('Gallery upload error:', err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    await uploadFiles(files);
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const handlePickerSelect = (url: string) => {
    if (!images.includes(url)) {
      onChange([...images, url]);
    }
    setShowPicker(false);
  };

  return (
    <>
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">
            <span className="flex items-center gap-2">
              <Images className="w-4 h-4" />
              {label}
            </span>
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 transition-colors"
            >
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              {uploading ? 'Keliama...' : 'Įkelti'}
            </button>
            <button
              type="button"
              onClick={() => setShowPicker(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              Biblioteka
            </button>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
          onChange={handleFileChange}
          className="hidden"
        />

        {images.length === 0 ? (
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
            <Plus className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">Pridėkite papildomų nuotraukų galerijai</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {images.map((url, index) => (
              <div key={index} className="group relative aspect-square rounded-xl overflow-hidden border border-gray-200">
                <img
                  src={url}
                  alt={`Gallery ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 hover:border-amber-400 hover:bg-amber-50 transition-colors disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
              ) : (
                <>
                  <Plus className="w-6 h-6 text-gray-400" />
                  <span className="text-xs text-gray-400">Pridėti</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {showPicker && (
        <MediaPickerModal
          onSelect={handlePickerSelect}
          onClose={() => setShowPicker(false)}
        />
      )}
    </>
  );
};

export default GalleryUploadField;
