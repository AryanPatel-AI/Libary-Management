import React, { useState, useEffect } from 'react';
import API_URL from '../../api/config';
import axios from 'axios';
import { Sliders, ShieldCheck, Clock, DollarSign, RefreshCw, Save, CheckCircle2, Building } from 'lucide-react';
import { toast } from 'react-toastify';

const LibrarySettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [memberTypes, setMemberTypes] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedType, setSelectedType] = useState(null);

  // Form edit states
  const [editForm, setEditForm] = useState({
    maxBorrowLimit: 5,
    defaultLoanPeriodDays: 14,
    finePerDay: 2,
    maxFineCap: 100,
    maxRenewals: 2,
    gracePeriodDays: 1,
    membershipDurationDays: 365
  });

  const getAuthConfig = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/policies`, getAuthConfig());
      const mTypes = res.data.data.memberTypes || [];
      setMemberTypes(mTypes);
      setPolicies(res.data.data.policies || []);
      setBranches(res.data.data.branches || []);

      if (mTypes.length > 0) {
        selectMemberType(mTypes[0]);
      }
    } catch (err) {
      console.error('Failed to load library settings:', err);
      toast.error('Failed to load library circulation policies');
    } finally {
      setLoading(false);
    }
  };

  const selectMemberType = (type) => {
    setSelectedType(type);
    setEditForm({
      maxBorrowLimit: type.maxBorrowLimit,
      defaultLoanPeriodDays: type.defaultLoanPeriodDays,
      finePerDay: (type.finePerDayCents / 100) || 1,
      maxFineCap: (type.maxFineCapCents / 100) || 50,
      maxRenewals: type.maxRenewals,
      gracePeriodDays: type.gracePeriodDays,
      membershipDurationDays: type.membershipDurationDays
    });
  };

  const handleSaveMemberType = async (e) => {
    e.preventDefault();
    if (!selectedType) return;

    try {
      setSaving(true);
      const res = await axios.put(`${API_URL}/policies/member-types/${selectedType.id}`, {
        maxBorrowLimit: parseInt(editForm.maxBorrowLimit),
        defaultLoanPeriodDays: parseInt(editForm.defaultLoanPeriodDays),
        finePerDayCents: Math.round(parseFloat(editForm.finePerDay) * 100),
        maxFineCapCents: Math.round(parseFloat(editForm.maxFineCap) * 100),
        maxRenewals: parseInt(editForm.maxRenewals),
        gracePeriodDays: parseInt(editForm.gracePeriodDays),
        membershipDurationDays: parseInt(editForm.membershipDurationDays)
      }, getAuthConfig());

      toast.success(res.data.message || 'Policy settings saved successfully');
      await fetchSettings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update policy settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
          <Sliders className="w-8 h-8 text-indigo-600" />
          Circulation Policies & Rule Engine
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Configure borrowing rules, overdue fine rates, grace periods, and renewal limits per member category.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Col: Member Categories List */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-950 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-500" />
              Member Categories
            </h2>

            <div className="space-y-2">
              {memberTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => selectMemberType(type)}
                  className={`w-full p-4 rounded-2xl text-left transition-all flex items-center justify-between ${
                    selectedType?.id === type.id
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                      : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div>
                    <p className="font-bold text-sm">{type.name}</p>
                    <p className={`text-xs mt-0.5 ${selectedType?.id === type.id ? 'text-indigo-100' : 'text-slate-500'}`}>
                      {type._count?.members || 0} active members
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-lg font-bold ${
                    selectedType?.id === type.id ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800'
                  }`}>
                    {type.defaultLoanPeriodDays}d loan
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-indigo-50 dark:bg-indigo-950/20 rounded-3xl p-5 border border-indigo-100 dark:border-indigo-900/50">
            <h3 className="font-bold text-indigo-900 dark:text-indigo-200 text-sm mb-1 flex items-center gap-1.5">
              <Building className="w-4 h-4" />
              System Branches ({branches.length})
            </h3>
            <p className="text-xs text-indigo-700 dark:text-indigo-300 leading-relaxed">
              Circulation rules are evaluated hierarchically: Branch-specific overrides take precedence over global member defaults.
            </p>
          </div>
        </div>

        {/* Right Col (2 cols): Policy Configuration Form */}
        <div className="md:col-span-2">
          {selectedType && (
            <form onSubmit={handleSaveMemberType} className="bg-white dark:bg-slate-950 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Rules for {selectedType.name}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Modifications will immediately govern automated loans and fines.
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-2xl font-bold text-sm shadow-md shadow-indigo-500/20 transition-all active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Max Borrow Limit */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Max Simultaneous Loans
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={editForm.maxBorrowLimit}
                    onChange={(e) => setEditForm({ ...editForm, maxBorrowLimit: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-lg font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Maximum books a member can hold simultaneously.</p>
                </div>

                {/* Loan Period */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Default Loan Duration (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={editForm.defaultLoanPeriodDays}
                    onChange={(e) => setEditForm({ ...editForm, defaultLoanPeriodDays: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-lg font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Standard loan period before book is marked overdue.</p>
                </div>

                {/* Fine Per Day */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Daily Overdue Fine (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={editForm.finePerDay}
                    onChange={(e) => setEditForm({ ...editForm, finePerDay: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-lg font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Charged daily after the grace period expires.</p>
                </div>

                {/* Max Fine Cap */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Maximum Fine Cap (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editForm.maxFineCap}
                    onChange={(e) => setEditForm({ ...editForm, maxFineCap: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-lg font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Upper limit ceiling per individual loan fine.</p>
                </div>

                {/* Max Renewals */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Allowed Renewals
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={editForm.maxRenewals}
                    onChange={(e) => setEditForm({ ...editForm, maxRenewals: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-lg font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Times a patron can extend loan before physical checkin.</p>
                </div>

                {/* Grace Period */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Grace Period (Days)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="14"
                    value={editForm.gracePeriodDays}
                    onChange={(e) => setEditForm({ ...editForm, gracePeriodDays: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-lg font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Days after due date during which late fines are waived.</p>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LibrarySettings;
