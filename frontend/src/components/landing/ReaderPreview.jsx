import { useState } from 'react';
import { BookOpen, Type } from 'lucide-react';

export const ReaderPreview = () => {
  const [theme, setTheme] = useState('sepia'); // 'sepia' | 'dark' | 'paper'
  const [fontSize, setFontSize] = useState(15);

  const themeStyles = {
    sepia: 'bg-[#f4ecd8] text-[#433422] border-[#e2d5bd]',
    paper: 'bg-[#ffffff] text-[#1c1917] border-[#e7e5e4]',
    dark: 'bg-[#0f141c] text-[#cbd5e1] border-[#1e293b]',
  };

  return (
    <div className="w-full h-full flex flex-col justify-between rounded-2xl overflow-hidden shadow-inner border border-black/5 dark:border-white/10">
      {/* Top Reader Controls */}
      <div className="flex items-center justify-between px-4 py-2 bg-black/5 dark:bg-white/5 border-b border-inherit text-xs">
        <div className="flex items-center gap-2">
          <BookOpen className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span className="font-semibold tracking-tight truncate max-w-[140px]">
            The Art of Thought
          </span>
        </div>

        {/* Theme Selectors */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setTheme('paper')}
            className={`w-4 h-4 rounded-full bg-white border border-stone-300 ${theme === 'paper' ? 'ring-2 ring-amber-500' : ''}`}
            title="Clean Paper"
          />
          <button
            onClick={() => setTheme('sepia')}
            className={`w-4 h-4 rounded-full bg-[#f4ecd8] border border-[#d6c7a7] ${theme === 'sepia' ? 'ring-2 ring-amber-500' : ''}`}
            title="Archival Sepia"
          />
          <button
            onClick={() => setTheme('dark')}
            className={`w-4 h-4 rounded-full bg-[#0f141c] border border-slate-700 ${theme === 'dark' ? 'ring-2 ring-amber-500' : ''}`}
            title="Darkroom Slate"
          />
          <span className="text-slate-400 mx-1">|</span>
          <button
            onClick={() => setFontSize((s) => (s >= 17 ? 13 : s + 2))}
            className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded"
            title="Adjust Text Size"
          >
            <Type className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Reader Page Content */}
      <div
        className={`flex-1 p-5 transition-colors duration-300 overflow-hidden ${themeStyles[theme]}`}
        style={{ fontSize: `${fontSize}px` }}
      >
        <p className="font-serif-editorial leading-relaxed text-justify select-none">
          <span className="float-left text-3xl font-bold leading-none pr-2 pt-1 font-serif-editorial text-amber-700 dark:text-amber-400">
            K
          </span>
          nowledge is not a stagnant reservoir, but an expansive living
          circulation. When a scholar pulls a volume from the shelf, they enter
          into communion with minds centuries past—discovering that questions of
          architecture, philosophy, and mathematics are eternal dialogues.
        </p>
      </div>

      {/* Reader Footer Info */}
      <div className="px-4 py-2 bg-black/5 dark:bg-white/5 border-t border-inherit flex items-center justify-between text-[11px] text-slate-500">
        <span>Page 42 of 318</span>
        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          In-Browser Digital Vault
        </span>
      </div>
    </div>
  );
};

export default ReaderPreview;
