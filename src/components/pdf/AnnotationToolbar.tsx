import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function AnnotationToolbar() {
  const [color, setColor] = useState<string>('yellow');
  const colors = [
    { key: 'yellow', hex: '#ffd700' },
    { key: 'green', hex: '#4fc664' },
    { key: 'blue', hex: '#4a9eff' },
    { key: 'pink', hex: '#ff6595' },
    { key: 'purple', hex: '#9b59ff' },
  ];

  return (
    <div className="w-full border-t bg-background/60 p-2 flex items-center gap-2">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm">✏️</Button>
        <Button variant="ghost" size="sm">🖍️</Button>
        <Button variant="ghost" size="sm">▭</Button>
        <Button variant="ghost" size="sm">⚪</Button>
        <Button variant="ghost" size="sm">T</Button>
        <Button variant="ghost" size="sm">🗒️</Button>
        <Button variant="ghost" size="sm">🧽</Button>
      </div>

      <div className="h-6 w-px bg-border mx-2" />

      <div className="flex items-center gap-2">
        {colors.map((c) => (
          <button
            key={c.key}
            onClick={() => setColor(c.key)}
            aria-label={c.key}
            className={`h-6 w-6 rounded-full border ${color === c.key ? 'ring-2 ring-offset-1 ring-accent' : ''}`}
            style={{ backgroundColor: c.hex }}
          />
        ))}
      </div>

      <div className="ml-auto flex items-center gap-2">
        <select className="rounded-md border px-2 py-1 bg-background text-sm">
          <option>1 px</option>
          <option>2 px</option>
          <option>3 px</option>
          <option>4 px</option>
        </select>
        <Button variant="ghost" size="sm">Undo</Button>
        <Button variant="ghost" size="sm">Redo</Button>
      </div>
    </div>
  );

  }

