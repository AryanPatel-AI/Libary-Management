import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';

/**
 * BookCover component
 * Renders a physical book cover aesthetic with spine crease, gentle page shadow,
 * and high-fidelity fallback when an image is unavailable.
 */
const BookCover = ({
  src,
  title = 'Archival Folio',
  author,
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl'
  className = '',
  ribbon,
  aspectRatio = 'aspect-[2/3]',
  showCrease = true,
}) => {
  const [imageError, setImageError] = useState(!src);

  const sizeClasses = {
    sm: 'w-16 h-24 text-[9px]',
    md: 'w-32 h-48 text-xs',
    lg: 'w-44 h-64 text-sm',
    xl: 'w-56 h-80 text-base',
    full: 'w-full h-full text-xs',
  };

  // Deterministic palette generation for fallback cover based on title string
  const getCoverBg = (str = '') => {
    const palettes = [
      'bg-[#1a233a] text-blue-100 border-[#2b3a5c]',
      'bg-[#231a28] text-purple-100 border-[#3d2c47]',
      'bg-[#18261e] text-emerald-100 border-[#274032]',
      'bg-[#2d1c16] text-amber-100 border-[#4a2e24]',
      'bg-[#1e1e24] text-slate-100 border-[#32323c]',
    ];
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return palettes[Math.abs(hash) % palettes.length];
  };

  return (
    <div
      className={`relative select-none overflow-hidden rounded-md shadow-md transition-all duration-300 hover:shadow-xl ${
        size === 'full' ? 'w-full' : sizeClasses[size] || sizeClasses.md
      } ${aspectRatio} ${className}`}
    >
      {/* Visual Spine crease effect */}
      {showCrease && (
        <div className="absolute inset-y-0 left-0 w-2.5 bg-gradient-to-r from-black/40 via-white/10 to-transparent z-10 pointer-events-none" />
      )}

      {/* Decorative Book Ribbon / Bookmark */}
      {ribbon && (
        <div className="absolute top-0 right-3 w-3 h-7 bg-amber-500 shadow-sm z-20 rounded-b-xs" />
      )}

      {!imageError && src ? (
        <img
          src={src}
          alt={title}
          onError={() => setImageError(true)}
          className="h-full w-full object-cover rounded-md"
          loading="lazy"
        />
      ) : (
        /* Fallback: Fine-cloth / archival typography binding */
        <div
          className={`h-full w-full p-4 flex flex-col justify-between rounded-md border text-center ${getCoverBg(
            title
          )}`}
        >
          {/* Top Blind-Stamping Detail */}
          <div className="border-b border-white/15 pb-2">
            <span className="font-mono text-[8px] uppercase tracking-widest opacity-60">
              Patel &amp; Co. Archive
            </span>
          </div>

          {/* Title & Icon */}
          <div className="my-auto py-2">
            <BookOpen className="w-4 h-4 mx-auto mb-2 opacity-50" />
            <p className="font-serif-editorial font-bold leading-tight line-clamp-3">
              {title}
            </p>
            {author && (
              <p className="font-sans text-[10px] mt-1.5 opacity-75 font-medium line-clamp-1">
                {author}
              </p>
            )}
          </div>

          {/* Bottom Foil Stamp */}
          <div className="border-t border-white/15 pt-1.5">
            <span className="font-mono text-[8px] tracking-wider opacity-60">
              Folio Reference
            </span>
          </div>
        </div>
      )}

      {/* Subtle Right-edge paper page depth illusion */}
      <div className="absolute inset-y-0 right-0 w-[2px] bg-gradient-to-l from-white/20 to-transparent pointer-events-none" />
    </div>
  );
};

export default BookCover;
