import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, BookOpen, Compass, Layers, MapPin,
  ArrowRight, X, ExternalLink, Library, ShieldCheck,
  ChevronRight, Sparkles, SlidersHorizontal, Info,
  CheckCircle2, Building, Eye, Bookmark
} from 'lucide-react';

const curatedThemes = [
  {
    id: 'philosophy',
    title: 'Philosophy & Dialectics',
    subtitle: 'From Pre-Socratic Inquiries to Contemporary Metaphysics',
    deweyRange: 'DEWEY 100 – 199',
    iconName: 'Compass',
    volumeCount: 5420,
    accentColor: '#d97706',
    shelfLocation: {
      wing: 'North Wing (Socrates Pavilion)',
      floor: 'Floor 2 (Western Promenade)',
      aisle: 'Aisles 12-A through 15-D',
      callPrefix: '100.PH',
      zoneColor: 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400'
    },
    description: 'A foundational assembly of classical epistemic investigations, moral philosophy, stoic personal records, existentialist journals, and analytic logic treatises spanning two and a half millennia.',
    keySubtopics: ['Stoicism & Roman Ethics', 'Epistemology & Theory of Knowledge', 'German Idealism', 'Existentialism & Phenomenology', 'Formal Symbolic Logic'],
    featuredTitles: [
      { title: 'Meditations', author: 'Marcus Aurelius', year: 'c. 175 CE', callNumber: 'DEWEY 188.A9', copies: 6 },
      { title: 'Critique of Pure Reason', author: 'Immanuel Kant', year: '1781', callNumber: 'DEWEY 121.K1', copies: 4 },
      { title: 'Tractatus Logico-Philosophicus', author: 'Ludwig Wittgenstein', year: '1921', callNumber: 'DEWEY 160.W8', copies: 3 },
      { title: 'Being and Time', author: 'Martin Heidegger', year: '1927', callNumber: 'DEWEY 111.H4', copies: 2 }
    ]
  },
  {
    id: 'classical-literature',
    title: 'Classical Literature & Epics',
    subtitle: 'Greco-Roman Mythology, Sagas & Foundational Canons',
    deweyRange: 'DEWEY 870 – 889',
    iconName: 'BookOpen',
    volumeCount: 6810,
    accentColor: '#9333ea',
    shelfLocation: {
      wing: 'East Wing (Humanities Gallery)',
      floor: 'Floor 1 (Grand Hall Stacks)',
      aisle: 'Aisles 04-A through 07-C',
      callPrefix: '870.CL',
      zoneColor: 'border-purple-500/40 bg-purple-500/10 text-purple-700 dark:text-purple-400'
    },
    description: 'Preserved poetic meters, tragic theater manuscripts, Homeric hexameters, Latin satires, and bilingual Loeb Classical editions alongside facsimile copies of early Renaissance incunabula.',
    keySubtopics: ['Homeric Epic Poetry', 'Attic Tragedy & Comedy', 'Virgilian Hexameters', 'Renaissance Bilingual Editions', 'Comparative Mythological Analysis'],
    featuredTitles: [
      { title: 'The Iliad & The Odyssey', author: 'Homer', year: 'c. 8th Cent. BCE', callNumber: 'DEWEY 883.01', copies: 8 },
      { title: 'The Aeneid', author: 'Virgil (Publius Vergilius Maro)', year: '19 BCE', callNumber: 'DEWEY 873.01', copies: 5 },
      { title: 'The Divine Comedy', author: 'Dante Alighieri', year: '1320', callNumber: 'DEWEY 851.15', copies: 4 },
      { title: 'Metamorphoses', author: 'Ovid', year: '8 CE', callNumber: 'DEWEY 873.01', copies: 3 }
    ]
  },
  {
    id: 'quantum-science',
    title: 'Quantum Science & Relativistic Physics',
    subtitle: 'Atomic Mechanics, Cosmological Field Theories & Electrodynamics',
    deweyRange: 'DEWEY 530 – 539',
    iconName: 'Sparkles',
    volumeCount: 4180,
    accentColor: '#2563eb',
    shelfLocation: {
      wing: 'South Wing (Newton & Maxwell Stacks)',
      floor: 'Floor 3 (Pure Sciences Atrium)',
      aisle: 'Aisles 22-A through 24-B',
      callPrefix: '530.QU',
      zoneColor: 'border-blue-500/40 bg-blue-500/10 text-blue-700 dark:text-blue-400'
    },
    description: 'Foundational 20th-century physics papers, seminar transcripts from the Solvay Conferences, original Feynman lecture editions, Dirac’s relativistic mechanics, and modern quantum computing literature.',
    keySubtopics: ['Wave Mechanics & Copenhagen Interpretation', 'General & Special Relativity', 'Quantum Electrodynamics', 'Condensed Matter Physics', 'Quantum Computing Architectures'],
    featuredTitles: [
      { title: 'The Feynman Lectures on Physics (3 Vols)', author: 'Richard P. Feynman', year: '1963', callNumber: 'DEWEY 530.F4', copies: 7 },
      { title: 'The Principles of Quantum Mechanics', author: 'P.A.M. Dirac', year: '1930', callNumber: 'DEWEY 530.12', copies: 3 },
      { title: 'The Meaning of Relativity', author: 'Albert Einstein', year: '1922', callNumber: 'DEWEY 530.11', copies: 4 },
      { title: 'Quantum Computation and Quantum Information', author: 'Nielsen & Chuang', year: '2000', callNumber: 'DEWEY 006.38', copies: 5 }
    ]
  },
  {
    id: 'rare-manuscripts',
    title: 'Rare Manuscripts & Incunabula',
    subtitle: 'Pre-1501 Western Printings, Illuminated Parchments & Folios',
    deweyRange: 'SPECIAL VAULT 090 – 099',
    iconName: 'ShieldCheck',
    volumeCount: 1420,
    accentColor: '#e11d48',
    shelfLocation: {
      wing: 'Special Archival Vault (Sub-Level 1)',
      floor: 'Sub-Level B (Climate Vault: 18°C, 45% RH)',
      aisle: 'Security Vault Enclosures 1 & 2',
      callPrefix: 'VAULT.INC',
      zoneColor: 'border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-400'
    },
    description: 'Our most carefully preserved collection: Gutenberg press trial impressions, 15th-century Venetian Aldine Press octavos, illuminated liturgical vellums, and handwritten scientific correspondence.',
    keySubtopics: ['Gutenberg Era Printings', 'Aldine Press Classics', 'Medieval Book of Hours Vellums', 'Early Scientific Epistolary', 'Deacidified Conservation Proofs'],
    featuredTitles: [
      { title: 'Aldine Aristotle: Organon (Editio Princeps)', author: 'Aristotle / Aldus Manutius', year: '1495', callNumber: 'VAULT-ALD-01', copies: 1 },
      { title: 'Nuremberg Chronicle (Liber Chronicarum)', author: 'Hartmann Schedel', year: '1493', callNumber: 'VAULT-NUR-02', copies: 1 },
      { title: 'Gutenberg Bible Leaf Facsimile & Provenance', author: 'Johannes Gutenberg', year: '1455', callNumber: 'VAULT-GUT-00', copies: 1 },
      { title: 'De Humani Corporis Fabrica', author: 'Andreas Vesalius', year: '1543', callNumber: 'VAULT-VES-01', copies: 1 }
    ]
  },
  {
    id: 'architectural-theory',
    title: 'Architectural Theory & Urbanism',
    subtitle: 'Vitruvian Treatises, Bauhaus Manifestos & Modern Spatial Form',
    deweyRange: 'DEWEY 720 – 729',
    iconName: 'Building',
    volumeCount: 3890,
    accentColor: '#059669',
    shelfLocation: {
      wing: 'West Wing (Vitruvius Hall)',
      floor: 'Floor 2 (Design & Built Environment)',
      aisle: 'Aisles 17-A through 19-C',
      callPrefix: '720.AR',
      zoneColor: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
    },
    description: 'Monographs, hand-drafted structural blueprints, Bauhaus workshop exercises, Le Corbusier manifestos, and urban planning compendia examining the physical geometry of human civilization.',
    keySubtopics: ['Vitruvian Proportions & Classical Orders', 'Bauhaus & Modernist Rationalism', 'Phenomenology of Architecture', 'Civic Urban Morphology', 'Structural Engineering Innovations'],
    featuredTitles: [
      { title: 'The Ten Books on Architecture (De Architectura)', author: 'Marcus Vitruvius Pollio', year: 'c. 15 BCE', callNumber: 'DEWEY 720.V8', copies: 4 },
      { title: 'Toward an Architecture (Vers une architecture)', author: 'Le Corbusier', year: '1923', callNumber: 'DEWEY 724.6', copies: 3 },
      { title: 'The Architecture of the City', author: 'Aldo Rossi', year: '1966', callNumber: 'DEWEY 711.4', copies: 2 },
      { title: 'Complexity and Contradiction in Architecture', author: 'Robert Venturi', year: '1966', callNumber: 'DEWEY 720.1', copies: 4 }
    ]
  },
  {
    id: 'computational-arts',
    title: 'Computational Arts & Generative Media',
    subtitle: 'Cybernetics, Algorithmic Aesthetics & Digital Typography',
    deweyRange: 'DEWEY 004 – 006 & 700.28',
    iconName: 'Layers',
    volumeCount: 3260,
    accentColor: '#0284c7',
    shelfLocation: {
      wing: 'Digital Commons (Turing Annex)',
      floor: 'Floor 1 (North-East Gallery)',
      aisle: 'Aisles 02-B through 03-D',
      callPrefix: '006.ART',
      zoneColor: 'border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-400'
    },
    description: 'Literature at the intersection of coding and aesthetics: early plotter graphics manuals, ASCII telecommunications archives, algorithmic music composition scores, and digital typographic standards.',
    keySubtopics: ['Early Cybernetic Art (1960s–70s)', 'Digital Typography & PostScript Evolution', 'Algorithmic Composition & Synthesis', 'Generative Adversarial Design', 'Digital Media Preservation'],
    featuredTitles: [
      { title: 'Cybernetics: Or Control and Communication in Animal and Machine', author: 'Norbert Wiener', year: '1948', callNumber: 'DEWEY 003.5', copies: 4 },
      { title: 'The METAFONTbook', author: 'Donald E. Knuth', year: '1986', callNumber: 'DEWEY 005.52', copies: 3 },
      { title: 'Generative Design: Visualize, Program, and Create with JavaScript', author: 'Gross, Bohnacker, Laub', year: '2018', callNumber: 'DEWEY 700.28', copies: 5 },
      { title: 'The Nature of Code: Simulating Natural Systems with JavaScript', author: 'Daniel Shiffman', year: '2012', callNumber: 'DEWEY 006.6', copies: 6 }
    ]
  },
  {
    id: 'cartography',
    title: 'Cartography & Maritime Exploration',
    subtitle: 'Historical Atlases, Celestial Globes & Geodetic Survey Maps',
    deweyRange: 'DEWEY 912 & VAULT-MAP',
    iconName: 'MapPin',
    volumeCount: 2750,
    accentColor: '#ca8a04',
    shelfLocation: {
      wing: 'Special Collections (The Map Vault)',
      floor: 'Floor 3 (Southern Mezzanine)',
      aisle: 'Flat Folio Cases A1–A14',
      callPrefix: '912.MAP',
      zoneColor: 'border-yellow-500/40 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400'
    },
    description: 'Large-format copperplate nautical charts, Dutch Golden Age world atlases by Blaeu and Ortelius, celestial sky maps from the Greenwich Royal Observatory, and early triangulation surveys.',
    keySubtopics: ['Portolan Maritime Navigation Charts', 'Dutch Golden Age Cartography (Blaeu)', 'Celestial Constellation Atlases', 'Topographical Trigonometric Surveys', 'GIS & Satellite Geodesy History'],
    featuredTitles: [
      { title: 'Theatrum Orbis Terrarum (Theater of the World)', author: 'Abraham Ortelius', year: '1570', callNumber: 'VAULT-MAP-ORT', copies: 1 },
      { title: 'Atlas Maior (11 Volumes)', author: 'Joan Blaeu', year: '1662', callNumber: 'VAULT-MAP-BLA', copies: 1 },
      { title: 'Uranometria (Celestial Atlas of the Constellations)', author: 'Johann Bayer', year: '1603', callNumber: 'VAULT-CEL-BAY', copies: 1 },
      { title: 'The Great Trigonometrical Survey of India', author: 'William Lambton & George Everest', year: '1830', callNumber: 'DEWEY 526.9', copies: 2 }
    ]
  },
  {
    id: 'natural-history',
    title: 'Natural History & Botanical Illustration',
    subtitle: 'Herbal Compendia, Linnaean Taxonomies & Evolution Monographs',
    deweyRange: 'DEWEY 570 – 589',
    iconName: 'Library',
    volumeCount: 4620,
    accentColor: '#16a34a',
    shelfLocation: {
      wing: 'South Wing (Darwin & Linnaeus Stacks)',
      floor: 'Floor 2 (Biology & Ecology Wing)',
      aisle: 'Aisles 26-C through 29-A',
      callPrefix: '580.BOT',
      zoneColor: 'border-green-500/40 bg-green-500/10 text-green-700 dark:text-green-400'
    },
    description: 'Lavishly illustrated hand-colored copper engravings of flora and fauna, early microscope observations by Hooke and Leeuwenhoek, Darwin’s HMS Beagle journals, and ecological field studies.',
    keySubtopics: ['Renaissance Herbal Monographs', 'Micrographia & Cellular Discovery', 'Linnaean Binomial Nomenclature', 'Evolutionary Biology Field Notebooks', 'Ecological Systems & Conservation'],
    featuredTitles: [
      { title: 'Micrographia: Physiological Descriptions of Minute Bodies', author: 'Robert Hooke', year: '1665', callNumber: 'VAULT-MIC-01', copies: 1 },
      { title: 'On the Origin of Species', author: 'Charles Darwin', year: '1859', callNumber: 'DEWEY 576.82', copies: 5 },
      { title: 'Systema Naturae', author: 'Carl Linnaeus', year: '1735', callNumber: 'DEWEY 580.01', copies: 2 },
      { title: 'Birds of America (Double Elephant Folio Facsimile)', author: 'John James Audubon', year: '1827–1838', callNumber: 'VAULT-ORN-01', copies: 1 }
    ]
  }
];

