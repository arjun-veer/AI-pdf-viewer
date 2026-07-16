import { useEffect, useState } from 'react';
import { AppLayout, TabBar, RightPanel, CommandPalette } from './index';
import { PDFViewer, PDFToolbar, PDFSidebar, FileDropZone } from '@/components/pdf';
import { useFileOpen } from '@/hooks/useFileOpen';

export function MainLayout() {
  const { openFile } = useFileOpen();

  useEffect(() => {
    const handler = () => void openFile();
    document.addEventListener('open-pdf', handler);
    return () => document.removeEventListener('open-pdf', handler);
  }, [openFile]);

  const [showPalette, setShowPalette] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowPalette((s) => !s);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <FileDropZone>
      <AppLayout
        toolbar={<PDFToolbar />}
        tabs={<TabBar />}
        sidebar={<PDFSidebar />}
        main={<PDFViewer />}
        rightPanel={<RightPanel />}
      />
      <CommandPalette open={showPalette} onClose={() => setShowPalette(false)} />
    </FileDropZone>
  );
}
