import React from 'react';
import { buildSrcSet, getResponsiveImageUrl } from '../utils/imageUtils';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  widths?: number[];
  defaultWidth?: number;
  loading?: 'lazy' | 'eager';
  fetchpriority?: 'high' | 'low' | 'auto';
}

const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  className,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  widths = [400, 800, 1200],
  defaultWidth = 800,
  loading = 'lazy',
  fetchpriority = 'auto',
}) => {
  if (!src) return null;

  const optimizedSrc = getResponsiveImageUrl(src, defaultWidth);
  const srcSet = buildSrcSet(src, widths);

  return (
    <img
      src={optimizedSrc}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      className={className}
      loading={loading}
      fetchpriority={fetchpriority}
      decoding="async"
    />
  );
};

export default ResponsiveImage;
