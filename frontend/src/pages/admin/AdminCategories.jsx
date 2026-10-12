import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers,
  FolderTree,
  List,
  Search,
  Plus,
  Edit2,
  Trash2,
  ChevronRight,
  ChevronDown,
  BookOpen,
  MapPin,
  Tag,
  Hash,
  Filter,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  X,
  Bookmark,
  Folder,
  FolderOpen
} from 'lucide-react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

/* ── Comprehensive Dewey Decimal Hierarchy Initial Data ── */
const INITIAL_CATEGORIES = [
  {
    id: 'cat-000',
    prefix: '000–099',
    name: 'Computer Science, Information & General Works',
    parentId: null,
    shelfLocation: 'Wing B - 3rd Floor - Stacks 1-4',
    bookCount: 684,
    description: 'Algorithms, data architectures, artificial intelligence, library sciences, and encyclopedic compendiums.',
    color: 'emerald',
    children: [
      {
        id: 'cat-004',
        prefix: '004',
        name: 'Data Processing & Computer Systems',
        parentId: 'cat-000',
        shelfLocation: 'Wing B - 3rd Floor - Stack 1',
        bookCount: 240,
        description: 'Computer hardware architecture, distributed systems, networks, and cloud infrastructure.',
      },
      {
        id: 'cat-005',
        prefix: '005',
        name: 'Computer Programming, Programs & Data',
        parentId: 'cat-000',
        shelfLocation: 'Wing B - 3rd Floor - Stack 2',
        bookCount: 310,
        description: 'Software engineering, algorithms, compilers, programming paradigms, and cybersecurity.',
      },
      {
        id: 'cat-006',
        prefix: '006',
        name: 'Artificial Intelligence & Neural Computation',
        parentId: 'cat-000',
        shelfLocation: 'Wing B - 3rd Floor - Stack 3',
        bookCount: 134,
        description: 'Machine learning, generative models, cognitive computing, and computer vision.',
      },
    ],
  },
  {
    id: 'cat-100',
    prefix: '100–199',
    name: 'Philosophy & Psychology',
    parentId: null,
    shelfLocation: 'West Wing - 2nd Floor - Stacks 5-7',
    bookCount: 420,
    description: 'Metaphysics, epistemology, moral philosophy, logic, cognitive psychology, and psychoanalysis.',
    color: 'indigo',
    children: [
      {
        id: 'cat-110',
        prefix: '110',
        name: 'Metaphysics & Ontology',
        parentId: 'cat-100',
        shelfLocation: 'West Wing - 2nd Floor - Stack 5',
        bookCount: 125,
        description: 'Nature of reality, existence, space-time theory, and causation.',
      },
      {
        id: 'cat-150',
        prefix: '150',
        name: 'Psychology & Behavioral Sciences',
        parentId: 'cat-100',
        shelfLocation: 'West Wing - 2nd Floor - Stack 6',
        bookCount: 195,
        description: 'Cognitive models, developmental psychology, and emotional dynamics.',
      },
      {
        id: 'cat-170',
        prefix: '170',
        name: 'Ethics & Moral Philosophy',
        parentId: 'cat-100',
        shelfLocation: 'West Wing - 2nd Floor - Stack 7',
        bookCount: 100,
        description: 'Normative ethics, bioethics, social justice frameworks, and virtue traditions.',
      },
    ],
  },
  {
    id: 'cat-300',
    prefix: '300–399',
    name: 'Social Sciences & Jurisprudence',
    parentId: null,
    shelfLocation: 'Central Gallery - 1st Floor - Stacks 8-12',
    bookCount: 512,
    description: 'Sociology, political theory, macroeconomic analysis, constitutional jurisprudence, and public policy.',
    color: 'blue',
    children: [
      {
        id: 'cat-320',
        prefix: '320',
        name: 'Political Science & Statecraft',
        parentId: 'cat-300',
        shelfLocation: 'Central Gallery - 1st Floor - Stack 9',
        bookCount: 180,
        description: 'Comparative politics, governance systems, international diplomacy, and state institutions.',
      },
      {
        id: 'cat-330',
        prefix: '330',
        name: 'Economics & Trade Systems',
        parentId: 'cat-300',
        shelfLocation: 'Central Gallery - 1st Floor - Stack 10',
        bookCount: 212,
        description: 'Micro/macroeconomic theory, fiscal policies, banking history, and market mechanics.',
      },
      {
        id: 'cat-340',
        prefix: '340',
        name: 'Law & International Treaties',
        parentId: 'cat-300',
        shelfLocation: 'Central Gallery - 1st Floor - Stack 11',
        bookCount: 120,
        description: 'Civil and common law, criminal justice doctrines, and maritime treaties.',
      },
    ],
  },
  {
    id: 'cat-500',
    prefix: '500–599',
    name: 'Pure Sciences & Mathematics',
    parentId: null,
    shelfLocation: 'Science Wing - 4th Floor - Stacks 13-18',
    bookCount: 640,
    description: 'Theoretical physics, organic chemistry, astrophysics, evolutionary biology, and topology.',
    color: 'teal',
    children: [
      {
        id: 'cat-510',
        prefix: '510',
        name: 'Mathematics & Analysis',
        parentId: 'cat-500',
        shelfLocation: 'Science Wing - 4th Floor - Stack 13',
        bookCount: 220,
        description: 'Calculus, linear algebra, number theory, and differential geometry.',
      },
      {
        id: 'cat-530',
        prefix: '530',
        name: 'Physics & Quantum Mechanics',
        parentId: 'cat-500',
        shelfLocation: 'Science Wing - 4th Floor - Stack 15',
        bookCount: 260,
        description: 'Classical mechanics, general relativity, quantum electrodynamics, and astrophysics.',
      },
      {
        id: 'cat-570',
        prefix: '570',
        name: 'Biology & Genetics',
        parentId: 'cat-500',
        shelfLocation: 'Science Wing - 4th Floor - Stack 17',
        bookCount: 160,
        description: 'Molecular biology, genomics, ecology, and evolutionary anthropology.',
      },
    ],
  },
  {
    id: 'cat-800',
    prefix: '800–899',
    name: 'Literature & Rhetoric',
    parentId: null,
    shelfLocation: 'Rotunda Reading Hall - Ground Floor - Stacks 19-28',
    bookCount: 1250,
    description: 'Poetry, drama, classical epics, modernist fiction, literary criticism, and comparative prose.',
    color: 'amber',
    children: [
      {
        id: 'cat-810',
        prefix: '810',
        name: 'American Literature & Poetry',
        parentId: 'cat-800',
        shelfLocation: 'Rotunda Reading Hall - Stacks 19-21',
        bookCount: 410,
        description: 'Colonial essays, Transcendentalist treatises, 20th-century Southern Gothic, and postmodern verse.',
      },
      {
        id: 'cat-820',
        prefix: '820',
        name: 'English & Anglo-Saxon Literature',
        parentId: 'cat-800',
        shelfLocation: 'Rotunda Reading Hall - Stacks 22-24',
        bookCount: 520,
        description: 'Shakespearean folios, Victorian novels, Romantic poets, and British modernism.',
      },
      {
        id: 'cat-830',
        prefix: '830',
        name: 'German & Continental Literature',
        parentId: 'cat-800',
        shelfLocation: 'Rotunda Reading Hall - Stacks 25-26',
        bookCount: 180,
        description: 'Weimar classicism, German romantic prose, and existential fiction.',
      },
      {
        id: 'cat-891',
        prefix: '891',
        name: 'Indo-Iranian & South Asian Literature',
        parentId: 'cat-800',
        shelfLocation: 'Rotunda Reading Hall - Stack 27',
        bookCount: 140,
        description: 'Classical Sanskrit epics, Urdu poetry (Ghazals), and contemporary South Asian novels.',
      },
    ],
  },
  {
    id: 'cat-900',
    prefix: '900–999',
    name: 'History, Geography & Biography',
    parentId: null,
    shelfLocation: 'East Archival Wing - 2nd Floor - Stacks 29-35',
    bookCount: 890,
    description: 'Ancient civilizations, medieval chronologies, cartography, war histories, and authoritative memoirs.',
    color: 'rose',
    children: [
      {
        id: 'cat-930',
        prefix: '930',
        name: 'History of Ancient World to ca. 499',
        parentId: 'cat-900',
        shelfLocation: 'East Archival Wing - 2nd Floor - Stack 29',
        bookCount: 290,
        description: 'Mesopotamian tablets, Classical Greco-Roman treatises, and Han Dynasty histories.',
      },
      {
        id: 'cat-940',
        prefix: '940',
        name: 'History of Modern Europe',
        parentId: 'cat-900',
        shelfLocation: 'East Archival Wing - 2nd Floor - Stack 31',
        bookCount: 340,
        description: 'Renaissance statecraft, Industrial Revolution, World Wars, and European integration.',
      },
      {
        id: 'cat-950',
        prefix: '950',
        name: 'History of Asia & the Orient',
        parentId: 'cat-900',
        shelfLocation: 'East Archival Wing - 2nd Floor - Stack 33',
        bookCount: 260,
        description: 'Silk Road chronicles, Mughal era treatises, and East Asian dynastic records.',
      },
    ],
  },
];