const deweyDecimalClasses = [
  {
    code: '000',
    name: 'Computer Science, Information & General Works',
    description: 'Algorithms, bibliography, library science, encyclopedias, computing machinery, and rare archival preservation.',
    volumeCount: 7840,
    wing: 'Digital Commons & Main Hall',
    floor: 'Floor 1',
    aisles: 'Aisles 01-A to 03-D',
    subclasses: [
      { code: '001', name: 'Knowledge & Systems Theory', count: 820 },
      { code: '004', name: 'Data Processing & Computer Science', count: 3410 },
      { code: '005', name: 'Computer Programming & Software Engineering', count: 2190 },
      { code: '006', name: 'Artificial Intelligence & Generative Methods', count: 1420 }
    ]
  },
  {
    code: '100',
    name: 'Philosophy & Psychology',
    description: 'Metaphysics, epistemology, ethics, logic, and ancient philosophical schools from Greece to East Asia.',
    volumeCount: 5420,
    wing: 'North Wing',
    floor: 'Floor 2',
    aisles: 'Aisles 12-A to 15-D',
    subclasses: [
      { code: '110', name: 'Metaphysics & Ontology', count: 980 },
      { code: '120', name: 'Epistemology, Causation & Human Nature', count: 1140 },
      { code: '160', name: 'Logic & Deductive Inference', count: 860 },
      { code: '180', name: 'Ancient, Medieval & Eastern Philosophy', count: 2440 }
    ]
  },
  {
    code: '200',
    name: 'Religion & Comparative Theology',
    description: 'Sacred texts, moral theology, world spiritual philosophies, and medieval ecclesiastical history.',
    volumeCount: 3950,
    wing: 'North Wing',
    floor: 'Floor 2',
    aisles: 'Aisles 16-A to 18-B',
    subclasses: [
      { code: '210', name: 'Philosophy of Religion & Natural Theology', count: 740 },
      { code: '220', name: 'Sacred Scriptures & Hermeneutics', count: 1280 },
      { code: '290', name: 'Comparative World Religions & Mythology', count: 1930 }
    ]
  },
  {
    code: '300',
    name: 'Social Sciences & Juridical Systems',
    description: 'Sociology, constitutional law, economics, political theory, commerce, and education.',
    volumeCount: 8120,
    wing: 'East Wing',
    floor: 'Floor 2',
    aisles: 'Aisles 08-A to 11-D',
    subclasses: [
      { code: '320', name: 'Political Science & Statecraft', count: 2100 },
      { code: '330', name: 'Economics & Monetary Systems', count: 2950 },
      { code: '340', name: 'Jurisprudence & Constitutional Law', count: 1840 },
      { code: '370', name: 'Education & Pedagogy History', count: 1230 }
    ]
  },
  {
    code: '400',
    name: 'Language & Linguistics',
    description: 'Grammar, philology, semiotics, dead languages, lexicography, and computational linguistics.',
    volumeCount: 2640,
    wing: 'East Wing',
    floor: 'Floor 1',
    aisles: 'Aisles 06-B to 07-D',
    subclasses: [
      { code: '410', name: 'Linguistics & Semiotics', count: 1120 },
      { code: '470', name: 'Latin Philology & Classical Grammar', count: 820 },
      { code: '480', name: 'Classical Greek & Attic Dialects', count: 700 }
    ]
  },
  {
    code: '500',
    name: 'Natural Sciences & Mathematics',
    description: 'Theoretical physics, chemistry, astronomy, calculus, botany, zoology, and celestial mechanics.',
    volumeCount: 9480,
    wing: 'South Wing',
    floor: 'Floor 3',
    aisles: 'Aisles 20-A to 25-D',
    subclasses: [
      { code: '510', name: 'Pure & Applied Mathematics', count: 2840 },
      { code: '520', name: 'Astronomy & Astrophysics', count: 1690 },
      { code: '530', name: 'Physics & Thermodynamics', count: 2750 },
      { code: '570', name: 'Life Sciences & Evolutionary Biology', count: 2200 }
    ]
  },
  {
    code: '600',
    name: 'Technology & Applied Sciences',
    description: 'Mechanical engineering, medicine, civil infrastructure, manufacturing, and telecommunications.',
    volumeCount: 7120,
    wing: 'South Wing',
    floor: 'Floor 3',
    aisles: 'Aisles 26-A to 29-D',
    subclasses: [
      { code: '610', name: 'Medicine & Health Sciences', count: 2430 },
      { code: '620', name: 'Engineering & Applied Mechanics', count: 3290 },
      { code: '650', name: 'Management & Industrial Organization', count: 1400 }
    ]
  },
  {
    code: '700',
    name: 'The Arts & Recreation',
    description: 'Architecture, sculpture, classical music, painting, photography, and decorative design.',
    volumeCount: 5210,
    wing: 'West Wing',
    floor: 'Floor 2',
    aisles: 'Aisles 17-A to 19-D',
    subclasses: [
      { code: '720', name: 'Architecture & Built Form', count: 2150 },
      { code: '745', name: 'Industrial Design & Decorative Arts', count: 1420 },
      { code: '780', name: 'Musicology & Orchestral Scores', count: 1640 }
    ]
  },
  {
    code: '800',
    name: 'Literature & Rhetoric',
    description: 'Poetry, drama, world fiction, essays, literary criticism, and historical rhetoric across nations.',
    volumeCount: 11450,
    wing: 'East Wing',
    floor: 'Floor 1',
    aisles: 'Aisles 04-A to 07-D',
    subclasses: [
      { code: '810', name: 'American Literature in English', count: 3100 },
      { code: '820', name: 'English & Old English Literature', count: 3650 },
      { code: '860', name: 'Spanish & Latin American Literature', count: 2400 },
      { code: '880', name: 'Classical Greek & Hellenic Texts', count: 2300 }
    ]
  },
  {
    code: '900',
    name: 'History, Geography & Biography',
    description: 'World historical chronicles, cartography, archaeological records, and scholarly biographies.',
    volumeCount: 8960,
    wing: 'North Wing',
    floor: 'Floor 1',
    aisles: 'Aisles 10-A to 12-D',
    subclasses: [
      { code: '910', name: 'Geography, Travel & Atlases', count: 2150 },
      { code: '930', name: 'History of Ancient World to 499 CE', count: 2890 },
      { code: '940', name: 'History of Europe & Renaissance', count: 3920 }
    ]
  }
];

