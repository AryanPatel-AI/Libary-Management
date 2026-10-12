import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Library,
  Search,
  Bell,
  BookOpen,
  Users,
  ClipboardList,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Plus,
  ArrowRightLeft,
  Undo2,
  UserPlus,
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  MoreVertical,
  ChevronRight,
  CalendarDays,
  Menu,
  BookMarked
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';

/** 
 * @typedef {Object} Member
 * @property {string} id
 * @property {string} name
 * @property {string} avatar
 */

/** 
 * @typedef {Object} Book
 * @property {string} id
 * @property {string} title
 * @property {string} author
 * @property {string} category
 * @property {string} status
 * @property {number} issues
 * @property {string} gradient
 */

// ─── MOCK DATA ───────────────────────────────────────────────────────────────

const OVERDUE_BOOKS = [
  { id: 1, member: 'Rahul Sharma', book: 'Atomic Habits', dueDate: '12 Sep 2026', days: 2, fine: 20 },
  { id: 2, member: 'Amit Kumar', book: 'The Psychology of Money', dueDate: '10 Sep 2026', days: 4, fine: 40 },
  { id: 3, member: 'Neha Gupta', book: 'Rich Dad Poor Dad', dueDate: '08 Sep 2026', days: 6, fine: 60 },
  { id: 4, member: 'Sanjay Singh', book: 'Clean Code', dueDate: '05 Sep 2026', days: 9, fine: 90 },
];

const PENDING_REQUESTS = [
  { id: 1, member: 'Ananya Verma', book: 'The Alchemist', date: '14 Sep, 09:30 AM', status: 'Pending' },
  { id: 2, member: 'Vikram Desai', book: 'Ikigai', date: '14 Sep, 10:15 AM', status: 'Pending' },
  { id: 3, member: 'Priya Singh', book: 'Deep Work', date: '13 Sep, 04:45 PM', status: 'Pending' },
];

