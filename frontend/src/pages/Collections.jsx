import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, ShieldCheck, Calendar, BookOpen, User,
  ChevronLeft, ChevronRight, ExternalLink, Eye, MapPin,
  Clock, CheckCircle2, X, FileText, ArrowRight, Layers,
  Compass, AlertCircle, Share2
} from 'lucide-react';

const collectionsData = [
  {
    id: 'renaissance-folios',
    title: 'Rare Renaissance Folios & Incunabula',
    subtitle: 'Movable Type Dawn, Venetian Humanism & Early Scientific Treatises (1450–1600)',
    curator: {
      name: 'Dr. Evelyn Sterling',
      title: 'Senior Conservator of Rare Manuscripts',
      department: 'Special Collections Department'
    },
    acquisition: 'Acquired October 1928 &bull; Davies Memorial Archival Bequest',
    preservation: 'Nitrogen Gas Micro-Climate Vault &bull; 18°C &bull; 45% Relative Humidity &bull; Deacidified Rag Paper',
    preservationTier: 'Tier 1 Ultra-Rare Vault',
    status: 'Permanent Archival Vault',
    catalogTag: 'Renaissance',
    summary: 'Spanning the Gutenberg revolution through the high Italian Renaissance, this premier collection houses monumentally significant printings that established typography, Western philosophy, and empirical natural science.',
    curatorNote: '“Holding the 1499 Aldine Hypnerotomachia or the 1543 Copernicus folio allows one to feel the physical weight of human intellectual rebirth. Each vellum leaf bears the indelible ink impression of early hand-cranked wooden screw presses.”',
    accentColor: '#d97706',
    items: [
      {
        id: 'gut-01',
        title: 'Gutenberg Bible Leaf (Book of Genesis)',
        creator: 'Johannes Gutenberg & Johann Fust',
        year: 'c. 1455',
        location: 'Mainz, Germany',
        callNumber: 'VAULT-INC-001',
        medium: 'Letterpress on linen rag vellum &bull; 42-line Gothic textura type',
        condition: 'Exceptional; minimal ox gall degradation on rubricated initials',
        image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
        description: 'An original folio leaf from the Latin Vulgate Bible printed by Gutenberg in Mainz, representing the dawn of movable metal type printing in the Western world.'
      },
      {
        id: 'ald-02',
        title: 'Hypnerotomachia Poliphili',
        creator: 'Francesco Colonna / Aldus Manutius',
        year: '1499',
        location: 'Venice, Italy',
        callNumber: 'VAULT-INC-042',
        medium: 'Letterpress with 168 woodcuts &bull; Contemporary limp vellum binding',
        condition: 'Pristine; complete text block with clear watermark provenance',
        image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=80',
        description: 'Celebrated as the most aesthetically exquisite typographic achievement of the Renaissance, pairing Francesco Griffo’s roman type with classical architectural woodcuts.'
      },
      {
        id: 'cop-03',
        title: 'De Revolutionibus Orbium Coelestium',
        creator: 'Nicolaus Copernicus',
        year: '1543',
        location: 'Nuremberg, Germany',
        callNumber: 'VAULT-SCI-014',
        medium: 'Folio with geometric woodcut diagrams &bull; Blind-tooled calf over wooden boards',
        condition: 'Conserved in 1994; faint 16th-century marginalia by Oxford astronomer',
        image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
        description: 'The revolutionary foundational text that placed the Sun at the center of the planetary orbits, inaugurating modern heliocentric astronomy.'
      },
      {
        id: 'mun-04',
        title: 'Cosmographia (Universal Cosmography)',
        creator: 'Sebastian Münster',
        year: '1550',
        location: 'Basel, Switzerland',
        callNumber: 'VAULT-GEO-008',
        medium: 'Woodcut panoramic cityscapes & maps &bull; Pigskin over oak boards',
        condition: 'Complete double-page woodcut foldouts intact',
        image: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=800&q=80',
        description: 'The earliest German-language description of the world, containing over 900 woodcuts and panoramic engravings of major European, Asian, and African cities.'
      }
    ]
  },
  {
    id: 'cs-pioneers',
    title: 'The Computer Science Pioneers Archive',
    subtitle: 'From Turing Machines and Cybernetics to ARPANET and Personal Computing (1936–1985)',
    curator: {
      name: 'Prof. Alistair Vance',
      title: 'Chair of Computational History',
      department: 'Department of Computing Antiquities'
    },
    acquisition: 'Assembled 1964–1988 &bull; Joint National Science Foundation Deposit',
    preservation: 'Cold Storage Vault &bull; 15°C &bull; Acid-Free Mylar Encapsulation &bull; Magnetic Media Digitized',
    preservationTier: 'Tier 2 Historical Tech Archive',
    status: 'Permanent Archival Vault',
    catalogTag: 'Computer Science',
    summary: 'A definitive repository tracking the mathematical, electrical, and algorithmic origins of the modern computational age: containing original offprints, seminar transcripts, and hardware prototypes.',
    curatorNote: '“Computing is not merely machines; it is human symbolic reasoning made physical. Our copies of Turing’s 1936 offprint and Shannon’s 1948 information theory paper form the Magna Carta of our algorithmic society.”',
    accentColor: '#2563eb',
    items: [
      {
        id: 'tur-01',
        title: 'On Computable Numbers (Offprint)',
        creator: 'Alan M. Turing',
        year: '1936',
        location: 'London, United Kingdom',
        callNumber: 'COMP-TUR-1936',
        medium: 'Proceedings of the London Mathematical Society &bull; Original grey wrappers',
        condition: 'Pristine offprint; author presentation copy',
        image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
        description: 'The seminal paper introducing the universal Turing machine, the halting problem, and proving the unsolvability of Hilbert’s Entscheidungsproblem.'
      },
      {
        id: 'sha-02',
        title: 'A Mathematical Theory of Communication',
        creator: 'Claude E. Shannon',
        year: '1948',
        location: 'Murray Hill, NJ, USA',
        callNumber: 'COMP-SHA-1948',
        medium: 'Bell System Technical Journal Offprint &bull; Blue cloth portfolio',
        condition: 'Excellent; annotated by early Bell Labs network engineer',
        image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80',
        description: 'Founded the discipline of information theory, introduced the word "bit" as the unit of information, and mathematically quantified channel entropy.'
      },
      {
        id: 'edv-03',
        title: 'First Draft of a Report on the EDVAC',
        creator: 'John von Neumann',
        year: '1945',
        location: 'Philadelphia, PA, USA',
        callNumber: 'COMP-VON-1945',
        medium: 'Mimeographed typescript memorandum &bull; 101 numbered pages',
        condition: 'Archivally stabilized; enclosed in custom red leather solander box',
        image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
        description: 'The conceptual blueprint for the stored-program computer architecture (the von Neumann architecture) utilized in nearly all computers built to this day.'
      },
      {
        id: 'unx-04',
        title: 'The UNIX Time-Sharing System',
        creator: 'Dennis M. Ritchie & Ken Thompson',
        year: '1974',
        location: 'Yorktown Heights, NY, USA',
        callNumber: 'COMP-UNX-1974',
        medium: 'Communications of the ACM &bull; Typescript preprint signed by authors',
        condition: 'Includes original Bell Labs circulation routing slip',
        image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
        description: 'The public revelation of the UNIX operating system and C programming environment that laid the structural foundation of modern software systems.'
      }
    ]
  },
  {
    id: 'nobel-laureates',
    title: 'Nobel Laureates in Literature',
    subtitle: 'Annotated First Editions, Literary Correspondence & Acceptance Speeches (1901–Present)',
    curator: {
      name: 'Dame Miriam Thorne',
      title: 'Curator of Literary Archives',
      department: 'Department of Modern Literature'
    },
    acquisition: 'Ongoing Literary Endowment &bull; Inaugurated 1952',
    preservation: 'Neutral pH Encapsulation &bull; Dark Storage Vault &bull; 19°C &bull; 50% RH',
    preservationTier: 'Tier 2 Literary Heritage',
    status: 'Current Special Exhibition',
    catalogTag: 'Literature',
    summary: 'A magnificent assemblage of first printings, corrected galley proofs, and intimate correspondence from Nobel Prize recipients in literature across six continents.',
    curatorNote: '“These volumes capture literary craft at its highest watermark. From Faulkner’s handwritten corrections to Toni Morrison’s resonant marginalia, we preserve the unvarnished creative process.”',
    accentColor: '#9333ea',
    items: [
      {
        id: 'fau-01',
        title: 'The Sound and the Fury (Author Inscribed)',
        creator: 'William Faulkner (Nobel 1949)',
        year: '1929',
        location: 'New York, USA',
        callNumber: 'LIT-FAU-1929',
        medium: 'Cape & Smith First Edition &bull; Original patterned boards & dust jacket',
        condition: 'Fine; inscribed by Faulkner to his Oxford, Mississippi physician',
        image: 'https://images.unsplash.com/photo-1474932430478-367dbb6832c1?auto=format&fit=crop&w=800&q=80',
        description: 'Faulkner’s polyphonic modernist masterpiece employing stream of consciousness to explore the decline of the Compson family.'
      },
      {
        id: 'cam-02',
        title: 'L’Étranger (The Stranger)',
        creator: 'Albert Camus (Nobel 1957)',
        year: '1942',
        location: 'Paris, France',
        callNumber: 'LIT-CAM-1942',
        medium: 'Éditions Gallimard &bull; Original cream printed wrappers',
        condition: 'One of 100 numbered copies on vélin pur fil paper',
        image: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=800&q=80',
        description: 'The landmark novel of Absurdism, exploring alienation and existential responsibility under the searing North African sun.'
      },
      {
        id: 'mor-03',
        title: 'Beloved (Inscribed First Edition with Galleys)',
        creator: 'Toni Morrison (Nobel 1993)',
        year: '1987',
        location: 'New York, USA',
        callNumber: 'LIT-MOR-1987',
        medium: 'Alfred A. Knopf First Edition &bull; Accompanied by uncorrected bound proofs',
        condition: 'Mint in dust jacket; includes signed 1993 Nobel Banquet address program',
        image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80',
        description: 'Pulitzer Prize-winning masterpiece exploring the haunting generational trauma of American slavery through mythic lyricism.'
      },
      {
        id: 'ner-04',
        title: 'Canto General (Illustrated First Edition)',
        creator: 'Pablo Neruda (Nobel 1971)',
        year: '1950',
        location: 'Mexico City, Mexico',
        callNumber: 'LIT-NER-1950',
        medium: 'Talleres Gráficos de la Nación &bull; Endpapers by Diego Rivera & David Siqueiros',
        condition: 'Limited subscription edition of 500 copies signed by Neruda & Rivera',
        image: 'https://images.unsplash.com/photo-1463320726281-696a485928c7?auto=format&fit=crop&w=800&q=80',
        description: 'Epic pan-American poetry cycle narrating the geological, indigenous, and political struggle of the South American continent.'
      }
    ]
  },
  {
    id: 'mid-century-design',
    title: 'Mid-Century Modern Design Monographs',
    subtitle: 'Bauhaus Pedagogy, Swiss International Typographic Style & Braun Functionalism (1940–1975)',
    curator: {
      name: 'Soren Kjaergaard',
      title: 'Curator of Applied Arts & Architecture',
      department: 'Architecture & Design Archive'
    },
    acquisition: 'Acquired 1978 &bull; Donated by the Bauhaus Diaspora Collective',
    preservation: 'Standard Archival Enclosure &bull; 20°C &bull; 50% RH &bull; Flat Plan Files',
    preservationTier: 'Tier 3 Applied Arts Archive',
    status: 'Current Special Exhibition',
    catalogTag: 'Design',
    summary: 'Tracking the evolution of functionalist industrial product design, asymmetric grid systems, corporate graphic standards manuals, and modernist architecture.',
    curatorNote: '“This collection demonstrates how rigorous proportion, white space, and reduction of ornament transformed the visual texture of postwar everyday life.”',
    accentColor: '#e11d48',
    items: [
      {
        id: 'mul-01',
        title: 'Grid Systems in Graphic Design (Raster Systeme)',
        creator: 'Josef Müller-Brockmann',
        year: '1981',
        location: 'Niederteufen, Switzerland',
        callNumber: 'DES-MUL-1981',
        medium: 'Arthur Niggli First Edition &bull; Hardcover with orange dust jacket',
        condition: 'Pristine; includes typographic specimen scale overlays',
        image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
        description: 'The definitive handbook of the Swiss Style, presenting systematic mathematical grid layouts for editorial and corporate communications.'
      },
      {
        id: 'vig-02',
        title: 'NYC Transit Authority Graphics Standards Manual',
        creator: 'Massimo Vignelli & Bob Noorda (Unimark)',
        year: '1970',
        location: 'New York, USA',
        callNumber: 'DES-VIG-1970',
        medium: 'Original mechanical loose-leaf ring binder with color chip swatches',
        condition: 'Complete with all 182 silkscreened color specification leaves',
        image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
        description: 'The groundbreaking design manual that unified the chaotic New York subway system using clean Standard Medium typography and color-coded geometric signage.'
      },
      {
        id: 'ger-03',
        title: 'Designing Programmes (Programme Entwerfen)',
        creator: 'Karl Gerstner',
        year: '1964',
        location: 'Teufen, Switzerland',
        callNumber: 'DES-GER-1964',
        medium: 'Original wire-bound square monograph with die-cut covers',
        condition: 'Very fine; author signed on dedication leaf',
        image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
        description: 'Four essays formulating a programmatic method for visual creation, anticipating generative computer-aided design principles.'
      },
      {
        id: 'ram-04',
        title: 'Weniger, aber besser (Less, but better)',
        creator: 'Dieter Rams',
        year: '1995',
        location: 'Hamburg, Germany',
        callNumber: 'DES-RAM-1995',
        medium: 'Jo Klatt Design+Design Verlag &bull; Minimalist white boards',
        condition: 'Signed by Rams at the Patel & Co. Design Colloquium (1998)',
        image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=800&q=80',
        description: 'The legendary industrial designer’s manifesto detailing the Ten Principles of Good Design through iconic Braun audio and appliance products.'
      }
    ]
  },
  {
    id: 'cartographic-vault',
    title: 'The Cartographic Vault & Celestial Atlases',
    subtitle: 'Copperplate Nautical Portolans, Mercator Projections & Dutch Golden Age Atlases (1500–1850)',
    curator: {
      name: 'Captain Thomas Vance (Ret.)',
      title: 'Master of Cartographic Antiquities',
      department: 'Department of Geodesy & Maps'
    },
    acquisition: 'Acquired 1912 &bull; Bequest of Lord Charles Hastings',
    preservation: 'Horizontal Flat Plan Cabinets &bull; Museum Glass Display Case &bull; Low-Lux Fiber Optic Lighting',
    preservationTier: 'Tier 1 Fragile Map Vault',
    status: 'Restricted Scholarly Reserve',
    catalogTag: 'Cartography',
    summary: 'A breathtaking vault of hand-colored copper engravings, astronomical constellation maps, and maritime navigation charts recording humanity’s gradual mapping of Earth and sky.',
    curatorNote: '“To unfurl Blaeu’s 1662 Atlas Maior is to witness the zenith of Dutch engraving art. Hand-painted gold leaf highlights the imperial borders of a world still full of terra incognita.”',
    accentColor: '#ca8a04',
    items: [
      {
        id: 'ort-01',
        title: 'Theatrum Orbis Terrarum (Theater of the World)',
        creator: 'Abraham Ortelius',
        year: '1570',
        location: 'Antwerp, Belgium',
        callNumber: 'MAP-ORT-1570',
        medium: 'Double-page copperplate engraved maps &bull; Original hand-coloring',
        condition: 'Superb; early gilt-stamped calf armorial binding',
        image: 'https://images.unsplash.com/photo-1524654458049-e36be0721fa2?auto=format&fit=crop&w=800&q=80',
        description: 'Universally recognized as the first modern world atlas, compiling 70 maps engraved from uniform plates by Franz Hogenberg.'
      },
      {
        id: 'bla-02',
        title: 'Atlas Maior: Gallia, Germania & Britannia (3 Vols)',
        creator: 'Joan Blaeu',
        year: '1662',
        location: 'Amsterdam, Netherlands',
        callNumber: 'MAP-BLA-1662',
        medium: 'Elephant folio with illuminated title pages &bull; Original publisher’s vellum',
        condition: 'Extremely rare hand-illuminated presentation copy',
        image: 'https://images.unsplash.com/photo-1508873696983-2df5703bc20d?auto=format&fit=crop&w=800&q=80',
        description: 'The crowning masterwork of Dutch Golden Age cartography, celebrated for extraordinary calligraphic cartouches, sailing ships, and sea monsters.'
      },
      {
        id: 'cel-03',
        title: 'Harmonia Macrocosmica (Celestial Atlas)',
        creator: 'Andreas Cellarius',
        year: '1660',
        location: 'Amsterdam, Netherlands',
        callNumber: 'MAP-CEL-1660',
        medium: '29 double-folio hand-colored copperplate celestial engravings',
        condition: 'Flawless plates illustrating Ptolemaic, Copernican, and Tychonic systems',
        image: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=800&q=80',
        description: 'The sole celestial atlas published in the Netherlands during the Golden Age, depicting the heavens surrounded by opulent baroque cartouches.'
      },
      {
        id: 'bay-04',
        title: 'Uranometria (Star Atlas with Greek Letters)',
        creator: 'Johann Bayer',
        year: '1603',
        location: 'Augsburg, Germany',
        callNumber: 'MAP-BAY-1603',
        medium: 'Engraved copperplates by Alexander Mair &bull; Contemporary limp vellum',
        condition: 'Includes all 51 constellation charts with accurate coordinate grids',
        image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80',
        description: 'The first atlas to cover the entire celestial sphere, pioneering the Bayer designation system using Greek letters to denote stellar brightness.'
      }
    ]
  },
  {
    id: 'alchemy-medicine',
    title: 'Alchemy, Early Medicine & Herbal Compendia',
    subtitle: 'From Avicenna’s Canon to Vesalian Anatomy and Herbal Pharmacopoeia (1300–1750)',
    curator: {
      name: 'Dr. Ramesh Chandra',
      title: 'Senior Conservator of Natural Sciences',
      department: 'Department of Early Science & Medicine'
    },
    acquisition: 'Acquired 1935 &bull; Royal Society Fellowship Deposit',
    preservation: 'Micro-Climate Showcase &bull; 17°C &bull; 40% RH &bull; Chemical Stabilizers',
    preservationTier: 'Tier 1 Historic Scientific Treasures',
    status: 'Permanent Archival Vault',
    catalogTag: 'Medicine',
    summary: 'Documenting the mystical and empirical origins of healing arts: from Islamic and Greek humoral medicine to Paracelsian spagyric alchemy and revolutionary woodcut anatomical dissections.',
    curatorNote: '“Looking upon Vesalius’s 1543 woodcut skeletons poised against Venetian landscapes, one witnesses the exact moment medicine parted ways with Galenic dogma to embrace hands-on anatomical truth.”',
    accentColor: '#10b981',
    items: [
      {
        id: 'ves-01',
        title: 'De Humani Corporis Fabrica (On the Fabric of the Human Body)',
        creator: 'Andreas Vesalius',
        year: '1543',
        location: 'Basel, Switzerland (Johannes Oporinus)',
        callNumber: 'MED-VES-1543',
        medium: 'Imperial folio with over 200 woodcuts &bull; Blind-stamped pigskin',
        condition: 'Magnificent foldout muscle-man plate completely intact',
        image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80',
        description: 'The most famous anatomy book ever published, revolutionizing medical science through empirical human dissection and exquisite woodcut illustrations.'
      },
      {
        id: 'bru-02',
        title: 'Herbarum Vivae Eicones (Living Plant Portraits)',
        creator: 'Otto Brunfels & Hans Weiditz',
        year: '1530',
        location: 'Strasbourg, France',
        callNumber: 'MED-BRU-1530',
        medium: 'Woodcut botanical portraits drawn directly from living specimens',
        condition: 'First edition with original hand-colored botanicals',
        image: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=800&q=80',
        description: 'Inaugurated modern botanical illustration by depicting plants with roots, blemishes, and wilted petals rather than idealized medieval schemas.'
      },
      {
        id: 'har-03',
        title: 'Exercitatio Anatomica de Motu Cordis (Circulation of the Blood)',
        creator: 'William Harvey',
        year: '1628',
        location: 'Frankfurt, Germany (William Fitzer)',
        callNumber: 'MED-HAR-1628',
        medium: 'Quarto with two engraved plates illustrating venous valves',
        condition: 'Rebound in full crushed morocco; leaves washed and sized',
        image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&q=80',
        description: 'Announced the revolutionary discovery of the continuous systemic circulation of blood pumped throughout the body by the muscular heart.'
      },
      {
        id: 'ash-04',
        title: 'Theatrum Chemicum Britannicum (Alchemical Compendium)',
        creator: 'Elias Ashmole',
        year: '1652',
        location: 'London, United Kingdom',
        callNumber: 'ALC-ASH-1652',
        medium: 'Quarto with intricate copper engravings by Robert Vaughan',
        condition: 'Includes rare foldout plate of the Ripley Scrowle',
        image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80',
        description: 'An annotated poetic anthology of British alchemical treatises, recording esoteric metallurgical transmutation recipes and philosophical allegories.'
      }
    ]
  }
];

