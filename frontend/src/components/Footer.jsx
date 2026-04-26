import React from 'react';

const Footer = () => {
  return (
    <footer className="mt-auto py-8 text-center text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 space-y-2">
        <p className="text-sm font-medium">
          Made with <span className="text-red-500 animate-pulse inline-block">❤️</span> by <span className="font-bold text-slate-700 dark:text-slate-300">Aryan Patel</span>
        </p>
        <p className="text-xs">
          © 2026 Patel & Co. Knowledge Center – All Rights Reserved
        </p>
      </div>
    </footer>
  );
};

export default Footer;
