import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAnnotationStore, type HighlightColor } from '@/stores/annotationStore';
import {
  Highlighter,
  StickyNote,
  Pencil,
  Bookmark,
  Trash2,
  Save,
} from 'lucide-react';

interface AnnotationToolbarProps {
  documentHash: string;
  currentPage: number;
  onAnnotationCreate?: () => void;
}

const HIGHLIGHT_COLORS: { value: HighlightColor; label: string; color: string }[] = [
  { value: 'yellow', label: 'Yellow', color: 'bg-yellow-200' },
  { value: 'green', label: 'Green', color: 'bg-green-200' },
  { value: 'blue', label: 'Blue', color: 'bg-blue-200' },
  { value: 'pink', label: 'Pink', color: 'bg-pink-200' },
  { value: 'purple', label: 'Purple', color: 'bg-purple-200' },
];

export function AnnotationToolbar({
  documentHash: _documentHash,
  currentPage: _currentPage,
  onAnnotationCreate,
}: AnnotationToolbarProps) {
  const { activeType, activeColor, setActiveType, setActiveColor, getAnnotations } =
    useAnnotationStore();
  const [noteContent, setNoteContent] = useState('');

  const annotations = getAnnotations();

  const handleToolSelect = useCallback(
    (tool: typeof activeType) => {
      setActiveType(activeType === tool ? null : tool);
    },
    [activeType, setActiveType]
  );

  const handleCreateNote = useCallback(() => {
    if (noteContent.trim()) {
      // This will be handled by canvas interaction
      setNoteContent('');
      onAnnotationCreate?.();
    }
  }, [noteContent, onAnnotationCreate]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-sm">Annotation Tools</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={activeType === 'highlight' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleToolSelect('highlight')}
          >
            <Highlighter className="w-4 h-4 mr-1" />
            Highlight
          </Button>

          <Button
            variant={activeType === 'note' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleToolSelect('note')}
          >
            <StickyNote className="w-4 h-4 mr-1" />
            Note
          </Button>

          <Button
            variant={activeType === 'drawing' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleToolSelect('drawing')}
          >
            <Pencil className="w-4 h-4 mr-1" />
            Draw
          </Button>

          <Button
            variant={activeType === 'bookmark' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleToolSelect('bookmark')}
          >
            <Bookmark className="w-4 h-4 mr-1" />
            Bookmark
          </Button>
        </div>

        {activeType === 'highlight' && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Highlight Color</div>
            <div className="flex gap-2">
              {HIGHLIGHT_COLORS.map(({ value, label, color }) => (
                <button
                  key={value}
                  onClick={() => setActiveColor(value)}
                  className={`w-8 h-8 rounded ${color} border-2 ${
                    activeColor === value ? 'border-black' : 'border-transparent'
                  }`}
                  title={label}
                />
              ))}
            </div>
          </div>
        )}

        {activeType === 'note' && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Create Note</div>
            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Enter note content..."
              className="w-full p-2 border rounded text-sm min-h-[80px]"
            />
            <Button onClick={handleCreateNote} size="sm" disabled={!noteContent.trim()}>
              <Save className="w-4 h-4 mr-1" />
              Save Note
            </Button>
          </div>
        )}

        <div className="space-y-2">
          <div className="text-sm font-medium">Page Annotations ({annotations.length})</div>
          {annotations.length === 0 ? (
            <div className="text-sm text-muted-foreground">No annotations on this page</div>
          ) : (
            <div className="space-y-1 max-h-[200px] overflow-y-auto">
              {annotations.map((ann) => (
                <div
                  key={ann.id}
                  className="flex items-center justify-between p-2 border rounded text-sm"
                >
                  <div className="flex items-center gap-2">
                    {ann.type === 'highlight' && <Highlighter className="w-3 h-3" />}
                    {ann.type === 'note' && <StickyNote className="w-3 h-3" />}
                    {ann.type === 'drawing' && <Pencil className="w-3 h-3" />}
                    {ann.type === 'bookmark' && <Bookmark className="w-3 h-3" />}
                    <span className="truncate">{ann.content || ann.type}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => useAnnotationStore.getState().deleteAnnotation(ann.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
