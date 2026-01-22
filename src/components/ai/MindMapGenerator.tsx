import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, RefreshCw, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface MindMapNode {
  id: string;
  label: string;
  level: number;
  children: MindMapNode[];
  pageNumbers: number[];
}

interface MindMapGeneratorProps {
  documentHash: string;
  pages: Array<{ pageNumber: number; text: string }>;
  onNavigateToPage?: (pageNumber: number) => void;
}

export function MindMapGenerator({
  documentHash: _documentHash,
  pages,
  onNavigateToPage,
}: MindMapGeneratorProps) {
  const [mindMap, setMindMap] = useState<MindMapNode | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [viewMode, setViewMode] = useState<'tree' | 'radial'>('tree');

  const generateMindMap = useCallback(async () => {
    setIsGenerating(true);

    try {
      // Simulate AI hierarchy extraction
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock mind map structure
      const mockMindMap: MindMapNode = {
        id: 'root',
        label: 'Document Overview',
        level: 0,
        children: [
          {
            id: 'node-1',
            label: 'Introduction',
            level: 1,
            children: [
              { id: 'node-1-1', label: 'Background', level: 2, children: [], pageNumbers: [1] },
              { id: 'node-1-2', label: 'Objectives', level: 2, children: [], pageNumbers: [1, 2] },
            ],
            pageNumbers: [1],
          },
          {
            id: 'node-2',
            label: 'Main Content',
            level: 1,
            children: [
              { id: 'node-2-1', label: 'Topic A', level: 2, children: [], pageNumbers: [3, 4] },
              { id: 'node-2-2', label: 'Topic B', level: 2, children: [], pageNumbers: [5, 6] },
              { id: 'node-2-3', label: 'Topic C', level: 2, children: [], pageNumbers: [7] },
            ],
            pageNumbers: [3, 4, 5, 6, 7],
          },
          {
            id: 'node-3',
            label: 'Conclusion',
            level: 1,
            children: [
              { id: 'node-3-1', label: 'Summary', level: 2, children: [], pageNumbers: [8] },
              { id: 'node-3-2', label: 'Future Work', level: 2, children: [], pageNumbers: [9] },
            ],
            pageNumbers: [8, 9],
          },
        ],
        pageNumbers: Array.from({ length: pages.length }, (_, i) => i + 1),
      };

      setMindMap(mockMindMap);
    } catch (error) {
      console.error('Failed to generate mind map:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [pages.length]);

  useEffect(() => {
    if (pages.length > 0 && !mindMap) {
      generateMindMap();
    }
  }, [pages.length, mindMap, generateMindMap]);

  const exportAsPNG = useCallback(async () => {
    // Mock export
    await new Promise((resolve) => setTimeout(resolve, 500));
    alert('Mind map exported as PNG (mock)');
  }, []);

  const exportAsSVG = useCallback(async () => {
    // Mock export
    await new Promise((resolve) => setTimeout(resolve, 500));
    alert('Mind map exported as SVG (mock)');
  }, []);

  const exportAsMarkdown = useCallback(() => {
    if (!mindMap) return;

    const renderNode = (node: MindMapNode, depth: number): string => {
      const indent = '  '.repeat(depth);
      const pages = node.pageNumbers.length > 0 ? ` (pages ${node.pageNumbers.join(', ')})` : '';
      let markdown = `${indent}- ${node.label}${pages}\n`;

      node.children.forEach((child) => {
        markdown += renderNode(child, depth + 1);
      });

      return markdown;
    };

    const markdown = `# Document Mind Map\n\n${renderNode(mindMap, 0)}`;
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mindmap.md';
    a.click();
    URL.revokeObjectURL(url);
  }, [mindMap]);

  const renderTreeNode = (node: MindMapNode, depth: number = 0) => (
    <div key={node.id} className="ml-4">
      <div
        className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-accent ${
          depth === 0 ? 'font-bold text-lg' : depth === 1 ? 'font-semibold' : ''
        }`}
        onClick={() => {
          if (node.pageNumbers.length > 0 && onNavigateToPage) {
            const pageNum = node.pageNumbers?.[0];
            if (pageNum !== undefined) {
              onNavigateToPage(pageNum);
            }
          }
        }}
      >
        <div
          className={`w-3 h-3 rounded-full ${
            depth === 0 ? 'bg-primary' : depth === 1 ? 'bg-blue-500' : 'bg-gray-400'
          }`}
        />
        <span>{node.label}</span>
        {node.pageNumbers.length > 0 && (
          <span className="text-xs text-muted-foreground">
            (p. {node.pageNumbers.join(', ')})
          </span>
        )}
      </div>
      {node.children.length > 0 && (
        <div className="ml-6 border-l-2 border-gray-300 pl-2">
          {node.children.map((child) => renderTreeNode(child, depth + 1))}
        </div>
      )}
    </div>
  );

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Mind Map</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setZoom((z) => Math.min(2, z + 0.1))}>
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setZoom(1)}>
              <Maximize2 className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={generateMindMap} disabled={isGenerating}>
              <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        {isGenerating ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
              <div>Generating mind map...</div>
            </div>
          </div>
        ) : mindMap ? (
          <div>
            <div className="mb-4 flex gap-2">
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value as 'tree' | 'radial')}
                className="px-3 py-1 border rounded"
              >
                <option value="tree">Tree View</option>
                <option value="radial">Radial View</option>
              </select>

              <Button variant="outline" size="sm" onClick={exportAsPNG}>
                <Download className="w-4 h-4 mr-1" />
                PNG
              </Button>
              <Button variant="outline" size="sm" onClick={exportAsSVG}>
                <Download className="w-4 h-4 mr-1" />
                SVG
              </Button>
              <Button variant="outline" size="sm" onClick={exportAsMarkdown}>
                <Download className="w-4 h-4 mr-1" />
                Markdown
              </Button>
            </div>

            <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}>
              {viewMode === 'tree' ? (
                renderTreeNode(mindMap)
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  Radial view visualization (would use D3.js or similar)
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center text-muted-foreground">
            No mind map generated yet. Click the refresh button to generate.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
