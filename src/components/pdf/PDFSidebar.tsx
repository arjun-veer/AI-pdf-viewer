import { useState, useEffect } from 'react';
import { usePDFStore } from '@/stores/pdfStore';
import { useReadingProgressStore } from '@/stores/readingProgressStore';
import {
  TTSControls,
  TTSHighlight,
  PronunciationChecker,
  PracticeMode,
  TranslationPanel,
  OCRPanel,
  ChatPanel,
  SyncSettings
} from '@/components/ai';
import { pdfService } from '@/services/pdfService';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  FileText,
  Bookmark,
  Clock,
  Mic,
  BookOpen,
  Languages,
  Scan,
  MessageSquare,
  Settings,
  ChevronDown,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

interface PDFSidebarProps {
  className?: string;
}

interface BookmarkItem {
  pageNumber: number;
  title: string;
  timestamp: string;
}

type SidebarTab = 'thumbnails' | 'bookmarks' | 'recent' | 'ai-features';

const tabIcons: Record<SidebarTab, React.ComponentType<{ className?: string }>> = {
  thumbnails: FileText,
  bookmarks: Bookmark,
  recent: Clock,
  'ai-features': Mic,
};

const tabLabels: Record<SidebarTab, string> = {
  thumbnails: 'Pages',
  bookmarks: 'Bookmarks',
  recent: 'Recent',
  'ai-features': 'AI Tools',
};

