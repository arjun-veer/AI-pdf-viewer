import { useEffect } from 'react';
import { usePDFStore } from '@/stores/pdfStore';
import { useSettingsStore } from '@/stores/settingsStore';

export function useZoomControls() {
  const { scale, setScale } = usePDFStore();
  const { defaultZoom } = useSettingsStore();

  const zoomIn = () => {
    setScale(Math.min(scale + 0.25, 5.0));
  };

  const zoomOut = () => {
    setScale(Math.max(scale - 0.25, 0.25));
  };

  const resetZoom = () => {
    setScale(defaultZoom);
  };

  const setZoomLevel = (level: number) => {
    setScale(Math.max(0.25, Math.min(level, 5.0)));
  };

  const fitToWidth = () => {
    setScale(1.0);
  };

  const fitToPage = () => {
    setScale(1.5);
  };

  return {
    scale,
    zoomIn,
    zoomOut,
    resetZoom,
    setZoomLevel,
    fitToWidth,
    fitToPage,
    zoomPercentage: Math.round(scale * 100),
  };
}

export function useKeyboardZoom() {
  const { zoomIn, zoomOut, resetZoom } = useZoomControls();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || 
          event.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case '=':
          case '+':
            event.preventDefault();
            zoomIn();
            break;
          case '-':
            event.preventDefault();
            zoomOut();
            break;
          case '0':
            event.preventDefault();
            resetZoom();
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [zoomIn, zoomOut, resetZoom]);
}
