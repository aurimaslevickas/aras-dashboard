import React, { useState, useEffect, useRef } from 'react';
import { X, Search, Upload, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase, adminFetch as adminFetchLib } from '../../lib/supabase';
import { compressImage, formatFileSize } from '../../utils/imageUtils';

interface MediaItem {
  id: string;
  filename: string;
  url: string;
  size: number;
  created_at: string;
}

interface MediaPickerModalProps {
  onSelect: (url: string) => void;
  onClose: () => void;
}

const MediaPickerModal: React.FC<MediaPickerModalProps> = ({ onSelect, onClose }) => {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [filtered, setFiltered] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadMedia();
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(items);
    } else {
      setFiltered(items.filter(item =>
        item.filename.toLowerCase().includes(search.toLowerCase())
      ));
    }
  }, [search, items]);

  const loadMedia = async () => {
    try {
      const { data, error } = await supabase
        .from('media_library')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setItems(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const adminFetch = (body: object) => adminFetchLib('admin-write', body);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const compressed = await compressImage(file);
      const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}_${compressed.name}`;

      const { error: storageError } = await supabase.storage
        .from('media')
        .upload(filename, compressed);

      if (storageError) throw new Error(`Storage: ${storageError.message}`);

      const { data: urlData } = supabase.storage
        .from('media')
        .getPublicUrl(filename);

      await adminFetch({
        action: 'insert',
        table: 'media_library',
        payload: {
          filename: file.name,
          url: urlData.publicUrl,
          type: 'image',
          size: compressed.size,
        },
      });

      await loadMedia();
      setSelected(urlData.publicUrl);
    } catch (err: any) {
      setUploadError(err?.message || 'Klaida įkeliant nuotrauką');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleConfirm = () => {
    if (selected) onSelect(selected);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Pasirinkite nuotrauką</h2>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 disabled:opacity-50 transition-colors"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {uploading ? 'Keliama...' : 'Įkelti naują'}
            </button>
            <button type="button" onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
            onChange={handleUpload}
            className="hidden"
          />
        </div>

        {uploadError && (
          <div className="mx-6 mt-3 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{uploadError}</span>
            <button onClick={() => setUploadError(null)} className="ml-auto flex-shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="px-6 py-3 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ieškoti pagal pavadinimą..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              {search ? 'Nerasta nuotraukų pagal paiešką' : 'Biblioteka tuščia. Įkelkite pirmą nuotrauką.'}
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {filtered.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelected(item.url)}
                  className={`group relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                    selected === item.url
                      ? 'border-amber-500 ring-2 ring-amber-200'
                      : 'border-transparent hover:border-amber-300'
                  }`}
                >
                  <img
                    src={item.url}
                    alt={item.filename}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {selected === item.url && (
                    <div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-amber-600 drop-shadow" />
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs truncate">{item.filename}</p>
                    <p className="text-gray-300 text-xs">{formatFileSize(item.size)}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-sm text-gray-500">
            {filtered.length} nuotrauka(-os) bibliotekoje
            {selected && ' • 1 pasirinkta'}
          </span>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Atšaukti
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!selected}
              className="px-5 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Pasirinkti
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaPickerModal;