export default function Collections() {
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [activeItemModal, setActiveItemModal] = useState(null);
  const [activeConsultationModal, setActiveConsultationModal] = useState(null);
  const [carouselIndices, setCarouselIndices] = useState({});
  const [consultationSuccess, setConsultationSuccess] = useState(false);
  const [consultationForm, setConsultationForm] = useState({
    scholarName: '',
    email: '',
    institution: '',
    purpose: '',
    date: ''
  });

  const statuses = ['All', 'Permanent Archival Vault', 'Current Special Exhibition', 'Restricted Scholarly Reserve'];

  const filteredCollections = useMemo(() => {
    if (selectedStatus === 'All') return collectionsData;
    return collectionsData.filter(c => c.status === selectedStatus);
  }, [selectedStatus]);

  const handlePrevItem = (collectionId, totalItems) => {
    setCarouselIndices(prev => {
      const current = prev[collectionId] || 0;
      return { ...prev, [collectionId]: (current - 1 + totalItems) % totalItems };
    });
  };

  const handleNextItem = (collectionId, totalItems) => {
    setCarouselIndices(prev => {
      const current = prev[collectionId] || 0;
      return { ...prev, [collectionId]: (current + 1) % totalItems };
    });
  };

  const handleConsultationSubmit = (e) => {
    e.preventDefault();
    setConsultationSuccess(true);
  };

  return (
    <div className="min-h-screen bg-[#fbf9f5] dark:bg-[#090b11] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* ── HERO SECTION ───────────────────────────────────────────── */}
      <section className="relative pt-12 pb-16 border-b border-slate-200/80 dark:border-white/[0.08] archival-grid overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center max-w-3xl mx-auto space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 font-mono text-[10px] uppercase tracking-widest border border-amber-500/20 font-bold">
              <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" />
              <span>SPECIAL EXHIBITS &bull; CURATED ARCHIVAL VAULTS</span>
            </div>

            <h1 className="font-serif-editorial text-4xl sm:text-6xl font-bold tracking-tight text-slate-950 dark:text-white leading-tight">
              Curated Archival Collections
            </h1>

            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base max-w-2xl mx-auto font-sans leading-relaxed">
              Explore protected repositories of human civilization: from 15th-century incunabula and
              seminal computer science offprints to Nobel manuscripts and hand-tinted cartography.
            </p>

            {/* Metrics Ticker */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 max-w-2xl mx-auto">
              <div className="hairline-card p-3 rounded-xl bg-white/70 dark:bg-[#111523]/80 backdrop-blur-xs text-center">
                <span className="font-serif-editorial text-2xl font-bold text-slate-900 dark:text-white block">6</span>
                <span className="font-mono text-[9px] uppercase tracking-widest text-slate-500 dark:text-slate-400">Vault Collections</span>
              </div>
              <div className="hairline-card p-3 rounded-xl bg-white/70 dark:bg-[#111523]/80 backdrop-blur-xs text-center">
                <span className="font-serif-editorial text-2xl font-bold text-amber-600 dark:text-amber-400 block">24</span>
                <span className="font-mono text-[9px] uppercase tracking-widest text-slate-500 dark:text-slate-400">Priceless Artifacts</span>
              </div>
              <div className="hairline-card p-3 rounded-xl bg-white/70 dark:bg-[#111523]/80 backdrop-blur-xs text-center">
                <span className="font-serif-editorial text-2xl font-bold text-slate-900 dark:text-white block">18°C</span>
                <span className="font-mono text-[9px] uppercase tracking-widest text-slate-500 dark:text-slate-400">Climate Controlled</span>
              </div>
              <div className="hairline-card p-3 rounded-xl bg-white/70 dark:bg-[#111523]/80 backdrop-blur-xs text-center">
                <span className="font-serif-editorial text-2xl font-bold text-emerald-600 dark:text-emerald-400 block">1894</span>
                <span className="font-mono text-[9px] uppercase tracking-widest text-slate-500 dark:text-slate-400">Year Founded</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FILTER CONTROLS ────────────────────────────────────────── */}
      <section className="sticky top-20 z-40 bg-[#fbf9f5]/95 dark:bg-[#090b11]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-white/[0.08] py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none w-full sm:w-auto">
            <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400 font-bold shrink-0 mr-1">
              STATUS:
            </span>
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                  selectedStatus === status
                    ? 'bg-slate-950 dark:bg-white text-white dark:text-slate-950 shadow-xs'
                    : 'bg-white/60 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200/80 dark:hover:bg-white/10 border border-slate-200/60 dark:border-white/[0.06]'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 shrink-0">
            <ShieldCheck className="w-4 h-4 text-amber-500" />
            <span>WHITE-GLOVE SCHOLARLY CONSULTATION AVAILABLE</span>
          </div>

        </div>
      </section>

      {/* ── COLLECTIONS LIST ───────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {filteredCollections.map((collection, colIdx) => {
          const activeIndex = carouselIndices[collection.id] || 0;
          const currentItem = collection.items[activeIndex];

          return (
            <motion.section
              key={collection.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.45, delay: colIdx * 0.05 }}
              className="hairline-card rounded-3xl bg-white dark:bg-[#111523] border border-slate-200 dark:border-white/10 p-6 sm:p-10 shadow-lg relative overflow-hidden"
            >
              {/* Decorative Header Accent */}
              <div
                className="absolute top-0 left-0 right-0 h-1.5"
                style={{ backgroundColor: collection.accentColor }}
              />

              {/* Collection Metadata Header */}
              <div className="space-y-4 mb-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[10px] uppercase tracking-widest px-3 py-1 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold border border-amber-500/20">
                      {collection.status}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-md bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 font-bold">
                      {collection.preservationTier}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setActiveConsultationModal({ collection, item: currentItem });
                      setConsultationSuccess(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Request Vault Consultation</span>
                  </button>
                </div>

                <div>
                  <h2 className="font-serif-editorial text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white leading-tight">
                    {collection.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-sans mt-1">
                    {collection.subtitle}
                  </p>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-sans leading-relaxed max-w-4xl">
                  {collection.summary}
                </p>

                {/* Preservation & Acquisition Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 rounded-2xl bg-[#fbf9f5] dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] text-xs font-mono">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase block">PRESERVATION ENVIRONMENT:</span>
                      <span className="font-medium text-slate-900 dark:text-white text-[11px]">{collection.preservation}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Calendar className="w-4 h-4 text-amber-500 shrink-0" />
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase block">PROVENANCE &amp; ACQUISITION:</span>
                      <span className="font-medium text-slate-900 dark:text-white text-[11px]" dangerouslySetInnerHTML={{ __html: collection.acquisition }} />
                    </div>
                  </div>
                </div>

                {/* Curator Note Callout */}
                <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-xs italic text-slate-700 dark:text-slate-300 font-serif-editorial leading-relaxed relative">
                  <p className="pl-2">
                    {collection.curatorNote}
                  </p>
                  <p className="not-italic font-mono text-[10px] text-amber-700 dark:text-amber-400 uppercase tracking-widest mt-2 font-bold">
                    — {collection.curator.name}, {collection.curator.title} ({collection.curator.department})
                  </p>
                </div>
              </div>

              {/* ── ARTIFACT SHOWCASE CAROUSEL ───────────────────────── */}
              <div className="border-t border-slate-100 dark:border-white/5 pt-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                      ARTIFACT EXHIBIT CAROUSEL ({activeIndex + 1} OF {collection.items.length})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePrevItem(collection.id, collection.items.length)}
                      aria-label="Previous artifact"
                      className="p-2 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleNextItem(collection.id, collection.items.length)}
                      aria-label="Next artifact"
                      className="p-2 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Carousel Card */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center rounded-2xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.06] p-6 sm:p-8">
                  
                  {/* Artifact Image Preview */}
                  <div className="lg:col-span-5 relative group overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 shadow-md aspect-4/3">
                    <img
                      src={currentItem.image}
                      alt={currentItem.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4">
                      <span className="font-mono text-[9px] uppercase tracking-widest text-amber-400 font-bold">
                        {currentItem.callNumber}
                      </span>
                      <p className="text-xs text-white font-medium truncate">
                        {currentItem.location} &bull; {currentItem.year}
                      </p>
                    </div>

                    <button
                      onClick={() => setActiveItemModal(currentItem)}
                      className="absolute top-3 right-3 p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-all shadow-xs"
                      title="Inspect High-Resolution Artifact"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Artifact Details */}
                  <div className="lg:col-span-7 space-y-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                          {currentItem.year}
                        </span>
                        <span className="text-slate-400 text-xs">&bull;</span>
                        <span className="font-mono text-[10px] text-slate-500">
                          {currentItem.location}
                        </span>
                      </div>
                      
                      <h3 className="font-serif-editorial text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white leading-snug">
                        {currentItem.title}
                      </h3>
                      
                      <p className="font-sans text-xs text-slate-500 dark:text-slate-400 italic">
                        by {currentItem.creator}
                      </p>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-sans leading-relaxed">
                      {currentItem.description}
                    </p>

                    <div className="space-y-1.5 text-xs font-mono p-3.5 rounded-xl bg-white dark:bg-[#111523] border border-slate-200/80 dark:border-white/[0.08]">
                      <div>
                        <span className="text-slate-400 text-[10px] block">PHYSICAL MEDIUM &amp; BINDING:</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">{currentItem.medium}</span>
                      </div>
                      <div className="pt-1 border-t border-slate-100 dark:border-white/5">
                        <span className="text-slate-400 text-[10px] block">CONSERVATION CONDITION:</span>
                        <span className="font-medium text-emerald-700 dark:text-emerald-400">{currentItem.condition}</span>
                      </div>
                    </div>

                    {/* Carousel Thumbnail Stepper */}
                    <div className="flex items-center gap-2 pt-2">
                      {collection.items.map((item, idx) => (
                        <button
                          key={item.id}
                          onClick={() => setCarouselIndices(prev => ({ ...prev, [collection.id]: idx }))}
                          className={`h-2 rounded-full transition-all ${
                            idx === activeIndex
                              ? 'w-8 bg-amber-500'
                              : 'w-2 bg-slate-300 dark:bg-white/20 hover:bg-slate-400'
                          }`}
                          aria-label={`Slide ${idx + 1}`}
                        />
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <button
                        onClick={() => setActiveItemModal(currentItem)}
                        className="px-4 py-2 bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-bold text-xs rounded-xl hover:opacity-90 transition-all flex items-center gap-1.5 shadow-xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect Facsimile</span>
                      </button>

                      <Link
                        to={`/books?search=${encodeURIComponent(collection.catalogTag)}`}
                        className="px-4 py-2 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5"
                      >
                        <span>View in Catalog</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                  </div>

                </div>

              </div>

            </motion.section>
          );
        })}
      </main>

      {/* ── HIGH-RESOLUTION ARTIFACT FACSIMILE MODAL ────────────────── */}
      <AnimatePresence>
        {activeItemModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-3xl bg-white dark:bg-[#111523] rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl p-6 sm:p-8 my-8 max-h-[92vh] overflow-y-auto"
            >
              <button
                onClick={() => setActiveItemModal(null)}
                className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-6">
                
                <div className="space-y-1 pr-8">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[9px] uppercase tracking-widest px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold">
                      ARCHIVAL FACSIMILE &bull; {activeItemModal.callNumber}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">
                      1200 DPI ARCHIVE MASTER
                    </span>
                  </div>
                  <h3 className="font-serif-editorial text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                    {activeItemModal.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-sans italic">
                    {activeItemModal.creator} &bull; {activeItemModal.year} &bull; {activeItemModal.location}
                  </p>
                </div>

                {/* High-res Image Preview */}
                <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-lg bg-black">
                  <img
                    src={activeItemModal.image}
                    alt={activeItemModal.title}
                    className="w-full max-h-96 object-contain mx-auto"
                  />
                </div>

                {/* Detailed Analysis */}
                <div className="space-y-2">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400 font-bold block">
                    ARCHIVAL CATALOG ENTRY:
                  </span>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                    {activeItemModal.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] text-xs font-mono">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase block">MEDIUM &amp; MATERIAL:</span>
                    <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{activeItemModal.medium}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase block">CONSERVATION GRADE:</span>
                    <p className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{activeItemModal.condition}</p>
                  </div>
                </div>

                {/* Modal Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <Link
                    to={`/books?search=${encodeURIComponent(activeItemModal.title)}`}
                    onClick={() => setActiveItemModal(null)}
                    className="w-full sm:flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm text-center transition-all flex items-center justify-center gap-2 shadow-xs"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Search Item in Main Catalog</span>
                  </Link>

                  <button
                    onClick={() => setActiveItemModal(null)}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-semibold hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                  >
                    Close Preview
                  </button>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── SCHOLARLY CONSULTATION REQUEST MODAL ───────────────────── */}
      <AnimatePresence>
        {activeConsultationModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-xl bg-white dark:bg-[#111523] rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl p-6 sm:p-8 my-8"
            >
              <button
                onClick={() => setActiveConsultationModal(null)}
                className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              {consultationSuccess ? (
                <div className="text-center py-6 space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/20">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  
                  <h3 className="font-serif-editorial text-2xl font-bold text-slate-900 dark:text-white">
                    Consultation Request Registered
                  </h3>
                  
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto font-sans leading-relaxed">
                    Your request to inspect artifacts from <strong className="text-slate-900 dark:text-white">{activeConsultationModal.collection.title}</strong> has been transmitted to {activeConsultationModal.collection.curator.name}.
                  </p>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-xs font-mono text-left space-y-1">
                    <p className="text-slate-400">REFERENCE TICKET: <strong className="text-amber-600 dark:text-amber-400">VAULT-REQ-2026-8921</strong></p>
                    <p className="text-slate-400">LOCATION: <strong className="text-slate-900 dark:text-white">Special Collections Reading Room &bull; Level 3</strong></p>
                    <p className="text-slate-400">STATUS: <strong className="text-emerald-600 dark:text-emerald-400">Archivist Review within 24 Hours</strong></p>
                  </div>

                  <button
                    onClick={() => setActiveConsultationModal(null)}
                    className="w-full py-3 rounded-xl bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-bold text-xs shadow-xs"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleConsultationSubmit} className="space-y-5">
                  <div className="space-y-1 pr-8">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 font-mono text-[9px] uppercase tracking-widest font-bold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>WHITE-GLOVE RARE VAULT CONSULTATION</span>
                    </div>
                    <h3 className="font-serif-editorial text-2xl font-bold text-slate-900 dark:text-white">
                      Request Access to Special Collections
                    </h3>
                    <p className="text-xs text-slate-500 font-sans">
                      Appointments must be scheduled 48 hours in advance for physical deacidification acclimatization.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 font-mono">
                    Target Collection: <strong className="font-bold">{activeConsultationModal.collection.title}</strong>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="font-mono text-[10px] uppercase tracking-widest text-slate-500 block mb-1 font-bold">
                        FULL RESEARCHER NAME *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Dr. Arthur Pendelton"
                        value={consultationForm.scholarName}
                        onChange={(e) => setConsultationForm({ ...consultationForm, scholarName: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#111523] border border-slate-300/80 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-1 focus:ring-amber-500 outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-mono text-[10px] uppercase tracking-widest text-slate-500 block mb-1 font-bold">
                          INSTITUTIONAL EMAIL *
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="scholar@oxford.edu"
                          value={consultationForm.email}
                          onChange={(e) => setConsultationForm({ ...consultationForm, email: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#111523] border border-slate-300/80 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-1 focus:ring-amber-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="font-mono text-[10px] uppercase tracking-widest text-slate-500 block mb-1 font-bold">
                          UNIVERSITY / AFFILIATION
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Cambridge / Independent"
                          value={consultationForm.institution}
                          onChange={(e) => setConsultationForm({ ...consultationForm, institution: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#111523] border border-slate-300/80 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-1 focus:ring-amber-500 outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-mono text-[10px] uppercase tracking-widest text-slate-500 block mb-1 font-bold">
                        PREFERRED CONSULTATION DATE *
                      </label>
                      <input
                        type="date"
                        required
                        value={consultationForm.date}
                        onChange={(e) => setConsultationForm({ ...consultationForm, date: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#111523] border border-slate-300/80 dark:border-white/10 text-slate-900 dark:text-white focus:ring-1 focus:ring-amber-500 outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="font-mono text-[10px] uppercase tracking-widest text-slate-500 block mb-1 font-bold">
                        RESEARCH STATEMENT &amp; PURPOSE *
                      </label>
                      <textarea
                        required
                        rows={3}
                        placeholder="Detail specific folios or leaves needed for peer-reviewed research or doctoral thesis..."
                        value={consultationForm.purpose}
                        onChange={(e) => setConsultationForm({ ...consultationForm, purpose: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#111523] border border-slate-300/80 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-1 focus:ring-amber-500 outline-none resize-none font-sans"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="submit"
                      className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm transition-all shadow-xs"
                    >
                      Transmit Consultation Request
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveConsultationModal(null)}
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
