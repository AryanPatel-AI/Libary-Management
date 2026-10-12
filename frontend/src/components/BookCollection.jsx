import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Layers } from 'lucide-react';
import BookCard from './BookCard';

/**
 * Reusable BookCollection component
 * Displays a curated group of volumes with editorial section header and uncrowded grid.
 */
const BookCollection = ({
  title = 'Curated Collection',
  subtitle,
  category,
  books = [],
  viewAllLink = '/books',
  className = '',
}) => {
  return (
    <section className={`space-y-6 ${className}`}>
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-border">
        <div>
          {category && (
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">
              CURATED SHELF &bull; {category}
            </span>
          )}
          <h2 className="font-serif-editorial text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl">
              {subtitle}
            </p>
          )}
        </div>

        {viewAllLink && (
          <Link
            to={viewAllLink}
            className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
          >
            <span>View All Volumes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {/* Book Grid */}
      {books.length === 0 ? (
        <div className="py-12 text-center text-xs text-muted-foreground border border-dashed border-border rounded-2xl">
          No titles currently assigned to this collection.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {books.slice(0, 4).map((book, i) => (
            <BookCard key={book._id || book.id || i} book={book} index={i} />
          ))}
        </div>
      )}
    </section>
  );
};

export default BookCollection;
