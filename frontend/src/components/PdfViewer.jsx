import React from 'react';
import { X, Download, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PdfViewer = ({ url, title, onClose }) => {
  if (!url) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800 text-white">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-lg truncate max-w-xs md:max-w-md">{title}</h3>
            <span className="text-xs bg-indigo-600 px-2 py-1 rounded-full">Digital Edition</span>
          </div>
          <div className="flex items-center gap-4">
            <a 
              href={url} 
              download 
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
              title="Download PDF"
            >
              <Download className="w-5 h-5" />
            </a>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-red-500/20 text-white hover:text-red-500 rounded-full transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Viewer */}
        <div className="flex-1 w-full h-full overflow-hidden bg-slate-800">
          <iframe
            src={`${url}#toolbar=0`}
            className="w-full h-full border-none"
            title={title}
          />
        </div>

        {/* Footer / Info */}
        <div className="p-2 bg-slate-900 text-slate-500 text-[10px] text-center uppercase tracking-widest">
          Patel & Co. Knowledge Center – Secure Digital Library Interface
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PdfViewer;