const COLOR_MAP = {
  emerald: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60',
  indigo: 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/60',
  blue: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60',
  teal: 'bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800/60',
  amber: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60',
  rose: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60',
};

const AdminCategories = () => {
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('tree'); // 'tree' | 'table'
  const [expandedNodes, setExpandedNodes] = useState({
    'cat-000': true,
    'cat-800': true,
  });

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    prefix: '',
    parentId: '',
    shelfLocation: 'Wing B - 3rd Floor - Stack 1',
    bookCount: 0,
    description: '',
  });

  // Flattened list for table view and parent select
  const flatCategories = useMemo(() => {
    const list = [];
    categories.forEach((parent) => {
      list.push({ ...parent, isTopLevel: true, parentName: '— None (Main Class) —' });
      if (parent.children) {
        parent.children.forEach((child) => {
          list.push({ ...child, isTopLevel: false, parentName: parent.name });
        });
      }
    });
    return list;
  }, [categories]);

  // Derived metrics
  const totalMainClasses = categories.length;
  const totalSubclasses = categories.reduce((sum, c) => sum + (c.children?.length || 0), 0);
  const totalCatalogedBooks = flatCategories.reduce((sum, c) => sum + c.bookCount, 0);
  const distinctShelvesCount = new Set(flatCategories.map((c) => c.shelfLocation.split(' - ')[0])).size;

  // Filtered flat list for search
  const filteredFlatList = useMemo(() => {
    if (!searchQuery.trim()) return flatCategories;
    const q = searchQuery.toLowerCase();
    return flatCategories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.prefix.toLowerCase().includes(q) ||
        c.shelfLocation.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q)
    );
  }, [flatCategories, searchQuery]);

  // Toggle tree node expansion
  const toggleNode = (nodeId) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }));
  };

  // Expand all / Collapse all
  const handleExpandAll = () => {
    const all = {};
    categories.forEach((c) => {
      all[c.id] = true;
    });
    setExpandedNodes(all);
  };

  const handleCollapseAll = () => {
    setExpandedNodes({});
  };

  // Open Add Modal
  const handleOpenAdd = (presetParentId = '') => {
    setEditingCategory(null);
    setFormData({
      name: '',
      prefix: '',
      parentId: presetParentId,
      shelfLocation: 'Wing B - 3rd Floor - Stack 4',
      bookCount: 0,
      description: '',
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (item) => {
    setEditingCategory(item);
    setFormData({
      name: item.name,
      prefix: item.prefix,
      parentId: item.parentId || '',
      shelfLocation: item.shelfLocation,
      bookCount: item.bookCount,
      description: item.description || '',
    });
    setIsModalOpen(true);
  };

  // Delete Category
  const handleDelete = async (category) => {
    if (category.bookCount > 0) {
      const confirm = await Swal.fire({
        title: `Category contains ${category.bookCount} volumes!`,
        text: `Are you certain you wish to remove classification "${category.prefix} ${category.name}"? Cataloged titles will become unclassified.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'Yes, remove',
        background: document.documentElement.classList.contains('dark') ? '#0f172a' : '#fff',
        color: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
      });
      if (!confirm.isConfirmed) return;
    }

    // Process deletion
    if (category.parentId) {
      // It is a child
      setCategories((prev) =>
        prev.map((parent) => {
          if (parent.id === category.parentId) {
            return {
              ...parent,
              children: (parent.children || []).filter((c) => c.id !== category.id),
            };
          }
          return parent;
        })
      );
    } else {
      // It is a parent
      setCategories((prev) => prev.filter((p) => p.id !== category.id));
    }

    toast.success(`Removed classification ${category.prefix}`);
  };

  // Save Add/Edit
  const handleSubmitForm = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.prefix.trim()) {
      toast.error('Category name and Dewey call number prefix are required.');
      return;
    }

    if (editingCategory) {
      // Update logic
      if (editingCategory.parentId) {
        setCategories((prev) =>
          prev.map((parent) => {
            if (parent.id === editingCategory.parentId) {
              return {
                ...parent,
                children: (parent.children || []).map((c) =>
                  c.id === editingCategory.id ? { ...c, ...formData } : c
                ),
              };
            }
            return parent;
          })
        );
      } else {
        setCategories((prev) =>
          prev.map((parent) =>
            parent.id === editingCategory.id
              ? { ...parent, ...formData }
              : parent
          )
        );
      }
      toast.success(`Updated classification: ${formData.prefix} ${formData.name}`);
    } else {
      // Add logic
      const newId = `cat-${Date.now().toString().slice(-4)}`;
      const newCategory = {
        id: newId,
        prefix: formData.prefix,
        name: formData.name,
        parentId: formData.parentId || null,
        shelfLocation: formData.shelfLocation,
        bookCount: Number(formData.bookCount) || 0,
        description: formData.description,
      };

      if (formData.parentId) {
        // Append as child
        setCategories((prev) =>
          prev.map((parent) => {
            if (parent.id === formData.parentId) {
              return {
                ...parent,
                children: [...(parent.children || []), newCategory],
              };
            }
            return parent;
          })
        );
        // Expand the parent so user sees the new child immediately
        setExpandedNodes((prev) => ({ ...prev, [formData.parentId]: true }));
      } else {
        // Create as new top-level classification
        setCategories((prev) => [
          ...prev,
          { ...newCategory, color: 'amber', children: [] },
        ]);
      }

      toast.success(`Registered new classification ${newCategory.prefix}`);
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
              Bibliographic Taxonomy
            </span>
          </div>
          <h1 className="font-serif-editorial text-3xl md:text-4xl font-bold text-foreground tracking-tight">
            Subject Classifications &amp; Dewey Hierarchy
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl font-sans">
            Manage institutional subject taxonomy, Dewey Decimal call number ranges, stack shelf allocations, and bibliographic volume counts.
          </p>
        </div>

        <button
          onClick={() => handleOpenAdd('')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-foreground text-background dark:bg-amber-500 dark:text-slate-950 font-bold text-sm shadow-md hover:opacity-90 transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          New Category
        </button>
      </div>

      {/* ── Top Metric Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-card border border-border hairline-card metric-amber">
          <div className="flex items-center justify-between mb-2">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Main Dewey Classes
            </p>
            <FolderTree className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-foreground">{totalMainClasses}</p>
          <p className="text-xs text-muted-foreground mt-1">Foundational divisions</p>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border hairline-card metric-blue">
          <div className="flex items-center justify-between mb-2">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Active Subclasses
            </p>
            <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-foreground">{totalSubclasses}</p>
          <p className="text-xs text-muted-foreground mt-1">Granular subject branches</p>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border hairline-card metric-green">
          <div className="flex items-center justify-between mb-2">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Cataloged Titles
            </p>
            <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-foreground">
            {totalCatalogedBooks.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Shelved bibliographic items</p>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border hairline-card metric-purple">
          <div className="flex items-center justify-between mb-2">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Stack Sectors
            </p>
            <MapPin className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-foreground">{distinctShelvesCount} Wings</p>
          <p className="text-xs text-muted-foreground mt-1">Physical wing allocations</p>
        </div>
      </div>

      {/* ── Search Bar & View Mode Switcher ── */}
      <div className="p-4 rounded-2xl bg-card border border-border hairline-card flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Dewey prefix, subject, or shelf location..."
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

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {viewMode === 'tree' && (
            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={handleExpandAll}
                className="text-muted-foreground hover:text-foreground underline cursor-pointer text-xs"
              >
                Expand All
              </button>
              <span className="text-muted-foreground/40">•</span>
              <button
                onClick={handleCollapseAll}
                className="text-muted-foreground hover:text-foreground underline cursor-pointer text-xs"
              >
                Collapse All
              </button>
            </div>
          )}

          {/* View Toggle */}
          <div className="flex items-center border border-border rounded-xl p-0.5 bg-muted/30">
            <button
              onClick={() => setViewMode('tree')}
              title="Tree Hierarchy View"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'tree'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <FolderTree className="w-3.5 h-3.5" />
              Tree View
            </button>
            <button
              onClick={() => setViewMode('table')}
              title="Flat Table View"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'table'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              Table View
            </button>
          </div>
        </div>
      </div>

      {/* ── Main View Content ── */}
      {viewMode === 'tree' ? (
        /* ── DEWEY TREE VIEW ── */
        <div className="space-y-4">
          {categories.map((parent) => {
            const isExpanded = Boolean(expandedNodes[parent.id]);
            const badgeClass = COLOR_MAP[parent.color] || COLOR_MAP.amber;

            return (
              <div
                key={parent.id}
                className="bg-card border border-border rounded-3xl overflow-hidden hairline-card transition-all"
              >
                {/* Main Class Bar */}
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/20 border-b border-border/50">
                  <div className="flex items-start sm:items-center gap-3">
                    <button
                      onClick={() => toggleNode(parent.id)}
                      className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors mt-0.5 sm:mt-0 cursor-pointer"
                      title={isExpanded ? 'Collapse subcategories' : 'Expand subcategories'}
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`font-mono text-xs font-bold px-2.5 py-0.5 rounded-md border ${badgeClass}`}
                        >
                          {parent.prefix}
                        </span>
                        <h3 className="font-serif-editorial text-base sm:text-lg font-bold text-foreground">
                          {parent.name}
                        </h3>
                        <span className="font-mono text-[10px] text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                          {parent.children?.length || 0} subclasses
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1.5">
                        <span className="flex items-center gap-1 font-mono text-[11px]">
                          <MapPin className="w-3.5 h-3.5 text-muted-foreground/70" />
                          {parent.shelfLocation}
                        </span>
                        <span>•</span>
                        <span className="font-mono text-[11px] font-semibold text-foreground">
                          {parent.bookCount.toLocaleString()} volumes
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions for Parent Class */}
                  <div className="flex items-center gap-1 self-end sm:self-auto">
                    <button
                      onClick={() => handleOpenAdd(parent.id)}
                      title="Add subclass under this Dewey category"
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Subclass
                    </button>
                    <button
                      onClick={() => handleOpenEdit(parent)}
                      title="Edit Category"
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(parent)}
                      title="Delete Category"
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Subclass Children Accordion */}
                <AnimatePresence>
                  {isExpanded && parent.children && parent.children.length > 0 && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="divide-y divide-border/40 pl-6 sm:pl-10 pr-4 py-2 bg-card"
                    >
                      {parent.children.map((child) => (
                        <div
                          key={child.id}
                          className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-muted/30 -ml-2 -mr-2 px-3 rounded-xl transition-colors group"
                        >
                          <div className="flex items-start gap-3">
                            <span className="font-mono text-xs font-bold text-foreground bg-muted/60 px-2 py-0.5 rounded border border-border/70 shrink-0 mt-0.5">
                              {child.prefix}
                            </span>
                            <div>
                              <p className="text-sm font-bold text-foreground leading-snug">
                                {child.name}
                              </p>
                              {child.description && (
                                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                                  {child.description}
                                </p>
                              )}
                              <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-muted-foreground mt-1">
                                <span className="flex items-center gap-1 font-mono text-[10px]">
                                  <MapPin className="w-3 h-3 text-muted-foreground/70" />
                                  {child.shelfLocation}
                                </span>
                                <span>•</span>
                                <span className="font-mono text-[10px] font-semibold text-foreground">
                                  {child.bookCount} items
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity self-end sm:self-auto">
                            <button
                              onClick={() => handleOpenEdit(child)}
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                              title="Edit Subclass"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(child)}
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                              title="Delete Subclass"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── TABLE VIEW ── */
        <div className="bg-card border border-border rounded-3xl overflow-hidden hairline-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  <th className="th-cell w-28">Call Prefix</th>
                  <th className="th-cell">Subject Classification</th>
                  <th className="th-cell">Parent Tier</th>
                  <th className="th-cell">Shelf Location Tag</th>
                  <th className="th-cell text-right">Holdings</th>
                  <th className="th-cell text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredFlatList.map((cat) => (
                  <tr
                    key={cat.id}
                    className="hover:bg-muted/30 transition-colors group"
                  >
                    <td className="td-cell">
                      <span className="font-mono text-xs font-bold text-foreground bg-muted/60 px-2 py-0.5 rounded border border-border/70">
                        {cat.prefix}
                      </span>
                    </td>
                    <td className="td-cell">
                      <p className="font-bold text-sm text-foreground">{cat.name}</p>
                      {cat.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1 max-w-md mt-0.5">
                          {cat.description}
                        </p>
                      )}
                    </td>
                    <td className="td-cell">
                      <span className="font-mono text-xs text-muted-foreground">
                        {cat.parentName}
                      </span>
                    </td>
                    <td className="td-cell">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
                        <span className="font-mono text-[11px] truncate max-w-[200px]">
                          {cat.shelfLocation}
                        </span>
                      </div>
                    </td>
                    <td className="td-cell text-right">
                      <span className="font-mono text-xs font-bold text-foreground">
                        {cat.bookCount.toLocaleString()}
                      </span>
                    </td>
                    <td className="td-cell text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(cat)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                          title="Edit Classification"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                          title="Delete Classification"
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
      )}

      {/* ── New / Edit Category Modal ── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-card border border-border w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden hairline-card"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/20">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                    <Layers className="w-4 h-4" />
                  </div>
                  <h2 className="font-serif-editorial text-lg font-bold text-foreground">
                    {editingCategory ? 'Edit Classification' : 'New Classification'}
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
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Dewey Prefix *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.prefix}
                      onChange={(e) =>
                        setFormData({ ...formData, prefix: e.target.value })
                      }
                      placeholder="e.g. 823.91"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-muted/40 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Classification Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="e.g. Modernist English Prose"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-muted/40 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Parent Tier (Hierarchy)
                    </label>
                    <select
                      value={formData.parentId}
                      onChange={(e) =>
                        setFormData({ ...formData, parentId: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl bg-muted/40 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
                    >
                      <option value="">— None (Top-Level Main Class) —</option>
                      {categories.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.prefix} {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Holdings Book Count
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.bookCount}
                      onChange={(e) =>
                        setFormData({ ...formData, bookCount: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl bg-muted/40 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Physical Stack Location Tag *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.shelfLocation}
                    onChange={(e) =>
                      setFormData({ ...formData, shelfLocation: e.target.value })
                    }
                    placeholder="e.g. Wing B - 3rd Floor - Stacks 14-16"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-muted/40 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Bibliographic Scope Description
                  </label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Subject parameters, historical range, and classification notes..."
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
                    {editingCategory ? 'Save Classification' : 'Create Category'}
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

export default AdminCategories;
