import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Library, Clock, MapPin, ShieldCheck, Compass, Mail,
  Phone, Building, Wifi, Camera, Coffee, BookOpen,
  Calendar, CheckCircle2, ChevronRight, Award, FileText,
  AlertCircle, Sparkles, Send, Download, Layers, UserCheck
} from 'lucide-react';

const wingHours = [
  {
    name: 'Main Reading Room & Rotunda',
    status: 'Open Now',
    schedule: 'Mon – Fri: 08:00 – 22:00 | Sat – Sun: 09:00 – 20:00',
    description: 'High-ceiling classical quiet study desks, oak refectory tables with emerald bankers lamps, and general circulating open stacks.',
    access: 'Open to All Enrolled Members & Day Pass Visitors',
    accentColor: '#10b981'
  },
  {
    name: 'Special Collections & Rare Folios Vault',
    status: 'Open Now',
    schedule: 'Mon – Fri: 10:00 – 17:00 | Saturday: By Appointment Only',
    description: 'Climate-controlled research room (18°C, 45% RH) for inspection of pre-1800 incunabula, original manuscripts, and historical maps.',
    access: 'White-Glove Registration & Approved Scholarly Request Required',
    accentColor: '#d97706'
  },
  {
    name: 'Digital Commons & Compute Lab',
    status: 'Open 24/7',
    schedule: 'General Public: 08:00 – 00:00 | Resident Fellows: 24/7 Card Access',
    description: '10Gbps symmetric fiber terminals, high-performance compute nodes, microform digital scanners, and multimedia production suites.',
    access: 'Valid Member ID or Student ID Required',
    accentColor: '#2563eb'
  },
  {
    name: 'The Atrium Café & Antiquarian Bookshop',
    status: 'Open Now',
    schedule: 'Mon – Sat: 07:30 – 19:00 | Sunday: 09:00 – 17:00',
    description: 'Artisanal single-origin coffee, teas, light fare, and a curated bookstore carrying university press releases and fine stationery.',
    access: 'Public Access &bull; Ground Floor Atrium',
    accentColor: '#ca8a04'
  }
];

const floorDirectory = [
  {
    floor: 'Floor 4',
    levelName: 'Observation Mezzanine & Quiet Study Pavilion',
    wings: ['Sunlit Rooftop Terraces', 'Deep Silent Carrels', 'Monograph Seminar Rooms (401–408)'],
    highlights: 'Panoramic city vista, zero-noise enforcement, individual scholar study carrels.',
    amenities: ['Silent Charging Stations', 'Private Study Pods', 'Natural Light Lightwells']
  },
  {
    floor: 'Floor 3',
    levelName: 'Special Collections, Rare Folios & Archival Fellowship',
    wings: ['The Rare Manuscript Vault', 'Davies Memorial Consultation Room', 'Fellows Research Lounge'],
    highlights: 'Restricted research center for rare incunabula, medieval manuscripts, and cartographic folios.',
    amenities: ['1200 DPI Overhead Book Scanners', 'White-Glove Preparation Desks', 'Conservation Consultation Office']
  },
  {
    floor: 'Floor 2',
    levelName: 'The Main Stacks & Subject Reading Galleries',
    wings: ['Dewey 100–600 (Philosophy, Science, Engineering)', 'Babbage Memorial Auditorium', 'Microfilm & Periodicals Desk'],
    highlights: 'Over 40,000 open-shelf volumes, comfortable reading armchairs, and public consultation terminals.',
    amenities: ['Self-Check Circulation Kiosks', 'Reference Librarian Desk', 'Printing & Microform Stations']
  },
  {
    floor: 'Floor 1',
    levelName: 'Grand Rotunda, Circulation Hall & Digital Commons',
    wings: ['Central Circulation Desk', 'Main Catalog Search Desks', 'Digital Commons Computing Annex', 'Atrium Café'],
    highlights: 'The institutional entrance: member enrollment, loan returns, high-speed research computer lab, and coffee.',
    amenities: ['24/7 Automated Book Return Chute', 'Restrooms & Lockers', 'Day Lockers & Coat Check']
  },
  {
    floor: 'Sub-Level B',
    levelName: 'Conservation Laboratory & High-Density Vault',
    wings: ['Rare Book Restoration Studio', 'Nitrogen Atmosphere Master Vault', 'Historic Map Storage'],
    highlights: 'Secure preservation facility housing rare leather bindings, deacidification baths, and flat map archives.',
    amenities: ['Authorized Staff & Conservator Access Only', 'Staff Loading Bay', 'Cold Archival Storage']
  }
];

