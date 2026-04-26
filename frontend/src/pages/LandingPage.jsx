import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ReactTyped } from 'react-typed';
import {
  BookOpen, Users, Clock, Search, ArrowRight, CheckCircle,
  ShieldCheck, Zap, Globe
} from 'lucide-react';
import Navbar from '../components/Navbar';
import ParticlesBackground from '../components/ParticlesBackground';

const LandingPage = ({ onOpenLogin }) => {
  const features = [
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "Book Management",
      description: "Comprehensive cataloging with real-time availability tracking and smart categorization."
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "User Management",
      description: "Robust member profiles, activity logs, and seamless authentication systems."
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Issue & Return",
      description: "Automated circulation workflows with instant notifications and fine management."
    },
    {
      icon: <Search className="w-6 h-6" />,
      title: "Smart Search",
      description: "Advanced filtering and lightning-fast discovery across thousands of titles."
    }
  ];

  const steps = [
    { title: "Quick Login", desc: "Access your account securely with enterprise-grade auth." },
    { title: "Browse Catalog", desc: "Explore our vast collection of knowledge and literature." },
    { title: "Issue Book", desc: "Request and borrow books with a single click." },
    { title: "Track Status", desc: "Monitor due dates and returns from your dashboard." }
  ];

  return (
    <div className="min-h-screen bg-[#030712] text-white selection:bg-indigo-500/30">
      {/* Hero Section */}
      <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
        <ParticlesBackground />

        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-blob"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-blob animation-delay-2000"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8">
              <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
              <span className="text-sm font-medium text-indigo-300 uppercase tracking-widest">Enterprise Library System</span>
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8 leading-[1.1] min-h-[280px] md:min-h-[350px] flex items-center justify-center">
              <div className="w-full flex flex-col items-center justify-center gap-y-2 md:gap-y-4">
                <span className="text-white">Patel & Co.</span>
                <ReactTyped
                  strings={[
                    'Knowledge Center',
                    'A unit of',
                    'Limited'
                  ]}
                  typeSpeed={80}
                  backSpeed={50}
                  backDelay={2000}
                  loop
                  cursorChar="|"
                  showCursor={true}
                  className="text-gradient"
                />
              </div>
            </h1>

            <p className="text-lg md:text-2xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed px-4">
              Empowering institutions with the world's most advanced digital library infrastructure.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <button
                onClick={onOpenLogin}
                className="group relative px-12 py-6 bg-indigo-600 text-white rounded-2xl font-bold text-xl overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-indigo-500/20"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity"></div>
                <span className="relative flex items-center gap-2">
                  Get Started <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
              <button
                onClick={onOpenLogin}
                className="px-12 py-6 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl font-bold text-xl transition-all backdrop-blur-md"
              >
                Sign In
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Minimal CTA / Stats Section */}
      <section className="py-32 relative overflow-hidden bg-slate-950/50">
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-white/[0.02] border border-white/10 backdrop-blur-sm rounded-[48px] p-12 md:p-24 text-center shadow-2xl overflow-hidden relative"
          >
            <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight">
              Ready to modernize your <br />
              <span className="text-gradient inline-block">knowledge center?</span>
            </h2>
            <p className="text-white/80 text-xl mb-12 max-w-2xl mx-auto">
              Join the elite group of institutions revolutionizing their knowledge management.
            </p>
            <Link
              to="/signup"
              className="inline-block px-12 py-6 bg-indigo-600 text-white rounded-2xl font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-indigo-500/20"
            >
              Initialize My Platform
            </Link>
          </motion.div>
        </div>
      </section>

      <footer className="py-12 border-t border-white/5 text-center text-slate-500 text-sm">
        © 2026 Patel & Co. Knowledge Center – All Rights Reserved
      </footer>
    </div>
  );
};

export default LandingPage;