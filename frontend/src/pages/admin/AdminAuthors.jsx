import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PenLine,
  BookOpen,
  Search,
  Plus,
  Edit2,
  Trash2,
  Globe,
  Calendar,
  TrendingUp,
  Award,
  Sparkles,
  ExternalLink,
  BookMarked,
  Filter,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  Library,
  ChevronRight,
  Flame
} from 'lucide-react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

/* ── Pre-populated Authority Database for Quick Lookup Simulation ── */
const PRESET_LOOKUP_DATABASE = {
  'Gabriel García Márquez': {
    authorityId: 'LCCN-n79021389',
    nationality: 'Colombian',
    birthDeathYears: '1927 – 2014',
    primaryGenre: 'Magical Realism & Latin American Fiction',
    bio: 'Nobel Laureate in Literature (1982). Pioneered Latin American magical realism, blending myth, solitude, and the socio-political history of the Caribbean coast.',
    suggestedTitles: ['One Hundred Years of Solitude', 'Love in the Time of Cholera', 'Chronicle of a Death Foretold'],
    popularityIndex: 96,
  },
  'Virginia Woolf': {
    authorityId: 'LCCN-n79041634',
    nationality: 'British',
    birthDeathYears: '1882 – 1941',
    primaryGenre: 'Modernist Stream-of-Consciousness',
    bio: 'Key figure of the Bloomsbury Group. Revolutionized interior monologue, temporal narrative, and feminist literary criticism in 20th-century literature.',
    suggestedTitles: ['Mrs. Dalloway', 'To the Lighthouse', 'Orlando', 'A Room of One\'s Own'],
    popularityIndex: 93,
  },
  'George Orwell': {
    authorityId: 'LCCN-n79058383',
    nationality: 'British',
    birthDeathYears: '1903 – 1950',
    primaryGenre: 'Political Satire & Dystopian Fiction',
    bio: 'Pen name of Eric Arthur Blair. Acclaimed essayist and novelist renowned for lucid prose, fierce opposition to totalitarianism, and dystopian foresight.',
    suggestedTitles: ['1984', 'Animal Farm', 'Homage to Catalonia', 'Down and Out in Paris and London'],
    popularityIndex: 99,
  },
  'Toni Morrison': {
    authorityId: 'LCCN-n80139625',
    nationality: 'American',
    birthDeathYears: '1931 – 2019',
    primaryGenre: 'African American Historical Fiction',
    bio: 'Nobel Laureate (1993) and Pulitzer Prize winner. Celebrated for epic themes, vivid dialogue, and richly detailed African American historical experiences.',
    suggestedTitles: ['Beloved', 'Song of Solomon', 'The Bluest Eye', 'Sula'],
    popularityIndex: 92,
  },
  'Rabindranath Tagore': {
    authorityId: 'LCCN-n80036680',
    nationality: 'Indian',
    birthDeathYears: '1861 – 1941',
    primaryGenre: 'Bengali Renaissance & Philosophical Poetry',
    bio: 'Polymath, poet, dramatist, and first non-European Nobel Laureate in Literature (1913). Reshaped Bengali literature and music with profound humanistic spirit.',
    suggestedTitles: ['Gitanjali', 'The Home and the World', 'Gora', 'The Post Office'],
    popularityIndex: 95,
  },
  'Haruki Murakami': {
    authorityId: 'LCCN-n86140590',
    nationality: 'Japanese',
    birthDeathYears: '1949 – Present',
    primaryGenre: 'Surrealist Contemporary Fiction',
    bio: 'Internationally celebrated novelist whose melancholy, surrealist narratives merge classical music, feline motifs, urban alienation, and subconscious quests.',
    suggestedTitles: ['Norwegian Wood', 'Kafka on the Shore', '1Q84', 'The Wind-Up Bird Chronicle'],
    popularityIndex: 97,
  },
  'Jorge Luis Borges': {
    authorityId: 'LCCN-n79040135',
    nationality: 'Argentine',
    birthDeathYears: '1899 – 1986',
    primaryGenre: 'Philosophical Labyrinths & Fantastic Fiction',
    bio: 'Director of the National Public Library of Argentina. Master of the miniature fiction, philosophical labyrinths, infinite libraries, and metafictional paradoxes.',
    suggestedTitles: ['Ficciones', 'The Aleph', 'Labyrinths', 'The Book of Sand'],
    popularityIndex: 94,
  },
  'Franz Kafka': {
    authorityId: 'LCCN-n79021404',
    nationality: 'Czech / Austro-Hungarian',
    birthDeathYears: '1883 – 1924',
    primaryGenre: 'Existential Absurdism & Bureaucratic Surrealism',
    bio: 'German-speaking Bohemian novelist whose nightmarish, bureaucratic parables about guilt, alienation, and surreal transformation defined the concept of the Kafkaesque.',
    suggestedTitles: ['The Metamorphosis', 'The Trial', 'The Castle', 'Letters to Milena'],
    popularityIndex: 98,
  },
};

