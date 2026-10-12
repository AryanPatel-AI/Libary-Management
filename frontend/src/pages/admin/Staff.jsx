import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  UserCheck,
  UserX,
  Search,
  Plus,
  Mail,
  Phone,
  Clock,
  Building2,
  Shield,
  Filter,
  LayoutGrid,
  List,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  MapPin,
  Calendar,
  X,
  Sparkles
} from 'lucide-react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

/* ── Initial Mock Staff Roster Data ── */
const INITIAL_STAFF = [
  {
    id: 'stf-001',
    employeeId: 'EMP-ARCH-014',
    name: 'Dr. Alistair Finch',
    email: 'a.finch@library.archive.org',
    phone: '+1 (555) 234-8901',
    role: 'Chief Archivist',
    department: 'Special Collections',
    shift: 'Morning: 08:00 – 16:00',
    assignedDesk: 'Rare Manuscripts Vault, Rm 4B',
    joinedDate: '2016-04-12',
    active: true,
    avatarColor: 'from-amber-600 to-amber-800',
    notes: 'Oversees historical manuscripts, 16th-century folios, and parchment preservation.',
  },
  {
    id: 'stf-002',
    employeeId: 'EMP-CIRC-082',
    name: 'Elena Rostova',
    email: 'e.rostova@library.archive.org',
    phone: '+1 (555) 456-1123',
    role: 'Circulation Supervisor',
    department: 'Circulation',
    shift: 'Midday: 10:00 – 18:00',
    assignedDesk: 'Main Circulation Desk, Central Hall',
    joinedDate: '2019-09-01',
    active: true,
    avatarColor: 'from-blue-600 to-indigo-800',
    notes: 'Coordinates patron lending desks, reserve shelf requests, and stack runners.',
  },
  {
    id: 'stf-003',
    employeeId: 'EMP-TECH-105',
    name: 'Marcus Vance',
    email: 'm.vance@library.archive.org',
    phone: '+1 (555) 789-3344',
    role: 'Cataloger',
    department: 'Technical Services',
    shift: 'Morning: 08:30 – 16:30',
    assignedDesk: 'Bibliographic Ingest Station, Wing C',
    joinedDate: '2021-02-15',
    active: true,
    avatarColor: 'from-emerald-600 to-teal-800',
    notes: 'Dewey Decimal authority formatting, MARC21 records, and subject headings.',
  },
  {
    id: 'stf-004',
    employeeId: 'EMP-DIGI-047',
    name: 'Sophia Chen',
    email: 's.chen@library.archive.org',
    phone: '+1 (555) 678-9902',
    role: 'IT Specialist',
    department: 'Digital Preservation',
    shift: 'Flexible: 09:00 – 17:00',
    assignedDesk: 'High-Res Optical Scanning Lab, 2nd Fl',
    joinedDate: '2022-07-10',
    active: true,
    avatarColor: 'from-purple-600 to-indigo-900',
    notes: 'High-throughput optical digitization, OCR verification, and cold storage backups.',
  },
  {
    id: 'stf-005',
    employeeId: 'EMP-CIRC-119',
    name: 'Julian Thorne',
    email: 'j.thorne@library.archive.org',
    phone: '+1 (555) 901-4455',
    role: 'Library Assistant',
    department: 'Circulation',
    shift: 'Evening: 13:00 – 21:00',
    assignedDesk: 'Holdings Pickup Counter & Returns',
    joinedDate: '2023-01-20',
    active: true,
    avatarColor: 'from-slate-600 to-slate-800',
    notes: 'Physical shelf restocking, barcode tagging, and patron self-checkout assistance.',
  },
  {
    id: 'stf-006',
    employeeId: 'EMP-SPEC-028',
    name: 'Beatrice Morales',
    email: 'b.morales@library.archive.org',
    phone: '+1 (555) 345-6677',
    role: 'Chief Archivist',
    department: 'Digital Preservation',
    shift: 'Morning: 08:00 – 16:00',
    assignedDesk: 'Microfilm & Audio Archive, Rm 12',
    joinedDate: '2018-11-05',
    active: false,
    avatarColor: 'from-rose-600 to-red-800',
    notes: 'On academic research sabbatical through Q3. Available for consulting on provenance.',
  },
];

const ROLES = [
  'Chief Archivist',
  'Circulation Supervisor',
  'Cataloger',
  'Library Assistant',
  'IT Specialist',
];

