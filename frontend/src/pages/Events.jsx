import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Clock, MapPin, Users, Sparkles, Filter,
  ArrowRight, X, CheckCircle2, Video, Ticket, ExternalLink,
  BookOpen, Award, ShieldAlert, Download, Share2, Search,
  ChevronRight, Mic, Feather, Wrench
} from 'lucide-react';

const eventsData = [
  {
    id: 'evt-borges-infinite',
    title: 'The Metaphysics of the Infinite Library: Borges & Quantum Multiverses',
    category: 'Author Salons',
    timeframe: 'Upcoming',
    date: 'Thursday, October 8, 2026',
    time: '18:30 – 20:30 EST',
    duration: '2 hours',
    location: {
      room: 'Babbage Memorial Auditorium',
      wing: 'Floor 2, Western Promenade',
      capacity: 120,
      reserved: 108
    },
    admission: 'Free Admission &bull; Complimentary Wine & Folio Display',
    format: 'In-Person & Live Streamed',
    speaker: {
      name: 'Dr. Helena Rostova',
      title: 'Professor of Comparative Literature & Epistemology',
      institution: 'Oxford Institute for Advanced Studies',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      bio: 'Author of "Labyrinths of Mind: Borges and the Prehistory of the Internet", Dr. Rostova specializes in the intersection of 20th-century speculative prose and quantum physics.'
    },
    summary: 'A luminous intellectual evening exploring Jorge Luis Borges’s celebrated stories "The Library of Babel" and "The Garden of Forking Paths". Examining how metaphysical fiction predicted modern hyperlinked networks and quantum many-worlds mechanics.',
    keyTakeaways: [
      'Original 1944 Sur first editions of Ficciones on display in the auditorium foyer',
      'Panel dialogue on quantum computing with MIT Department of Physics guests',
      'Audience Q&A followed by an intimate reception in the Rotunda'
    ],
    accentColor: '#d97706'
  },
  {
    id: 'evt-aldine-showing',
    title: 'White-Glove Public Viewing: The 1499 Aldine Hypnerotomachia',
    category: 'Rare Book Showings',
    timeframe: 'This Week',
    date: 'Saturday, October 3, 2026',
    time: '14:00 – 16:00 EST',
    duration: '2 hours',
    location: {
      room: 'The Rare Manuscript Atrium',
      wing: 'North Wing, Special Collections Level 3',
      capacity: 25,
      reserved: 23
    },
    admission: 'Exclusive Viewing &bull; White Cotton Gloves Provided',
    format: 'In-Person Exclusive',
    speaker: {
      name: 'Dr. Evelyn Sterling',
      title: 'Senior Conservator of Rare Manuscripts',
      institution: 'Patel & Co. Knowledge Center',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
      bio: 'Dr. Sterling has directed the preservation of our pre-1501 incunabula for over eighteen years and trained at the Vatican Secret Archives.'
    },
    summary: 'An extraordinarily rare public showing of the finest typographic folio of the Italian Renaissance. Attendees will inspect the 168 woodcuts, Aldus Manutius’s revolutionary roman typeface, and 500-year-old rag paper under fiber optic illumination.',
    keyTakeaways: [
      'Personal hands-on leaf inspection under direct conservator supervision',
      'Detailed breakdown of Renaissance watermark paper fabrication',
      'Curator monograph booklet included for all registered scholars'
    ],
    accentColor: '#9333ea'
  },
  {
    id: 'evt-bookbinding-workshop',
    title: 'Medieval Leather Bookbinding & Deacidification Masterclass',
    category: 'Manuscript Restoration Workshops',
    timeframe: 'Upcoming',
    date: 'Saturday, October 17, 2026',
    time: '10:00 – 16:00 EST',
    duration: '6 hours (Full Day)',
    location: {
      room: 'Guild Bookbinding Studio',
      wing: 'Sub-Level Vault B, Conservation Wing',
      capacity: 16,
      reserved: 14
    },
    admission: '$45 Materials Fee &bull; Includes Hand-Bound Journal to Keep',
    format: 'Hands-On Intensive Studio',
    speaker: {
      name: 'Brian Thorne',
      title: 'Master Conservator & Bookbinder',
      institution: 'Fellow of the Guild of Fine Bookbinders',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      bio: 'Brian Thorne has conserved 16th-century armorial bindings across Oxford, Dublin, and Bologna. He teaches traditional sewn-on-raised-cords techniques.'
    },
    summary: 'Learn the ancient craft of binding books by hand. Using authentic vegetable-tanned goatskin leather, unbleached Irish linen thread, bone folders, and wheat starch paste, participants will construct their own leather-bound archival blank book.',
    keyTakeaways: [
      'Learn classic sewing on raised hemp cords and hand-worked headbands',
      'Master paper pH testing and gentle calcium bicarbonate washing',
      'Take home your completed hand-bound goatskin folio'
    ],
    accentColor: '#e11d48'
  },
  {
    id: 'evt-algorithms-lecture',
    title: 'The Architecture of Computation: From Turing & Von Neumann to Generative AI',
    category: 'Academic Lectures',
    timeframe: 'This Week',
    date: 'Wednesday, September 30, 2026',
    time: '17:00 – 19:00 EST',
    duration: '2 hours',
    location: {
      room: 'Digital Commons Main Amphitheater',
      wing: 'Floor 1, East Annex',
      capacity: 150,
      reserved: 89
    },
    admission: 'Free &bull; Open to Public & University Students',
    format: 'Hybrid &bull; In-Person & Global Webcast',
    speaker: {
      name: 'Prof. Alistair Vance',
      title: 'Chair of Computational History',
      institution: 'Patel & Co. Knowledge Center',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      bio: 'Prof. Vance holds joint appointments in computer science and historical philosophy. Author of "The Stored Program: How Memory Built the Modern Mind".'
    },
    summary: 'A deep-dive academic symposium reviewing how the architectural principles of Turing machines, Claude Shannon’s information entropy, and von Neumann’s 1945 memo evolved into modern neural weights and large language models.',
    keyTakeaways: [
      'Examination of original 1945 EDVAC mimeographed memo pages',
      'Interactive timeline of software memory architectures',
      'Complimentary reception and compute lab demonstrations'
    ],
    accentColor: '#2563eb'
  },
  {
    id: 'evt-odyssey-club',
    title: 'The Homeric Salon: Reading the Odyssey with Emily Wilson',
    category: 'Book Clubs',
    timeframe: 'Upcoming',
    date: 'Tuesday, October 20, 2026',
    time: '19:00 – 21:00 EST',
    duration: '2 hours',
    location: {
      room: 'Socrates Pavilion & Reading Lounge',
      wing: 'West Wing, Floor 2',
      capacity: 30,
      reserved: 21
    },
    admission: 'Free for All Registered Members &bull; Tea & Refreshments',
    format: 'Roundtable Seminar Discussion',
    speaker: {
      name: 'Julian Sterling, M.Phil',
      title: 'Resident Classical Philology Fellow',
      institution: 'Patel & Co. Humanities Initiative',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      bio: 'Julian leads our monthly Homeric and tragic Greek literature circles, emphasizing poetic meter, ethical dilemmas, and modern translations.'
    },
    summary: 'Join our monthly intellectual salon as we explore books 9 through 12 of Homer’s Odyssey in Emily Wilson’s celebrated iambic pentameter translation. We contrast her rhythm with Alexander Pope’s 1725 heroic couplets.',
    keyTakeaways: [
      'Comparative bilingual analysis of original Greek dactylic hexameters',
      'Inspection of our 1524 Aldine Press pocket Odyssey edition',
      'Lively open intellectual discussion among scholars and enthusiasts'
    ],
    accentColor: '#059669'
  },
  {
    id: 'evt-youth-illuminators',
    title: 'Little Illuminators: Medieval Calligraphy & Gold Leaf for Young Minds',
    category: 'Youth Literacy Hours',
    timeframe: 'This Week',
    date: 'Sunday, October 4, 2026',
    time: '11:00 – 12:30 EST',
    duration: '90 minutes',
    location: {
      room: 'Grand Rotunda Family Corner',
      wing: 'Level 1, Central Hall',
      capacity: 40,
      reserved: 32
    },
    admission: 'Free Family Programming &bull; Ages 7–14 (Parents Welcome)',
    format: 'Hands-On Youth Masterclass',
    speaker: {
      name: 'Clara Hernandez',
      title: 'Director of Community Literacy & Pedagogy',
      institution: 'Patel & Co. Educational Outreach',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
      bio: 'Clara has designed youth typography programs for museums and schools across North America, inspiring a love of books through physical tactile art.'
    },
    summary: 'An enchanting morning introducing young scholars to medieval book arts. Children will grind organic pigments, mix natural gum arabic, use goose quill dip pens, and apply real 22-karat imitation gold leaf to their own illuminated initial letters.',
    keyTakeaways: [
      'Take home your own illuminated parchment letter bookmark',
      'Discover how medieval monks made inks from crushed oak galls and walnuts',
      'Storytelling reading from Celtic and Arthurian illustrated folklore'
    ],
    accentColor: '#0284c7'
  },
  {
    id: 'evt-past-penrose',
    title: 'Archival Symposium: Sir Roger Penrose on Shadows of the Mind',
    category: 'Academic Lectures',
    timeframe: 'Past Programming',
    date: 'Recorded May 14, 2026',
    time: 'Archived Recording & Full Transcript',
    duration: '2 hours 15 minutes',
    location: {
      room: 'Babbage Memorial Auditorium',
      wing: 'Floor 2, Digital Video Archive',
      capacity: 150,
      reserved: 150
    },
    admission: 'Archived &bull; Free Video on Demand for Members',
    format: 'Video Recording & Synchronized Transcript',
    speaker: {
      name: 'Sir Roger Penrose, OM FRS',
      title: 'Nobel Laureate in Physics (2020)',
      institution: 'University of Oxford',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
      bio: 'Mathematical physicist and philosopher of science, known for Penrose tilings, singularity theorems with Stephen Hawking, and objective reduction theory.'
    },
    summary: 'A celebrated archival recording of Sir Roger Penrose delivering the Annual Patel & Co. Foundation Lecture on quantum state reduction, Gödelian non-computability, and mathematical consciousness.',
    keyTakeaways: [
      'Full 4K video recording with synchronized audio and searchable transcript',
      'High-resolution PDF copy of Sir Roger’s hand-drawn transparency slides',
      'Permanent addition to our Digital Commons permanent scientific archive'
    ],
    accentColor: '#ca8a04'
  }
];

