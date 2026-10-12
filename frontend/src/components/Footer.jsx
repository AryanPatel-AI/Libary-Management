import React from 'react';

const Footer = () => {
  return (
    <footer className="mt-auto py-8 text-center text-slate-500 dark:text-slate-400 border-t border-slate-200/80 dark:border-white/[0.08] bg-white/60 dark:bg-[#07090e]/80 backdrop-blur-sm text-xs font-mono">
      <div className="container mx-auto px-4 space-y-2">
        <p className="text-slate-700 dark:text-slate-300 font-sans font-medium text-xs">
          Crafted with care by <span className="font-bold text-slate-950 dark:text-white">Aryan Patel</span>
        </p>
        <p className="text-[11px] text-slate-400">
          © 2026 Patel &amp; Co. Knowledge Center &bull; Curated Archival Standards
        </p>
      </div>
    </footer>
  );
};

export default Footer;
