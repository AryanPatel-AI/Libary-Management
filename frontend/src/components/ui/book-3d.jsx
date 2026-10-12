import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { BookOpen } from 'lucide-react';

export const Book3D = ({
  title,
  author,
  category,
  coverImage,
  color = 'bg-[#1e293b]',
  accentColor = '#f59e0b',
  ribbonColor = '#d97706',
  shelf = 'A-12',
  className,
  onClick,
}) => {
  return (
    <motion.div
      whileHover={{
        y: -12,
        rotateY: -8,
        rotateZ: 1,
        transition: { duration: 0.3, ease: 'easeOut' },
      }}
      className={cn(
        'group relative cursor-pointer select-none perspective-[1200px]',
        className
      )}
      onClick={onClick}
    >
      {/* Physical Book Container */}
      <div
        className={cn(
          'relative w-48 sm:w-56 h-72 sm:h-80 rounded-r-xl rounded-l-xs overflow-hidden',
          'book-shadow book-spine-crease',
          'border-y border-r border-white/10 dark:border-white/10',
          'transition-transform duration-300 transform-gpu',
          color
        )}
      >
        {/* Silk Bookmark Ribbon */}
        <div
          className="absolute -top-1 right-6 w-3 h-12 shadow-md z-20"
          style={{
            backgroundColor: ribbonColor,
            clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)',
          }}
        />

        {/* Cover Artwork or Typography */}
        {coverImage ? (
          <img
            src={coverImage}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full p-6 flex flex-col justify-between text-white relative z-10">
            {/* Top Shelf Tag */}
            <div className="flex items-center justify-between border-b border-white/15 pb-2">
              <span
                style={{ color: accentColor }}
                className="text-[10px] font-mono tracking-widest uppercase font-bold"
              >
                {shelf}
              </span>
              <span className="text-[9px] font-mono text-white/50 uppercase">
                VOL. {category?.slice(0, 3)}
              </span>
            </div>

            {/* Middle Title */}
            <div className="my-auto space-y-2">
              <p className="text-[10px] uppercase font-bold tracking-widest text-amber-400">
                {category}
              </p>
              <h4 className="font-serif-editorial text-xl sm:text-2xl font-bold leading-tight line-clamp-3 text-white">
                {title}
              </h4>
              <p className="text-xs text-white/70 italic line-clamp-1">
                by {author}
              </p>
            </div>

            {/* Bottom Publisher Mark */}
            <div className="pt-3 border-t border-white/15 flex items-center justify-between text-[9px] text-white/60 tracking-wider">
              <span>PATEL & CO.</span>
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            </div>
          </div>
        )}

        {/* Paper Page Edge illusion on right */}
        <div className="absolute top-1 bottom-1 -right-0.5 w-1 bg-gradient-to-r from-stone-200 to-stone-400 dark:from-stone-300 dark:to-stone-500 rounded-r-xs opacity-80" />

        {/* Subtle Specular Sheen on Hover */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      </div>

      {/* Book Reflection / Floor Drop Shadow */}
      <div className="w-44 sm:w-52 h-4 mx-auto mt-2 bg-black/40 blur-md rounded-full transform group-hover:scale-110 group-hover:opacity-60 transition-all duration-300" />
    </motion.div>
  );
};

export default Book3D;
