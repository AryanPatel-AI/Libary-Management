import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  ShieldAlert,
  Shield,
  Users,
  Check,
  X,
  Plus,
  RotateCcw,
  Search,
  Key,
  Lock,
  Unlock,
  AlertCircle,
  HelpCircle,
  FileCheck2,
  Edit2,
  Sliders,
  ChevronRight,
  Info,
  Sparkles
} from 'lucide-react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

/* ── 6 Core Required Permissions + Definitions ── */
const PERMISSIONS = [
  {
    id: 'circulationCheckout',
    label: 'Circulation checkout',
    shortCode: 'CIRC_ISSUE',
    category: 'Operations',
    description: 'Grant authority to issue books, process loan renewals, and execute circulation returns.',
  },
  {
    id: 'catalogEditing',
    label: 'Catalog editing',
    shortCode: 'CAT_EDIT',
    category: 'Catalog',
    description: 'Create, revise, and purge bibliographic records, MARC metadata, and author authorities.',
  },
  {
    id: 'inventoryAudit',
    label: 'Inventory audit',
    shortCode: 'INV_AUDIT',
    category: 'Operations',
    description: 'Initiate shelf scans, reconcile physical inventory discrepancies, and modify shelf codes.',
  },
  {
    id: 'memberOverrides',
    label: 'Member overrides',
    shortCode: 'MEM_OVRD',
    category: 'Governance',
    description: 'Bypass borrowing quotas, unlock suspended patron cards, and grant special privilege tiers.',
  },
  {
    id: 'financialWaiver',
    label: 'Financial waiver',
    shortCode: 'FIN_WAIVE',
    category: 'Finance',
    description: 'Waive overdue fines, issue damage assessment clearances, and process institutional discounts.',
  },
  {
    id: 'systemConfig',
    label: 'System config',
    shortCode: 'SYS_CONF',
    category: 'Governance',
    description: 'Configure operational policies, branch hours, API tokens, security certificates, and RBAC matrix.',
  },
];

/* ── Default System Roles ── */
const DEFAULT_ROLES = [
  {
    id: 'role-admin',
    name: 'Admin',
    code: 'ROLE_ADMIN',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
    description: 'Full sovereign governance over all library branches, catalog databases, policies, and system infrastructure.',
    assignedUserCount: 4,
    isSystem: true,
    permissions: {
      circulationCheckout: true,
      catalogEditing: true,
      inventoryAudit: true,
      memberOverrides: true,
      financialWaiver: true,
      systemConfig: true,
    },
  },
  {
    id: 'role-librarian',
    name: 'Librarian',
    code: 'ROLE_LIBRARIAN',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    description: 'Comprehensive bibliographic cataloging, circulation desk leadership, shelf audits, and patron fee exemptions.',
    assignedUserCount: 12,
    isSystem: true,
    permissions: {
      circulationCheckout: true,
      catalogEditing: true,
      inventoryAudit: true,
      memberOverrides: true,
      financialWaiver: true,
      systemConfig: false,
    },
  },
  {
    id: 'role-staff',
    name: 'Staff',
    code: 'ROLE_STAFF',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
    description: 'Operational front-desk execution, physical shelf check-ins, barcode verification, and basic hold staging.',
    assignedUserCount: 28,
    isSystem: true,
    permissions: {
      circulationCheckout: true,
      catalogEditing: false,
      inventoryAudit: true,
      memberOverrides: false,
      financialWaiver: false,
      systemConfig: false,
    },
  },
  {
    id: 'role-patron',
    name: 'Patron',
    code: 'ROLE_PATRON',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    description: 'Standard library membership. Browse collection, reserve titles online, borrow up to quota, and manage account.',
    assignedUserCount: 1420,
    isSystem: true,
    permissions: {
      circulationCheckout: false,
      catalogEditing: false,
      inventoryAudit: false,
      memberOverrides: false,
      financialWaiver: false,
      systemConfig: false,
    },
  },
  {
    id: 'role-researcher',
    name: 'Academic Researcher',
    code: 'ROLE_RESEARCHER',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800',
    description: 'Accredited university scholars and fellows. Extended loan durations, access to rare archives, and bulk reference holds.',
    assignedUserCount: 86,
    isSystem: true,
    permissions: {
      circulationCheckout: false,
      catalogEditing: false,
      inventoryAudit: false,
      memberOverrides: false,
      financialWaiver: false,
      systemConfig: false,
    },
  },
];