const institutionalPolicies = [
  {
    title: 'Circulation & Borrowing Quotas',
    icon: BookOpen,
    summary: 'Clear, equitable borrowing periods tailored to support thorough academic scholarship.',
    rules: [
      'Standard Member: Up to 5 books for 28 calendar days with 2 online renewals.',
      'Resident Fellow / Graduate: Up to 15 volumes for 90 days with unlimited renewals unless recalled.',
      'Late Circulation Fines: $0.25/day for general books; $2.00/hour for reserve desk items.',
      'Automated return drops operate 24 hours a day on the East Entrance facade.'
    ]
  },
  {
    title: 'High-Speed Connectivity & Computing',
    icon: Wifi,
    summary: 'Enterprise-grade digital infrastructure ensuring uninterrupted academic research.',
    rules: [
      'Encrypted eduroam network available across all wings and outdoor reading pavilions.',
      'Patel-Guest Wi-Fi provided complimentary with SMS phone verification.',
      'Complimentary 100 pages of black & white duplex printing per month for all active members.',
      'High-performance compute clusters require reservations via the Digital Commons desk.'
    ]
  },
  {
    title: 'Photography & Archival Handling',
    icon: Camera,
    summary: 'Rigorous preservation protocols safeguarding century-old folios and vellum.',
    rules: [
      'Non-flash photography of general stacks and architecture is permitted for personal research.',
      'Special Collections manuscripts may only be photographed with conservator permission.',
      'Pencils only in all reading rooms — ink pens and highlighters are strictly prohibited.',
      'Cotton white gloves (supplied at entrance) must be worn when handling all pre-1850 materials.'
    ]
  },
  {
    title: 'Atmosphere & Preservation Guidelines',
    icon: ShieldCheck,
    summary: 'A sanctuary dedicated to profound reflection, deep reading, and scholarly courtesy.',
    rules: [
      'All mobile devices must be placed on silent mode upon passing through the Grand Rotunda.',
      'Lidded water bottles are permitted in general stacks; strictly no food or beverages in the Vault.',
      'Quiet phone call booths are located on Floors 1 and 2 near the stairwells.',
      'Respect the zoned silence ratings posted at the entrance of each study room.'
    ]
  }
];

const historicalTimeline = [
  {
    year: '1894',
    title: 'Founding by Devendra Patel',
    desc: 'Industrialist and bibliophile Devendra Patel endows the library with his personal collection of 4,000 rare scientific monographs and classical texts, establishing a free public repository.'
  },
  {
    year: '1928',
    title: 'Construction of the Neo-Classical Rotunda',
    desc: 'Architect Sir Edwin Lutyens collaborates on the Grand Rotunda and Stained Glass Dome, featuring Indiana limestone columns and oak refectory reading tables.'
  },
  {
    year: '1964',
    title: 'The Turing-Von Neumann Computer Archive',
    desc: 'Joint National Science Foundation grant establishes the Computer Science Pioneers Archive, receiving original offprints and technical memoranda from early electronic computing projects.'
  },
  {
    year: '1998',
    title: 'Seismic Retrofit & Climate Vaults',
    desc: 'A comprehensive modernization adds the Sub-Level nitrogen-controlled preservation vault, ensuring 18°C temperature and 45% relative humidity for irreplaceable incunabula.'
  },
  {
    year: '2018',
    title: 'High-Resolution Digitization Initiative',
    desc: 'Launch of the 1200 DPI cultural heritage scanning program, digitizing over 10,000 rare Renaissance leaves and nautical atlases for open public scholarship.'
  },
  {
    year: '2026',
    title: 'The Unified Digital & Physical Knowledge Center',
    desc: 'Patel & Co. unveils its next-generation hybrid archival system, unifying physical circulation desks, AI-assisted research bibliographies, and worldwide scholarly access.'
  }
];

