import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface PhotoGalleryProps {
  images: string[];
  mainImage: string;
  alt: string;
}

const PhotoGallery: React.FC<PhotoGalleryProps> = ({ images, mainImage, alt }) => {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const allImages = [mainImage, ...images.filter(img => img && img !== mainImage)];
  const visibleThumbs = allImages.slice(1, 5);
  const extraCount = allImages.length > 5 ? allImages.length - 5 : 0;

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const prev = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex - 1 + allImages.length) % allImages.length);
  };

  const next = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex + 1) % allImages.length);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
    if (e.key === 'Escape') closeLightbox();
  };

  if (allImages.length === 1) {
    return (
      <div
        className="relative h-96 rounded-2xl overflow-hidden mb-4 cursor-pointer"
        onClick={() => openLightbox(0)}
      >
        <img src={mainImage} alt={alt} loading="lazy" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
        {lightboxIndex !== null && (
          <Lightbox
            images={allImages}
            index={lightboxIndex}
            onClose={closeLightbox}
            onPrev={prev}
            onNext={next}
            onKeyDown={handleKeyDown}
          />
        )}
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-4 grid-rows-2 gap-1.5 h-80">
          <div
            className="col-span-2 row-span-2 cursor-pointer overflow-hidden rounded-l-2xl"
            onClick={() => openLightbox(0)}
          >
            <img src={allImages[0]} alt={alt} loading="lazy" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
          </div>

          {visibleThumbs.map((img, i) => {
            const isLast = i === visibleThumbs.length - 1 && extraCount > 0;
            const globalIndex = i + 1;
            const isLastThumb = i === 3;
            return (
              <div
                key={i}
                className={`relative cursor-pointer overflow-hidden ${
                  i === 1 ? 'rounded-tr-2xl' : i === 3 ? 'rounded-br-2xl' : ''
                }`}
                onClick={() => openLightbox(globalIndex)}
              >
                <img src={img} alt={`${alt} ${i + 2}`} loading="lazy" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                {isLast && isLastThumb && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-br-2xl">
                    <span className="text-white text-xl font-bold">+{extraCount + 1}</span>
                  </div>
                )}
              </div>
            );
          })}

          {visibleThumbs.length < 4 && Array.from({ length: 4 - visibleThumbs.length }).map((_, i) => (
            <div key={`empty-${i}`} className="bg-gray-100" />
          ))}
        </div>
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          images={allImages}
          index={lightboxIndex}
          onClose={closeLightbox}
          onPrev={prev}
          onNext={next}
          onKeyDown={handleKeyDown}
        />
      )}
    </>
  );
};

interface LightboxProps {
  images: string[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

const Lightbox: React.FC<LightboxProps> = ({ images, index, onClose, onPrev, onNext, onKeyDown }) => (
  <div
    className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
    onClick={onClose}
    onKeyDown={onKeyDown}
    tabIndex={0}
    role="dialog"
  >
    <button
      onClick={(e) => { e.stopPropagation(); onClose(); }}
      className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
    >
      <X className="w-6 h-6 text-white" />
    </button>

    {images.length > 1 && (
      <>
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="absolute right-16 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>
      </>
    )}

    <img
      src={images[index]}
      alt={`Photo ${index + 1}`}
      className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    />

    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
      {index + 1} / {images.length}
    </div>
  </div>
);

export default PhotoGallery;
