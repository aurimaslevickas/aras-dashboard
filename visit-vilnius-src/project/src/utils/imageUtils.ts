const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;

export function getResponsiveImageUrl(url: string, width: number, quality = 80): string {
  if (!url) return url;

  if (url.includes('images.pexels.com')) {
    const base = url.split('?')[0];
    return `${base}?auto=compress&cs=tinysrgb&w=${width}&fit=crop`;
  }

  if (SUPABASE_URL && url.includes(SUPABASE_URL) && url.includes('/storage/v1/object/public/')) {
    return `${url}?width=${width}&quality=${quality}&format=webp`;
  }

  return url;
}

export function buildSrcSet(url: string, widths: number[] = [400, 800, 1200]): string {
  return widths.map(w => `${getResponsiveImageUrl(url, w)} ${w}w`).join(', ');
}

const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1080;
const QUALITY = 0.85;

export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) return file;

  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;
      const needsResize = width > MAX_WIDTH || height > MAX_HEIGHT;

      if (!needsResize && file.type === 'image/webp') {
        resolve(file);
        return;
      }

      if (width > MAX_WIDTH) {
        height = Math.round((height * MAX_WIDTH) / width);
        width = MAX_WIDTH;
      }
      if (height > MAX_HEIGHT) {
        width = Math.round((width * MAX_HEIGHT) / height);
        height = MAX_HEIGHT;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve(file); return; }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) { resolve(file); return; }
          const baseName = file.name
            .replace(/\.[^.]+$/, '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-zA-Z0-9_\-]/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_|_$/g, '');
          const compressed = new File([blob], `${baseName || 'image'}.webp`, { type: 'image/webp' });
          resolve(compressed);
        },
        'image/webp',
        QUALITY
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };

    img.src = url;
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
