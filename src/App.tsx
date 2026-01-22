import { MainLayout } from '@/components/layout';
import { useTheme } from '@/hooks';

function App() {
  useTheme();

  return (
    <div className="h-screen w-screen overflow-hidden">
      <MainLayout />
    </div>
  );
}

export default App;
