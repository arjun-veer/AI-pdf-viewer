import { useState, useMemo, useEffect } from 'react';
import { usePDFStore } from '@/stores/pdfStore';
import { useReadingProgressStore } from '@/stores/readingProgressStore';
import { TTSControls, TTSHighlight } from '@/components/ai';
import { pdfService } from '@/services/pdfService';
import { cn } from '@/lib/utils';

interface PDFSidebarProps {
  className?: string;
}

interface BookmarkItem {
  pageNumber: number;
  title: string;
  timestamp: string;
}

export function PDFSidebar({ className }: PDFSidebarProps) {
  const { document, currentPage, setCurrentPage, totalPages } = usePDFStore();
  const recentDocuments = useReadingProgressStore((state) => state.getRecentDocuments());
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [activeTab, setActiveTab] = useState<'info' | 'bookmarks' | 'recent' | 'tts'>('info');
  const [pageText, setPageText] = useState<string>('');
  const [isLoadingText, setIsLoadingText] = useState(false);

  // Extract text from current page for TTS
  useEffect(() => {
    const loadPageText = async () => {
      if (!document || activeTab !== 'tts') return;

      setIsLoadingText(true);
      try {
        const text = await pdfService.getPageText(currentPage);
        setPageText(text);
      } catch (error) {
        console.error('Failed to extract page text:', error);
        setPageText('');
      } finally {
        setIsLoadingText(false);
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

  const removeBookmark = (pageNumber: number) => {
    setBookmarks(bookmarks.filter((b) => b.pageNumber !== pageNumber));
  };

  const progress = useMemo(() => {
    return totalPages > 0 ? Math.round((currentPage / totalPages) * 100) : 0;
  }, [currentPage, totalPages]);

  return (
    <div className={cn(
      'flex h-full w-64 flex-col border-r bg-background overflow-hidden',
      className
    )}>
      {/* Tabs */}
      <div className="flex border-b">
        {(['info', 'bookmarks', 'recent', 'tts'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
            }}
            className={cn(
              'flex-1 px-3 py-2 text-sm font-medium transition-colors',
              activeTab === tab
                ? 'border-b-2 border-accent text-accent'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {activeTab === 'info' && (
          <div className="space-y-4">
            {document && (
              <>
                <div>
                  <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-1">
                    Document
                  </h3>
                  <p className="text-sm break-words">
                    {document.title || 'Untitled'}
                  </p>
                </div>

                <div>
                  <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-1">
                    Progress
                  </h3>
                  <div className="space-y-2">
                    <div className="w-full bg-accent/20 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-accent h-full transition-all duration-200"
                        style={{ width: String(progress) + '%' }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {currentPage} / {totalPages} ({progress}%)
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-1">
                    Properties
                  </h3>
                  <dl className="text-xs space-y-1">
                    {document.author && (
                      <>
                        <dt className="text-muted-foreground">Author:</dt>
                        <dd className="ml-2 text-foreground">{document.author}</dd>
                      </>
                    )}
                    {document.creator && (
                      <>
                        <dt className="text-muted-foreground">Creator:</dt>
                        <dd className="ml-2 text-foreground">{document.creator}</dd>
                      </>
                    )}
                    <dt className="text-muted-foreground">Pages:</dt>
                    <dd className="ml-2 text-foreground">{totalPages}</dd>
                  </dl>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'bookmarks' && (
          <div className="space-y-3">
            <button
              onClick={addBookmark}
              className="w-full rounded bg-accent px-3 py-2 text-sm font-medium text-accent-foreground hover:opacity-90"
            >
              Add Bookmark
            </button>
            
            <div className="space-y-2">
              {bookmarks.length === 0 ? (
                <p className="text-xs text-muted-foreground">No bookmarks yet</p>
              ) : (
                bookmarks.map((bookmark) => (
                  <div
                    key={bookmark.pageNumber}
                    className={cn(
                      'rounded border p-2 cursor-pointer transition-colors',
                      currentPage === bookmark.pageNumber
                        ? 'border-accent bg-accent/10'
                        : 'border-border hover:bg-accent/5'
                    )}
                    onClick={() => {
                      setCurrentPage(bookmark.pageNumber);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-medium">{bookmark.title}</div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeBookmark(bookmark.pageNumber);
                        }}
                        className="text-xs text-muted-foreground hover:text-destructive"
                      >
                        ✕
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">{bookmark.timestamp}</p>
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
              recentDocuments.map((doc) => (
                <div
                  key={doc.documentId}
                  className="rounded border border-border p-2 text-xs hover:bg-accent/5 cursor-pointer transition-colors"
                >
                  <p className="font-medium">{'Page ' + String(doc.currentPage)}</p>
                  <p className="text-muted-foreground text-xs">
                    {new Date(doc.lastReadAt).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'tts' && (
          <div className="flex flex-col gap-4">
            {isLoadingText ? (
              <div className="flex items-center justify-center p-4">
                <p className="text-sm text-muted-foreground">Loading text...</p>
              </div>
            ) : (
              <>
                <div>
                  <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                    Page {currentPage} Text
                  </h3>
                  <TTSHighlight text={pageText} className="text-sm" />
                </div>
                
                <div>
                  <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                    Controls
                  </h3>
                  <TTSControls text={pageText} />
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