/* ── Initial Author Authority Records ── */
const INITIAL_AUTHORS = [
  {
    id: 'auth-001',
    authorityId: 'LCCN-n79058383',
    name: 'George Orwell',
    nationality: 'British',
    birthDeathYears: '1903 – 1950',
    primaryGenre: 'Political Satire & Dystopian Fiction',
    bio: 'Pen name of Eric Arthur Blair. Acclaimed essayist and novelist renowned for lucid prose, fierce opposition to totalitarianism, and dystopian foresight.',
    totalTitles: 24,
    popularityIndex: 99,
    linkedTitles: ['1984', 'Animal Farm', 'Homage to Catalonia', 'Down and Out in Paris and London'],
    status: 'Verified Authority',
  },
  {
    id: 'auth-002',
    authorityId: 'LCCN-n79021389',
    name: 'Gabriel García Márquez',
    nationality: 'Colombian',
    birthDeathYears: '1927 – 2014',
    primaryGenre: 'Magical Realism & Latin American Fiction',
    bio: 'Nobel Laureate in Literature (1982). Pioneered Latin American magical realism, blending myth, solitude, and the socio-political history of the Caribbean coast.',
    totalTitles: 18,
    popularityIndex: 96,
    linkedTitles: ['One Hundred Years of Solitude', 'Love in the Time of Cholera', 'Chronicle of a Death Foretold'],
    status: 'Verified Authority',
  },
  {
    id: 'auth-003',
    authorityId: 'LCCN-n86140590',
    name: 'Haruki Murakami',
    nationality: 'Japanese',
    birthDeathYears: '1949 – Present',
    primaryGenre: 'Surrealist Contemporary Fiction',
    bio: 'Internationally celebrated novelist whose melancholy, surrealist narratives merge classical music, feline motifs, urban alienation, and subconscious quests.',
    totalTitles: 21,
    popularityIndex: 97,
    linkedTitles: ['Norwegian Wood', 'Kafka on the Shore', '1Q84', 'The Wind-Up Bird Chronicle'],
    status: 'Verified Authority',
  },
  {
    id: 'auth-004',
    authorityId: 'LCCN-n80036680',
    name: 'Rabindranath Tagore',
    nationality: 'Indian',
    birthDeathYears: '1861 – 1941',
    primaryGenre: 'Bengali Renaissance & Philosophical Poetry',
    bio: 'Polymath, poet, dramatist, and first non-European Nobel Laureate in Literature (1913). Reshaped Bengali literature and music with profound humanistic spirit.',
    totalTitles: 32,
    popularityIndex: 95,
    linkedTitles: ['Gitanjali', 'The Home and the World', 'Gora', 'The Post Office'],
    status: 'Verified Authority',
  },
  {
    id: 'auth-005',
    authorityId: 'LCCN-n79041634',
    name: 'Virginia Woolf',
    nationality: 'British',
    birthDeathYears: '1882 – 1941',
    primaryGenre: 'Modernist Stream-of-Consciousness',
    bio: 'Key figure of the Bloomsbury Group. Revolutionized interior monologue, temporal narrative, and feminist literary criticism in 20th-century literature.',
    totalTitles: 16,
    popularityIndex: 93,
    linkedTitles: ['Mrs. Dalloway', 'To the Lighthouse', 'Orlando', 'A Room of One\'s Own'],
    status: 'Verified Authority',
  },
  {
    id: 'auth-006',
    authorityId: 'LCCN-n80139625',
    name: 'Toni Morrison',
    nationality: 'American',
    birthDeathYears: '1931 – 2019',
    primaryGenre: 'African American Historical Fiction',
    bio: 'Nobel Laureate (1993) and Pulitzer Prize winner. Celebrated for epic themes, vivid dialogue, and richly detailed African American historical experiences.',
    totalTitles: 14,
    popularityIndex: 92,
    linkedTitles: ['Beloved', 'Song of Solomon', 'The Bluest Eye', 'Sula'],
    status: 'Verified Authority',
  },
];