export default function LibraryInfo() {
  const [activeFloor, setActiveFloor] = useState('Floor 1');
  const [inquirySuccess, setInquirySuccess] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({
    name: '',
    email: '',
    inquiryType: 'General Research Question',
    subject: '',
    message: ''
  });

  const handleInquirySubmit = (e) => {
    e.preventDefault();
    setInquirySuccess(true);
  };

  const selectedFloorData = floorDirectory.find(f => f.floor === activeFloor) || floorDirectory[3];

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
              <Building className="w-3 h-3 text-amber-600 dark:text-amber-400" />
              <span>INSTITUTIONAL GUIDE &bull; FOUNDED 1894</span>
            </div>

            <h1 className="font-serif-editorial text-4xl sm:text-6xl font-bold tracking-tight text-slate-950 dark:text-white leading-tight">
              Patel &amp; Co. Knowledge Center
            </h1>

            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base max-w-2xl mx-auto font-sans leading-relaxed">
              A comprehensive guide to our reading rooms, opening hours across wings,
              interactive floor plan, archival policies, scholar fellowships, and history.
            </p>

            {/* Live Institutional Status Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-mono font-bold mt-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>ALL WINGS OPEN TODAY UNTIL 22:00 EST &bull; VISITORS WELCOME</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── SECTION 1: OPENING HOURS ACROSS WINGS ───────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-b border-slate-200/80 dark:border-white/[0.08]">
        <div className="space-y-2 mb-8">
          <span className="font-mono text-[10px] uppercase tracking-widest text-amber-600 dark:text-amber-400 font-bold">
            WING OPERATING HOURS
          </span>
          <h2 className="font-serif-editorial text-3xl font-bold text-slate-900 dark:text-white">
            Opening Schedule by Department
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-sans max-w-xl">
            Each research pavilion operates tailored schedules to accommodate general public reading,
            specialized rare book handling, and fellowship research.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {wingHours.map((wing) => (
            <div
              key={wing.name}
              className="hairline-card rounded-2xl bg-white dark:bg-[#111523] border border-slate-200 dark:border-white/10 p-6 space-y-4 hover:border-amber-500/30 transition-all shadow-xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: wing.accentColor }}
                  />
                  <h3 className="font-serif-editorial text-xl font-bold text-slate-900 dark:text-white">
                    {wing.name}
                  </h3>
                </div>
                <span className="font-mono text-[9px] uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold">
                  {wing.status}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#fbf9f5] dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04] text-xs font-mono text-amber-700 dark:text-amber-400 font-bold">
                <Clock className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
                {wing.schedule}
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 font-sans leading-relaxed">
                {wing.description}
              </p>

              <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span className="text-[10px] uppercase tracking-wider text-slate-400">ACCESS:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{wing.access}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECTION 2: INTERACTIVE FLOOR PLAN & DIRECTORY ───────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-b border-slate-200/80 dark:border-white/[0.08]">
        <div className="space-y-2 mb-8">
          <span className="font-mono text-[10px] uppercase tracking-widest text-amber-600 dark:text-amber-400 font-bold">
            ARCHITECTURAL SCHEMATIC
          </span>
          <h2 className="font-serif-editorial text-3xl font-bold text-slate-900 dark:text-white">
            Floor Directory &amp; Navigation Map
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-sans max-w-xl">
            Select a floor level to view wings, collection placements, elevator banks, and scholar amenities.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Floor Level Selector */}
          <div className="lg:col-span-4 space-y-2">
            {floorDirectory.map((f) => (
              <button
                key={f.floor}
                onClick={() => setActiveFloor(f.floor)}
                className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between ${
                  activeFloor === f.floor
                    ? 'bg-slate-950 dark:bg-white text-white dark:text-slate-950 border-transparent shadow-md'
                    : 'bg-white dark:bg-[#111523] text-slate-800 dark:text-slate-200 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                <div>
                  <span className="font-mono text-xs font-extrabold uppercase tracking-wider block">
                    {f.floor}
                  </span>
                  <span className="font-serif-editorial text-sm font-semibold truncate block mt-0.5 max-w-[240px]">
                    {f.levelName.split('&')[0]}
                  </span>
                </div>
                <ChevronRight className={`w-4 h-4 shrink-0 ${activeFloor === f.floor ? 'text-amber-400' : 'text-slate-400'}`} />
              </button>
            ))}
          </div>

          {/* Active Floor Detail Card & Diagram */}
          <div className="lg:col-span-8 hairline-card rounded-3xl bg-white dark:bg-[#111523] border border-slate-200 dark:border-white/10 p-6 sm:p-8 space-y-6">
            
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-white/5 pb-4">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-amber-600 dark:text-amber-400 font-bold">
                  ACTIVE FLOOR SELECTION
                </span>
                <h3 className="font-serif-editorial text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
                  {selectedFloorData.floor}: {selectedFloorData.levelName}
                </h3>
              </div>
              <span className="font-mono text-xs px-3 py-1 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold">
                Level Map Active
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-sans leading-relaxed">
              {selectedFloorData.highlights}
            </p>

            {/* Wings on This Floor */}
            <div className="space-y-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400 font-bold block">
                CORRIDORS &amp; READING ROOMS:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {selectedFloorData.wings.map((wing, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-[#fbf9f5] dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04] text-xs font-medium text-slate-800 dark:text-slate-200"
                  >
                    <Building className="w-3.5 h-3.5 text-amber-500 mb-1" />
                    <span>{wing}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Amenities on This Floor */}
            <div className="space-y-2 pt-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400 font-bold block">
                AVAILABLE RESEARCH AMENITIES:
              </span>
              <div className="flex flex-wrap gap-2">
                {selectedFloorData.amenities.map((amenity, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200/60 dark:border-white/[0.06] text-xs text-slate-700 dark:text-slate-300 font-mono"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{amenity}</span>
                  </span>
                ))}
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ── SECTION 3: INSTITUTIONAL POLICIES ──────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-b border-slate-200/80 dark:border-white/[0.08]">
        <div className="space-y-2 mb-8">
          <span className="font-mono text-[10px] uppercase tracking-widest text-amber-600 dark:text-amber-400 font-bold">
            TERMS OF THE ARCHIVE
          </span>
          <h2 className="font-serif-editorial text-3xl font-bold text-slate-900 dark:text-white">
            Library Policies &amp; Preservation Standards
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-sans max-w-xl">
            Established protocols to balance open scholarly enquiry with the meticulous physical conservation
            of delicate folios and collective intellectual tranquility.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {institutionalPolicies.map((pol) => {
            const Icon = pol.icon;
            return (
              <div
                key={pol.title}
                className="hairline-card rounded-2xl bg-white dark:bg-[#111523] border border-slate-200 dark:border-white/10 p-6 space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif-editorial text-xl font-bold text-slate-900 dark:text-white">
                      {pol.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-sans">{pol.summary}</p>
                  </div>
                </div>

                <ul className="space-y-2 pt-2 text-xs font-sans text-slate-600 dark:text-slate-300">
                  {pol.rules.map((rule, rIdx) => (
                    <li key={rIdx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                      <span className="leading-relaxed">{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── SECTION 4: RESEARCH FELLOWSHIPS & CONSULTATIONS ────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-b border-slate-200/80 dark:border-white/[0.08]">
        <div className="hairline-card rounded-3xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 p-8 sm:p-12">
          <div className="max-w-3xl space-y-5">
            <span className="font-mono text-[10px] uppercase tracking-widest text-amber-700 dark:text-amber-400 font-bold px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 inline-block">
              SCHOLARLY INITIATIVE
            </span>

            <h2 className="font-serif-editorial text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white leading-tight">
              Resident Research Fellowships &amp; Rare Book Consultations
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-sans leading-relaxed">
              Patel &amp; Co. awards up to twelve annual residential fellowships to doctoral candidates,
              historians of science, and literary translators. Fellows receive a private research carrel on Floor 3,
              unrestricted access to the Special Collections vault, high-speed compute clusters, and a modest research stipend.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-white/80 dark:bg-[#111523]/80 border border-slate-200 dark:border-white/10 text-xs space-y-1">
                <span className="font-mono text-[10px] uppercase text-amber-600 font-bold block">TERM LENGTH</span>
                <p className="font-serif-editorial text-base font-bold text-slate-900 dark:text-white">3 to 9 Months</p>
                <p className="text-[11px] text-slate-500">Full carrel allocation</p>
              </div>

              <div className="p-4 rounded-xl bg-white/80 dark:bg-[#111523]/80 border border-slate-200 dark:border-white/10 text-xs space-y-1">
                <span className="font-mono text-[10px] uppercase text-amber-600 font-bold block">RESEARCH STIPEND</span>
                <p className="font-serif-editorial text-base font-bold text-slate-900 dark:text-white">$4,500 / Month</p>
                <p className="text-[11px] text-slate-500">Plus digitization quota</p>
              </div>

              <div className="p-4 rounded-xl bg-white/80 dark:bg-[#111523]/80 border border-slate-200 dark:border-white/10 text-xs space-y-1">
                <span className="font-mono text-[10px] uppercase text-amber-600 font-bold block">APPLICATION WINDOW</span>
                <p className="font-serif-editorial text-base font-bold text-slate-900 dark:text-white">Open for 2027</p>
                <p className="text-[11px] text-slate-500">Deadline December 15</p>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => alert('Fellowship syllabus and application prospectus PDF downloaded.')}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm transition-all shadow-xs inline-flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download Fellowship Prospectus (.PDF)</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 5: HISTORICAL TIMELINE ─────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-b border-slate-200/80 dark:border-white/[0.08]">
        <div className="space-y-2 mb-10">
          <span className="font-mono text-[10px] uppercase tracking-widest text-amber-600 dark:text-amber-400 font-bold">
            CHRONICLES OF PATEL &amp; CO.
          </span>
          <h2 className="font-serif-editorial text-3xl font-bold text-slate-900 dark:text-white">
            Historical Timeline (1894 – Present)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-sans max-w-xl">
            Over a century of archival stewardship, architectural additions, and pioneering digital humanities.
          </p>
        </div>

        <div className="relative border-l-2 border-slate-200 dark:border-white/10 ml-4 sm:ml-6 space-y-10 pl-6 sm:pl-8">
          {historicalTimeline.map((item, idx) => (
            <motion.div
              key={item.year}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: idx * 0.05 }}
              className="relative"
            >
              {/* Bullet Dot */}
              <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full bg-amber-500 border-4 border-[#fbf9f5] dark:border-[#090b11] shadow-xs" />

              <span className="font-mono text-sm font-extrabold text-amber-700 dark:text-amber-400 block mb-0.5">
                {item.year}
              </span>

              <h3 className="font-serif-editorial text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-snug">
                {item.title}
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-sans leading-relaxed mt-1 max-w-3xl">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── SECTION 6: ASK A LIBRARIAN FORM ────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Form Context */}
          <div className="lg:col-span-5 space-y-4">
            <span className="font-mono text-[10px] uppercase tracking-widest text-amber-600 dark:text-amber-400 font-bold">
              REFERENCE DESK DISPATCH
            </span>
            <h2 className="font-serif-editorial text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white leading-tight">
              Ask a Librarian
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-sans leading-relaxed">
              Have a complex bibliographic query? Need assistance locating rare manuscripts,
              deciphering shelf marks, or requesting inter-library loans? Our master reference librarians
              provide thorough responses within one business day.
            </p>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] space-y-3 text-xs font-mono">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Mail className="w-4 h-4 text-amber-500" />
                <span>reference@patelknowledge.org</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Phone className="w-4 h-4 text-amber-500" />
                <span>+1 (212) 555-1894 &bull; Ref Desk Ext. 4</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <MapPin className="w-4 h-4 text-amber-500" />
                <span>Level 1 Circulation Hall, Patel &amp; Co.</span>
              </div>
            </div>
          </div>

          {/* Form Card */}
          <div className="lg:col-span-7 hairline-card rounded-3xl bg-white dark:bg-[#111523] border border-slate-200 dark:border-white/10 p-6 sm:p-8 shadow-xl">
            {inquirySuccess ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/20">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-serif-editorial text-2xl font-bold text-slate-900 dark:text-white">
                  Inquiry Dispatched to Reference Desk
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-sm mx-auto font-sans">
                  A librarian has been assigned to your query and will reply to <strong className="text-slate-900 dark:text-white">{inquiryForm.email}</strong> shortly.
                </p>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-mono text-left">
                  <p className="text-slate-400">TICKET REF: <strong className="text-amber-600 dark:text-amber-400">REF-2026-8492</strong></p>
                  <p className="text-slate-400">SLA: <strong className="text-emerald-600 dark:text-emerald-400">Response within 24 business hours</strong></p>
                </div>
                <button
                  onClick={() => setInquirySuccess(false)}
                  className="px-6 py-2.5 rounded-xl bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-xs font-bold"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-mono text-[10px] uppercase tracking-widest text-slate-500 block mb-1 font-bold">
                      SCHOLAR NAME *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Arthur Pendelton"
                      value={inquiryForm.name}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#111523] border border-slate-300/80 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-mono text-[10px] uppercase tracking-widest text-slate-500 block mb-1 font-bold">
                      EMAIL ADDRESS *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="scholar@oxford.edu"
                      value={inquiryForm.email}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#111523] border border-slate-300/80 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-mono text-[10px] uppercase tracking-widest text-slate-500 block mb-1 font-bold">
                      INQUIRY TOPIC / NATURE
                    </label>
                    <select
                      value={inquiryForm.inquiryType}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, inquiryType: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#111523] border border-slate-300/80 dark:border-white/10 text-slate-900 dark:text-white text-xs focus:ring-1 focus:ring-amber-500 outline-none font-mono"
                    >
                      <option>General Research Question</option>
                      <option>Rare Manuscript &amp; Vault Access</option>
                      <option>Inter-Library Loan Request</option>
                      <option>Acquisitions / Purchase Suggestion</option>
                      <option>Scholar Fellowship Application</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-mono text-[10px] uppercase tracking-widest text-slate-500 block mb-1 font-bold">
                      SUBJECT LINE *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 1543 Copernicus Nuremberg Folio Citation"
                      value={inquiryForm.subject}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, subject: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#111523] border border-slate-300/80 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-mono text-[10px] uppercase tracking-widest text-slate-500 block mb-1 font-bold">
                    DETAILED INQUIRY DESCRIPTION *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe your research question, author, call number, or citation details..."
                    value={inquiryForm.message}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#111523] border border-slate-300/80 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 text-xs focus:ring-1 focus:ring-amber-500 outline-none resize-none font-sans"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm transition-all shadow-xs flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Inquiry to Reference Desk</span>
                </button>
              </form>
            )}
          </div>

        </div>
      </section>

    </div>
  );
}
