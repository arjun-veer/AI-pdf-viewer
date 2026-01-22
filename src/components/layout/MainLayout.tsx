import { AppLayout } from './AppLayout';
import { PDFViewer, PDFToolbar, PDFSidebar, FileDropZone } from '@/components/pdf';

export function MainLayout() {
  return (
    <FileDropZone>
      <AppLayout
        toolbar={<PDFToolbar />}
        sidebar={<PDFSidebar />}
        main={<PDFViewer />}
      />
    </FileDropZone>
  );
}
