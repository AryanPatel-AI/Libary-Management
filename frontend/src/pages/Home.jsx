import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
  Search, Book, Layers, LayoutGrid, List, SlidersHorizontal,
  X, Filter, Check, ArrowUpDown, Sparkles, BookOpen, Star,
  Award, TrendingUp, Compass, Calendar, ChevronRight, Bookmark
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, Link } from 'react-router-dom';
import BookCard from '../components/BookCard';
import BookCover from '../components/BookCover';
import FeaturedBook from '../components/FeaturedBook';
import BookCollection from '../components/BookCollection';
import API_URL from '../api/config';

/* ── Rich Default Catalog Dataset ──────────────────────────────────── */
const COMPREHENSIVE_BOOKS = [
  {
    _id: 'b-01',
    title: 'Structure and Interpretation of Computer Programs',
    author: 'Harold Abelson & Gerald Jay Sussman',
    category: 'Computer Science',
    isbn: '978-0262510875',
    publisher: 'The MIT Press',
    language: 'English',
    year: 1984,
    availableCopies: 4,
    borrowCount: 68,
    image: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?w=600&q=80',
    description: 'A monument in computational pedagogy teaching abstraction, modularity, interpreters, and metalinguistic design.',
    shelf: 'Wing B &bull; Stacks 4-A',
    isStaffPick: true,
    isAwardWinner: true,
  },
  {
    _id: 'b-02',
    title: 'The Design of Everyday Things',
    author: 'Don Norman',
    category: 'Design Systems',
    isbn: '978-0465050659',
    publisher: 'Basic Books',
    language: 'English',
    year: 1988,
    availableCopies: 6,
    borrowCount: 59,
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80',
    description: 'A primer on cognitive ergonomics, affordances, signifiers, and human-centered design principles.',
    shelf: 'Wing A &bull; Stacks 2-C',
    isStaffPick: true,
  },
  {
    _id: 'b-03',
    title: 'The Structure of Scientific Revolutions',
    author: 'Thomas S. Kuhn',
    category: 'Philosophy',
    isbn: '978-0226458120',
    publisher: 'University of Chicago Press',
    language: 'English',
    year: 1962,
    availableCopies: 2,
    borrowCount: 74,
    image: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=600&q=80',
    description: 'Introduced the seminal concept of paradigm shifts, transforming philosophical perspectives on scientific discovery.',
    shelf: 'Wing A &bull; Stacks 1-B',
    isStaffPick: false,
    isAwardWinner: true,
  },
  {
    _id: 'b-04',
    title: 'Gödel, Escher, Bach: An Eternal Golden Braid',
    author: 'Douglas R. Hofstadter',
    category: 'Cognitive Science',
    isbn: '978-0465026562',
    publisher: 'Basic Books',
    language: 'English',
    year: 1979,
    availableCopies: 3,
    borrowCount: 62,
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80',
    description: 'Pulitzer Prize-winning exploration of recursion, self-reference, formal systems, and emergent human consciousness.',
    shelf: 'Wing A &bull; Stacks 3-A',
    isAwardWinner: true,
  },
  {
    _id: 'b-05',
    title: 'Philosophiae Naturalis Principia Mathematica',
    author: 'Sir Isaac Newton',
    category: 'Pure Science',
    isbn: '978-0520088177',
    publisher: 'University of California Press',
    language: 'Latin',
    year: 1687,
    availableCopies: 1,
    borrowCount: 31,
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&q=80',
    description: 'The monumental Latin foundation of classical mechanics, universal gravitation, and modern mathematical physics.',
    shelf: 'Special Vault &bull; Vault-01',
    isAwardWinner: true,
  },
  {
    _id: 'b-06',
    title: 'Introduction to Algorithms (CLRS)',
    author: 'Thomas H. Cormen, Charles Leiserson, Ronald Rivest, Clifford Stein',
    category: 'Computer Science',
    isbn: '978-0262033848',
    publisher: 'The MIT Press',
    language: 'English',
    year: 2009,
    availableCopies: 5,
    borrowCount: 85,
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&q=80',
    description: 'The comprehensive canonical textbook on modern data structures, graph theory, and computational complexity.',
    shelf: 'Wing B &bull; Stacks 4-B',
    isStaffPick: true,
  },
  {
    _id: 'b-07',
    title: 'The Order of Time',
    author: 'Carlo Rovelli',
    category: 'Physics',
    isbn: '978-0735216105',
    publisher: 'Riverhead Books',
    language: 'English',
    year: 2018,
    availableCopies: 4,
    borrowCount: 48,
    image: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=600&q=80',
    description: 'Lyrical exploration of loop quantum gravity, entropy, and the dissolution of conventional linear chronology.',
    shelf: 'Wing A &bull; Stacks 2-D',
    isStaffPick: true,
  },
  {
    _id: 'b-08',
    title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    author: 'Robert C. Martin',
    category: 'Computer Science',
    isbn: '978-0132350884',
    publisher: 'Prentice Hall',
    language: 'English',
    year: 2008,
    availableCopies: 0,
    borrowCount: 55,
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&q=80',
    description: 'Practices and engineering standards for maintainable, readable, and robust software architecture.',
    shelf: 'Wing B &bull; Stacks 4-C',
  },
  {
    _id: 'b-09',
    title: 'A Pattern Language: Towns, Buildings, Construction',
    author: 'Christopher Alexander',
    category: 'Architecture',
    isbn: '978-0195019193',
    publisher: 'Oxford University Press',
    language: 'English',
    year: 1977,
    availableCopies: 2,
    borrowCount: 44,
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80',
    description: 'Classic treatise detailing 253 patterns for human-centric architectural living spaces and urban communities.',
    shelf: 'Wing C &bull; Stacks 1-A',
    isStaffPick: true,
  },
  {
    _id: 'b-10',
    title: 'Ficciones',
    author: 'Jorge Luis Borges',
    category: 'Literature',
    isbn: '978-0802130303',
    publisher: 'Grove Press',
    language: 'Spanish',
    year: 1944,
    availableCopies: 3,
    borrowCount: 58,
    image: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=600&q=80',
    description: 'Labyrinthine short fictions on infinite libraries, circular book structures, and metaphysical puzzles.',
    shelf: 'Wing D &bull; Stacks 2-B',
    isAwardWinner: true,
  },
];

