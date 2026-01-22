import { ReactNode } from 'react';

interface AppLayoutProps {
  sidebar: ReactNode;
  toolbar: ReactNode;
  main: ReactNode;
  tabs?: ReactNode;
}

export function AppLayout({ sidebar, toolbar, main, tabs }: AppLayoutProps) {
  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-background text-foreground">
      {toolbar && <div className="border-b">{toolbar}</div>}
      
      {tabs && <div className="border-b">{tabs}</div>}
      
      <div className="flex flex-1 overflow-hidden">
        {sidebar && (
          <div className="border-r">
            {sidebar}
          </div>
        )}
        
        <div className="flex-1 overflow-hidden">
          {main}
        </div>
      </div>
    </div>
  );
}
