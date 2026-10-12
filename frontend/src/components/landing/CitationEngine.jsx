import { useState } from 'react';
import { Copy, Check, Quote } from 'lucide-react';

export const CitationEngine = () => {
  const [style, setStyle] = useState('APA');
  const [copied, setCopied] = useState(false);

  const citations = {
    APA: 'Patel, A. (2026). Digital Architecture and Archival Circulation (2nd ed.). Patel & Co. Publishing.',
    MLA: 'Patel, Aryan. Digital Architecture and Archival Circulation. 2nd ed., Patel & Co. Publishing, 2026.',
    Chicago: 'Patel, Aryan. Digital Architecture and Archival Circulation. 2nd ed. Bareilly: Patel & Co. Publishing, 2026.',
    BibTeX: `@book{patel2026archival,\n  author = {Patel, Aryan},\n  title = {Digital Architecture and Archival Circulation},\n  year = {2026},\n  publisher = {Patel & Co. Publishing}\n}`,
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(citations[style]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full h-full flex flex-col justify-between rounded-2xl bg-slate-50 dark:bg-[#0c0f18] p-4 border border-slate-200 dark:border-white/10">
      {/* Format Selector Tabs */}
      <div className="flex items-center justify-between gap-1 pb-3 border-b border-slate-200 dark:border-white/10">
        <div className="flex items-center gap-1">
          {['APA', 'MLA', 'Chicago', 'BibTeX'].map((item) => (
            <button
              key={item}
              onClick={() => setStyle(item)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                style === item
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 hover:underline shrink-0"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      {/* Citation Box */}
      <div className="flex-1 py-3 flex items-center">
        <div className="w-full bg-white dark:bg-black/40 p-3 rounded-xl border border-slate-200 dark:border-white/5 font-mono text-[11px] leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap select-all">
          {citations[style]}
        </div>
      </div>

      {/* Footer Notice */}
      <div className="flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1">
          <Quote className="w-3 h-3 text-amber-500" />
          Academic Standard Compliant
        </span>
        <span className="text-[10px] uppercase font-mono tracking-wider">
          DOI: 10.1000/182
        </span>
      </div>
    </div>
  );
};

export default CitationEngine;
