import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Sparkles, Calendar, MapPin, ArrowRight, ShieldCheck } from 'lucide-react';
import BookCover from './BookCover';

/**
 * Reusable FeaturedBook component
 * Cinematic presentation for spotlighting seminal monographs and rare editions.
 */
const FeaturedBook = ({
  book,
  label = 'SEMINAL MONOGRAPH // ARCHIVAL FEATURE',
  curatorNote,
  className = '',
}) => {
  if (!book) return null;

  const isAvailable = (book.availableCopies ?? 1) > 0;
  const coverImage = book.image || book.coverImage;
  const pubYear = book.year || book.publishedYear || '1984';

  return (
    <div className={`relative rounded-3xl bg-card border border-border p-6 sm:p-10 shadow-sm overflow-hidden ${className}`}>
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8 lg:gap-12">
        
        {/* Large Visual Asset (Book Cover) */}
        <div className="shrink-0 flex justify-center">
          <BookCover
            src={coverImage}
            title={book.title}
            author={book.author}
            size="lg"
            className="shadow-2xl"
            ribbon
          />
        </div>

        {/* Narrative & Bibliographic Details */}
        <div className="flex-1 space-y-4 text-center md:text-left">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 font-mono text-[10px] uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>{label}</span>
          </div>

          <div className="space-y-1">
            <h2 className="font-serif-editorial text-2xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight leading-tight">
              {book.title}
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground font-sans font-medium">
              Authored by <span className="text-foreground font-semibold">{book.author}</span>
            </p>
          </div>

          {/* Curatorial Note or Summary */}
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-2xl">
            {curatorNote || book.description || (
              'One of the seminal works in modern computational theory. Formulates foundational models of algorithmic structure, recursion, and interpretive abstraction.'
            )}
          </p>

          {/* Restrained Metadata Pills */}
          <div className="flex items-center justify-center md:justify-start gap-4 pt-2 text-xs text-muted-foreground flex-wrap font-mono text-[11px]">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-500" />
              {pubYear}
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-500" />
              {book.shelf || book.category || 'Special Stacks'}
            </span>
            <span>&bull;</span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                isAvailable ? 'badge-success' : 'badge-danger'
              }`}
            >
              {isAvailable ? 'In Stacks &bull; Available' : 'Circulated'}
            </span>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center justify-center md:justify-start gap-3 pt-4">
            <Link
              to={`/books/${book._id || book.id || 'b-101'}`}
              className="px-5 py-2.5 bg-foreground text-background font-semibold text-xs rounded-xl hover:opacity-90 transition-all flex items-center gap-2 shadow-xs"
            >
              <span>Examine Volume</span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
            </Link>

            <Link
              to="/books"
              className="px-4 py-2.5 bg-card hover:bg-muted text-foreground border border-border text-xs font-semibold rounded-xl transition-all"
            >
              Catalog Index
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};

export default FeaturedBook;
