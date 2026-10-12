import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import {
  User, ShieldCheck, Mail, Phone, MapPin, Key,
  Bell, Award, CheckCircle2, QrCode, Bookmark, BookOpen, Save
} from 'lucide-react';
import { AuthContext } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const currentUser = user?.data || user;

  const [name, setName] = useState(currentUser?.name || 'Julian Sterling');
  const [email, setEmail] = useState(currentUser?.email || 'scholar.sterling@patel-library.org');
  const [phone, setPhone] = useState('+1 (555) 234-8901');
  const [department, setDepartment] = useState('Department of Philosophy & Classics');

  // Preferences
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [newsletter, setNewsletter] = useState(true);

  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    setSaving(false);
    toast.success('Patron profile details updated successfully');
  };

  const memberId = 'PKC-MBR-849204';
  const tier = currentUser?.role === 'admin' ? 'Administrative Overseer' : 'Senior Research Scholar';
  const booksCheckedOut = 3;
  const maxBooks = 10;
  const checkoutPercent = (booksCheckedOut / maxBooks) * 100;

  return (
    <div className="min-h-screen bg-background text-foreground pt-8 pb-16 font-sans">
      <div className="container mx-auto px-4 max-w-4xl">

        {/* Eyebrow & Header */}
        <div className="mb-8">
          <span className="section-eyebrow mb-2">Member Portal &bull; Credentials</span>
          <h1 className="font-serif-editorial text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            Patron Identity &amp; Profile
          </h1>
          <p className="text-muted-foreground text-sm mt-1.5 max-w-xl">
            Institutional credential verification, circulation privilege tiers, and contact preferences.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Left Column: Digital Library Card */}
          <div className="md:col-span-1 space-y-6">
            
            {/* Archival Library Card */}
            <div className="p-6 rounded-3xl bg-card border border-border relative overflow-hidden shadow-md book-shadow">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                  Patel &amp; Co. &bull; Pass
                </span>
                <ShieldCheck className="w-4 h-4 text-amber-500" />
              </div>

              {/* Avatar & Name */}
              <div className="mt-5 text-center">
                <div className="w-18 h-18 mx-auto rounded-2xl bg-foreground text-background font-serif-editorial text-2xl font-bold flex items-center justify-center shadow-md">
                  {name.charAt(0)}
                </div>
                <h3 className="font-serif-editorial text-lg font-bold text-foreground mt-3 leading-snug">
                  {name}
                </h3>
                <span className="inline-block mt-1 badge-info px-2.5 py-0.5 rounded-full text-[10px] font-semibold">
                  {tier}
                </span>
              </div>

              {/* Barcode Simulation */}
              <div className="mt-6 pt-5 border-t border-border">
                <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
                  {/* Visual barcode stripes */}
                  <div className="h-10 flex items-stretch justify-center gap-[2px] overflow-hidden">
                    {[3,1,2,4,1,3,2,1,4,2,3,1,2,3,1,4,2,1,3,2,4,1,2,3,1,2,4,1,3].map((w, i) => (
                      <div
                        key={i}
                        className="bg-slate-950 h-full"
                        style={{ width: `${w}px` }}
                      />
                    ))}
                  </div>
                  <span className="block font-mono text-[11px] text-slate-900 tracking-wider mt-1 font-semibold">
                    {memberId}
                  </span>
                </div>
                <p className="text-[10px] text-center text-muted-foreground mt-2">
                  Scan at any physical self-checkout kiosk or circulation terminal
                </p>
              </div>
            </div>

            {/* Circulation Privileges Quota */}
            <div className="p-5 rounded-2xl bg-card border border-border shadow-xs">
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Circulation Quota
              </span>
              <div className="mt-3">
                <div className="flex justify-between text-xs font-semibold mb-1.5">
                  <span>Volumes Held</span>
                  <span>{booksCheckedOut} of {maxBooks} Max</span>
                </div>
                <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all"
                    style={{ width: `${checkoutPercent}%` }}
                  />
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-border text-xs text-muted-foreground space-y-1.5">
                <div className="flex justify-between">
                  <span>Loan Duration</span>
                  <span className="font-medium text-foreground">28 Days</span>
                </div>
                <div className="flex justify-between">
                  <span>Max Renewals</span>
                  <span className="font-medium text-foreground">3 times per book</span>
                </div>
                <div className="flex justify-between">
                  <span>Inter-Library Access</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Enabled</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Profile Edit Form */}
          <div className="md:col-span-2 space-y-6">

            <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-xs">
              <h3 className="font-serif-editorial text-xl font-bold text-foreground">
                Personal &amp; Academic Information
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Keep your institution contact records up to date for urgent preservation notices.
              </p>

              <form onSubmit={handleSave} className="mt-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                      Full Legal / Scholarly Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                      Institutional Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                      Contact Phone (SMS Alerts)
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                      Department or College Wing
                    </label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Communication Preferences */}
                <div className="pt-4 border-t border-border">
                  <h4 className="font-serif-editorial font-bold text-sm text-foreground mb-3">
                    Institutional Dispatch Preferences
                  </h4>

                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border cursor-pointer">
                      <div>
                        <p className="text-xs font-semibold text-foreground">Email Due-Date Reminders</p>
                        <p className="text-[11px] text-muted-foreground">Receive notice 3 days and 24 hours prior to expiration</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={emailAlerts}
                        onChange={(e) => setEmailAlerts(e.target.checked)}
                        className="accent-amber-500 w-4 h-4 rounded"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border cursor-pointer">
                      <div>
                        <p className="text-xs font-semibold text-foreground">SMS Hold-Arrival Notifications</p>
                        <p className="text-[11px] text-muted-foreground">Immediate text when requested book lands on the pickup shelf</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={smsAlerts}
                        onChange={(e) => setSmsAlerts(e.target.checked)}
                        className="accent-amber-500 w-4 h-4 rounded"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border cursor-pointer">
                      <div>
                        <p className="text-xs font-semibold text-foreground">Monthly Archival Acquisitions Bulletin</p>
                        <p className="text-[11px] text-muted-foreground">Curated reviews of rare folios and faculty additions</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={newsletter}
                        onChange={(e) => setNewsletter(e.target.checked)}
                        className="accent-amber-500 w-4 h-4 rounded"
                      />
                    </label>
                  </div>
                </div>

                <div className="pt-3 flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2.5 bg-foreground text-background text-xs font-semibold rounded-xl hover:opacity-90 transition-all flex items-center gap-2 shadow-xs"
                  >
                    <Save className="w-3.5 h-3.5 text-amber-400" />
                    {saving ? 'Preserving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default Profile;
