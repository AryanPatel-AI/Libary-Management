import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  BookOpen,
  Search,
  Plus,
  Edit2,
  Trash2,
  Clock,
  Percent,
  Mail,
  Phone,
  MapPin,
  Tag,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  X,
  ChevronRight,
  Sparkles,
  DollarSign,
  Truck,
  Layers
} from 'lucide-react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

/* ── Initial Publisher & Imprint Directory Data ── */
const INITIAL_PUBLISHERS = [
  {
    id: 'pub-001',
    name: 'Penguin Random House',
    headquarters: 'New York, USA',
    imprints: ['Viking', 'Knopf', 'Vintage Books', 'Anchor', 'Everyman\'s Library'],
    titlesAcquired: 542,
    contactRep: {
      name: 'Eleanor Vance',
      email: 'e.vance@penguinrandomhouse.com',
      phone: '+1 (212) 782-9000',
    },
    discountAgreement: '42% wholesale institutional discount on trade paperbacks; 38% on hardcover releases. Free courier freight on bulk orders over $500.',
    standardLeadTimeDays: 3,
    status: 'Preferred Vendor',
    paymentTerms: 'Net 30',
    averageDiscountPct: 42,
  },
  {
    id: 'pub-002',
    name: 'Oxford University Press',
    headquarters: 'Oxford, United Kingdom',
    imprints: ['Clarendon Press', 'Oxford World\'s Classics', 'Oxford Reference'],
    titlesAcquired: 418,
    contactRep: {
      name: 'Julian Hastings',
      email: 'j.hastings@oup.co.uk',
      phone: '+44 (1865) 556767',
    },
    discountAgreement: '38% standing order discount on academic monographs, 45% on Oxford World\'s Classics editions. Annual consortium rebate applicable.',
    standardLeadTimeDays: 7,
    status: 'Consortium Agreement',
    paymentTerms: 'Net 60',
    averageDiscountPct: 40,
  },
  {
    id: 'pub-003',
    name: 'The MIT Press',
    headquarters: 'Cambridge, MA, USA',
    imprints: ['Bradford Books', 'Zone Books', 'Leonardo Books'],
    titlesAcquired: 185,
    contactRep: {
      name: 'Dr. Claire Sterling',
      email: 'csterling@mit.edu',
      phone: '+1 (617) 253-5646',
    },
    discountAgreement: '35% institutional discount across computer science, cognitive science, and architecture texts. Direct digital preservation license inclusion.',
    standardLeadTimeDays: 4,
    status: 'Preferred Vendor',
    paymentTerms: 'Net 45',
    averageDiscountPct: 35,
  },
  {
    id: 'pub-004',
    name: 'HarperCollins Publishers',
    headquarters: 'New York, USA',
    imprints: ['William Morrow', 'Harper Perennial', 'Ecco Press', 'Avon'],
    titlesAcquired: 320,
    contactRep: {
      name: 'Marcus Bell',
      email: 'marcus.bell@harpercollins.com',
      phone: '+1 (212) 207-7000',
    },
    discountAgreement: '40% standard wholesale rate on current catalogue; returns accepted within 180 days in uncirculated condition.',
    standardLeadTimeDays: 5,
    status: 'Standard Academic',
    paymentTerms: 'Net 30',
    averageDiscountPct: 40,
  },
  {
    id: 'pub-005',
    name: 'O\'Reilly Media',
    headquarters: 'Sebastopol, CA, USA',
    imprints: ['O\'Reilly Technical', 'In a Nutshell', 'Head First Series'],
    titlesAcquired: 215,
    contactRep: {
      name: 'Devon Takahashi',
      email: 'dtakahashi@oreilly.com',
      phone: '+1 (707) 827-7000',
    },
    discountAgreement: '45% high-volume technical library tier discount; multi-seat digital companion repository access provided with physical shelf copies.',
    standardLeadTimeDays: 2,
    status: 'Preferred Vendor',
    paymentTerms: 'Net 30',
    averageDiscountPct: 45,
  },
  {
    id: 'pub-006',
    name: 'Bloomsbury Publishing',
    headquarters: 'London, United Kingdom',
    imprints: ['Bloomsbury Academic', 'Methuen Drama', 'The Arden Shakespeare', 'T&T Clark'],
    titlesAcquired: 164,
    contactRep: {
      name: 'Arthur Pendelton',
      email: 'a.pendelton@bloomsbury.com',
      phone: '+44 (20) 7631-5600',
    },
    discountAgreement: '36% discount on drama and humanities texts. Quarterly expedited container freight from UK distribution hub.',
    standardLeadTimeDays: 9,
    status: 'Standard Academic',
    paymentTerms: 'Net 45',
    averageDiscountPct: 36,
  },
];

