import { useState, useCallback } from 'react';
import { pdfService } from '@/services/pdfService';
import { cn } from '@/lib/utils';

interface PDFSearchPanelProps {
  className?: string;
}

interface SearchResult {
  pageNumber: number;
  text: string;
}

export function PDFSearchPanel({ className }: PDFSearchPanelProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [currentResultIndex, setCurrentResultIndex] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [totalResults, setTotalResults] = useState(0);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) {
      setResults([]);
      setTotalResults(0);
      return;
    }

    setIsSearching(true);
    try {
      const matchingPages = await pdfService.searchText(query);
      
      const searchResults: SearchResult[] = matchingPages.map((page) => ({
        pageNumber: page,
        text: query,
      }));
      
      setResults(searchResults);
      setTotalResults(searchResults.length);
      setCurrentResultIndex(0);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
      setTotalResults(0);
    } finally {
      setIsSearching(false);
    }
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch().catch((err: unknown) => {
        console.error('Search error:', err);
      });
    }
  };

  const goToPreviousResult = () => {
    setCurrentResultIndex(Math.max(0, currentResultIndex - 1));
  };

  const goToNextResult = () => {
    setCurrentResultIndex(Math.min(results.length - 1, currentResultIndex + 1));
  };

  return (
    <div className={cn(
      'flex flex-col gap-3 rounded border bg-background p-4',
      className
    )}>
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); }}
          onKeyDown={handleKeyDown}
          placeholder="Search PDF text..."
          className="flex-1 rounded border bg-background px-3 py-2 text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <button
          onClick={() => {
            handleSearch().catch((err: unknown) => {
              console.error('Search error:', err);
            });
          }}
          disabled={isSearching}
          className="rounded bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90 disabled:opacity-50"
        >
          {isSearching ? 'Searching...' : 'Search'}
        </button>
      </div>

      {totalResults > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Found {totalResults} result{totalResults !== 1 ? 's' : ''} on page{totalResults !== 1 ? 's' : ''}
          </p>
          
          {results.length > 0 && (
            <div className="flex gap-1">
              <button
                onClick={goToPreviousResult}
                disabled={currentResultIndex === 0}
                className="rounded border px-2 py-1 text-xs disabled:opacity-50"
              >
                ← Prev
              </button>
              <span className="px-2 py-1 text-xs">
                {currentResultIndex + 1} / {results.length}
              </span>
              <button
                onClick={goToNextResult}
                disabled={currentResultIndex === results.length - 1}
                className="rounded border px-2 py-1 text-xs disabled:opacity-50"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      )}

      {results.length === 0 && query.trim() && !isSearching && (
        <p className="text-xs text-muted-foreground">No results found for "{query}"</p>
      )}
    </div>
  );
}
