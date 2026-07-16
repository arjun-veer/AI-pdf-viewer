import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function RightPanel() {
  const [tab, setTab] = useState<'annotations' | 'notes' | 'outline'>('annotations');

  return (
    <div className="h-full flex flex-col p-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Notes</h3>
          <div className="text-xs text-muted-foreground">Editable page notes and annotations</div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => {}}>•••</Button>
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <button onClick={() => setTab('annotations')} className={tab === 'annotations' ? 'text-foreground font-medium' : 'text-muted-foreground'}>Annotations</button>
        <button onClick={() => setTab('notes')} className={tab === 'notes' ? 'text-foreground font-medium' : 'text-muted-foreground'}>Notes</button>
        <button onClick={() => setTab('outline')} className={tab === 'outline' ? 'text-foreground font-medium' : 'text-muted-foreground'}>Outline</button>
      </div>

      <div className="mt-4 flex-1 overflow-auto">
        {tab === 'annotations' && <div className="text-sm text-muted-foreground">Annotations list placeholder</div>}
        {tab === 'notes' && <div className="text-sm text-muted-foreground">Notes editor placeholder</div>}
        {tab === 'outline' && <div className="text-sm text-muted-foreground">Outline / bookmarks placeholder</div>}
      </div>
    </div>
  );
}