const CATEGORIES = [
  'All Disciplines',
  'Computer Science',
  'Design Systems',
  'Philosophy',
  'Cognitive Science',
  'Pure Science',
  'Physics',
  'Architecture',
  'Literature',
];

const LANGUAGES = ['All Languages', 'English', 'Latin', 'Spanish', 'German', 'French'];
const PUBLISHERS = ['All Publishers', 'The MIT Press', 'Oxford University Press', 'Basic Books', 'University of Chicago Press', 'Grove Press'];
const YEAR_RANGES = [
  { label: 'All Eras', value: 'all' },
  { label: 'Classical (Pre-1800)', value: 'pre_1800' },
  { label: 'Modern Classic (1800–1950)', value: '1800_1950' },
  { label: 'Contemporary (1951–Present)', value: 'post_1950' },
];

const Home = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('discovery'); // 'discovery' | 'catalog'
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('search') || '');
  const [books, setBooks] = useState(COMPREHENSIVE_BOOKS);
  const [loading, setLoading] = useState(false);

  // Filters
  const [category, setCategory] = useState('All Disciplines');
  const [availability, setAvailability] = useState('all'); // 'all' | 'available' | 'circulated'
  const [author, setAuthor] = useState('');
  const [language, setLanguage] = useState('All Languages');
  const [publisher, setPublisher] = useState('All Publishers');
  const [yearFilter, setYearFilter] = useState('all');

  // Sorting & View mode
  const [sortBy, setSortBy] = useState('relevance'); // 'relevance' | 'newest' | 'title' | 'popularity' | 'availability'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    // If query in URL, switch to catalog view automatically
    if (searchParams.get('search')) {
      setActiveTab('catalog');
      setSearchQuery(searchParams.get('search'));
    }
  }, [searchParams]);

  // Filter and Sort Processing
  const filteredAndSortedBooks = useMemo(() => {
    return books
      .filter((book) => {
        // Search
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          book.title.toLowerCase().includes(q) ||
          book.author.toLowerCase().includes(q) ||
          (book.isbn && book.isbn.toLowerCase().includes(q)) ||
          (book.publisher && book.publisher.toLowerCase().includes(q));

        // Category
        const matchesCat = category === 'All Disciplines' || book.category === category;

        // Availability
        const isAvail = (book.availableCopies ?? 1) > 0;
        const matchesAvail =
          availability === 'all' ||
          (availability === 'available' && isAvail) ||
          (availability === 'circulated' && !isAvail);

        // Author
        const matchesAuthor = !author || book.author.toLowerCase().includes(author.toLowerCase().trim());

        // Language
        const matchesLang = language === 'All Languages' || book.language === language;

        // Publisher
        const matchesPub = publisher === 'All Publishers' || book.publisher === publisher;

        // Year
        let matchesYear = true;
        if (yearFilter === 'pre_1800') matchesYear = book.year < 1800;
        else if (yearFilter === '1800_1950') matchesYear = book.year >= 1800 && book.year <= 1950;
        else if (yearFilter === 'post_1950') matchesYear = book.year > 1950;

        return matchesSearch && matchesCat && matchesAvail && matchesAuthor && matchesLang && matchesPub && matchesYear;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return (b.year || 0) - (a.year || 0);
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        if (sortBy === 'popularity') return (b.borrowCount || 0) - (a.borrowCount || 0);
        if (sortBy === 'availability') return (b.availableCopies || 0) - (a.availableCopies || 0);
        return 0; // relevance
      });
  }, [books, searchQuery, category, availability, author, language, publisher, yearFilter, sortBy]);

  const clearAllFilters = () => {
    setCategory('All Disciplines');
    setAvailability('all');
    setAuthor('');
    setLanguage('All Languages');
    setPublisher('All Publishers');
    setYearFilter('all');
    setSearchQuery('');
  };

  const activeFilterCount = [
    category !== 'All Disciplines',
    availability !== 'all',
    author.trim() !== '',
    language !== 'All Languages',
    publisher !== 'All Publishers',
    yearFilter !== 'all',
  ].filter(Boolean).length;

  return (
    <div className="space-y-12 pb-20 font-sans text-foreground">
      
      {/* ── TOP EDITORIAL SEARCH & DISCOVERY SWITCHER ──────────────────── */}
      <section className="pt-2">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-8">
          <h1 className="font-serif-editorial text-4xl sm:text-6xl lg:text-7xl font-bold text-foreground tracking-tight leading-[1.1] mb-4">
            Discover knowledge.<br />
            <span className="italic text-amber-600 dark:text-amber-400">Find your next story.</span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto font-normal leading-relaxed mb-8">
            Explore our collection of books, authors, ideas, and resources.
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setActiveTab('discovery')}
              className="px-8 py-3.5 rounded-xl bg-foreground text-background font-bold text-sm hover:opacity-90 transition-all shadow-md"
            >
              Explore Catalog
            </button>
            <button
              onClick={() => {
                setActiveTab('catalog');
                setTimeout(() => {
                  const input = document.querySelector('input[type="text"]');
                  if(input) input.focus();
                }, 100);
              }}
              className="px-8 py-3.5 rounded-xl border border-border bg-card text-foreground font-bold text-sm hover:bg-muted transition-all shadow-xs"
            >
              Search Library
            </button>
          </div>

          
        </div>

        {/* Global Catalog Search Bar */}
        <div className="max-w-2xl mx-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setActiveTab('catalog');
            }}
            className="relative flex items-center"
          >
            <Search className="absolute left-4 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search title, author, ISBN, publisher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-24 py-3.5 text-xs sm:text-sm rounded-2xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-500 shadow-xs transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-12 text-muted-foreground hover:text-foreground p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="submit"
              className="absolute right-2 px-3.5 py-2 bg-foreground text-background text-xs font-semibold rounded-xl hover:opacity-90 transition-all"
            >
              Query
            </button>
          </form>
        </div>
      </section>

      {/* ── TAB 1: EDITORIAL DISCOVERY EXPERIENCE ──────────────────────── */}
      {activeTab === 'discovery' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-16"
        >
          {/* 1. Featured Book Showcase */}
          <FeaturedBook
            book={COMPREHENSIVE_BOOKS[0]}
            label="CURATORIAL SPOTLIGHT // COMPUTATIONAL THEORY"
            curatorNote="“A monumental work that shaped modern engineering education. Reading SICP teaches one to perceive code not as arbitrary syntax, but as living mathematical abstraction.” — Dr. Evelyn Sterling"
          />

          {/* 2. New Arrivals (Horizontal composition) */}
          <section className="space-y-6">
            <div className="flex items-end justify-between border-b border-border pb-3">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">
                  RECENT ACQUISITIONS
                </span>
                <h2 className="font-serif-editorial text-2xl sm:text-3xl font-bold text-foreground">
                  New Arrivals in the Stacks
                </h2>
              </div>
              <button
                onClick={() => { setActiveTab('catalog'); setSortBy('newest'); }}
                className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
              >
                View all new &rarr;
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {COMPREHENSIVE_BOOKS.slice(4, 8).map((b, i) => (
                <BookCard key={b._id} book={b} index={i} />
              ))}
            </div>
          </section>

          {/* 3. Most Borrowed (Ranked List Composition) */}
          <section className="hairline-card p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">
                  HIGH-VELOCITY READS
                </span>
                <h2 className="font-serif-editorial text-2xl sm:text-3xl font-bold text-foreground">
                  Most Borrowed Folios This Semester
                </h2>
              </div>
              <TrendingUp className="w-5 h-5 text-amber-500" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {COMPREHENSIVE_BOOKS.slice(0, 4).map((b, idx) => (
                <Link
                  key={b._id}
                  to={`/books/${b._id}`}
                  className="p-4 rounded-2xl bg-muted/20 hover:bg-muted/40 border border-border transition-all flex items-center gap-4 group"
                >
                  <span className="font-mono text-xl font-bold text-amber-600 dark:text-amber-400 w-8 text-center shrink-0">
                    0{idx + 1}
                  </span>
                  <BookCover src={b.image} title={b.title} size="sm" className="shrink-0" />
                  <div className="min-w-0 flex-1">
                    <h4 className="font-serif-editorial font-bold text-sm text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors truncate">
                      {b.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{b.author}</p>
                    <div className="flex items-center gap-2 mt-2 font-mono text-[10px] text-muted-foreground">
                      <span className="bg-muted px-2 py-0.5 rounded">{b.category}</span>
                      <span>&bull;</span>
                      <span>{b.borrowCount} active circulations</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform shrink-0" />
                </Link>
              ))}
            </div>
          </section>

          {/* 4. Staff Picks & Award Winners */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BookCollection
              title="Senior Conservator's Picks"
              subtitle="Carefully recommended by our preservation librarians for intellectual depth."
              books={COMPREHENSIVE_BOOKS.filter(b => b.isStaffPick)}
              viewAllLink="/collections"
            />
            <BookCollection
              title="Literary & Scientific Laureates"
              subtitle="Pulitzer, Turing, and Royal Society prize-winning treatises on shelf."
              books={COMPREHENSIVE_BOOKS.filter(b => b.isAwardWinner)}
              viewAllLink="/collections"
            />
          </div>

          {/* 5. Explore by Category */}
          <section className="space-y-6">
            <div className="border-b border-border pb-3">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">
                STACK CLASSIFICATION
              </span>
              <h2 className="font-serif-editorial text-2xl sm:text-3xl font-bold text-foreground">
                Explore by Subject Discipline
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
              {[
                { name: 'Computer Science', dewey: 'Dewey 004–006', count: '1,420 folios' },
                { name: 'Philosophy', dewey: 'Dewey 100–199', count: '890 folios' },
                { name: 'Pure Science & Physics', dewey: 'Dewey 500–539', count: '1,120 folios' },
                { name: 'Architecture & Design', dewey: 'Dewey 720–745', count: '640 folios' },
                { name: 'Cognitive Science', dewey: 'Dewey 153', count: '390 folios' },
                { name: 'Classic Literature', dewey: 'Dewey 800–899', count: '2,100 folios' },
                { name: 'Rare Incunabula Vault', dewey: 'Vault Storage', count: '140 folios' },
                { name: 'Engineering Standards', dewey: 'Dewey 620', count: '780 folios' },
              ].map(cat => (
                <button
                  key={cat.name}
                  onClick={() => {
                    setCategory(cat.name === 'Rare Incunabula Vault' ? 'All Disciplines' : cat.name.split(' & ')[0]);
                    setActiveTab('catalog');
                  }}
                  className="p-4 rounded-2xl bg-card border border-border hover:border-amber-500/40 hover:shadow-sm text-left transition-all group"
                >
                  <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground block">
                    {cat.dewey}
                  </span>
                  <h4 className="font-serif-editorial font-bold text-base text-foreground mt-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {cat.name}
                  </h4>
                  <span className="text-[11px] text-muted-foreground mt-1 block">
                    {cat.count}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* 6. Explore by Author */}
          <section className="hairline-card p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">
                  CANONICAL WRITERS
                </span>
                <h2 className="font-serif-editorial text-2xl sm:text-3xl font-bold text-foreground">
                  Explore by Canonical Authors
                </h2>
              </div>
              <Link to="/authors" className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline">
                Author Archive &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { name: 'Ada Lovelace', era: '1815–1852', field: 'Computing Pioneer', avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&q=80' },
                { name: 'Alan Turing', era: '1912–1954', field: 'Mathematical Logic', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80' },
                { name: 'Virginia Woolf', era: '1882–1941', field: 'Modernist Fiction', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80' },
                { name: 'Jorge Luis Borges', era: '1899–1986', field: 'Metaphysical Prose', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80' },
              ].map(auth => (
                <button
                  key={auth.name}
                  onClick={() => {
                    setAuthor(auth.name);
                    setActiveTab('catalog');
                  }}
                  className="p-3.5 rounded-2xl bg-muted/20 hover:bg-muted/50 border border-border transition-all text-center group"
                >
                  <img
                    src={auth.avatar}
                    alt={auth.name}
                    className="w-16 h-16 rounded-full mx-auto object-cover border border-border mb-2.5 group-hover:scale-105 transition-transform"
                  />
                  <h4 className="font-serif-editorial font-bold text-sm text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {auth.name}
                  </h4>
                  <p className="font-mono text-[10px] text-muted-foreground mt-0.5">{auth.era}</p>
                  <span className="text-[10px] text-amber-700 dark:text-amber-400 mt-1 block">
                    {auth.field}
                  </span>
                </button>
              ))}
            </div>
          </section>

        </motion.div>
      )}

      {/* ── TAB 2: FULL CATALOG BROWSER & FILTERING ────────────────────── */}
      {activeTab === 'catalog' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Controls Bar: Sort, View Toggle, Mobile Filter Trigger */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-border shadow-2xs">
            <div className="flex items-center gap-2">
              {/* Mobile Filter Sheet Trigger */}
              <button
                onClick={() => setMobileFilterOpen(true)}
                className="lg:hidden px-3.5 py-2 rounded-xl bg-foreground text-background text-xs font-semibold flex items-center gap-2"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}</span>
              </button>

              <span className="font-serif-editorial text-lg font-bold text-foreground">
                Showing {filteredAndSortedBooks.length} Folios
              </span>

              {activeFilterCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-rose-600 dark:text-rose-400 hover:underline ml-2"
                >
                  Clear all filters
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Sort Selector */}
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-muted/40 border border-border text-xs text-foreground focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="relevance">Sort by: Relevance</option>
                  <option value="newest">Sort by: Newest Acquisition</option>
                  <option value="title">Sort by: Title (A–Z)</option>
                  <option value="popularity">Sort by: Most Borrowed</option>
                  <option value="availability">Sort by: Available on Shelf</option>
                </select>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center border border-border rounded-xl p-0.5 bg-muted/30">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-all ${
                    viewMode === 'grid' ? 'bg-card text-foreground shadow-2xs' : 'text-muted-foreground hover:text-foreground'
                  }`}
                  title="Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition-all ${
                    viewMode === 'list' ? 'bg-card text-foreground shadow-2xs' : 'text-muted-foreground hover:text-foreground'
                  }`}
                  title="List/Table View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Desktop Filters Sidebar */}
            <aside className="hidden lg:block w-72 shrink-0 space-y-6">
              <div className="hairline-card p-6 rounded-3xl bg-card border border-border shadow-xs sticky top-28 space-y-6">
                
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-foreground font-bold">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-amber-500" />
                    <span>Catalog Filters</span>
                  </div>
                  {activeFilterCount > 0 && (
                    <button
                      onClick={clearAllFilters}
                      className="text-[11px] text-muted-foreground hover:text-rose-500"
                    >
                      Reset
                    </button>
                  )}
                </div>

                {/* 1. Availability */}
                <div>
                  <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground block mb-2 font-semibold">
                    Availability
                  </label>
                  <div className="grid grid-cols-3 gap-1 p-1 bg-muted/40 rounded-xl border border-border">
                    {['all', 'available', 'circulated'].map(av => (
                      <button
                        key={av}
                        onClick={() => setAvailability(av)}
                        className={`py-1 text-[11px] font-medium rounded-lg capitalize transition-all ${
                          availability === av
                            ? 'bg-card text-foreground font-semibold shadow-2xs'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {av}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Discipline / Category */}
                <div>
                  <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground block mb-2 font-semibold">
                    Discipline
                  </label>
                  <div className="space-y-1 max-h-48 overflow-y-auto pr-1 scrollbar-none">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                          category === cat
                            ? 'bg-foreground text-background font-semibold'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Author Search */}
                <div>
                  <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground block mb-1.5 font-semibold">
                    Filter by Author
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Kuhn, Turing, Woolf..."
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* 4. Language */}
                <div>
                  <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground block mb-1.5 font-semibold">
                    Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    {LANGUAGES.map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>

                {/* 5. Publication Era */}
                <div>
                  <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground block mb-1.5 font-semibold">
                    Publication Era
                  </label>
                  <select
                    value={yearFilter}
                    onChange={(e) => setYearFilter(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    {YEAR_RANGES.map(y => (
                      <option key={y.value} value={y.value}>{y.label}</option>
                    ))}
                  </select>
                </div>

                {/* 6. Publisher */}
                <div>
                  <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground block mb-1.5 font-semibold">
                    Publisher / University Press
                  </label>
                  <select
                    value={publisher}
                    onChange={(e) => setPublisher(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    {PUBLISHERS.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>

              </div>
            </aside>

            {/* Catalog Main Results View */}
            <div className="flex-1 min-w-0">
              {filteredAndSortedBooks.length === 0 ? (
                <div className="py-24 text-center border border-dashed border-border rounded-3xl bg-card/40 p-8">
                  <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-3 opacity-40" />
                  <h3 className="font-serif-editorial text-2xl font-bold text-foreground mb-1">
                    No matching folios found
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-4">
                    Try adjusting your keyword query, resetting discipline classifications, or broadening availability filters.
                  </p>
                  <button
                    onClick={clearAllFilters}
                    className="px-4 py-2 bg-foreground text-background text-xs font-semibold rounded-xl"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : viewMode === 'grid' ? (
                /* Grid View */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredAndSortedBooks.map((book, idx) => (
                    <BookCard key={book._id} book={book} index={idx} />
                  ))}
                </div>
              ) : (
                /* List / Table View */
                <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                      <thead>
                        <tr className="border-b border-border bg-muted/30">
                          <th className="th-cell">Volume &amp; Title</th>
                          <th className="th-cell">Discipline &amp; Publisher</th>
                          <th className="th-cell">Shelf Call No.</th>
                          <th className="th-cell">Year</th>
                          <th className="th-cell">Status</th>
                          <th className="th-cell text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {filteredAndSortedBooks.map((book) => {
                          const isAvail = (book.availableCopies ?? 1) > 0;
                          return (
                            <tr key={book._id} className="tr-hover">
                              <td className="td-cell">
                                <div className="flex items-center gap-3">
                                  <BookCover src={book.image} title={book.title} size="sm" className="shrink-0" />
                                  <div className="min-w-0">
                                    <Link
                                      to={`/books/${book._id}`}
                                      className="font-serif-editorial font-bold text-sm text-foreground hover:text-amber-600 dark:hover:text-amber-400 transition-colors line-clamp-1"
                                    >
                                      {book.title}
                                    </Link>
                                    <p className="text-xs text-muted-foreground mt-0.5">{book.author}</p>
                                  </div>
                                </div>
                              </td>

                              <td className="td-cell text-xs">
                                <span className="font-semibold text-foreground">{book.category}</span>
                                <p className="text-[11px] text-muted-foreground">{book.publisher}</p>
                              </td>

                              <td className="td-cell font-mono text-xs text-muted-foreground" dangerouslySetInnerHTML={{ __html: book.shelf || 'Stack 1' }} />

                              <td className="td-cell font-mono text-xs text-muted-foreground">
                                {book.year}
                              </td>

                              <td className="td-cell">
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                  isAvail ? 'badge-success' : 'badge-danger'
                                }`}>
                                  {isAvail ? `${book.availableCopies} Available` : 'Circulated'}
                                </span>
                              </td>

                              <td className="td-cell text-right">
                                <Link
                                  to={`/books/${book._id}`}
                                  className="px-3 py-1 rounded-lg bg-foreground text-background text-xs font-semibold hover:opacity-90 transition-all inline-flex items-center gap-1"
                                >
                                  Inspect &rarr;
                                </Link>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

          </div>
        </motion.div>
      )}

      {/* ── MOBILE FILTER DRAWER / SHEET ──────────────────────────────── */}
      <AnimatePresence>
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 flex justify-end lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFilterOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-xs"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="relative w-full max-w-xs bg-card border-l border-border h-full p-6 overflow-y-auto space-y-6 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <h3 className="font-serif-editorial text-lg font-bold text-foreground">
                  Refine Catalog Filters
                </h3>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Discipline */}
              <div>
                <label className="font-mono text-xs uppercase tracking-wider text-muted-foreground block mb-2">
                  Discipline
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs text-foreground"
                >
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>

              {/* Mobile Availability */}
              <div>
                <label className="font-mono text-xs uppercase tracking-wider text-muted-foreground block mb-2">
                  Availability
                </label>
                <div className="grid grid-cols-3 gap-1 p-1 bg-muted/40 rounded-xl border border-border">
                  {['all', 'available', 'circulated'].map(av => (
                    <button
                      key={av}
                      onClick={() => setAvailability(av)}
                      className={`py-1 text-xs font-medium rounded-lg capitalize ${
                        availability === av ? 'bg-card text-foreground font-bold shadow-2xs' : 'text-muted-foreground'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Language */}
              <div>
                <label className="font-mono text-xs uppercase tracking-wider text-muted-foreground block mb-2">
                  Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs text-foreground"
                >
                  {LANGUAGES.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>

              {/* Mobile Era */}
              <div>
                <label className="font-mono text-xs uppercase tracking-wider text-muted-foreground block mb-2">
                  Publication Era
                </label>
                <select
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs text-foreground"
                >
                  {YEAR_RANGES.map(y => <option key={y.value} value={y.value}>{y.label}</option>)}
                </select>
              </div>

              <div className="pt-4 border-t border-border flex gap-2">
                <button
                  onClick={clearAllFilters}
                  className="flex-1 py-2.5 rounded-xl border border-border text-xs font-semibold text-muted-foreground"
                >
                  Reset
                </button>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-foreground text-background text-xs font-semibold"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Home;