const RECENT_ACTIVITY = [
  { id: 1, icon: ArrowRightLeft, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'Rahul Sharma borrowed "Atomic Habits"', time: '10 mins ago' },
  { id: 2, icon: Undo2, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'Priya Singh returned "Clean Code"', time: '1 hour ago' },
  { id: 3, icon: Plus, color: 'text-indigo-500', bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'Admin added 24 new books', time: '3 hours ago' },
  { id: 4, icon: BookMarked, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'Ananya Verma requested "The Psychology of Money"', time: '4 hours ago' },
  { id: 5, icon: CreditCard, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30', text: '₹500 fine payment received from Amit Kumar', time: '5 hours ago' },
];

const POPULAR_BOOKS = [
  { id: 1, title: 'Atomic Habits', author: 'James Clear', category: 'Self-Help', status: 'Available', issues: 342, gradient: 'from-amber-500 to-orange-600' },
  { id: 2, title: 'Clean Code', author: 'Robert C. Martin', category: 'Computer Science', status: 'Available', issues: 289, gradient: 'from-indigo-600 to-purple-700' },
  { id: 3, title: 'The Psychology of Money', author: 'Morgan Housel', category: 'Finance', status: 'Available', issues: 256, gradient: 'from-emerald-600 to-teal-600' },
  { id: 4, title: 'Ikigai', author: 'Francesc Miralles', category: 'Philosophy', status: 'Available', issues: 198, gradient: 'from-rose-500 to-pink-600' },
];

const UPCOMING_EVENTS = [
  { id: 1, type: 'Due', title: '5 Books Due Today', time: 'By EOD', icon: Clock, color: 'text-rose-500', bg: 'bg-rose-100 dark:bg-rose-900/30' },
  { id: 2, type: 'Reservation', title: 'Vikram to collect Ikigai', time: '10:15 AM', icon: BookMarked, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  { id: 3, type: 'Event', title: 'Author Meet & Greet', time: 'Tomorrow, 4 PM', icon: CalendarDays, color: 'text-indigo-500', bg: 'bg-indigo-100 dark:bg-indigo-900/30' },
  { id: 4, type: 'Expiry', title: '12 Memberships Expiring', time: 'In 2 days', icon: Users, color: 'text-slate-500', bg: 'bg-slate-100 dark:bg-slate-800' },
];

const ANALYTICS_DATA = [
  { name: 'Mon', issues: 45, returns: 38 },
  { name: 'Tue', issues: 52, returns: 42 },
  { name: 'Wed', issues: 48, returns: 50 },
  { name: 'Thu', issues: 61, returns: 45 },
  { name: 'Fri', issues: 59, returns: 60 },
  { name: 'Sat', issues: 85, returns: 70 },
  { name: 'Sun', issues: 72, returns: 65 },
];

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

export default function LmsDashboard() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [issueDialogOpen, setIssueDialogOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-50 pt-20">
      
      {/* ── 1. TOP NAVIGATION ── */}
      <header className="fixed top-0 inset-x-0 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-50 flex items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-6 lg:gap-10">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-indigo-600/20 group-hover:rotate-6 transition-transform">
              <Library className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight hidden sm:block">Patel & Co.</span>
          </Link>
          
          <nav className="hidden lg:flex items-center gap-1 text-sm font-medium text-slate-500 dark:text-slate-400">
            <Link to="/dashboard" className="px-3 py-2 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 rounded-md">Dashboard</Link>
            <Link to="/books" className="px-3 py-2 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors">Books</Link>
            <Link to="/users" className="px-3 py-2 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors">Members</Link>
            <Link to="/circulation" className="px-3 py-2 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors">Circulation</Link>
            <Link to="/reservations" className="px-3 py-2 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors">Reservations</Link>
            <Link to="/fines" className="px-3 py-2 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors">Fines</Link>
            <Link to="/reports" className="px-3 py-2 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors">Reports</Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {/* Global Search - Header Version */}
          <div className="hidden md:flex relative group">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text"
              placeholder="Search books, members..." 
              className="h-9 w-64 pl-9 pr-4 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
              <kbd className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 text-slate-500">⌘</kbd>
              <kbd className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 text-slate-500">K</kbd>
            </div>
          </div>

          <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 rounded-full h-9 w-9">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900"></span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger className="focus:outline-none">
              <Avatar className="h-8 w-8 border border-slate-200 dark:border-slate-800 transition-transform hover:scale-105">
                <AvatarFallback className="bg-indigo-100 text-indigo-700 font-bold text-xs dark:bg-indigo-900/50 dark:text-indigo-300">AD</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile Setting</DropdownMenuItem>
              <DropdownMenuItem>Library Configuration</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-rose-600 dark:text-rose-400">Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-[1600px] mx-auto p-4 lg:p-8 space-y-8">

        {/* ── 2. DASHBOARD HEADER & 3. GLOBAL SEARCH ── */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-4 flex-1">
            <div>
              <h1 className="text-2xl lg:text-3xl font-semibold tracking-tight">Good afternoon, Admin</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">Here's what's happening in your library today.</p>
            </div>
            
            {/* Prominent Global Search */}
            <div className="relative max-w-2xl group">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input 
                type="text"
                placeholder="Search books, ISBN, authors, or members..." 
                className="h-12 w-full pl-12 pr-12 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1">
                <kbd className="hidden sm:inline-block text-xs font-mono bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1 text-slate-500">⌘ K</kbd>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Dialog open={issueDialogOpen} onOpenChange={setIssueDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 gap-2 h-10 px-4 shadow-sm">
                  <ArrowRightLeft className="w-4 h-4" /> Issue Book
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Issue Book</DialogTitle>
                  <DialogDescription>Process a new circulation loan.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Member ID or Name</label>
                    <Input placeholder="e.g. Rahul Sharma" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Book ISBN or Title</label>
                    <Input placeholder="e.g. Atomic Habits" />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIssueDialogOpen(false)}>Cancel</Button>
                  <Button onClick={() => setIssueDialogOpen(false)} className="bg-indigo-600 hover:bg-indigo-700 text-white">Confirm Issue</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button variant="outline" className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 gap-2 h-10 px-4 shadow-sm hidden sm:flex">
              <Undo2 className="w-4 h-4" /> Return Book
            </Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm gap-2 h-10 px-4">
              <Plus className="w-4 h-4" /> Add Book
            </Button>
          </div>
        </div>

        {/* ── 4. KPI STATISTICS ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <BookOpen className="w-5 h-5 text-indigo-500" />
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> +124
                </span>
              </div>
              <div>
                <p className="text-2xl font-bold">12,480</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Total Books</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">8,642</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Available (69.2%)</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <ClipboardList className="w-5 h-5 text-amber-500" />
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> +8.4%
                </span>
              </div>
              <div>
                <p className="text-2xl font-bold">3,218</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Books Issued</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow ring-1 ring-rose-500/20">
            <CardContent className="p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <AlertCircle className="w-5 h-5 text-rose-500" />
                <span className="text-xs font-medium text-rose-600 bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 rounded-full">
                  18 critical
                </span>
              </div>
              <div>
                <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">126</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Overdue Books</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <Users className="w-5 h-5 text-blue-500" />
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> +86
                </span>
              </div>
              <div>
                <p className="text-2xl font-bold">2,480</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Total Members</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="w-5 h-5 flex items-center justify-center font-serif italic text-purple-500 border border-purple-200 dark:border-purple-800 rounded-full text-xs bg-purple-50 dark:bg-purple-900/20">₹</span>
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <TrendingDown className="w-3 h-3" /> -12%
                </span>
              </div>
              <div>
                <p className="text-2xl font-bold">24,680</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Outstanding Fines</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── 5. QUICK ACTIONS ── */}
        <section>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-slate-400" /> Quick Actions
          </h2>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 gap-2 shadow-sm rounded-xl hover:border-indigo-500 hover:text-indigo-600 transition-colors h-auto py-3 px-4 justify-start">
              <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg"><Plus className="w-4 h-4" /></div> Add New Book
            </Button>
            <Button variant="outline" className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 gap-2 shadow-sm rounded-xl hover:border-indigo-500 hover:text-indigo-600 transition-colors h-auto py-3 px-4 justify-start">
              <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg"><ArrowRightLeft className="w-4 h-4" /></div> Issue Book
            </Button>
            <Button variant="outline" className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 gap-2 shadow-sm rounded-xl hover:border-indigo-500 hover:text-indigo-600 transition-colors h-auto py-3 px-4 justify-start">
              <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg"><Undo2 className="w-4 h-4" /></div> Return Book
            </Button>
            <Button variant="outline" className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 gap-2 shadow-sm rounded-xl hover:border-indigo-500 hover:text-indigo-600 transition-colors h-auto py-3 px-4 justify-start">
              <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg"><UserPlus className="w-4 h-4" /></div> Add Member
            </Button>
            <Button variant="outline" className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 gap-2 shadow-sm rounded-xl hover:border-indigo-500 hover:text-indigo-600 transition-colors h-auto py-3 px-4 justify-start">
              <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg"><CreditCard className="w-4 h-4" /></div> Collect Fine
            </Button>
          </div>
        </section>

        {/* Middle Grid: Attention Required & Pending */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* ── 6. ATTENTION REQUIRED: OVERDUE BOOKS ── */}
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/60">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500" /> Overdue Books
                </CardTitle>
                <Button variant="ghost" size="sm" className="h-8 text-xs text-indigo-600 dark:text-indigo-400">View All</Button>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-medium whitespace-nowrap">Member</th>
                    <th className="px-4 py-3 font-medium whitespace-nowrap">Book</th>
                    <th className="px-4 py-3 font-medium whitespace-nowrap">Due Date</th>
                    <th className="px-4 py-3 font-medium text-right whitespace-nowrap">Fine</th>
                    <th className="px-4 py-3 font-medium text-center whitespace-nowrap">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {OVERDUE_BOOKS.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                      <td className="px-4 py-3 whitespace-nowrap font-medium">{item.member}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-600 dark:text-slate-300">{item.book}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-rose-600 dark:text-rose-400 text-xs font-medium">{item.dueDate}</span>
                        <br />
                        <span className="text-[10px] text-slate-500">({item.days} days)</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right font-medium">₹{item.fine}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-indigo-600">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* ── 6. ATTENTION REQUIRED: PENDING REQUESTS ── */}
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/60">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500" /> Pending Requests
                </CardTitle>
                <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400">3 New</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1">
              <ul className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {PENDING_REQUESTS.map((req) => (
                  <li key={req.id} className="p-4 flex items-start sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <div>
                      <p className="font-medium text-sm">{req.member}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Requested: <span className="text-slate-700 dark:text-slate-300 font-medium">{req.book}</span></p>
                      <p className="text-xs text-slate-400 mt-1">{req.date}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 mt-2 sm:mt-0">
                      <Button variant="outline" size="sm" className="h-8 border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-900/30">
                        <CheckCircle2 className="w-4 h-4 mr-1" /> Approve
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30">
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Lower Grid: Analytics, Activity, Popular Books */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* ── 9. LIBRARY ANALYTICS ── */}
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm lg:col-span-2 flex flex-col">
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Circulation Overview</CardTitle>
                  <CardDescription>Issues vs Returns over the last 7 days</CardDescription>
                </div>
                <div className="flex items-center gap-4 text-xs font-medium">
                  <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-indigo-500"></span> Issues</div>
                  <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Returns</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={ANALYTICS_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIssues" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorReturns" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: 'hsl(var(--foreground))', fontSize: '12px', fontWeight: 500 }}
                  />
                  <Area type="monotone" dataKey="issues" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorIssues)" />
                  <Area type="monotone" dataKey="returns" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorReturns)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* ── 7. RECENT ACTIVITY ── */}
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/60">
              <CardTitle className="text-base">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="p-5 flex-1">
              <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-[19px] before:w-px before:bg-slate-200 dark:before:bg-slate-800">
                {RECENT_ACTIVITY.map((activity, i) => (
                  <div key={activity.id} className="relative flex gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-4 border-white dark:border-slate-900 z-10 ${activity.bg}`}>
                      <activity.icon className={`w-4 h-4 ${activity.color}`} />
                    </div>
                    <div className="pt-1">
                      <p className="text-sm font-medium leading-snug">{activity.text}</p>
                      <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="pt-0 pb-4 px-4 border-t border-slate-100 dark:border-slate-800/60 mt-auto">
              <Button variant="ghost" className="w-full text-indigo-600 dark:text-indigo-400 text-sm h-9">View Full Log</Button>
            </CardFooter>
          </Card>
        </div>

        {/* Bottom Grid: Popular Books & Calendar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* ── 8. POPULAR BOOKS ── */}
          <section className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-slate-400" /> Highly Circulated Titles
              </h2>
              <Link to="/books" className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center">
                View all inventory <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {POPULAR_BOOKS.map((book) => (
                <Card key={book.id} className="overflow-hidden border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group flex flex-col">
                  <div className={`h-28 bg-gradient-to-br ${book.gradient} relative overflow-hidden flex items-end p-3`}>
                    <BookOpen className="w-24 h-24 absolute -right-4 -top-4 text-white/10 group-hover:scale-110 transition-transform duration-500" />
                    <Badge variant="secondary" className="bg-black/30 text-white hover:bg-black/40 border-0 text-[10px] uppercase tracking-wider backdrop-blur-md">
                      {book.category}
                    </Badge>
                  </div>
                  <CardContent className="p-3 flex-1 flex flex-col">
                    <h3 className="font-bold text-sm leading-tight line-clamp-2 mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {book.title}
                    </h3>
                    <p className="text-xs text-slate-500 truncate mb-3">{book.author}</p>
                    
                    <div className="mt-auto flex items-center justify-between text-xs">
                      <span className="font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded">
                        Available
                      </span>
                      <span className="text-slate-400 font-medium">{book.issues} issues</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* ── 10. UPCOMING / CALENDAR ── */}
          <section className="lg:col-span-1">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-slate-400" /> Upcoming & Events
            </h2>
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm h-[calc(100%-2.25rem)]">
              <CardContent className="p-5">
                <div className="space-y-5">
                  {UPCOMING_EVENTS.map((evt) => (
                    <div key={evt.id} className="flex items-start gap-4 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-800/80 -mx-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${evt.bg}`}>
                        <evt.icon className={`w-5 h-5 ${evt.color}`} />
                      </div>
                      <div className="pt-0.5 min-w-0 flex-1">
                        <p className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">{evt.title}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-slate-500">{evt.type}</span>
                          <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{evt.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

        </div>

      </main>
    </div>
  );
}
