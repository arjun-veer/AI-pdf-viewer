import { MainLayout } from '@/components/layout';
import { ErrorBoundary } from '@/components/common';
import { useTheme } from '@/hooks';

function App() {
  useTheme();

  return (
    <ErrorBoundary>
      <div className="h-screen w-screen overflow-hidden">
        <MainLayout />
      </div>
    </ErrorBoundary>
  );
}

export default App;
