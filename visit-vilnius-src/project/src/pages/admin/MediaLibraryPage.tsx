import React, { useState, useEffect, useRef } from 'react';
import { Upload, Copy, Trash2, Image, AlertCircle, CheckCircle, X, Loader2 } from 'lucide-react';
import { supabase, adminFetch as adminFetchLib } from '../../lib/supabase';
import AdminLayout from '../../components/admin/AdminLayout';
import { compressImage, formatFileSize } from '../../utils/imageUtils';

interface MediaItem {
  id: string;
  filename: string;
  url: string;
  type: string;
  size: number;
  created_at: string;
}

const MediaLibraryPage = () => {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = async () => {
    try {
      const { data, error } = await supabase
        .from('media_library')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error loading media:', error);
    } finally {
      setLoading(false);
    }
  };

  const adminFetch = (body: object) => adminFetchLib('admin-write', body);

  const processFiles = async (files: File[]) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
    const maxSize = 50 * 1024 * 1024;

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        setMessage({ type: 'error', text: `"${file.name}" — leidžiami tik paveikslėliai (JPEG, PNG, WebP)` });
        return;
      }
      if (file.size > maxSize) {
        setMessage({ type: 'error', text: `"${file.name}" — failas per didelis. Max: 50 MB` });
        return;
      }
    }

    if (files.length > 15) {
      setMessage({ type: 'error', text: 'Galima įkelti max 15 nuotraukų vienu metu' });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress(`Optimizuojama ir keliama ${i + 1}/${files.length}...`);

        const compressed = await compressImage(file);
        const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}_${compressed.name}`;

        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(filename, compressed);

        if (uploadError) throw uploadError;

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
      }

      setMessage({ type: 'success', text: `${files.length} nuotrauka(-os) optimizuota(-os) ir įkelta(-os) sėkmingai` });
      loadMedia();
    } catch (error) {
      setMessage({ type: 'error', text: 'Klaida įkeliant nuotrauką' });
    } finally {
      setUploading(false);
      setUploadProgress('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    await processFiles(files);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (!files.length) return;
    await processFiles(files);
  };

  const copyUrl = (item: MediaItem) => {
    navigator.clipboard.writeText(item.url);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const deleteItem = async (id: string) => {
    try {
      await adminFetch({ action: 'delete', table: 'media_library', match: { id } });
      setItems((prev) => prev.filter((item) => item.id !== id));
      setDeleteConfirm(null);
    } catch (error: any) {
      setMessage({ type: 'error', text: `Klaida trinant failą: ${error?.message || JSON.stringify(error)}` });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Medijų biblioteka</h1>
            <p className="text-gray-600 mt-1">Visi įkelti failai — {items.length} vnt.</p>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
            {uploading ? uploadProgress || 'Įkeliama...' : 'Įkelti nuotraukas'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {message && (
          <div className={`flex items-center gap-3 p-4 rounded-lg border ${
            message.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {message.type === 'success'
              ? <CheckCircle className="w-5 h-5 flex-shrink-0" />
              : <AlertCircle className="w-5 h-5 flex-shrink-0" />
            }
            <span>{message.text}</span>
            <button onClick={() => setMessage(null)} className="ml-auto">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
            dragOver
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50'
          }`}
        >
          {uploading ? (
            <>
              <Loader2 className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-spin" />
              <p className="text-blue-600 font-medium">{uploadProgress}</p>
              <p className="text-gray-400 text-sm mt-1">Nuotraukos optimizuojamos ir keliamos...</p>
            </>
          ) : (
            <>
              <Upload className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Tempkite nuotraukas čia arba spustelėkite</p>
              <p className="text-gray-400 text-sm mt-1">JPEG, PNG, WebP — automatiškai sumažinama iki 1920px, konvertuojama į WebP</p>
            </>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <Image className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Nėra įkeltų failų</h3>
            <p className="text-gray-500">Įkelkite pirmą nuotrauką</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {items.map((item) => (
              <div key={item.id} className="group relative bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow">
                <div className="aspect-square overflow-hidden bg-gray-50">
                  <img
                    src={item.url}
                    alt={item.filename}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    width="200"
                    height="200"
                  />
                </div>
                <div className="p-3">
                  <p className="text-xs text-gray-700 truncate font-medium" title={item.filename}>{item.filename}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatFileSize(item.size)}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => copyUrl(item)}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs bg-gray-50 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                      title="Kopijuoti URL"
                    >
                      {copiedId === item.id ? (
                        <>
                          <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                          <span className="text-green-500">Nukopijuota</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>URL</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(item.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Ištrinti"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Ištrinti failą?</h3>
              <p className="text-gray-600 mb-6">Šis veiksmas negrįžtamas.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Atšaukti
                </button>
                <button
                  onClick={() => deleteItem(deleteConfirm)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Ištrinti
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default MediaLibraryPage;