const categories = [
  'All',
  'Author Salons',
  'Rare Book Showings',
  'Manuscript Restoration Workshops',
  'Academic Lectures',
  'Book Clubs',
  'Youth Literacy Hours'
];

export default function Events() {
  const [timeframeFilter, setTimeframeFilter] = useState('Upcoming'); // 'Upcoming' | 'This Week' | 'Past Programming' | 'All'
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // RSVP Modal State
  const [activeRsvpEvent, setActiveRsvpEvent] = useState(null);
  const [rsvpSuccess, setRsvpSuccess] = useState(false);
  const [rsvpForm, setRsvpForm] = useState({
    name: '',
    email: '',
    affiliation: '',
    ticketCount: 1,
    accessibility: ''
  });

  const filteredEvents = useMemo(() => {
    return eventsData.filter((evt) => {
      const matchesTimeframe =
        timeframeFilter === 'All' ||
        (timeframeFilter === 'Upcoming' && (evt.timeframe === 'Upcoming' || evt.timeframe === 'This Week')) ||
        (timeframeFilter === 'This Week' && evt.timeframe === 'This Week') ||
        (timeframeFilter === 'Past Programming' && evt.timeframe === 'Past Programming');

      const matchesCategory =
        selectedCategory === 'All' || evt.category === selectedCategory;

      const q = searchQuery.toLowerCase();
      const matchesSearch =
        evt.title.toLowerCase().includes(q) ||
        evt.summary.toLowerCase().includes(q) ||
        evt.speaker.name.toLowerCase().includes(q) ||
        evt.location.room.toLowerCase().includes(q);

      return matchesTimeframe && matchesCategory && matchesSearch;
    });
  }, [timeframeFilter, selectedCategory, searchQuery]);

  const handleRsvpSubmit = (e) => {
    e.preventDefault();
    setRsvpSuccess(true);
  };

  return (
    <div className="min-h-screen bg-[#fbf9f5] dark:bg-[#090b11] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* ── HERO BANNER ────────────────────────────────────────────── */}
      <section className="relative pt-12 pb-16 border-b border-slate-200/80 dark:border-white/[0.08] archival-grid overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center max-w-3xl mx-auto space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 font-mono text-[10px] uppercase tracking-widest border border-amber-500/20 font-bold">
              <Calendar className="w-3 h-3 text-amber-600 dark:text-amber-400" />
              <span>CULTURAL &amp; ACADEMIC PROGRAMMING CALENDAR</span>
            </div>

            <h1 className="font-serif-editorial text-4xl sm:text-6xl font-bold tracking-tight text-slate-950 dark:text-white leading-tight">
              Library Salons, Showings &amp; Symposia
            </h1>

            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base max-w-2xl mx-auto font-sans leading-relaxed">
              Engage with prominent philosophers, rare book conservators, and computer scientists.
              Reserve your seat for white-glove folio showings, restoration workshops, and intellectual salons.
            </p>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 max-w-2xl mx-auto">
              <div className="hairline-card p-3 rounded-xl bg-white/70 dark:bg-[#111523]/80 backdrop-blur-xs text-center">
                <span className="font-serif-editorial text-2xl font-bold text-slate-900 dark:text-white block">7</span>
                <span className="font-mono text-[9px] uppercase tracking-widest text-slate-500 dark:text-slate-400">Scheduled Salons</span>
              </div>
              <div className="hairline-card p-3 rounded-xl bg-white/70 dark:bg-[#111523]/80 backdrop-blur-xs text-center">
                <span className="font-serif-editorial text-2xl font-bold text-amber-600 dark:text-amber-400 block">400+</span>
                <span className="font-mono text-[9px] uppercase tracking-widest text-slate-500 dark:text-slate-400">Auditorium Seats</span>
              </div>
              <div className="hairline-card p-3 rounded-xl bg-white/70 dark:bg-[#111523]/80 backdrop-blur-xs text-center">
                <span className="font-serif-editorial text-2xl font-bold text-slate-900 dark:text-white block">100%</span>
                <span className="font-mono text-[9px] uppercase tracking-widest text-slate-500 dark:text-slate-400">Free to Scholars</span>
              </div>
              <div className="hairline-card p-3 rounded-xl bg-white/70 dark:bg-[#111523]/80 backdrop-blur-xs text-center">
                <span className="font-serif-editorial text-2xl font-bold text-emerald-600 dark:text-emerald-400 block">Hybrid</span>
                <span className="font-mono text-[9px] uppercase tracking-widest text-slate-500 dark:text-slate-400">In-Person &amp; Stream</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── TIMEFRAME & CATEGORY FILTERS ───────────────────────────── */}
      <section className="sticky top-20 z-40 bg-[#fbf9f5]/95 dark:bg-[#090b11]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-white/[0.08] py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Timeframe Segmented Control */}
            <div className="flex items-center p-1 bg-black/5 dark:bg-white/5 border border-slate-200/80 dark:border-white/[0.08] rounded-2xl">
              {['Upcoming', 'This Week', 'Past Programming', 'All'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setTimeframeFilter(tab)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    timeframeFilter === tab
                      ? 'bg-white dark:bg-[#111523] text-slate-950 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-72 group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search event, speaker, or room..."
                className="w-full pl-10 pr-9 py-2 text-xs bg-white dark:bg-[#111523] border border-slate-300/80 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400 font-bold shrink-0 mr-1">
              PROGRAM TYPE:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-slate-950 dark:bg-white text-white dark:text-slate-950 shadow-xs'
                    : 'bg-white/60 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200/80 dark:hover:bg-white/10 border border-slate-200/60 dark:border-white/[0.06]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* ── EVENTS LISTING ─────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        <div className="flex items-center justify-between mb-6">
          <span className="font-mono text-[11px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-bold">
            SHOWING {filteredEvents.length} ARCHIVAL &amp; CULTURAL GATHERINGS
          </span>
          {(searchQuery || selectedCategory !== 'All' || timeframeFilter !== 'Upcoming') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setTimeframeFilter('Upcoming');
              }}
              className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-semibold"
            >
              Reset Filters
            </button>
          )}
        </div>

        {filteredEvents.length === 0 ? (
          <div className="hairline-card rounded-2xl p-12 text-center bg-white dark:bg-[#111523] space-y-3">
            <Calendar className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="font-serif-editorial text-xl font-bold text-slate-800 dark:text-slate-200">
              No Events Match Your Selected Criteria
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto font-sans">
              Switch between "Upcoming", "This Week", and "Past Programming" or clear your search terms.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredEvents.map((evt, idx) => {
              const remainingSeats = evt.location.capacity - evt.location.reserved;
              const isFull = remainingSeats <= 0;
              const isAlmostFull = remainingSeats > 0 && remainingSeats <= 5;
              const isPast = evt.timeframe === 'Past Programming';

              return (
                <motion.article
                  key={evt.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: idx * 0.04 }}
                  className="hairline-card rounded-3xl bg-white dark:bg-[#111523] border border-slate-200 dark:border-white/10 p-6 sm:p-8 hover:shadow-xl transition-all duration-300 relative overflow-hidden"
                >
                  {/* Top Accent Stripe */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1.5"
                    style={{ backgroundColor: evt.accentColor }}
                  />

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Left & Center Information */}
                    <div className="lg:col-span-8 space-y-5">
                      
                      {/* Badge Ribbon */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[9px] uppercase tracking-widest px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold border border-amber-500/20">
                          {evt.category}
                        </span>
                        
                        <span className="font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 font-medium">
                          {evt.format}
                        </span>

                        {isAlmostFull && !isPast && (
                          <span className="font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold animate-pulse">
                            Only {remainingSeats} Seats Left!
                          </span>
                        )}

                        {isPast && (
                          <span className="font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-200 dark:bg-white/10 text-slate-500 font-bold">
                            Recorded Archive
                          </span>
                        )}
                      </div>

                      {/* Title & Date */}
                      <div className="space-y-2">
                        <h2 className="font-serif-editorial text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white leading-tight">
                          {evt.title}
                        </h2>

                        <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-600 dark:text-slate-300 pt-1">
                          <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-bold">
                            <Calendar className="w-4 h-4 text-amber-500" />
                            <span>{evt.date}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{evt.time} ({evt.duration})</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>{evt.location.room} &bull; {evt.location.wing}</span>
                          </div>
                        </div>
                      </div>

                      {/* Summary */}
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-sans leading-relaxed">
                        {evt.summary}
                      </p>

                      {/* Key Takeaways */}
                      <div className="p-4 rounded-2xl bg-[#fbf9f5] dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] space-y-1.5 text-xs">
                        <span className="font-mono text-[9px] uppercase tracking-widest text-slate-400 font-bold block">
                          PROGRAM HIGHLIGHTS &amp; CURATED ACCESS:
                        </span>
                        <ul className="space-y-1">
                          {evt.keyTakeaways.map((item, kIdx) => (
                            <li key={kIdx} className="flex items-start gap-2 text-slate-700 dark:text-slate-300 font-sans">
                              <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                    </div>

                    {/* Right Side: Speaker & Registration Box */}
                    <div className="lg:col-span-4 flex flex-col justify-between p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] space-y-5">
                      
                      {/* Speaker Profile */}
                      <div className="space-y-3">
                        <span className="font-mono text-[9px] uppercase tracking-widest text-slate-400 font-bold block">
                          GUEST SPEAKER &amp; LECTURER:
                        </span>

                        <div className="flex items-start gap-3">
                          <img
                            src={evt.speaker.avatar}
                            alt={evt.speaker.name}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-white/10 shadow-xs shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="font-serif-editorial text-base font-bold text-slate-900 dark:text-white truncate">
                              {evt.speaker.name}
                            </h4>
                            <p className="text-[11px] text-amber-700 dark:text-amber-400 font-mono truncate">
                              {evt.speaker.title}
                            </p>
                            <p className="text-[10px] text-slate-500 truncate">
                              {evt.speaker.institution}
                            </p>
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-600 dark:text-slate-400 font-sans line-clamp-3 leading-relaxed">
                          {evt.speaker.bio}
                        </p>
                      </div>

                      {/* Seat Count & Action Box */}
                      <div className="space-y-3 pt-4 border-t border-slate-200/80 dark:border-white/10">
                        
                        {/* Seat Meter */}
                        {!isPast ? (
                          <div className="space-y-1.5 font-mono text-xs">
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="text-slate-500">SEAT AVAILABILITY:</span>
                              <span className="font-bold text-slate-900 dark:text-white">
                                {evt.location.reserved} / {evt.location.capacity} Reserved
                              </span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                              <div
                                className={`h-full transition-all duration-500 ${
                                  isAlmostFull ? 'bg-rose-500' : 'bg-amber-500'
                                }`}
                                style={{
                                  width: `${(evt.location.reserved / evt.location.capacity) * 100}%`
                                }}
                              />
                            </div>
                            <div className="flex justify-between text-[10px] text-slate-400">
                              <span>{evt.admission.split('&bull;')[0]}</span>
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                                {remainingSeats} Seats Available
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-xs font-mono text-slate-500">
                            Recorded Session &bull; 150 Attendees in Attendance
                          </div>
                        )}

                        {/* Button */}
                        {isPast ? (
                          <button
                            onClick={() => alert('Accessing synchronized transcript and 4K video recording...')}
                            className="w-full py-3 rounded-xl bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs"
                          >
                            <Video className="w-4 h-4" />
                            <span>Watch Recorded Symposium</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setActiveRsvpEvent(evt);
                              setRsvpSuccess(false);
                            }}
                            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs"
                          >
                            <Ticket className="w-4 h-4" />
                            <span>Reserve Seat / Register RSVP</span>
                          </button>
                        )}

                      </div>

                    </div>

                  </div>
                </motion.article>
              );
            })}
          </div>
        )}

      </main>

      {/* ── RSVP REGISTRATION MODAL ────────────────────────────────── */}
      <AnimatePresence>
        {activeRsvpEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg bg-white dark:bg-[#111523] rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl p-6 sm:p-8 my-8"
            >
              <button
                onClick={() => setActiveRsvpEvent(null)}
                className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              {rsvpSuccess ? (
                <div className="text-center py-6 space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/20">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <h3 className="font-serif-editorial text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                    Seat Reservation Confirmed!
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-sm mx-auto font-sans">
                    A confirmation pass has been dispatched to <strong className="text-slate-900 dark:text-white">{rsvpForm.email}</strong>.
                  </p>

                  <div className="p-4 rounded-2xl bg-[#fbf9f5] dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-mono text-left space-y-1.5">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-200/60 dark:border-white/10">
                      <span className="text-slate-400">EVENT PASS:</span>
                      <span className="font-bold text-amber-600 dark:text-amber-400">
                        {`PATEL-PASS-2026-${Math.floor(1000 + Math.random() * 9000)}`}
                      </span>
                    </div>
                    <p className="text-slate-400">PROGRAM: <strong className="text-slate-900 dark:text-white">{activeRsvpEvent.title}</strong></p>
                    <p className="text-slate-400">DATE: <strong className="text-slate-900 dark:text-white">{activeRsvpEvent.date} &bull; {activeRsvpEvent.time}</strong></p>
                    <p className="text-slate-400">LOCATION: <strong className="text-slate-900 dark:text-white">{activeRsvpEvent.location.room}</strong></p>
                    <p className="text-slate-400">GUESTS: <strong className="text-slate-900 dark:text-white">{rsvpForm.ticketCount} Reserved Seat(s)</strong></p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                    <button
                      onClick={() => alert('Downloading ICS calendar invitation for Patel & Co. Library Salon...')}
                      className="w-full sm:flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-xs"
                    >
                      <Download className="w-4 h-4" />
                      <span>Add to Calendar (.ICS)</span>
                    </button>
                    <button
                      onClick={() => setActiveRsvpEvent(null)}
                      className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-white/5"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleRsvpSubmit} className="space-y-4">
                  <div className="space-y-1 pr-8">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 font-mono text-[9px] uppercase tracking-widest font-bold">
                      <Ticket className="w-3.5 h-3.5" />
                      <span>SCHOLAR SEAT REGISTRATION</span>
                    </div>
                    <h3 className="font-serif-editorial text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                      {activeRsvpEvent.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono">
                      {activeRsvpEvent.date} &bull; {activeRsvpEvent.location.room}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs flex justify-between items-center font-mono">
                    <span className="text-slate-500">AVAILABLE SEATS:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {activeRsvpEvent.location.capacity - activeRsvpEvent.location.reserved} Seats Open
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="font-mono text-[10px] uppercase tracking-widest text-slate-500 block mb-1 font-bold">
                        ATTENDEE FULL NAME *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Dr. Arthur Pendelton"
                        value={rsvpForm.name}
                        onChange={(e) => setRsvpForm({ ...rsvpForm, name: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#111523] border border-slate-300/80 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-1 focus:ring-amber-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-mono text-[10px] uppercase tracking-widest text-slate-500 block mb-1 font-bold">
                        CONFIRMATION EMAIL *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="scholar@university.edu"
                        value={rsvpForm.email}
                        onChange={(e) => setRsvpForm({ ...rsvpForm, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#111523] border border-slate-300/80 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-1 focus:ring-amber-500 outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-mono text-[10px] uppercase tracking-widest text-slate-500 block mb-1 font-bold">
                          INSTITUTION / STATUS
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Student / Fellow / Public"
                          value={rsvpForm.affiliation}
                          onChange={(e) => setRsvpForm({ ...rsvpForm, affiliation: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#111523] border border-slate-300/80 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-1 focus:ring-amber-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="font-mono text-[10px] uppercase tracking-widest text-slate-500 block mb-1 font-bold">
                          RESERVED SEATS
                        </label>
                        <select
                          value={rsvpForm.ticketCount}
                          onChange={(e) => setRsvpForm({ ...rsvpForm, ticketCount: parseInt(e.target.value, 10) })}
                          className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-[#111523] border border-slate-300/80 dark:border-white/10 text-slate-900 dark:text-white focus:ring-1 focus:ring-amber-500 outline-none font-mono"
                        >
                          <option value={1}>1 Seat (Individual)</option>
                          <option value={2}>2 Seats (Pair)</option>
                          <option value={3}>3 Seats (Group)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="font-mono text-[10px] uppercase tracking-widest text-slate-500 block mb-1 font-bold">
                        ACCESSIBILITY OR DIETARY NOTES
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Wheelchair access, sign interpretation..."
                        value={rsvpForm.accessibility}
                        onChange={(e) => setRsvpForm({ ...rsvpForm, accessibility: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#111523] border border-slate-300/80 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-1 focus:ring-amber-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-3">
                    <button
                      type="submit"
                      className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm transition-all shadow-xs"
                    >
                      Confirm RSVP Reservation
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveRsvpEvent(null)}
                      className="px-5 py-3 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-semibold hover:bg-slate-100 dark:hover:bg-white/5"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