const AdminAuthors = () => {
  const [authors, setAuthors] = useState(INITIAL_AUTHORS);
  const [searchQuery, setSearchQuery] = useState('');
  const [nationalityFilter, setNationalityFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('popularity'); // 'popularity' | 'titles' | 'name'

  // Selected Author for Drawer / Detailed inspection
  const [inspectingAuthor, setInspectingAuthor] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState(null);
  const [lookupQuery, setLookupQuery] = useState('');
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    authorityId: '',
    nationality: '',
    birthDeathYears: '',
    primaryGenre: '',
    bio: '',
    totalTitles: 1,
    popularityIndex: 85,
    linkedTitlesStr: '',
    status: 'Verified Authority',
  });

  // Unique Nationalities
  const nationalities = useMemo(() => {
    return Array.from(new Set(authors.map((a) => a.nationality))).sort();
  }, [authors]);

  // Derived Statistics
  const totalAuthors = authors.length;
  const totalTitlesAcrossCollection = authors.reduce((sum, a) => sum + a.totalTitles, 0);
  const avgPopularity = Math.round(
    authors.reduce((sum, a) => sum + a.popularityIndex, 0) / (authors.length || 1)
  );
  const distinctNations = new Set(authors.map((a) => a.nationality)).size;

  // Filtered and Sorted Authors
  const processedAuthors = useMemo(() => {
    let result = authors.filter((a) => {
      const q = searchQuery.toLowerCase();
      const matchQuery =
        a.name.toLowerCase().includes(q) ||
        a.authorityId.toLowerCase().includes(q) ||
        a.nationality.toLowerCase().includes(q) ||
        a.primaryGenre.toLowerCase().includes(q) ||
        a.linkedTitles.some((t) => t.toLowerCase().includes(q));

      const matchNat =
        nationalityFilter === 'ALL' || a.nationality === nationalityFilter;

      return matchQuery && matchNat;
    });

    if (sortBy === 'popularity') {
      result.sort((a, b) => b.popularityIndex - a.popularityIndex);
    } else if (sortBy === 'titles') {
      result.sort((a, b) => b.totalTitles - a.totalTitles);
    } else if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [authors, searchQuery, nationalityFilter, sortBy]);

  // Quick Lookup Execution
  const handleExecuteLookup = () => {
    const term = lookupQuery.trim();
    if (!term) return;

    setIsLookingUp(true);
    setTimeout(() => {
      setIsLookingUp(false);
      const matchKey = Object.keys(PRESET_LOOKUP_DATABASE).find(
        (key) => key.toLowerCase() === term.toLowerCase()
      );

      if (matchKey) {
        const found = PRESET_LOOKUP_DATABASE[matchKey];
        setFormData((prev) => ({
          ...prev,
          name: matchKey,
          authorityId: found.authorityId,
          nationality: found.nationality,
          birthDeathYears: found.birthDeathYears,
          primaryGenre: found.primaryGenre,
          bio: found.bio,
          popularityIndex: found.popularityIndex,
          linkedTitlesStr: found.suggestedTitles.join(', '),
        }));
        toast.success(`Authority record identified: ${matchKey} (${found.authorityId})`);
      } else {
        toast.info(
          `No exact record for "${term}" in cached authority index. Manual fields pre-populated.`
        );
        setFormData((prev) => ({
          ...prev,
          name: term,
          authorityId: `LCCN-n${Math.floor(10000000 + Math.random() * 90000000)}`,
        }));
      }
    }, 450);
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingAuthor(null);
    setLookupQuery('');
    setFormData({
      name: '',
      authorityId: `LCCN-n${Math.floor(10000000 + Math.random() * 90000000)}`,
      nationality: 'American',
      birthDeathYears: '1950 – Present',
      primaryGenre: 'Literary Prose',
      bio: '',
      totalTitles: 3,
      popularityIndex: 88,
      linkedTitlesStr: '',
      status: 'Verified Authority',
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (author) => {
    setEditingAuthor(author);
    setLookupQuery('');
    setFormData({
      name: author.name,
      authorityId: author.authorityId,
      nationality: author.nationality,
      birthDeathYears: author.birthDeathYears,
      primaryGenre: author.primaryGenre,
      bio: author.bio,
      totalTitles: author.totalTitles,
      popularityIndex: author.popularityIndex,
      linkedTitlesStr: (author.linkedTitles || []).join(', '),
      status: author.status,
    });
    setIsModalOpen(true);
  };

  // Delete Author
  const handleDelete = async (author) => {
    const res = await Swal.fire({
      title: `Delete authority record for ${author.name}?`,
      text: `This will unlink ${author.totalTitles} catalog titles from this authority authority file.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete',
      background: document.documentElement.classList.contains('dark') ? '#0f172a' : '#fff',
      color: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
    });

    if (res.isConfirmed) {
      setAuthors((prev) => prev.filter((a) => a.id !== author.id));
      if (inspectingAuthor?.id === author.id) setInspectingAuthor(null);
      toast.success(`Removed authority record: ${author.name}`);
    }
  };

  // Submit Form
  const handleSubmitForm = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Author canonical name is required.');
      return;
    }

    const titlesArray = formData.linkedTitlesStr
      ? formData.linkedTitlesStr
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      : [];

    if (editingAuthor) {
      setAuthors((prev) =>
        prev.map((a) =>
          a.id === editingAuthor.id
            ? {
                ...a,
                ...formData,
                totalTitles: Number(formData.totalTitles) || titlesArray.length || 1,
                popularityIndex: Number(formData.popularityIndex) || 85,
                linkedTitles: titlesArray,
              }
            : a
        )
      );
      toast.success(`Updated authority record for ${formData.name}`);
    } else {
      const newAuthor = {
        id: `auth-${Date.now().toString().slice(-4)}`,
        name: formData.name,
        authorityId: formData.authorityId || `LCCN-n${Math.floor(10000000 + Math.random() * 90000000)}`,
        nationality: formData.nationality,
        birthDeathYears: formData.birthDeathYears,
        primaryGenre: formData.primaryGenre,
        bio: formData.bio,
        totalTitles: Number(formData.totalTitles) || titlesArray.length || 1,
        popularityIndex: Number(formData.popularityIndex) || 85,
        linkedTitles: titlesArray,
        status: formData.status,
      };
      setAuthors((prev) => [newAuthor, ...prev]);
      toast.success(`Added ${newAuthor.name} to author authority index`);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] uppercase tracking-widest text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800/40">
              Bibliographic Authority Control
            </span>
          </div>
          <h1 className="font-serif-editorial text-3xl md:text-4xl font-bold text-foreground tracking-tight">
            Author Authority Records
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl font-sans">
            Manage canonical author files, Library of Congress control identifiers, biographical notes, and circulation popularity indices.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-foreground text-background dark:bg-amber-500 dark:text-slate-950 font-bold text-sm shadow-md hover:opacity-90 transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Author Record
        </button>
      </div>

      {/* ── Metric Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-card border border-border hairline-card metric-amber">
          <div className="flex items-center justify-between mb-2">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Authority Files
            </p>
            <PenLine className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-foreground">{totalAuthors}</p>
          <p className="text-xs text-muted-foreground mt-1">Verified creator entities</p>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border hairline-card metric-blue">
          <div className="flex items-center justify-between mb-2">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Cataloged Titles
            </p>
            <BookMarked className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-foreground">{totalTitlesAcrossCollection}</p>
          <p className="text-xs text-muted-foreground mt-1">Linked physical holdings</p>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border hairline-card metric-green">
          <div className="flex items-center justify-between mb-2">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Avg Popularity
            </p>
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-foreground">{avgPopularity} / 100</p>
          <p className="text-xs text-muted-foreground mt-1">Circulation index average</p>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border hairline-card metric-purple">
          <div className="flex items-center justify-between mb-2">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Provenance &amp; Nations
            </p>
            <Globe className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-foreground">{distinctNations} Nations</p>
          <p className="text-xs text-muted-foreground mt-1">Global literary traditions</p>
        </div>
      </div>

      {/* ── Search & Filter Controls ── */}
      <div className="p-4 rounded-2xl bg-card border border-border hairline-card flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search author name, LCCN ID, nationality, or title..."
            className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-muted/40 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Nationality Dropdown */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Filter className="w-3.5 h-3.5 hidden sm:inline" />
            <select
              value={nationalityFilter}
              onChange={(e) => setNationalityFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-muted/40 border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
            >
              <option value="ALL">All Nationalities</option>
              {nationalities.map((nat) => (
                <option key={nat} value={nat}>
                  {nat}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-muted/40 border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
          >
            <option value="popularity">Sort by: Circulation Popularity</option>
            <option value="titles">Sort by: Collection Titles</option>
            <option value="name">Sort by: Alphabetical (A-Z)</option>
          </select>
        </div>
      </div>

      {/* ── Authors Table ── */}
      <div className="bg-card border border-border rounded-3xl overflow-hidden hairline-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                <th className="th-cell">Author Authority Record</th>
                <th className="th-cell">Nationality &amp; Period</th>
                <th className="th-cell">Linked Catalog Titles</th>
                <th className="th-cell text-center">Collection Vol.</th>
                <th className="th-cell text-center">Popularity Index</th>
                <th className="th-cell text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {processedAuthors.map((author) => (
                <tr
                  key={author.id}
                  className="hover:bg-muted/30 transition-colors group cursor-default"
                >
                  {/* Name, Authority LCCN, and Bio */}
                  <td className="td-cell max-w-sm">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setInspectingAuthor(author)}
                          className="font-serif-editorial text-sm sm:text-base font-bold text-foreground hover:underline text-left"
                        >
                          {author.name}
                        </button>
                        <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          {author.status}
                        </span>
                      </div>

                      <p className="font-mono text-[10px] text-muted-foreground tracking-wider">
                        {author.authorityId}
                      </p>

                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                        {author.bio}
                      </p>
                    </div>
                  </td>

                  {/* Nationality & Period */}
                  <td className="td-cell">
                    <div className="space-y-1">
                      <span className="inline-flex items-center gap-1 font-semibold text-xs text-foreground">
                        <Globe className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                        {author.nationality}
                      </span>
                      <p className="font-mono text-[10px] text-muted-foreground">
                        {author.birthDeathYears}
                      </p>
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-muted/60 text-muted-foreground border border-border/50">
                        {author.primaryGenre}
                      </span>
                    </div>
                  </td>

                  {/* Linked Titles Preview */}
                  <td className="td-cell max-w-xs">
                    <div className="flex flex-wrap gap-1.5">
                      {author.linkedTitles && author.linkedTitles.length > 0 ? (
                        author.linkedTitles.slice(0, 3).map((title, i) => (
                          <span
                            key={i}
                            className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-muted/40 border border-border/60 text-foreground truncate max-w-[170px]"
                            title={title}
                          >
                            {title}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground italic">
                          No titles linked yet
                        </span>
                      )}
                      {author.linkedTitles?.length > 3 && (
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                          +{author.linkedTitles.length - 3} more
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Total Titles Count */}
                  <td className="td-cell text-center">
                    <span className="font-mono text-xs font-bold text-foreground bg-muted/50 px-2.5 py-1 rounded-lg border border-border/60">
                      {author.totalTitles}
                    </span>
                  </td>

                  {/* Popularity Index */}
                  <td className="td-cell text-center">
                    <div className="inline-flex items-center gap-1 font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                      <Flame className="w-3 h-3 text-amber-500" />
                      {author.popularityIndex}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="td-cell text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setInspectingAuthor(author)}
                        title="View Full Dossier"
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(author)}
                        title="Edit Authority Record"
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(author)}
                        title="Delete Record"
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Authority Detail Dossier Modal / Drawer ── */}
      <AnimatePresence>
        {inspectingAuthor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-card border border-border w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden hairline-card"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-muted/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-serif-editorial font-bold text-lg">
                    {inspectingAuthor.name[0]}
                  </div>
                  <div>
                    <h2 className="font-serif-editorial text-xl font-bold text-foreground">
                      {inspectingAuthor.name}
                    </h2>
                    <p className="font-mono text-xs text-muted-foreground">
                      {inspectingAuthor.authorityId}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setInspectingAuthor(null)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5">
                {/* Meta stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-muted/30 border border-border/60">
                    <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                      Nationality
                    </p>
                    <p className="text-xs font-bold text-foreground mt-0.5">
                      {inspectingAuthor.nationality}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/30 border border-border/60">
                    <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                      Chronology
                    </p>
                    <p className="text-xs font-bold text-foreground mt-0.5">
                      {inspectingAuthor.birthDeathYears}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/30 border border-border/60">
                    <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                      Popularity
                    </p>
                    <p className="text-xs font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                      {inspectingAuthor.popularityIndex} / 100
                    </p>
                  </div>
                </div>

                {/* Genre */}
                <div>
                  <h4 className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                    Primary Movement &amp; Genre
                  </h4>
                  <p className="text-xs font-semibold text-foreground">
                    {inspectingAuthor.primaryGenre}
                  </p>
                </div>

                {/* Biography */}
                <div>
                  <h4 className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                    Biographical Dossier
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed p-3.5 rounded-2xl bg-muted/20 border border-border/50">
                    {inspectingAuthor.bio}
                  </p>
                </div>

                {/* Linked Titles */}
                <div>
                  <h4 className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
                    Collection Catalog Titles ({inspectingAuthor.totalTitles} Total)
                  </h4>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {inspectingAuthor.linkedTitles?.map((title, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-muted/30 border border-border/60 text-xs font-medium text-foreground"
                      >
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                          <span>{title}</span>
                        </div>
                        <span className="font-mono text-[9px] text-muted-foreground uppercase">
                          In Collection
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                  <button
                    onClick={() => {
                      const curr = inspectingAuthor;
                      setInspectingAuthor(null);
                      handleOpenEdit(curr);
                    }}
                    className="px-4 py-2 text-xs font-semibold rounded-xl border border-border hover:bg-muted transition-colors text-foreground flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit Authority
                  </button>
                  <button
                    onClick={() => setInspectingAuthor(null)}
                    className="px-5 py-2 text-xs font-bold rounded-xl bg-foreground text-background dark:bg-amber-500 dark:text-slate-950 hover:opacity-90 transition-all cursor-pointer"
                  >
                    Close Dossier
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Add / Edit Author Modal with Quick Lookup ── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-card border border-border w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden hairline-card"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/20">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                    <PenLine className="w-4 h-4" />
                  </div>
                  <h2 className="font-serif-editorial text-lg font-bold text-foreground">
                    {editingAuthor ? 'Edit Author Authority' : 'Add Author Record'}
                  </h2>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmitForm} className="p-6 space-y-4">
                {/* Quick Lookup Bar */}
                {!editingAuthor && (
                  <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-amber-800 dark:text-amber-300">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        Quick Authority Lookup (Library of Congress / VIAF)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={lookupQuery}
                        onChange={(e) => setLookupQuery(e.target.value)}
                        placeholder="Try 'Gabriel García Márquez', 'Virginia Woolf'..."
                        className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                      />
                      <button
                        type="button"
                        onClick={handleExecuteLookup}
                        disabled={isLookingUp}
                        className="px-3 py-1.5 text-xs font-bold rounded-xl bg-amber-600 hover:bg-amber-700 text-white transition-all shrink-0 cursor-pointer"
                      >
                        {isLookingUp ? 'Querying...' : 'Auto-Fill'}
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Author Canonical Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="e.g. Gabriel García Márquez"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-muted/40 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      LCCN Authority Identifier
                    </label>
                    <input
                      type="text"
                      value={formData.authorityId}
                      onChange={(e) =>
                        setFormData({ ...formData, authorityId: e.target.value })
                      }
                      placeholder="e.g. LCCN-n79021389"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-muted/40 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Nationality *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nationality}
                      onChange={(e) =>
                        setFormData({ ...formData, nationality: e.target.value })
                      }
                      placeholder="e.g. Colombian"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-muted/40 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Birth / Death Years
                    </label>
                    <input
                      type="text"
                      value={formData.birthDeathYears}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          birthDeathYears: e.target.value,
                        })
                      }
                      placeholder="1927 – 2014"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-muted/40 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Popularity Index (0-100)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.popularityIndex}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          popularityIndex: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl bg-muted/40 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Primary Movement / Genre
                  </label>
                  <input
                    type="text"
                    value={formData.primaryGenre}
                    onChange={(e) =>
                      setFormData({ ...formData, primaryGenre: e.target.value })
                    }
                    placeholder="e.g. Magical Realism & Latin American Fiction"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-muted/40 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Biographical Scope &amp; Significance
                  </label>
                  <textarea
                    rows={2}
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                    placeholder="Major awards, literary influences, and historical significance..."
                    className="w-full px-3 py-2 text-xs rounded-xl bg-muted/40 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Linked Catalog Titles (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.linkedTitlesStr}
                    onChange={(e) =>
                      setFormData({ ...formData, linkedTitlesStr: e.target.value })
                    }
                    placeholder="One Hundred Years of Solitude, Love in the Time of Cholera..."
                    className="w-full px-3 py-2 text-xs rounded-xl bg-muted/40 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
                  />
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold rounded-xl border border-border hover:bg-muted transition-colors text-muted-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold rounded-xl bg-foreground text-background dark:bg-amber-500 dark:text-slate-950 hover:opacity-90 transition-all shadow-sm cursor-pointer"
                  >
                    {editingAuthor ? 'Save Changes' : 'Confirm Authority File'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminAuthors;
