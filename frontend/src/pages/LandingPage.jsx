import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, ArrowRight, ShieldCheck,
  Layers, Clock, Library, BookOpen, FileText
} from 'lucide-react';

import Spotlight from '../components/ui/spotlight';
import Marquee from '../components/ui/marquee';
import { BentoGrid, BentoCard } from '../components/ui/bento-grid';
import NumberTicker from '../components/ui/number-ticker';
import Book3D from '../components/ui/book-3d';
import ReaderPreview from '../components/landing/ReaderPreview';
import CitationEngine from '../components/landing/CitationEngine';
import CirculationTerminal from '../components/landing/CirculationTerminal';
import ParticlesBackground from '../components/ParticlesBackground';

const featuredCurations = [
  {
    title: 'Structure and Interpretation of Computer Programs',
    author: 'Harold Abelson & Gerald Sussman',
    category: 'Computer Science',
    shelf: 'DEWEY 005.1',
    color: 'bg-[#151c2e]',
    accentColor: '#3b82f6',
    ribbonColor: '#2563eb',
    year: '1984',
    copies: 4,
  },
  {
    title: 'The Design of Everyday Things',
    author: 'Don Norman',
    category: 'Design Systems',
    shelf: 'DEWEY 745.2',
    color: 'bg-[#291720]',
    accentColor: '#f43f5e',
    ribbonColor: '#e11d48',
    year: '1988',
    copies: 6,
  },
  {
    title: 'Clean Code: Craftsmanship in Software',
    author: 'Robert C. Martin',
    category: 'Engineering',
    shelf: 'DEWEY 005.13',
    color: 'bg-[#13261e]',
    accentColor: '#10b981',
    ribbonColor: '#059669',
    year: '2008',
    copies: 3,
  },
  {
    title: 'Philosophiae Naturalis Principia Mathematica',
    author: 'Sir Isaac Newton',
    category: 'Pure Science',
    shelf: 'VAULT-01',
    color: 'bg-[#2b1f14]',
    accentColor: '#f59e0b',
    ribbonColor: '#d97706',
    year: '1687',
    copies: 1,
  },
];

const publishers = [
  { name: 'OXFORD ACADEMIC', region: 'United Kingdom' },
  { name: 'MIT PRESS', region: 'Cambridge, MA' },
  { name: 'CAMBRIDGE UNIVERSITY PRESS', region: 'United Kingdom' },
  { name: 'SPRINGER NATURE', region: 'Berlin' },
  { name: 'HARVARD UNIVERSITY ARCHIVES', region: 'Boston' },
  { name: 'IEEE COMPUTER SOCIETY', region: 'International' },
  { name: 'ACM DIGITAL LIBRARY', region: 'New York' },
  { name: 'PRINCETON UNIVERSITY PRESS', region: 'New Jersey' },
];

const shelfCategories = [
  'All Collections',
  'Computer Science',
  'Engineering',
  'Pure Science',
  'Literature',
  'Commerce & Finance',
];

const virtualShelfBooks = [
  {
    id: 'b1',
    title: 'Introduction to Algorithms (CLRS)',
    author: 'Cormen, Leiserson, Rivest, Stein',
    category: 'Computer Science',
    shelf: 'SHELF 04-A',
    format: 'Hardcover & Digital',
    copies: 5,
    tag: 'Core Curriculum',
  },
  {
    id: 'b2',
    title: 'Modern Operating Systems',
    author: 'Andrew S. Tanenbaum',
    category: 'Computer Science',
    shelf: 'SHELF 04-C',
    format: 'Hardcover',
    copies: 2,
    tag: 'High Demand',
  },
  {
    id: 'b3',
    title: 'The Feynman Lectures on Physics',
    author: 'Richard P. Feynman',
    category: 'Pure Science',
    shelf: 'VAULT-03',
    format: 'Digital Archive',
    copies: 8,
    tag: 'Manuscript Edition',
  },
  {
    id: 'b4',
    title: 'Principles of Neural Science',
    author: 'Eric R. Kandel',
    category: 'Medical',
    shelf: 'SHELF 09-B',
    format: 'Physical Folio',
    copies: 3,
    tag: 'Research Reference',
  },
  {
    id: 'b5',
    title: 'Financial Markets and Institutions',
    author: 'Frederic S. Mishkin',
    category: 'Commerce & Finance',
    shelf: 'SHELF 02-D',
    format: 'Hardcover & Digital',
    copies: 4,
    tag: 'Standard Reference',
  },
  {
    id: 'b6',
    title: 'War and Peace (Oxford World Classics)',
    author: 'Leo Tolstoy',
    category: 'Literature',
    shelf: 'SHELF 11-E',
    format: 'Collector Cloth',
    copies: 2,
    tag: 'Classic Literature',
  },
];

