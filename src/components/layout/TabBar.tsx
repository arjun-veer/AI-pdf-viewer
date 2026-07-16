import { cn } from '@/lib/utils';
import { Plus, ArrowLeft, ArrowRight } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';

interface Tab {
  id: string;
  title: string;
  active?: boolean;
}

export function TabBar() {
  const tabs: Tab[] = [
    { id: '1', title: 'document.pdf', active: true },
    { id: '2', title: 'research.pdf' },
  ];
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const check = () => {
      setCanScrollLeft(el.scrollLeft > 0);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
    };
    check();
    el.addEventListener('scroll', check);
    window.addEventListener('resize', check);
    return () => {
      el.removeEventListener('scroll', check);
      window.removeEventListener('resize', check);
    };
  }, []);

  return (
    <div className={cn('h-9 flex items-center px-2 gap-2 frosted border-b', 'overflow-hidden')}> 
      <div className="flex items-center gap-2">
        <button
          className={cn('h-8 w-8 rounded-md flex items-center justify-center', !canScrollLeft ? 'opacity-40 pointer-events-none' : 'hover:bg-accent/5')}
          onClick={() => scrollRef.current?.scrollBy({ left: -200, behavior: 'smooth' })}
          aria-hidden={!canScrollLeft}
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
      </div>

      <div ref={scrollRef} className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        {tabs.map((t) => (
          <div
            key={t.id}
            className={cn(
              'flex items-center gap-2 px-3 py-1 rounded-md text-sm min-w-[80px] max-w-[200px] truncate',
              t.active ? 'bg-surface/80 text-foreground font-medium' : 'text-muted-foreground hover:bg-accent/5'
            )}
            title={t.title}
          >
            <span className="text-xs">📄</span>
            <span className="truncate">{t.title}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <button
          className={cn('h-8 w-8 rounded-md flex items-center justify-center', !canScrollRight ? 'opacity-40 pointer-events-none' : 'hover:bg-accent/5')}
          onClick={() => scrollRef.current?.scrollBy({ left: 200, behavior: 'smooth' })}
          aria-hidden={!canScrollRight}
        >
          <ArrowRight className="h-4 w-4" />
        </button>

        <button className="h-8 w-8 rounded-md hover:bg-accent/5 flex items-center justify-center">
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