const DEPARTMENTS = [
  'Circulation',
  'Special Collections',
  'Digital Preservation',
  'Technical Services',
];

const ROLE_BADGE_STYLES = {
  'Chief Archivist': 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50',
  'Circulation Supervisor': 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/50',
  'Cataloger': 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50',
  'Library Assistant': 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  'IT Specialist': 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/50',
};

const Staff = () => {
  const [staffList, setStaffList] = useState(INITIAL_STAFF);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, ACTIVE, INACTIVE
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'card'

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Cataloger',
    department: 'Technical Services',
    shift: 'Morning: 08:30 – 16:30',
    assignedDesk: '',
    notes: '',
    active: true,
  });

  // Derived statistics
  const totalStaff = staffList.length;
  const activeStaff = staffList.filter((s) => s.active).length;
  const deptCount = new Set(staffList.map((s) => s.department)).size;
  const onDutyCount = staffList.filter((s) => s.active && (s.shift.toLowerCase().includes('morning') || s.shift.toLowerCase().includes('midday'))).length;

  // Filtered staff list
  const filteredStaff = useMemo(() => {
    return staffList.filter((staff) => {
      const matchesSearch =
        staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        staff.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        staff.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        staff.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        staff.assignedDesk.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDept = selectedDept === 'ALL' || staff.department === selectedDept;
      const matchesRole = selectedRole === 'ALL' || staff.role === selectedRole;
      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && staff.active) ||
        (statusFilter === 'INACTIVE' && !staff.active);

      return matchesSearch && matchesDept && matchesRole && matchesStatus;
    });
  }, [staffList, searchQuery, selectedDept, selectedRole, statusFilter]);

  // Toggle active status
  const handleToggleStatus = (id) => {
    setStaffList((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextState = !item.active;
          toast.info(
            `${item.name} is now ${nextState ? 'Active' : 'On Leave / Inactive'}`
          );
          return { ...item, active: nextState };
        }
        return item;
      })
    );
  };

  // Open Add Dialog
  const handleOpenAdd = () => {
    setEditingStaff(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'Library Assistant',
      department: 'Circulation',
      shift: 'Morning: 08:30 – 16:30',
      assignedDesk: 'Main Circulation Desk',
      notes: '',
      active: true,
    });
    setIsModalOpen(true);
  };

  // Open Edit Dialog
  const handleOpenEdit = (staff) => {
    setEditingStaff(staff);
    setFormData({
      name: staff.name,
      email: staff.email,
      phone: staff.phone,
      role: staff.role,
      department: staff.department,
      shift: staff.shift,
      assignedDesk: staff.assignedDesk,
      notes: staff.notes || '',
      active: staff.active,
    });
    setIsModalOpen(true);
  };

  // Delete Staff
  const handleDelete = async (staff) => {
    const result = await Swal.fire({
      title: `Revoke ${staff.name}?`,
      text: `This will remove employee ${staff.employeeId} from the active library roster.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#4f46e5',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Yes, remove',
      cancelButtonText: 'Cancel',
      background: document.documentElement.classList.contains('dark') ? '#0f172a' : '#fff',
      color: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
    });

    if (result.isConfirmed) {
      setStaffList((prev) => prev.filter((s) => s.id !== staff.id));
      toast.success(`Removed ${staff.name} from staff registry`);
    }
  };

  // Submit Add / Edit
  const handleSubmitForm = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error('Staff name and email address are required.');
      return;
    }

    if (editingStaff) {
      setStaffList((prev) =>
        prev.map((s) =>
          s.id === editingStaff.id
            ? { ...s, ...formData }
            : s
        )
      );
      toast.success(`Updated details for ${formData.name}`);
    } else {
      const newStaff = {
        id: `stf-${Date.now().toString().slice(-4)}`,
        employeeId: `EMP-${formData.department.slice(0, 4).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
        ...formData,
        joinedDate: new Date().toISOString().split('T')[0],
        avatarColor: 'from-amber-600 to-indigo-800',
      };
      setStaffList((prev) => [newStaff, ...prev]);
      toast.success(`Added ${newStaff.name} to staff roster`);
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
              Institutional Administration
            </span>
          </div>
          <h1 className="font-serif-editorial text-3xl md:text-4xl font-bold text-foreground tracking-tight">
            Library Staff Roster
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl font-sans">
            Manage institutional staff members, archival appointments, departmental shifts, and duty credentials across the library network.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-foreground text-background dark:bg-amber-500 dark:text-slate-950 font-bold text-sm shadow-md hover:opacity-90 transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Staff Member
        </button>
      </div>

      {/* ── Metric Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-card border border-border hairline-card metric-amber">
          <div className="flex items-center justify-between mb-2">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Total Roster
            </p>
            <Users className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-foreground">{totalStaff}</p>
          <p className="text-xs text-muted-foreground mt-1">Institutional personnel</p>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border hairline-card metric-green">
          <div className="flex items-center justify-between mb-2">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Active Status
            </p>
            <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-foreground">{activeStaff}</p>
          <p className="text-xs text-muted-foreground mt-1">Currently on active duty</p>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border hairline-card metric-blue">
          <div className="flex items-center justify-between mb-2">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Shifts Covered
            </p>
            <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-foreground">{onDutyCount}</p>
          <p className="text-xs text-muted-foreground mt-1">Morning & midday coverage</p>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border hairline-card metric-purple">
          <div className="flex items-center justify-between mb-2">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Departments
            </p>
            <Building2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-foreground">{deptCount}</p>
          <p className="text-xs text-muted-foreground mt-1">Operational divisions</p>
        </div>
      </div>

      {/* ── Search & Filter Controls ── */}
      <div className="p-4 rounded-2xl bg-card border border-border hairline-card flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Search input */}
        <div className="relative w-full lg:w-80">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search staff, ID, role, or desk..."
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

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          {/* Department */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Filter className="w-3.5 h-3.5 hidden sm:inline" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-muted/40 border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
            >
              <option value="ALL">All Departments</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Role */}
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-muted/40 border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
          >
            <option value="ALL">All Roles</option>
            {ROLES.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-muted/40 border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Duty</option>
            <option value="INACTIVE">On Leave / Inactive</option>
          </select>

          {/* View Toggle */}
          <div className="flex items-center border border-border rounded-xl p-0.5 bg-muted/30 ml-auto">
            <button
              onClick={() => setViewMode('table')}
              title="Table View"
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'table'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('card')}
              title="Card Grid View"
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'card'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Main View Content ── */}
      {filteredStaff.length === 0 ? (
        <div className="p-12 text-center bg-card border border-border rounded-3xl hairline-card">
          <AlertCircle className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
          <p className="font-serif-editorial text-lg font-bold text-foreground">
            No staff records matched
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Try adjusting your search query, department, or role filter criteria.
          </p>
        </div>
      ) : viewMode === 'table' ? (
        /* ── TABLE VIEW ── */
        <div className="bg-card border border-border rounded-3xl overflow-hidden hairline-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  <th className="th-cell">Staff Member</th>
                  <th className="th-cell">Role &amp; Department</th>
                  <th className="th-cell">Shift Schedule</th>
                  <th className="th-cell">Desk / Station</th>
                  <th className="th-cell">Status</th>
                  <th className="th-cell text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredStaff.map((staff) => (
                  <tr
                    key={staff.id}
                    className="hover:bg-muted/30 transition-colors group"
                  >
                    {/* Staff Member Details */}
                    <td className="td-cell">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl bg-gradient-to-br ${staff.avatarColor} text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm`}
                        >
                          {staff.name
                            .split(' ')
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join('')}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-sm text-foreground leading-tight">
                              {staff.name}
                            </p>
                          </div>
                          <p className="font-mono text-[10px] text-muted-foreground tracking-wider mt-0.5">
                            {staff.employeeId}
                          </p>
                          <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" /> {staff.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" /> {staff.phone}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Role & Dept */}
                    <td className="td-cell">
                      <div className="space-y-1">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            ROLE_BADGE_STYLES[staff.role] ||
                            'bg-muted text-muted-foreground'
                          }`}
                        >
                          {staff.role}
                        </span>
                        <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-muted-foreground/70" />
                          {staff.department}
                        </p>
                      </div>
                    </td>

                    {/* Shift Schedule */}
                    <td className="td-cell">
                      <div className="flex items-center gap-1.5 text-xs text-foreground font-medium">
                        <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                        <span>{staff.shift}</span>
                      </div>
                      <p className="font-mono text-[9px] text-muted-foreground mt-0.5">
                        Since {staff.joinedDate}
                      </p>
                    </td>

                    {/* Desk Location */}
                    <td className="td-cell">
                      <div className="flex items-start gap-1.5 text-xs text-muted-foreground max-w-xs">
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0 mt-0.5" />
                        <span className="truncate">{staff.assignedDesk}</span>
                      </div>
                    </td>

                    {/* Active Status Toggle */}
                    <td className="td-cell">
                      <button
                        onClick={() => handleToggleStatus(staff.id)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                          staff.active
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                            : 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            staff.active
                              ? 'bg-emerald-500 animate-pulse'
                              : 'bg-rose-500'
                          }`}
                        />
                        {staff.active ? 'Active' : 'On Leave'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="td-cell text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(staff)}
                          title="Edit Staff Member"
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(staff)}
                          title="Revoke Record"
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
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
      ) : (
        /* ── CARD GRID VIEW ── */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredStaff.map((staff) => (
            <motion.div
              key={staff.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-3xl bg-card border border-border hairline-card flex flex-col justify-between hover:shadow-md transition-all group"
            >
              <div>
                {/* Card Top */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${staff.avatarColor} text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-sm`}
                    >
                      {staff.name
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-foreground leading-snug">
                        {staff.name}
                      </h3>
                      <p className="font-mono text-[10px] text-muted-foreground">
                        {staff.employeeId}
                      </p>
                    </div>
                  </div>

                  {/* Active status pill */}
                  <button
                    onClick={() => handleToggleStatus(staff.id)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                      staff.active
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300'
                        : 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300'
                    }`}
                  >
                    {staff.active ? 'Active' : 'On Leave'}
                  </button>
                </div>

                {/* Role and Department */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      ROLE_BADGE_STYLES[staff.role] ||
                      'bg-muted text-muted-foreground'
                    }`}
                  >
                    {staff.role}
                  </span>
                  <span className="font-mono text-[10px] uppercase text-muted-foreground px-2 py-0.5 rounded-md bg-muted/40">
                    {staff.department}
                  </span>
                </div>

                {/* Details List */}
                <div className="space-y-1.5 text-xs text-muted-foreground pt-2 border-t border-border/60">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span className="text-foreground font-medium truncate">{staff.shift}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="truncate">{staff.assignedDesk}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <a
                      href={`mailto:${staff.email}`}
                      className="truncate hover:underline hover:text-foreground"
                    >
                      {staff.email}
                    </a>
                  </div>
                </div>

                {staff.notes && (
                  <p className="text-[11px] text-muted-foreground/80 mt-3 p-2.5 rounded-xl bg-muted/30 italic line-clamp-2">
                    "{staff.notes}"
                  </p>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-border">
                <span className="font-mono text-[9px] text-muted-foreground">
                  Joined {staff.joinedDate}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(staff)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                    title="Edit Record"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(staff)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                    title="Remove Record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Add / Edit Staff Modal ── */}
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
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <h2 className="font-serif-editorial text-lg font-bold text-foreground">
                    {editingStaff ? 'Edit Staff Record' : 'Add Staff Member'}
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
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="e.g. Dr. Eleanor Vance"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-muted/40 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="e.vance@library.archive.org"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-muted/40 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-muted/40 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Assigned Role
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({ ...formData, role: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl bg-muted/40 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Department
                    </label>
                    <select
                      value={formData.department}
                      onChange={(e) =>
                        setFormData({ ...formData, department: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl bg-muted/40 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
                    >
                      {DEPARTMENTS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Shift Schedule
                    </label>
                    <input
                      type="text"
                      value={formData.shift}
                      onChange={(e) =>
                        setFormData({ ...formData, shift: e.target.value })
                      }
                      placeholder="e.g. Morning: 08:00 – 16:00"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-muted/40 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Assigned Desk / Station
                  </label>
                  <input
                    type="text"
                    value={formData.assignedDesk}
                    onChange={(e) =>
                      setFormData({ ...formData, assignedDesk: e.target.value })
                    }
                    placeholder="e.g. Special Collections Archives, Room 4B"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-muted/40 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Archival Notes / Responsibilities
                  </label>
                  <textarea
                    rows={2}
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    placeholder="Specializations, rare book handling permits, security clearances..."
                    className="w-full px-3 py-2 text-xs rounded-xl bg-muted/40 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="staffActiveToggle"
                    checked={formData.active}
                    onChange={(e) =>
                      setFormData({ ...formData, active: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-border"
                  />
                  <label
                    htmlFor="staffActiveToggle"
                    className="text-xs text-foreground font-medium cursor-pointer"
                  >
                    Active on library roster
                  </label>
                </div>

                {/* Footer Buttons */}
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
                    {editingStaff ? 'Save Changes' : 'Confirm Registration'}
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

export default Staff;
