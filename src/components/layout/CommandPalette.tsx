import { useEffect } from 'react';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24">
      <div className="w-full max-w-2xl bg-background/95 frosted rounded-lg p-4 shadow-lg">
        <input autoFocus placeholder="Search files, jump to page, run a command..." className="w-full p-3 rounded-md border bg-background/30" />
        <div className="mt-3 text-sm text-muted-foreground">Results will appear here.</div>
      </div>
    </div>
  );
}