export default function Categories() {
  const [activeTab, setActiveTab] = useState('curated'); // 'curated' | 'dewey'
  const [searchTerm, setSearchTerm] = useState('');
  const [activeShelfModal, setActiveShelfModal] = useState(null);

  // Filter curated themes
  const filteredThemes = useMemo(() => {
    return curatedThemes.filter((theme) => {
      const q = searchTerm.toLowerCase();
      return (
        theme.title.toLowerCase().includes(q) ||
        theme.description.toLowerCase().includes(q) ||
        theme.keySubtopics.some(s => s.toLowerCase().includes(q)) ||
        theme.featuredTitles.some(t => t.title.toLowerCase().includes(q) || t.author.toLowerCase().includes(q))
      );
    });
  }, [searchTerm]);

  // Filter dewey classes
  const filteredDewey = useMemo(() => {
    return deweyDecimalClasses.filter((dc) => {
      const q = searchTerm.toLowerCase();
      return (
        dc.name.toLowerCase().includes(q) ||
        dc.code.includes(q) ||
        dc.description.toLowerCase().includes(q) ||
        dc.subclasses.some(s => s.name.toLowerCase().includes(q) || s.code.includes(q))
      );
    });
  }, [searchTerm]);

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
              <Layers className="w-3 h-3 text-amber-600 dark:text-amber-400" />
              <span>CLASSIFICATION &amp; TOPOLOGICAL INDEX</span>
            </div>

            <h1 className="font-serif-editorial text-4xl sm:text-6xl font-bold tracking-tight text-slate-950 dark:text-white leading-tight">
              Classification Browser &amp; Stacks Map
            </h1>

            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base max-w-2xl mx-auto font-sans leading-relaxed">
              Navigate our holdings through two complementary systems: curated intellectual galleries
              spanning seminal disciplines, and the complete 000–900 Dewey Decimal Master Classification.
            </p>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 max-w-2xl mx-auto">
              <div className="hairline-card p-3 rounded-xl bg-white/70 dark:bg-[#111523]/80 backdrop-blur-xs text-center">
                <span className="font-serif-editorial text-2xl font-bold text-slate-900 dark:text-white block">8</span>
                <span className="font-mono text-[9px] uppercase tracking-widest text-slate-500 dark:text-slate-400">Curated Galleries</span>
              </div>
              <div className="hairline-card p-3 rounded-xl bg-white/70 dark:bg-[#111523]/80 backdrop-blur-xs text-center">
                <span className="font-serif-editorial text-2xl font-bold text-amber-600 dark:text-amber-400 block">10</span>
                <span className="font-mono text-[9px] uppercase tracking-widest text-slate-500 dark:text-slate-400">Dewey Classes</span>
              </div>
              <div className="hairline-card p-3 rounded-xl bg-white/70 dark:bg-[#111523]/80 backdrop-blur-xs text-center">
                <span className="font-serif-editorial text-2xl font-bold text-slate-900 dark:text-white block">62,000+</span>
                <span className="font-mono text-[9px] uppercase tracking-widest text-slate-500 dark:text-slate-400">Total Volumes</span>
              </div>
              <div className="hairline-card p-3 rounded-xl bg-white/70 dark:bg-[#111523]/80 backdrop-blur-xs text-center">
                <span className="font-serif-editorial text-2xl font-bold text-emerald-600 dark:text-emerald-400 block">4 Wings</span>
                <span className="font-mono text-[9px] uppercase tracking-widest text-slate-500 dark:text-slate-400">Physical Stacks</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── MODE SWITCHER & SEARCH ─────────────────────────────────── */}
      <section className="sticky top-20 z-40 bg-[#fbf9f5]/95 dark:bg-[#090b11]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-white/[0.08] py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Classification View Toggle */}
          <div className="flex items-center p-1 bg-black/5 dark:bg-white/5 border border-slate-200/80 dark:border-white/[0.08] rounded-2xl w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('curated')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'curated'
                  ? 'bg-white dark:bg-[#111523] text-slate-950 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-amber-500" />
              <span>Curated Thematic Galleries</span>
            </button>

            <button
              onClick={() => setActiveTab('dewey')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'dewey'
                  ? 'bg-white dark:bg-[#111523] text-slate-950 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-amber-500" />
              <span>Dewey Master Index (000–900)</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-80 group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search category, call sign, or topic..."
              className="w-full pl-10 pr-9 py-2 text-xs bg-white dark:bg-[#111523] border border-slate-300/80 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-xs"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

        </div>
      </section>

      {/* ── MAIN CONTENT AREA ──────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* VIEW 1: CURATED THEMATIC GALLERIES */}
        {activeTab === 'curated' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif-editorial text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                  Seminal Archival Galleries
                </h2>
                <p className="text-xs text-slate-500 font-sans mt-0.5">
                  Hand-selected thematic groupings pairing cross-disciplinary literature with shelf topological indices.
                </p>
              </div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400 font-bold hidden sm:inline">
                {filteredThemes.length} GALLERIES OPEN
              </span>
            </div>

            {filteredThemes.length === 0 ? (
              <div className="hairline-card rounded-2xl p-12 text-center bg-white dark:bg-[#111523] space-y-3">
                <Compass className="w-10 h-10 text-slate-400 mx-auto" />
                <h3 className="font-serif-editorial text-xl font-bold text-slate-800 dark:text-slate-200">
                  No Curated Galleries Match Your Query
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto font-sans">
                  Try searching for keywords like "Philosophy", "Quantum", "Manuscripts", or "Architecture".
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {filteredThemes.map((theme, index) => (
                  <motion.article
                    key={theme.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: index * 0.05 }}
                    className="hairline-card rounded-3xl bg-white dark:bg-[#111523] p-6 sm:p-8 flex flex-col justify-between hover:shadow-xl transition-all duration-300 relative group overflow-hidden border border-slate-200 dark:border-white/10"
                  >
                    {/* Top Accent Stripe */}
                    <div
                      className="absolute top-0 left-0 right-0 h-1.5"
                      style={{ backgroundColor: theme.accentColor }}
                    />

                    <div className="space-y-5">
                      
                      {/* Category Header */}
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="font-mono text-[10px] uppercase tracking-widest px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold">
                              {theme.deweyRange}
                            </span>
                            <span className="font-mono text-[10px] text-slate-400">
                              {theme.volumeCount.toLocaleString()} VOLUMES
                            </span>
                          </div>
                          
                          <h3 className="font-serif-editorial text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white leading-tight">
                            {theme.title}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-0.5">
                            {theme.subtitle}
                          </p>
                        </div>

                        {/* Shelf Location Pin Button */}
                        <button
                          onClick={() => setActiveShelfModal(theme)}
                          className="px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-amber-500/10 hover:border-amber-500/30 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all group-hover:border-amber-500/40"
                          title="View physical shelf location & floor map"
                        >
                          <MapPin className="w-3.5 h-3.5 text-amber-500" />
                          <span className="hidden sm:inline text-[11px]">Shelf Map</span>
                        </button>
                      </div>

                      {/* Description */}
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                        {theme.description}
                      </p>

                      {/* Shelf Locator Strip */}
                      <div className="p-3.5 rounded-2xl bg-[#fbf9f5] dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                          <Building className="w-4 h-4 text-amber-500 shrink-0" />
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white">{theme.shelfLocation.wing}</span>
                            <span className="text-slate-400 block sm:inline sm:ml-1 text-[11px]">({theme.shelfLocation.floor})</span>
                          </div>
                        </div>
                        <div className="text-[11px] text-amber-700 dark:text-amber-400 font-bold bg-amber-500/10 px-2.5 py-1 rounded-lg w-fit">
                          {theme.shelfLocation.aisle}
                        </div>
                      </div>

                      {/* Key Subtopics Tags */}
                      <div className="space-y-1.5">
                        <span className="font-mono text-[9px] uppercase tracking-widest text-slate-400 font-bold block">
                          INDEXED SUBTOPICS:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {theme.keySubtopics.map((topic) => (
                            <span
                              key={topic}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 font-medium"
                            >
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Featured Titles Grid */}
                      <div className="space-y-2 pt-2">
                        <span className="font-mono text-[9px] uppercase tracking-widest text-slate-400 font-bold block">
                          CURATED REPRESENTATIVE VOLUMES:
                        </span>
                        <div className="divide-y divide-slate-100 dark:divide-white/5 border border-slate-200/80 dark:border-white/[0.08] rounded-2xl overflow-hidden">
                          {theme.featuredTitles.map((book) => (
                            <div
                              key={book.title}
                              className="p-2.5 bg-white dark:bg-[#111523] flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors"
                            >
                              <div className="min-w-0 pr-3">
                                <p className="font-semibold text-slate-900 dark:text-white truncate">
                                  {book.title}
                                </p>
                                <p className="text-[11px] text-slate-500 font-sans truncate">
                                  by {book.author} &bull; {book.year}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="font-mono text-[9px] px-2 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                                  {book.callNumber}
                                </span>
                                <Link
                                  to={`/books?search=${encodeURIComponent(book.title)}`}
                                  className="text-amber-600 dark:text-amber-400 hover:opacity-80 p-1"
                                  title="Search title in catalog"
                                >
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>

                    {/* Card Footer Actions */}
                    <div className="pt-6 mt-6 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                      <button
                        onClick={() => setActiveShelfModal(theme)}
                        className="text-xs text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 font-medium flex items-center gap-1 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Interactive Floor Locator</span>
                      </button>

                      <Link
                        to={`/books?search=${encodeURIComponent(theme.title.split(' ')[0])}`}
                        className="px-4 py-2 rounded-xl bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-xs font-bold hover:opacity-90 transition-all flex items-center gap-1.5 shadow-xs"
                      >
                        <span>Browse Gallery</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                  </motion.article>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: DEWEY DECIMAL MASTER INDEX */}
        {activeTab === 'dewey' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif-editorial text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                  Dewey Decimal System 23rd Edition (000 – 900)
                </h2>
                <p className="text-xs text-slate-500 font-sans mt-0.5">
                  The universal decimal classification index organizing our entire physical and digital repository.
                </p>
              </div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400 font-bold hidden sm:inline">
                10 TOP-LEVEL DIVISIONS
              </span>
            </div>

            <div className="space-y-4">
              {filteredDewey.map((deweyClass, index) => (
                <motion.div
                  key={deweyClass.code}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                  className="hairline-card rounded-2xl bg-white dark:bg-[#111523] p-6 border border-slate-200 dark:border-white/10 hover:border-amber-500/40 transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    
                    {/* Class Info */}
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-base font-extrabold px-3 py-1 rounded-xl bg-slate-950 dark:bg-white text-white dark:text-slate-950 tracking-wider">
                          {deweyClass.code}
                        </span>
                        <h3 className="font-serif-editorial text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                          {deweyClass.name}
                        </h3>
                      </div>
                      
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans max-w-2xl">
                        {deweyClass.description}
                      </p>

                      {/* Subclasses Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-3">
                        {deweyClass.subclasses.map((sub) => (
                          <div
                            key={sub.code}
                            className="p-2.5 rounded-xl bg-[#fbf9f5] dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04] flex items-center justify-between text-xs"
                          >
                            <span className="font-mono font-bold text-amber-600 dark:text-amber-400 mr-2">
                              {sub.code}
                            </span>
                            <span className="text-slate-800 dark:text-slate-200 truncate flex-1 font-medium" title={sub.name}>
                              {sub.name}
                            </span>
                            <span className="font-mono text-[9px] text-slate-400 shrink-0 ml-1">
                              {sub.count}v
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Stacks Location & Browse Link */}
                    <div className="flex md:flex-col items-center md:items-end justify-between md:justify-start gap-3 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-white/5">
                      <div className="text-left md:text-right font-mono text-xs">
                        <span className="text-amber-700 dark:text-amber-400 font-bold block">{deweyClass.wing}</span>
                        <span className="text-slate-400 text-[11px] block">{deweyClass.floor} &bull; {deweyClass.aisles}</span>
                        <span className="text-slate-500 font-bold text-[10px] mt-0.5 block">{deweyClass.volumeCount.toLocaleString()} Volumes Preserved</span>
                      </div>

                      <Link
                        to={`/books?search=${deweyClass.code}`}
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                      >
                        <span>Query Class {deweyClass.code}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* ── INTERACTIVE SHELF LOCATION & MAP MODAL ─────────────────── */}
      <AnimatePresence>
        {activeShelfModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-2xl bg-white dark:bg-[#111523] rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl p-6 sm:p-8 my-8"
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveShelfModal(null)}
                className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Header */}
              <div className="space-y-1 mb-6 pr-8">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 font-mono text-[9px] uppercase tracking-widest font-bold">
                  <MapPin className="w-3 h-3" />
                  <span>PHYSICAL STACKS TOPOLOGY &bull; {activeShelfModal.deweyRange}</span>
                </div>
                <h3 className="font-serif-editorial text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                  {activeShelfModal.title}
                </h3>
                <p className="text-xs text-slate-500 font-sans">
                  Coordinate locator for physical retrieval at Patel &amp; Co. Knowledge Center.
                </p>
              </div>

              {/* Visual Floor Blueprint Simulation */}
              <div className="p-5 rounded-2xl bg-[#0e1322] border border-white/10 mb-6 text-white space-y-4">
                <div className="flex items-center justify-between text-xs font-mono border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                    <span className="font-bold tracking-wider uppercase text-amber-400">
                      {activeShelfModal.shelfLocation.wing}
                    </span>
                  </div>
                  <span className="text-slate-400 text-[11px]">{activeShelfModal.shelfLocation.floor}</span>
                </div>

                {/* Stacks Layout Graphic */}
                <div className="py-4 px-2 space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                    <span>NORTH ELEVATOR BANK</span>
                    <span className="text-amber-400 font-bold">ACTIVE AISLE: {activeShelfModal.shelfLocation.aisle}</span>
                    <span>RESTROOMS &amp; SCAN DESK</span>
                  </div>

                  {/* Aisles Graphic */}
                  <div className="grid grid-cols-4 gap-2.5 py-2">
                    {['Stack A', 'Stack B', 'Stack C (Highlighted)', 'Stack D'].map((stack, idx) => (
                      <div
                        key={stack}
                        className={`h-24 rounded-xl border p-2 flex flex-col justify-between text-center transition-all ${
                          idx === 2
                            ? 'bg-amber-500/20 border-amber-500 shadow-md shadow-amber-500/10'
                            : 'bg-white/5 border-white/10 text-slate-400'
                        }`}
                      >
                        <span className="font-mono text-[9px] uppercase tracking-wider block">
                          Aisle 0{idx + 1}
                        </span>
                        {idx === 2 ? (
                          <div className="space-y-0.5">
                            <span className="font-mono text-[9px] font-bold text-amber-400 block">YOU ARE HERE</span>
                            <span className="font-mono text-[8px] text-amber-300/80 block">{activeShelfModal.shelfLocation.callPrefix}</span>
                          </div>
                        ) : (
                          <span className="font-mono text-[8px] text-slate-500">General Stacks</span>
                        )}
                        <span className="font-mono text-[8px] text-slate-500">Shelves 1–8</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between text-[10px] font-mono text-slate-500 pt-1">
                    <span>← Main Reading Atrium Entrance</span>
                    <span>Microfilm Study Carrels →</span>
                  </div>
                </div>
              </div>

              {/* Instructions & Guidelines */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] space-y-1">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400 font-bold block">
                    HOW TO RETRIEVE:
                  </span>
                  <p className="text-slate-600 dark:text-slate-300 font-sans leading-relaxed">
                    Note the call number prefix <strong className="text-slate-900 dark:text-white font-mono">{activeShelfModal.shelfLocation.callPrefix}</strong>.
                    Proceed to {activeShelfModal.shelfLocation.wing}, take the central lift to {activeShelfModal.shelfLocation.floor}.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] space-y-1">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400 font-bold block">
                    NEED LIBRARIAN ASSISTANCE?
                  </span>
                  <p className="text-slate-600 dark:text-slate-300 font-sans leading-relaxed">
                    If items are in restricted reserve or high-density vaults, our reference librarians at the Circulation Desk will issue them within 15 minutes.
                  </p>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <Link
                  to={`/books?search=${encodeURIComponent(activeShelfModal.title.split(' ')[0])}`}
                  onClick={() => setActiveShelfModal(null)}
                  className="w-full sm:flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm text-center transition-all flex items-center justify-center gap-2 shadow-xs"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Search {activeShelfModal.title} in Catalog</span>
                </Link>

                <button
                  onClick={() => setActiveShelfModal(null)}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-semibold hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                >
                  Close Map
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