const Roles = () => {
  const [roles, setRoles] = useState(DEFAULT_ROLES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [isModified, setIsModified] = useState(false);

  // Modal State for adding/editing role
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    assignedUserCount: 0,
    permissions: {
      circulationCheckout: false,
      catalogEditing: false,
      inventoryAudit: false,
      memberOverrides: false,
      financialWaiver: false,
      systemConfig: false,
    },
  });

  // Derived Metrics
  const totalRoles = roles.length;
  const totalAssignedUsers = roles.reduce((sum, r) => sum + r.assignedUserCount, 0);
  const totalGrantedPermissions = roles.reduce((sum, r) => {
    return sum + Object.values(r.permissions).filter(Boolean).length;
  }, 0);
  const elevatedRolesCount = roles.filter(
    (r) => r.permissions.systemConfig || r.permissions.financialWaiver
  ).length;

  // Filtered roles
  const filteredRoles = useMemo(() => {
    return roles.filter((role) => {
      const matchSearch =
        role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        role.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        role.code.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSearch;
    });
  }, [roles, searchQuery]);

  // Filtered permission columns
  const filteredPermissions = useMemo(() => {
    if (selectedCategory === 'ALL') return PERMISSIONS;
    return PERMISSIONS.filter((p) => p.category === selectedCategory);
  }, [selectedCategory]);

  // Toggle a single permission cell
  const handleTogglePermission = (roleId, permissionKey) => {
    const targetRole = roles.find((r) => r.id === roleId);
    if (!targetRole) return;

    // Safety guard: Admin should keep systemConfig unless confirmed
    if (targetRole.name === 'Admin' && permissionKey === 'systemConfig' && targetRole.permissions.systemConfig) {
      toast.warning('Warning: Disabling System Config for Admin can lock administrative governance.');
    }

    setRoles((prev) =>
      prev.map((role) => {
        if (role.id === roleId) {
          const nextVal = !role.permissions[permissionKey];
          return {
            ...role,
            permissions: {
              ...role.permissions,
              [permissionKey]: nextVal,
            },
          };
        }
        return role;
      })
    );
    setIsModified(true);
  };

  // Reset to default
  const handleResetDefaults = async () => {
    const res = await Swal.fire({
      title: 'Reset RBAC Matrix to Defaults?',
      text: 'This will restore all permission flags to standard institutional library policy.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#4f46e5',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Reset Matrix',
      background: document.documentElement.classList.contains('dark') ? '#0f172a' : '#fff',
      color: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
    });

    if (res.isConfirmed) {
      setRoles(DEFAULT_ROLES);
      setIsModified(false);
      toast.success('Restored default role permissions matrix');
    }
  };

  // Save changes explicitly
  const handleSaveChanges = () => {
    setIsModified(false);
    toast.success('Access control policy synchronized across active sessions.');
  };

  // Open Create Role Modal
  const handleOpenCreateRole = () => {
    setEditingRole(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      assignedUserCount: 1,
      permissions: {
        circulationCheckout: false,
        catalogEditing: false,
        inventoryAudit: false,
        memberOverrides: false,
        financialWaiver: false,
        systemConfig: false,
      },
    });
    setIsModalOpen(true);
  };

  // Open Edit Role Modal
  const handleOpenEditRole = (role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      code: role.code,
      description: role.description,
      assignedUserCount: role.assignedUserCount,
      permissions: { ...role.permissions },
    });
    setIsModalOpen(true);
  };

  // Handle Form Submit
  const handleSaveRoleModal = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Role name is required.');
      return;
    }

    if (editingRole) {
      setRoles((prev) =>
        prev.map((r) =>
          r.id === editingRole.id
            ? { ...r, ...formData }
            : r
        )
      );
      toast.success(`Updated role: ${formData.name}`);
    } else {
      const newRole = {
        id: `role-${Date.now().toString().slice(-4)}`,
        name: formData.name,
        code: formData.code || `ROLE_${formData.name.toUpperCase().replace(/\s+/g, '_')}`,
        description: formData.description,
        assignedUserCount: Number(formData.assignedUserCount) || 0,
        badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
        isSystem: false,
        permissions: formData.permissions,
      };
      setRoles((prev) => [...prev, newRole]);
      toast.success(`Created new role: ${newRole.name}`);
    }

    setIsModalOpen(false);
  };

  // Delete Custom Role
  const handleDeleteRole = async (role) => {
    if (role.isSystem) {
      toast.error('System roles cannot be deleted.');
      return;
    }

    const res = await Swal.fire({
      title: `Delete role ${role.name}?`,
      text: `${role.assignedUserCount} users currently assigned will be reverted to Patron.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Delete Role',
      background: document.documentElement.classList.contains('dark') ? '#0f172a' : '#fff',
      color: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
    });

    if (res.isConfirmed) {
      setRoles((prev) => prev.filter((r) => r.id !== role.id));
      toast.success(`Deleted role ${role.name}`);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800/40">
              Security &amp; Authority Architecture
            </span>
          </div>
          <h1 className="font-serif-editorial text-3xl md:text-4xl font-bold text-foreground tracking-tight">
            Role-Based Access Control (RBAC) Matrix
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl font-sans">
            Configure permission matrices, operational privileges, and governance waivers across all patron and staff tiers.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {isModified && (
            <button
              onClick={handleSaveChanges}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md hover:bg-emerald-700 transition-all cursor-pointer animate-pulse"
            >
              <Check className="w-3.5 h-3.5" />
              Save Changes
            </button>
          )}

          <button
            onClick={handleResetDefaults}
            title="Reset matrix to default settings"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold text-muted-foreground hover:text-foreground transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Defaults
          </button>

          <button
            onClick={handleOpenCreateRole}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-foreground text-background dark:bg-amber-500 dark:text-slate-950 font-bold text-xs shadow-md hover:opacity-90 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Custom Role
          </button>
        </div>
      </div>

      {/* ── Metric Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-card border border-border hairline-card metric-blue">
          <div className="flex items-center justify-between mb-2">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Total Roles
            </p>
            <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-foreground">{totalRoles}</p>
          <p className="text-xs text-muted-foreground mt-1">Configured security tiers</p>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border hairline-card metric-amber">
          <div className="flex items-center justify-between mb-2">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Assigned Users
            </p>
            <Users className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-foreground">
            {totalAssignedUsers.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Active patrons &amp; staff</p>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border hairline-card metric-green">
          <div className="flex items-center justify-between mb-2">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Enforced Grants
            </p>
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-foreground">{totalGrantedPermissions}</p>
          <p className="text-xs text-muted-foreground mt-1">Active permission rules</p>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border hairline-card metric-red">
          <div className="flex items-center justify-between mb-2">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Elevated Governance
            </p>
            <Key className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          </div>
          <p className="text-2xl font-bold text-foreground">{elevatedRolesCount}</p>
          <p className="text-xs text-muted-foreground mt-1">Config &amp; waiver rights</p>
        </div>
      </div>

      {/* ── Search & Matrix Category Filter ── */}
      <div className="p-4 rounded-2xl bg-card border border-border hairline-card flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search roles or codes..."
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

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground hidden sm:inline">
            Scope Filter:
          </span>
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
            {['ALL', 'Operations', 'Catalog', 'Finance', 'Governance'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-foreground text-background dark:bg-amber-500 dark:text-slate-950 shadow-sm'
                    : 'bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted/60'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Interactive RBAC Matrix Table ── */}
      <div className="bg-card border border-border rounded-3xl overflow-hidden hairline-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                <th className="th-cell w-72">Role Definition</th>
                <th className="th-cell text-center w-24">Users</th>
                {filteredPermissions.map((perm) => (
                  <th
                    key={perm.id}
                    className="th-cell text-center min-w-[140px] px-3 py-3"
                    title={perm.description}
                  >
                    <div className="flex flex-col items-center">
                      <span className="font-bold text-foreground capitalize tracking-normal text-[11px] font-sans">
                        {perm.label}
                      </span>
                      <span className="font-mono text-[9px] text-muted-foreground mt-0.5">
                        {perm.shortCode}
                      </span>
                    </div>
                  </th>
                ))}
                <th className="th-cell text-right w-20">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredRoles.map((role) => (
                <tr
                  key={role.id}
                  className="hover:bg-muted/30 transition-colors group"
                >
                  {/* Role Name & Description */}
                  <td className="td-cell">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${role.badgeColor}`}
                        >
                          {role.name}
                        </span>
                        {role.isSystem && (
                          <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                            System
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 max-w-xs font-sans">
                        {role.description}
                      </p>
                    </div>
                  </td>

                  {/* Assigned User Count */}
                  <td className="td-cell text-center">
                    <span className="font-mono text-xs font-bold text-foreground bg-muted/50 px-2.5 py-1 rounded-lg border border-border/50">
                      {role.assignedUserCount.toLocaleString()}
                    </span>
                  </td>

                  {/* Permission Switches for 6 required permissions */}
                  {filteredPermissions.map((perm) => {
                    const isGranted = Boolean(role.permissions[perm.id]);
                    return (
                      <td
                        key={perm.id}
                        className="td-cell text-center px-3"
                      >
                        <button
                          onClick={() =>
                            handleTogglePermission(role.id, perm.id)
                          }
                          title={`${role.name}: ${isGranted ? 'Revoke' : 'Grant'} ${perm.label}`}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            isGranted
                              ? 'bg-amber-500 dark:bg-amber-400'
                              : 'bg-muted/80 dark:bg-slate-800'
                          }`}
                        >
                          <span
                            aria-hidden="true"
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out flex items-center justify-center ${
                              isGranted ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          >
                            {isGranted ? (
                              <Check className="w-3 h-3 text-amber-600" />
                            ) : (
                              <X className="w-3 h-3 text-slate-400" />
                            )}
                          </span>
                        </button>
                      </td>
                    );
                  })}

                  {/* Actions */}
                  <td className="td-cell text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleOpenEditRole(role)}
                        title="Edit Role Scope"
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {!role.isSystem && (
                        <button
                          onClick={() => handleDeleteRole(role)}
                          title="Delete Custom Role"
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Informational Architecture Box ── */}
      <div className="p-5 rounded-3xl bg-card border border-border hairline-card grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground font-sans uppercase tracking-wider">
              Strict Principle of Least Privilege
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              Elevated waivers (financial waivers and system configuration) are restricted to archival leadership and authorized directors.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
            <FileCheck2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground font-sans uppercase tracking-wider">
              Audit Trail Verification
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              All member override events and fine forgiveness actions are signed with the active staff ID and appended to the immutable audit log.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground font-sans uppercase tracking-wider">
              Instant Session Propagation
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              Permission updates take effect on subsequent API requests without requiring patrons or staff to re-authenticate.
            </p>
          </div>
        </div>
      </div>

      {/* ── Add / Edit Role Modal ── */}
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
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                    <Shield className="w-4 h-4" />
                  </div>
                  <h2 className="font-serif-editorial text-lg font-bold text-foreground">
                    {editingRole ? `Edit Role: ${editingRole.name}` : 'Create Custom Role'}
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
              <form onSubmit={handleSaveRoleModal} className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Role Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="e.g. Senior Archivist Fellow"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-muted/40 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Role Code / Identifier
                    </label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) =>
                        setFormData({ ...formData, code: e.target.value })
                      }
                      placeholder="e.g. ROLE_FELLOW"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-muted/40 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Role Description
                  </label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Describe the operational responsibilities and tier of this role..."
                    className="w-full px-3 py-2 text-xs rounded-xl bg-muted/40 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
                  />
                </div>

                {/* Assigned Permissions Checklist */}
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-2">
                    Granted Permissions
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {PERMISSIONS.map((perm) => {
                      const checked = Boolean(formData.permissions[perm.id]);
                      return (
                        <label
                          key={perm.id}
                          className="flex items-start gap-2.5 p-2.5 rounded-xl border border-border/70 hover:bg-muted/30 cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                permissions: {
                                  ...formData.permissions,
                                  [perm.id]: e.target.checked,
                                },
                              })
                            }
                            className="w-4 h-4 mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 border-border"
                          />
                          <div className="flex-1">
                            <p className="text-xs font-bold text-foreground">
                              {perm.label}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {perm.description}
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Modal Actions */}
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
                    {editingRole ? 'Save Changes' : 'Create Role'}
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

export default Roles;