const VENDOR_STATUS_STYLES = {
  'Preferred Vendor': 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
  'Consortium Agreement': 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800',
  'Standard Academic': 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
  'Under Review': 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
};

const AdminPublishers = () => {
  const [publishers, setPublishers] = useState(INITIAL_PUBLISHERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('titles'); // 'titles' | 'leadTime' | 'name'

  // Inspecting publisher drawer
  const [inspectingPub, setInspectingPub] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPub, setEditingPub] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    headquarters: '',
    imprintsStr: '',
    titlesAcquired: 0,
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    discountAgreement: '',
    standardLeadTimeDays: 5,
    status: 'Preferred Vendor',
    paymentTerms: 'Net 30',
    averageDiscountPct: 40,
  });

  // Derived Metrics
  const totalPublishers = publishers.length;
  const totalImprints = publishers.reduce((sum, p) => sum + p.imprints.length, 0);
  const totalTitlesAcquired = publishers.reduce((sum, p) => sum + p.titlesAcquired, 0);
  const avgLeadTime = (
    publishers.reduce((sum, p) => sum + p.standardLeadTimeDays, 0) / (publishers.length || 1)
  ).toFixed(1);
  const avgDiscount = Math.round(
    publishers.reduce((sum, p) => sum + p.averageDiscountPct, 0) / (publishers.length || 1)
  );

  // Filtered & Sorted
  const processedPublishers = useMemo(() => {
    let list = publishers.filter((p) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        p.name.toLowerCase().includes(q) ||
        p.headquarters.toLowerCase().includes(q) ||
        p.imprints.some((imp) => imp.toLowerCase().includes(q)) ||
        p.contactRep.name.toLowerCase().includes(q) ||
        p.contactRep.email.toLowerCase().includes(q);

      const matchStatus = statusFilter === 'ALL' || p.status === statusFilter;
      return matchSearch && matchStatus;
    });

    if (sortBy === 'titles') {
      list.sort((a, b) => b.titlesAcquired - a.titlesAcquired);
    } else if (sortBy === 'leadTime') {
      list.sort((a, b) => a.standardLeadTimeDays - b.standardLeadTimeDays);
    } else if (sortBy === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [publishers, searchQuery, statusFilter, sortBy]);

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingPub(null);
    setFormData({
      name: '',
      headquarters: '',
      imprintsStr: '',
      titlesAcquired: 10,
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      discountAgreement: '',
      standardLeadTimeDays: 5,
      status: 'Preferred Vendor',
      paymentTerms: 'Net 30',
      averageDiscountPct: 40,
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (pub) => {
    setEditingPub(pub);
    setFormData({
      name: pub.name,
      headquarters: pub.headquarters,
      imprintsStr: pub.imprints.join(', '),
      titlesAcquired: pub.titlesAcquired,
      contactName: pub.contactRep.name,
      contactEmail: pub.contactRep.email,
      contactPhone: pub.contactRep.phone,
      discountAgreement: pub.discountAgreement,
      standardLeadTimeDays: pub.standardLeadTimeDays,
      status: pub.status,
      paymentTerms: pub.paymentTerms,
      averageDiscountPct: pub.averageDiscountPct,
    });
    setIsModalOpen(true);
  };

  // Delete Publisher
  const handleDelete = async (pub) => {
    const res = await Swal.fire({
      title: `Remove ${pub.name}?`,
      text: `This will remove the publisher directory entry and trade agreements for ${pub.imprints.length} associated imprints.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete',
      background: document.documentElement.classList.contains('dark') ? '#0f172a' : '#fff',
      color: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
    });

    if (res.isConfirmed) {
      setPublishers((prev) => prev.filter((p) => p.id !== pub.id));
      if (inspectingPub?.id === pub.id) setInspectingPub(null);
      toast.success(`Removed publisher entry: ${pub.name}`);
    }
  };

  // Save Form
  const handleSubmitForm = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Publisher name is required.');
      return;
    }

    const imprintsArray = formData.imprintsStr
      ? formData.imprintsStr
          .split(',')
          .map((i) => i.trim())
          .filter(Boolean)
      : [formData.name];

    if (editingPub) {
      setPublishers((prev) =>
        prev.map((p) =>
          p.id === editingPub.id
            ? {
                ...p,
                name: formData.name,
                headquarters: formData.headquarters,
                imprints: imprintsArray,
                titlesAcquired: Number(formData.titlesAcquired) || 0,
                contactRep: {
                  name: formData.contactName,
                  email: formData.contactEmail,
                  phone: formData.contactPhone,
                },
                discountAgreement: formData.discountAgreement,
                standardLeadTimeDays: Number(formData.standardLeadTimeDays) || 5,
                status: formData.status,
                paymentTerms: formData.paymentTerms,
                averageDiscountPct: Number(formData.averageDiscountPct) || 35,
              }
            : p
        )
      );
      toast.success(`Updated publisher details for ${formData.name}`);
    } else {
      const newPub = {
        id: `pub-${Date.now().toString().slice(-4)}`,
        name: formData.name,
        headquarters: formData.headquarters || 'Unspecified',
        imprints: imprintsArray,
        titlesAcquired: Number(formData.titlesAcquired) || 0,
        contactRep: {
          name: formData.contactName,
          email: formData.contactEmail,
          phone: formData.contactPhone,
        },
        discountAgreement: formData.discountAgreement || 'Standard institutional wholesale pricing.',
        standardLeadTimeDays: Number(formData.standardLeadTimeDays) || 5,
        status: formData.status,
        paymentTerms: formData.paymentTerms || 'Net 30',
        averageDiscountPct: Number(formData.averageDiscountPct) || 35,
      };
      setPublishers((prev) => [newPub, ...prev]);
      toast.success(`Added ${newPub.name} to publisher directory`);
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
              Acquisitions &amp; Trade Agreements
            </span>
          </div>
          <h1 className="font-serif-editorial text-3xl md:text-4xl font-bold text-foreground tracking-tight">
            Publisher &amp; Imprint Directory
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl font-sans">
            Oversee trade publishers, affiliated distribution imprints, institutional discount terms, vendor representatives, and delivery lead times.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-foreground text-background dark:bg-amber-500 dark:text-slate-950 font-bold text-sm shadow-md hover:opacity-90 transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Publisher
        </button>
      </div>

      {/* ── Metric Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-card border border-border hairline-card metric-amber">
          <div className="flex items-center justify-between mb-2">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Publishing Houses
            </p>
            <Building2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-foreground">{totalPublishers}</p>
          <p className="text-xs text-muted-foreground mt-1">Contracted houses</p>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border hairline-card metric-blue">
          <div className="flex items-center justify-between mb-2">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Registered Imprints
            </p>
            <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-foreground">{totalImprints}</p>
          <p className="text-xs text-muted-foreground mt-1">Specialized presses</p>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border hairline-card metric-green">
          <div className="flex items-center justify-between mb-2">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Avg Lead Time
            </p>
            <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-foreground">{avgLeadTime} Days</p>
          <p className="text-xs text-muted-foreground mt-1">Standard dispatch turnaround</p>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border hairline-card metric-purple">
          <div className="flex items-center justify-between mb-2">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Avg Discount
            </p>
            <Percent className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-foreground">{avgDiscount}% Off</p>
          <p className="text-xs text-muted-foreground mt-1">Institutional agreement rate</p>
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
            placeholder="Search publisher, imprint, rep, or city..."
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
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-muted/40 border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
          >
            <option value="ALL">All Vendor Agreements</option>
            <option value="Preferred Vendor">Preferred Vendor</option>
            <option value="Consortium Agreement">Consortium Agreement</option>
            <option value="Standard Academic">Standard Academic</option>
            <option value="Under Review">Under Review</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-muted/40 border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
          >
            <option value="titles">Sort by: Titles Acquired</option>
            <option value="leadTime">Sort by: Fastest Lead Time</option>
            <option value="name">Sort by: Alphabetical (A-Z)</option>
          </select>
        </div>
      </div>

      {/* ── Publishers Table ── */}
      <div className="bg-card border border-border rounded-3xl overflow-hidden hairline-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                <th className="th-cell">Publisher &amp; Headquarters</th>
                <th className="th-cell">Distribution Imprints</th>
                <th className="th-cell">Contact Representative</th>
                <th className="th-cell">Discount &amp; Terms</th>
                <th className="th-cell text-center">Lead Time</th>
                <th className="th-cell text-center">Acquired</th>
                <th className="th-cell text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {processedPublishers.map((pub) => (
                <tr
                  key={pub.id}
                  className="hover:bg-muted/30 transition-colors group cursor-default"
                >
                  {/* Publisher Name & Location */}
                  <td className="td-cell">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setInspectingPub(pub)}
                          className="font-serif-editorial text-sm sm:text-base font-bold text-foreground hover:underline text-left"
                        >
                          {pub.name}
                        </button>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3 text-muted-foreground/70 shrink-0" />
                        <span>{pub.headquarters}</span>
                      </div>
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          VENDOR_STATUS_STYLES[pub.status] || 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {pub.status}
                      </span>
                    </div>
                  </td>

                  {/* Imprints Tags */}
                  <td className="td-cell max-w-xs">
                    <div className="flex flex-wrap gap-1.5">
                      {pub.imprints.map((imp, idx) => (
                        <span
                          key={idx}
                          className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-muted/50 border border-border/60 text-foreground"
                        >
                          {imp}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Contact Rep */}
                  <td className="td-cell">
                    <div className="space-y-0.5 text-xs">
                      <p className="font-semibold text-foreground">{pub.contactRep.name}</p>
                      <a
                        href={`mailto:${pub.contactRep.email}`}
                        className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground hover:underline"
                      >
                        <Mail className="w-3 h-3 text-muted-foreground/70" />
                        {pub.contactRep.email}
                      </a>
                      <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Phone className="w-3 h-3 text-muted-foreground/70" />
                        {pub.contactRep.phone}
                      </p>
                    </div>
                  </td>

                  {/* Discount Agreement */}
                  <td className="td-cell max-w-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>{pub.averageDiscountPct}% Discount • {pub.paymentTerms}</span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2" title={pub.discountAgreement}>
                        {pub.discountAgreement}
                      </p>
                    </div>
                  </td>

                  {/* Standard Acquisition Lead Time */}
                  <td className="td-cell text-center">
                    <span className="inline-flex items-center gap-1 font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-muted/60 text-foreground border border-border/60">
                      <Truck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      {pub.standardLeadTimeDays}d
                    </span>
                  </td>

                  {/* Catalog Titles Acquired */}
                  <td className="td-cell text-center">
                    <span className="font-mono text-xs font-bold text-foreground bg-muted/50 px-2.5 py-1 rounded-lg border border-border/60">
                      {pub.titlesAcquired.toLocaleString()}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="td-cell text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setInspectingPub(pub)}
                        title="View Full Directory Dossier"
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(pub)}
                        title="Edit Publisher Agreement"
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(pub)}
                        title="Delete Publisher"
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

      {/* ── Publisher Dossier Modal ── */}
      <AnimatePresence>
        {inspectingPub && (
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
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-serif-editorial text-xl font-bold text-foreground">
                      {inspectingPub.name}
                    </h2>
                    <p className="font-mono text-xs text-muted-foreground">
                      {inspectingPub.headquarters} • {inspectingPub.status}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setInspectingPub(null)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-muted/30 border border-border/60">
                    <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                      Titles Acquired
                    </p>
                    <p className="text-sm font-bold text-foreground mt-0.5">
                      {inspectingPub.titlesAcquired.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/30 border border-border/60">
                    <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                      Lead Turnaround
                    </p>
                    <p className="text-sm font-bold text-foreground mt-0.5">
                      {inspectingPub.standardLeadTimeDays} Business Days
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/30 border border-border/60">
                    <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                      Payment Terms
                    </p>
                    <p className="text-sm font-bold text-foreground mt-0.5">
                      {inspectingPub.paymentTerms}
                    </p>
                  </div>
                </div>

                {/* Imprints */}
                <div>
                  <h4 className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
                    Registered Imprints &amp; Distribution Presses
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {inspectingPub.imprints.map((imp, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-muted text-xs font-semibold text-foreground border border-border"
                      >
                        {imp}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Agreement Terms */}
                <div>
                  <h4 className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                    Wholesale Agreement &amp; Freight Policy
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed p-3.5 rounded-2xl bg-muted/20 border border-border/50">
                    {inspectingPub.discountAgreement}
                  </p>
                </div>

                {/* Representative */}
                <div className="p-4 rounded-2xl bg-muted/30 border border-border/60">
                  <h4 className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
                    Designated Account Representative
                  </h4>
                  <div className="space-y-1 text-xs">
                    <p className="font-bold text-foreground">{inspectingPub.contactRep.name}</p>
                    <p className="text-muted-foreground">
                      Email: <a href={`mailto:${inspectingPub.contactRep.email}`} className="text-foreground hover:underline">{inspectingPub.contactRep.email}</a>
                    </p>
                    <p className="text-muted-foreground">
                      Phone: <span className="text-foreground">{inspectingPub.contactRep.phone}</span>
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                  <button
                    onClick={() => {
                      const curr = inspectingPub;
                      setInspectingPub(null);
                      handleOpenEdit(curr);
                    }}
                    className="px-4 py-2 text-xs font-semibold rounded-xl border border-border hover:bg-muted transition-colors text-foreground flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit Agreement
                  </button>
                  <button
                    onClick={() => setInspectingPub(null)}
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

      {/* ── Add / Edit Publisher Modal ── */}
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
                    <Building2 className="w-4 h-4" />
                  </div>
                  <h2 className="font-serif-editorial text-lg font-bold text-foreground">
                    {editingPub ? 'Edit Publisher & Agreement' : 'Add Publisher'}
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Publishing House Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="e.g. Cambridge University Press"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-muted/40 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Headquarters (City, Country)
                    </label>
                    <input
                      type="text"
                      value={formData.headquarters}
                      onChange={(e) =>
                        setFormData({ ...formData, headquarters: e.target.value })
                      }
                      placeholder="e.g. Cambridge, United Kingdom"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-muted/40 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Imprints &amp; Affiliated Presses (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.imprintsStr}
                    onChange={(e) =>
                      setFormData({ ...formData, imprintsStr: e.target.value })
                    }
                    placeholder="e.g. Clarendon Press, Cambridge Library Collection"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-muted/40 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Contact Rep Name
                    </label>
                    <input
                      type="text"
                      value={formData.contactName}
                      onChange={(e) =>
                        setFormData({ ...formData, contactName: e.target.value })
                      }
                      placeholder="e.g. Eleanor Vance"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-muted/40 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) =>
                        setFormData({ ...formData, contactEmail: e.target.value })
                      }
                      placeholder="rep@publisher.com"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-muted/40 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Contact Phone
                    </label>
                    <input
                      type="text"
                      value={formData.contactPhone}
                      onChange={(e) =>
                        setFormData({ ...formData, contactPhone: e.target.value })
                      }
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-muted/40 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Vendor Agreement Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl bg-muted/40 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
                    >
                      <option value="Preferred Vendor">Preferred Vendor</option>
                      <option value="Consortium Agreement">Consortium Agreement</option>
                      <option value="Standard Academic">Standard Academic</option>
                      <option value="Under Review">Under Review</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Standard Lead Time (Days)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.standardLeadTimeDays}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          standardLeadTimeDays: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl bg-muted/40 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Payment Terms
                    </label>
                    <select
                      value={formData.paymentTerms}
                      onChange={(e) =>
                        setFormData({ ...formData, paymentTerms: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl bg-muted/40 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 font-mono"
                    >
                      <option value="Net 30">Net 30</option>
                      <option value="Net 45">Net 45</option>
                      <option value="Net 60">Net 60</option>
                      <option value="Immediate">Immediate</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Discount Agreement Notes &amp; Terms
                  </label>
                  <textarea
                    rows={2}
                    value={formData.discountAgreement}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discountAgreement: e.target.value,
                      })
                    }
                    placeholder="Institutional discount rates, freight allowances, standing order terms..."
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
                    {editingPub ? 'Save Changes' : 'Confirm Publisher Record'}
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

export default AdminPublishers;