export function PDFSidebar({ className }: PDFSidebarProps) {
  const { document, currentPage, setCurrentPage, totalPages } = usePDFStore();
  const recentDocuments = useReadingProgressStore((state) => state.recentDocuments);
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [activeTab, setActiveTab] = useState<SidebarTab>('thumbnails');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'ai-tools': false,
  });
  const [pageText, setPageText] = useState<string>('');
  const [documentHash, setDocumentHash] = useState<string>('');

  // Generate document hash for practice tracking
  useEffect(() => {
    if (document) {
      const hash = `doc-${String(Date.now())}`; // Simple hash, use SHA-256 in production
      setDocumentHash(hash);
    }
  }, [document]);

  // Extract text from current page for TTS, Practice, Translation, OCR, and Chat
  useEffect(() => {
    const loadPageText = async () => {
      if (!document || activeTab !== 'ai-features') return;

      try {
        const text = await pdfService.getPageText(currentPage);
        setPageText(text);
      } catch (error) {
        console.error('Failed to extract page text:', error);
        setPageText('');
      }
    };

    void loadPageText();
  }, [document, currentPage, activeTab]);

  const addBookmark = () => {
    if (!bookmarks.find((b) => b.pageNumber === currentPage)) {
      const pageStr = String(currentPage);
      const newBookmark: BookmarkItem = {
        pageNumber: currentPage,
        title: 'Page ' + pageStr,
        timestamp: new Date().toLocaleTimeString(),
      };
      setBookmarks([...bookmarks, newBookmark].sort((a, b) => a.pageNumber - b.pageNumber));
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  const [collapsed, setCollapsed] = useState(false);
  // progress currently unused but left for future UI

  return (
    <div className={cn('flex h-full flex-col p-2 frosted transition-all', collapsed ? 'w-20' : 'w-72', className)}>
      <div className="flex items-center justify-between px-2 py-1">
        <div className="flex items-center gap-2">
          <div className="text-sm font-semibold">Document</div>
          {!collapsed && <div className="text-xs text-muted-foreground">{document?.title || 'Untitled'}</div>}
        </div>

        <div className="no-drag">
          <Button variant="ghost" size="sm" onClick={() => setCollapsed((c) => !c)} className="h-7 w-7 p-0" aria-pressed={collapsed} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className="mt-2 rounded-md overflow-hidden bg-background/60 p-2">
        {(Object.keys(tabIcons) as SidebarTab[]).map((tab) => {
          const Icon = tabIcons[tab];
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors',
                activeTab === tab ? 'bg-accent/10 text-foreground' : 'text-muted-foreground hover:bg-accent/5'
              )}
            >
              <Icon className="h-4 w-4" />
              {!collapsed && <span className="font-medium">{tabLabels[tab]}</span>}
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-auto mt-3 px-2">
        {activeTab === 'thumbnails' && (
          <div className="space-y-3">
            <h4 className="text-xs font-medium text-muted-foreground">Pages</h4>
            {totalPages > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {Array.from({ length: Math.min(totalPages, 20) }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={cn(
                      'aspect-[3/4] rounded border bg-muted/50 text-xs font-medium flex items-center justify-center',
                      currentPage === pageNum ? 'border-accent bg-accent/10' : 'border-border hover:bg-accent/5'
                    )}
                  >
                    {pageNum}
                  </button>
                ))}
                {totalPages > 20 && <div className="col-span-2 text-center text-xs text-muted-foreground py-2">+{totalPages - 20} more</div>}
              </div>
            ) : (
              <div className="text-center text-sm text-muted-foreground py-8">No document loaded</div>
            )}
          </div>
        )}

        {activeTab === 'bookmarks' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-muted-foreground">Bookmarks</h4>
              <Button variant="outline" size="sm" onClick={addBookmark} className="h-7 px-2 text-xs">Add</Button>
            </div>

            <div className="space-y-2">
              {bookmarks.length === 0 ? (
                <p className="text-xs text-muted-foreground">No bookmarks yet</p>
              ) : (
                bookmarks.map((bookmark) => (
                  <div
                    key={bookmark.pageNumber}
                    className={cn('rounded border p-2 cursor-pointer', currentPage === bookmark.pageNumber ? 'border-accent bg-accent/10' : 'border-border hover:bg-accent/5')}
                    onClick={() => setCurrentPage(bookmark.pageNumber)}
                  >
                    <div className="text-sm font-medium">{bookmark.title}</div>
                    <div className="text-xs text-muted-foreground">{bookmark.timestamp}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'recent' && (
          <div className="space-y-2">
            {recentDocuments.length === 0 ? (
              <p className="text-xs text-muted-foreground">No recent documents</p>
            ) : (
              recentDocuments.slice(0, 10).map((doc, index) => (
                <div key={index} className="rounded border p-2 hover:bg-accent/5 transition-colors cursor-pointer text-xs">
                  <div className="font-medium">Document {doc.documentId}</div>
                  <div className="text-muted-foreground text-xs">{new Date(doc.lastReadAt).toLocaleDateString()}</div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'ai-features' && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">AI Tools</h4>

            <div>
              <button onClick={() => toggleSection('tts')} className="flex items-center gap-2 w-full text-left rounded px-2 py-1 hover:bg-accent/5">
                {expandedSections['tts'] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                <Mic className="h-4 w-4" />
                <span className="text-sm font-medium">Text-to-Speech</span>
              </button>
              {expandedSections['tts'] && <div className="ml-6 mt-2"><TTSControls /><TTSHighlight text={pageText} /></div>}
            </div>

            <Separator />

            <div>
              <button onClick={() => toggleSection('pronunciation')} className="flex items-center gap-2 w-full text-left rounded px-2 py-1 hover:bg-accent/5">
                {expandedSections['pronunciation'] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                <BookOpen className="h-4 w-4" />
                <span className="text-sm font-medium">Pronunciation</span>
              </button>
              {expandedSections['pronunciation'] && <div className="ml-6 mt-2"><PronunciationChecker text={pageText} /><PracticeMode documentHash={documentHash} pageText={pageText} pageNumber={currentPage} /></div>}
            </div>

            <Separator />

            <div>
              <button onClick={() => toggleSection('translation')} className="flex items-center gap-2 w-full text-left rounded px-2 py-1 hover:bg-accent/5">
                {expandedSections['translation'] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                <Languages className="h-4 w-4" />
                <span className="text-sm font-medium">Translation</span>
              </button>
              {expandedSections['translation'] && <div className="ml-6 mt-2"><TranslationPanel documentHash={documentHash} currentPage={currentPage} totalPages={totalPages} pageText={pageText} /></div>}
            </div>

            <Separator />

            <div>
              <button onClick={() => toggleSection('ocr')} className="flex items-center gap-2 w-full text-left rounded px-2 py-1 hover:bg-accent/5">
                {expandedSections['ocr'] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                <Scan className="h-4 w-4" />
                <span className="text-sm font-medium">OCR</span>
              </button>
              {expandedSections['ocr'] && <div className="ml-6 mt-2"><OCRPanel documentHash={documentHash} currentPage={currentPage} totalPages={totalPages} pageText={pageText} hasImages={false} /></div>}
            </div>

            <Separator />

            <div>
              <button onClick={() => toggleSection('chat')} className="flex items-center gap-2 w-full text-left rounded px-2 py-1 hover:bg-accent/5">
                {expandedSections['chat'] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                <MessageSquare className="h-4 w-4" />
                <span className="text-sm font-medium">AI Chat</span>
              </button>
              {expandedSections['chat'] && <div className="ml-6 mt-2"><ChatPanel documentHash={documentHash} pages={[{ pageNumber: currentPage, text: pageText }]} /></div>}
            </div>

            <Separator />

            <div>
              <button onClick={() => toggleSection('settings')} className="flex items-center gap-2 w-full text-left rounded px-2 py-1 hover:bg-accent/5">
                {expandedSections['settings'] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                <Settings className="h-4 w-4" />
                <span className="text-sm font-medium">Settings</span>
              </button>
              {expandedSections['settings'] && <div className="ml-6 mt-2"><SyncSettings /></div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
