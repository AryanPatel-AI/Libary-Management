import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

export const BentoGrid = ({ className, children }) => {
  return (
    <div
      className={cn(
        'grid w-full auto-rows-[22rem] grid-cols-1 md:grid-cols-3 gap-6',
        className
      )}
    >
      {children}
    </div>
  );
};

export const BentoCard = ({
  name,
  className,
  background,
  Icon,
  description,
  href,
  cta,
  children,
}) => {
  return (
    <div
      key={name}
      className={cn(
        'group relative col-span-3 flex flex-col justify-between overflow-hidden rounded-3xl',
        'bg-white dark:bg-[#111523]',
        'border border-slate-200/80 dark:border-white/[0.08]',
        'shadow-xs hover:shadow-xl transition-all duration-500',
        className
      )}
    >
      <div className="absolute inset-0 pointer-events-none">{background}</div>
      
      {children && (
        <div className="relative z-10 w-full h-full p-6">{children}</div>
      )}

      <div className="pointer-events-none z-10 flex transform-gpu flex-col gap-2 p-8 transition-all duration-300 group-hover:-translate-y-2">
        {Icon && (
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-400/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2 origin-left transition-all duration-300 group-hover:scale-110">
            <Icon className="h-6 w-6" />
          </div>
        )}
        <h3 className="text-xl font-bold font-serif-editorial tracking-tight text-slate-900 dark:text-white">
          {name}
        </h3>
        <p className="max-w-lg text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
          {description}
        </p>
      </div>

      {cta && (
        <div className="pointer-events-none absolute bottom-0 flex w-full translate-y-10 transform-gpu flex-row items-center p-8 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 z-20">
          <a
            href={href || '#'}
            className="pointer-events-auto inline-flex items-center gap-2 text-sm font-semibold text-amber-600 dark:text-amber-400 hover:underline"
          >
            {cta}
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      )}
      
      <div className="pointer-events-none absolute inset-0 transform-gpu transition-all duration-300 group-hover:bg-black/[.02] dark:group-hover:bg-white/[.02]" />
    </div>
  );
};
