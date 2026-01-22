import { AppLayout } from './AppLayout';
import { PDFViewer, PDFToolbar, PDFSidebar } from '@/components/pdf';

export function MainLayout() {
  return (
    <AppLayout
      toolbar={<PDFToolbar />}
      sidebar={<PDFSidebar />}
      main={<PDFViewer />}
    />
  );
}