const testimonials = [
  {
    quote:
      'The tactile precision of Patel & Co. Knowledge Center is unmatched. The circulation desk and citation system allow our doctoral fellows to locate rare treatises within seconds.',
    name: 'Dr. Evelyn V. Sterling',
    role: 'Chair of Computational Linguistics, Cambridge',
  },
  {
    quote:
      'In an age of noisy digital feeds, this platform restores the quiet dignity of a physical university library—clean typography, physical folio references, and instant loan fulfillment.',
    name: 'Marcus Vance, PhD',
    role: 'Senior Research Fellow, MIT Media Lab',
  },
  {
    quote:
      'The in-browser digital vault with sepia/darkroom presets made reading hundreds of technical monographs effortless during our semester research.',
    name: 'Ananya Sharma',
    role: 'Graduate Researcher in Distributed Systems',
  },
];

const LandingPage = () => {
  const [selectedShelf, setSelectedShelf] = useState('All Collections');
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectBook, setInspectBook] = useState(null);
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/books?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/books');
    }
  };

  const filteredShelfBooks = virtualShelfBooks.filter((book) => {
    if (selectedShelf === 'All Collections') return true;
    return book.category === selectedShelf;
  });

  return (
    <div className="min-h-screen bg-[#fbf9f5] dark:bg-[#090b11] text-slate-900 dark:text-slate-100 selection:bg-amber-500/30 font-sans transition-colors duration-300">
      
      {/* ── HERO SECTION ────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden border-b border-slate-200/60 dark:border-white/[0.06] archival-grid">
        {/* Moving Particles Animation (Dark: Purple & Blue, Light: Clean Light) */}
        <ParticlesBackground />

        {/* Aceternity Directional Spotlight */}
        <Spotlight
          className="-top-40 left-0 md:left-60 md:-top-20"
          fill="#3b82f6"
        />

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            
            {/* Archival Classification Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/5 dark:bg-white/5 border border-slate-900/10 dark:border-white/10 backdrop-blur-md mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
              <span className="text-[11px] font-mono uppercase tracking-widest text-slate-600 dark:text-slate-300">
                PATEL &amp; CO. // CURATED REPOSITORY &amp; ARCHIVE
              </span>
              <span className="text-slate-400 dark:text-slate-600 text-xs">•</span>
              <span className="text-[11px] font-mono text-amber-600 dark:text-amber-400">
                CIRCULATION ACTIVE
              </span>
            </motion.div>

            {/* Authoritative Editorial Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-serif-editorial text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-slate-950 dark:text-white leading-[1.08] mb-8"
            >
              A Sanctuary for <br className="hidden sm:block" />
              <span className="italic font-normal text-slate-700 dark:text-slate-300">
                Living Knowledge.
              </span>
            </motion.h1>

            {/* Subheading */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-base sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10 font-normal"
            >
              Organizing, cataloging, and delivering the world's seminal monographs,
              academic treatises, and digital archives in a tactile, distraction-free environment.
            </motion.p>

            {/* Interactive Archival Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="max-w-2xl mx-auto mb-14"
            >
              <form
                onSubmit={handleSearchSubmit}
                className="relative group p-1.5 bg-white dark:bg-[#111523] rounded-2xl border border-slate-300/80 dark:border-white/10 shadow-lg shadow-black/[0.03] dark:shadow-none hover:border-slate-400 dark:hover:border-white/20 transition-all flex items-center"
              >
                <div className="pl-4 text-slate-400 group-focus-within:text-amber-500 transition-colors">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder="Search 45,000+ works by title, author, or Dewey classification..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3.5 bg-transparent outline-none text-slate-900 dark:text-white placeholder:text-slate-400 text-sm md:text-base font-sans"
                />
                <div className="hidden sm:flex items-center gap-1.5 pr-2">
                  <kbd className="px-2 py-1 bg-slate-100 dark:bg-white/10 rounded-md border border-slate-200 dark:border-white/10 font-mono text-[10px] text-slate-500 dark:text-slate-400">
                    ⌘K
                  </kbd>
                </div>
                <button
                  type="submit"
                  className="px-5 py-3 bg-slate-950 dark:bg-amber-500 text-white dark:text-slate-950 rounded-xl font-bold text-sm hover:opacity-95 active:scale-95 transition-all shrink-0 flex items-center gap-2"
                >
                  <span>Explore</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Quick Filter Tag Pills */}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-mono text-[11px] uppercase tracking-wider text-slate-400">
                  Disciplines:
                </span>
                {['Algorithms', 'Architecture', 'Pure Mathematics', 'Philosophy', 'Engineering'].map(
                  (tag) => (
                    <button
                      key={tag}
                      onClick={() => navigate(`/books?search=${encodeURIComponent(tag)}`)}
                      className="px-2.5 py-1 rounded-full bg-slate-200/60 dark:bg-white/5 hover:bg-slate-300 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 transition-colors"
                    >
                      {tag}
                    </button>
                  )
                )}
              </div>
            </motion.div>
          </div>

          {/* ── 3D PHYSICAL BOOK SHOWCASE DECK ──────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.4 }}
            className="mt-6"
          >
            <div className="text-center mb-6">
              <span className="font-mono text-[11px] uppercase tracking-widest text-amber-600 dark:text-amber-400 font-bold">
                CURATOR'S SELECTED VOLUMES
              </span>
            </div>

            <div className="flex flex-wrap justify-center items-end gap-6 sm:gap-8 lg:gap-10 pb-4">
              {featuredCurations.map((item, idx) => (
                <Book3D
                  key={idx}
                  title={item.title}
                  author={item.author}
                  category={item.category}
                  shelf={item.shelf}
                  color={item.color}
                  accentColor={item.accentColor}
                  ribbonColor={item.ribbonColor}
                  onClick={() => setInspectBook(item)}
                />
              ))}
            </div>

            <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-4 font-mono">
              Hover over a volume to inspect folio perspective • Click to preview metadata
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── ARCHIVAL METRICS LEDGER ─────────────────────────────────── */}
      <section className="py-12 border-b border-slate-200/60 dark:border-white/[0.06] bg-white/50 dark:bg-[#0c0f18]/80 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-white/5">
            
            <div className="pt-4 md:pt-0">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif-editorial text-slate-900 dark:text-white">
                <NumberTicker value={45280} delay={0.2} />
                <span className="text-amber-500 font-sans text-2xl sm:text-3xl">+</span>
              </div>
              <p className="text-xs font-mono uppercase tracking-widest text-slate-500 dark:text-slate-400 mt-2">
                Cataloged Volumes
              </p>
            </div>

            <div className="pt-4 md:pt-0">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif-editorial text-slate-900 dark:text-white">
                <NumberTicker value={12450} delay={0.4} />
                <span className="text-amber-500 font-sans text-2xl sm:text-3xl">+</span>
              </div>
              <p className="text-xs font-mono uppercase tracking-widest text-slate-500 dark:text-slate-400 mt-2">
                Enrolled Scholars
              </p>
            </div>

            <div className="pt-4 md:pt-0">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif-editorial text-slate-900 dark:text-white">
                <NumberTicker value={99.4} decimalPlaces={1} delay={0.6} />
                <span className="text-amber-500 font-sans text-2xl sm:text-3xl">%</span>
              </div>
              <p className="text-xs font-mono uppercase tracking-widest text-slate-500 dark:text-slate-400 mt-2">
                Loan Fulfillment Rate
              </p>
            </div>

            <div className="pt-4 md:pt-0">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif-editorial text-slate-900 dark:text-white">
                <NumberTicker value={3840} delay={0.8} />
                <span className="text-amber-500 font-sans text-2xl sm:text-3xl">+</span>
              </div>
              <p className="text-xs font-mono uppercase tracking-widest text-slate-500 dark:text-slate-400 mt-2">
                Digital Folios &amp; PDFs
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ── SCHOLARLY PARTNER MARQUEE ───────────────────────────────── */}
      <section className="py-8 border-b border-slate-200/60 dark:border-white/[0.06] overflow-hidden bg-slate-50/50 dark:bg-black/20">
        <div className="container mx-auto px-6 mb-3 text-center">
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500">
            AFFILIATED UNIVERSITY PRESSES &amp; STANDARDS REPOSITORIES
          </span>
        </div>
        <Marquee pauseOnHover className="[--duration:35s]">
          {publishers.map((pub, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 px-6 py-2 rounded-xl bg-white/40 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.06] text-slate-700 dark:text-slate-300 text-xs font-mono tracking-wider font-semibold"
            >
              <Library className="w-3.5 h-3.5 text-amber-500" />
              <span>{pub.name}</span>
              <span className="text-[9px] text-slate-400">({pub.region})</span>
            </div>
          ))}
        </Marquee>
      </section>

      {/* ── THE ARCHIVAL BENTO GRID ─────────────────────────────────── */}
      <section className="py-24 md:py-32 border-b border-slate-200/60 dark:border-white/[0.06] relative">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-mono uppercase tracking-widest mb-4">
              <Layers className="w-3.5 h-3.5" />
              Precision Infrastructure
            </div>
            <h2 className="font-serif-editorial text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
              Engineered for Scholarly Rigor.
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-4 text-base sm:text-lg">
              Every detail—from RFID book spine tracking to in-browser EPUB typography—is
              crafted to honor human intellect without distraction.
            </p>
          </div>

          <BentoGrid className="max-w-6xl mx-auto">
            {/* Bento 1: Live Circulation Terminal (Col-span 2) */}
            <BentoCard
              name="Real-Time Circulation Terminal"
              className="col-span-1 md:col-span-2 auto-rows-auto"
              description="Live ledger monitoring of book issue requests, check-ins, due date grace periods, and shelf physical coordinate indexing."
              Icon={Clock}
              cta="View Circulation Desk"
            >
              <div className="h-64 mt-2">
                <CirculationTerminal />
              </div>
            </BentoCard>

            {/* Bento 2: In-Browser Digital Vault (Col-span 1) */}
            <BentoCard
              name="In-Browser Digital Vault"
              className="col-span-1"
              description="Read digital manuscripts instantly with eye-comfort palettes (Sepia, Paper, Darkroom) and adjustable typography."
              Icon={BookOpen}
              cta="Test Reader Demo"
            >
              <div className="h-64 mt-2">
                <ReaderPreview />
              </div>
            </BentoCard>

            {/* Bento 3: Citation Engine (Col-span 1) */}
            <BentoCard
              name="One-Click Citation Engine"
              className="col-span-1"
              description="Instantly export verified bibliography entries in APA 7th, MLA 9, Chicago, and BibTeX for LaTeX compilation."
              Icon={FileText}
              cta="Open Citation Vault"
            >
              <div className="h-64 mt-2">
                <CitationEngine />
              </div>
            </BentoCard>

            {/* Bento 4: Physical Archive Security (Col-span 2) */}
            <BentoCard
              name="Preservation & Catalog Standards"
              className="col-span-1 md:col-span-2"
              description="Archival-grade cataloging maintaining Dewey Decimal, Library of Congress, and ISBN standards alongside digital cryptographic checksums."
              Icon={ShieldCheck}
              cta="Explore Classification Standards"
            >
              <div className="h-64 mt-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 flex flex-col justify-between">
                  <div className="text-amber-500 font-mono text-xs font-bold">DEWEY CLASSIFICATION</div>
                  <p className="font-serif-editorial text-xl font-bold text-slate-900 dark:text-white mt-2">
                    000–999 Complete
                  </p>
                  <p className="text-[11px] text-slate-500 mt-2">
                    Complete multi-tier hierarchy indexed down to third decimal accuracy.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 flex flex-col justify-between">
                  <div className="text-emerald-500 font-mono text-xs font-bold">RFID HARDWARE SYNC</div>
                  <p className="font-serif-editorial text-xl font-bold text-slate-900 dark:text-white mt-2">
                    Instant Check-In
                  </p>
                  <p className="text-[11px] text-slate-500 mt-2">
                    Physical shelf sensors report copy availability within 200 milliseconds.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 flex flex-col justify-between">
                  <div className="text-blue-500 font-mono text-xs font-bold">DIGITAL PRESERVATION</div>
                  <p className="font-serif-editorial text-xl font-bold text-slate-900 dark:text-white mt-2">
                    Lossless PDF/A
                  </p>
                  <p className="text-[11px] text-slate-500 mt-2">
                    Digital folios stored with archival PDF/A-1b conformance.
                  </p>
                </div>
              </div>
            </BentoCard>
          </BentoGrid>
        </div>
      </section>

      {/* ── INTERACTIVE VIRTUAL BOOKSHELF ──────────────────────────── */}
      <section className="py-24 md:py-32 border-b border-slate-200/60 dark:border-white/[0.06] bg-slate-50/40 dark:bg-black/10">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-amber-600 dark:text-amber-400 font-bold">
                THE SHELF CATALOG
              </span>
              <h2 className="font-serif-editorial text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 dark:text-white mt-2">
                Curated Volumes on Shelf
              </h2>
            </div>

            <Link
              to="/books"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 transition-colors group"
            >
              <span>Explore Complete 45,000+ Index</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 custom-scrollbar">
            {shelfCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedShelf(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedShelf === cat
                    ? 'bg-slate-950 dark:bg-white text-white dark:text-slate-950 shadow-sm'
                    : 'bg-white dark:bg-[#111523] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Book Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredShelfBooks.map((book) => (
              <div
                key={book.id}
                className="p-6 rounded-2xl bg-white dark:bg-[#111523] border border-slate-200/80 dark:border-white/[0.08] shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-amber-600 dark:text-amber-400 px-2.5 py-1 rounded-md bg-amber-500/10 font-bold">
                      {book.shelf}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      {book.copies} Copies Left
                    </span>
                  </div>

                  <h3 className="font-serif-editorial text-xl font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors leading-snug mb-2">
                    {book.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 italic mb-4">
                    by {book.author}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-mono">
                    {book.format}
                  </span>
                  <Link
                    to="/books"
                    className="px-3.5 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-950 hover:text-white dark:hover:bg-amber-500 dark:hover:text-slate-950 text-xs font-bold transition-all"
                  >
                    Check Out
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SCHOLAR TESTIMONIALS ───────────────────────────────────── */}
      <section className="py-24 md:py-32 border-b border-slate-200/60 dark:border-white/[0.06]">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="font-mono text-xs uppercase tracking-widest text-amber-600 dark:text-amber-400 font-bold">
              PEER EXPERIENCES
            </span>
            <h2 className="font-serif-editorial text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 dark:text-white mt-2">
              Endorsed by Researchers &amp; Fellows
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="p-8 rounded-3xl bg-white dark:bg-[#111523] border border-slate-200/80 dark:border-white/[0.08] shadow-xs flex flex-col justify-between"
              >
                <p className="font-serif-editorial text-lg text-slate-800 dark:text-slate-200 leading-relaxed italic mb-8">
                  "{t.quote}"
                </p>

                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white font-sans">
                    {t.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {t.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ARCHIVAL CALL TO ACTION ─────────────────────────────────── */}
      <section className="py-28 relative overflow-hidden bg-slate-950 text-white">
        <div className="container mx-auto px-6 relative z-10 text-center max-w-3xl">
          <span className="font-mono text-xs uppercase tracking-widest text-amber-400 font-bold">
            COMMENCE RESEARCH
          </span>
          <h2 className="font-serif-editorial text-4xl sm:text-6xl font-bold tracking-tight mt-4 mb-6 leading-tight">
            Access the Repository Today.
          </h2>
          <p className="text-slate-300 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            Join hundreds of scholars, engineers, and curious minds exploring our open
            and reserved physical catalog.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/books"
              className="w-full sm:w-auto px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Explore The Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/signup"
              className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/15 text-white font-bold rounded-xl transition-all border border-white/10"
            >
              Enroll as Member
            </Link>
          </div>
        </div>
      </section>

      {/* ── ARCHITECTURAL FOOTER ────────────────────────────────────── */}
      <footer className="py-14 border-t border-slate-200/60 dark:border-white/[0.06] bg-white dark:bg-[#07090e] text-xs text-slate-500">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-2 font-black tracking-tight text-slate-900 dark:text-white text-base">
                <Library className="w-5 h-5 text-amber-500" />
                <span>Patel &amp; Co. Knowledge Center</span>
              </div>
              <p className="max-w-md text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                A modern institutional digital library dedicated to organizing, cataloging,
                and preserving seminal human thought, engineering standards, and literary works.
              </p>
            </div>

            <div>
              <h5 className="font-mono uppercase tracking-widest text-[11px] font-bold text-slate-900 dark:text-white mb-3">
                Repository
              </h5>
              <ul className="space-y-2">
                <li><Link to="/books" className="hover:text-amber-500 transition-colors">Catalog Index</Link></li>
                <li><Link to="/shadcn-demo" className="hover:text-amber-500 transition-colors">Design System</Link></li>
                <li><Link to="/dashboard" className="hover:text-amber-500 transition-colors">Member Dashboard</Link></li>
              </ul>
            </div>

            <div>
              <h5 className="font-mono uppercase tracking-widest text-[11px] font-bold text-slate-900 dark:text-white mb-3">
                Standards
              </h5>
              <p className="text-[11px] text-slate-400 font-mono">
                Dewey Decimal 23rd Edition • PDF/A Archive Conformance • ISO 2709 Circulation Sync
              </p>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="font-mono text-[11px]">
              © 2026 Patel &amp; Co. Limited. Curated and crafted with architectural rigor.
            </p>
            <div className="flex items-center gap-2 font-mono text-[11px] text-emerald-600 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              SYSTEM OPERATIONAL &bull; 99.98% UPTIME
            </div>
          </div>
        </div>
      </footer>

      {/* ── QUICK INSPECTION MODAL ──────────────────────────────────── */}
      <AnimatePresence>
        {inspectBook && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-[#111523] rounded-3xl border border-slate-200 dark:border-white/10 p-8 max-w-lg w-full shadow-2xl relative"
            >
              <div className="flex justify-between items-start mb-6">
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-600 dark:text-amber-400 px-3 py-1 rounded-md bg-amber-500/10 font-bold">
                  {inspectBook.shelf}
                </span>
                <button
                  onClick={() => setInspectBook(null)}
                  className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg"
                >
                  ✕
                </button>
              </div>

              <h3 className="font-serif-editorial text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white leading-tight mb-2">
                {inspectBook.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 italic mb-6">
                by {inspectBook.author} • First published {inspectBook.year}
              </p>

              <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 mb-6 text-xs font-mono">
                <div>
                  <span className="text-slate-400">CATEGORY</span>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">{inspectBook.category}</p>
                </div>
                <div>
                  <span className="text-slate-400">COPIES AVAILABLE</span>
                  <p className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{inspectBook.copies} on shelf</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setInspectBook(null);
                    navigate('/books');
                  }}
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-all text-sm text-center"
                >
                  Issue This Volume
                </button>
                <button
                  onClick={() => setInspectBook(null)}
                  className="px-5 py-3 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-white/5"
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default LandingPage;