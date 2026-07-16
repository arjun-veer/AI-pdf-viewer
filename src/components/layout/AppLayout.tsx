import { ReactNode } from 'react';

interface AppLayoutProps {
  sidebar: ReactNode;
  toolbar: ReactNode;
  main: ReactNode;
  tabs?: ReactNode;
  rightPanel?: ReactNode;
}

export function AppLayout({ sidebar, toolbar, main, tabs, rightPanel }: AppLayoutProps) {
  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-background text-foreground">
      {/* Top title bar */}
      <div className="titlebar relative flex items-center justify-between px-4 z-20 frosted shadow-sm">
        <div className="flex items-center gap-3 no-drag">
          <div className="traffic-lights no-drag" role="group" aria-label="Window controls">
            <button
              aria-label="Close"
              className="t-red interactive no-drag traffic-btn"
              onClick={() => { try { window.close?.(); } catch {} }}
              title="Close"
            />

            <button
              aria-label="Minimize"
              className="t-yellow interactive no-drag traffic-btn"
              onClick={() => { /* platform-specific minimize handled by Tauri in native builds */ }}
              title="Minimize"
            />

            <button
              aria-label="Maximize"
              className="t-green interactive no-drag traffic-btn"
              onClick={() => { /* platform-specific maximize handled by Tauri in native builds */ }}
              title="Maximize"
            />
          </div>

          <div className="h-8 w-8 rounded-md bg-accent/10 flex items-center justify-center text-accent font-semibold no-drag">
            PDF
          </div>
        </div>

        {/* Centered title - clickable/non-draggable */}
        <div className="absolute left-0 right-0 flex justify-center pointer-events-none">
          <div className="text-sm font-semibold no-drag pointer-events-auto">AI PDF Viewer</div>
        </div>

        <div className="flex items-center gap-3 no-drag">
          <div className="hidden md:block">
            <input
              placeholder="Search in document"
              className="rounded-md border border-border px-3 py-1 text-sm bg-background/60 focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
      </div>

      {/* Toolbar */}
      {toolbar && <div className="border-b bg-background/95">{toolbar}</div>}

      {/* Tabs */}
      {tabs && <div className="border-b bg-background/50 px-3 py-1">{tabs}</div>}

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {sidebar && (
          <aside className="left-sidebar border-r bg-background/5 w-72 min-w-[64px] overflow-hidden">
            {sidebar}
          </aside>
        )}

        {/* Main content */}
        <main className="flex-1 overflow-auto bg-muted p-6">
          <div className="mx-auto max-w-[1200px] h-full">{main}</div>
        </main>

        {/* Right panel */}
        {rightPanel && (
          <aside className="right-panel border-l bg-background/5 w-80 min-w-[220px] overflow-auto">
            {rightPanel}
          </aside>
        )}
      </div>
    </div>
  );
}
