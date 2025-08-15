import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  PenTool, 
  Route, 
  MapPin, 
  Save, 
  Trash2, 
  RotateCcw,
  Eye,
  EyeOff
} from 'lucide-react';

interface Path {
  id: string;
  name: string;
  points: Array<{ x: number; y: number; z: number }>;
  type: 'fence' | 'path' | 'waypoint';
  color: string;
}

interface MapSidebarProps {
  isDrawing: boolean;
  drawingMode: 'fence' | 'path' | 'waypoint';
  onDrawingModeChange: (mode: 'fence' | 'path' | 'waypoint') => void;
  onToggleDrawing: () => void;
  paths: Path[];
  onPathDelete: (pathId: string) => void;
  onPathRename: (pathId: string, newName: string) => void;
  onClearAll: () => void;
}

export function MapSidebar({
  isDrawing,
  drawingMode,
  onDrawingModeChange,
  onToggleDrawing,
  paths,
  onPathDelete,
  onPathRename,
  onClearAll
}: MapSidebarProps) {
  const [pathName, setPathName] = useState('');
  const [editingPath, setEditingPath] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleStartEdit = (path: Path) => {
    setEditingPath(path.id);
    setEditName(path.name);
  };

  const handleSaveEdit = () => {
    if (editingPath && editName.trim()) {
      onPathRename(editingPath, editName.trim());
    }
    setEditingPath(null);
    setEditName('');
  };

  const getDrawingModeIcon = (mode: 'fence' | 'path' | 'waypoint') => {
    switch (mode) {
      case 'fence':
        return <PenTool className="w-4 h-4" />;
      case 'path':
        return <Route className="w-4 h-4" />;
      case 'waypoint':
        return <MapPin className="w-4 h-4" />;
    }
  };

  const getDrawingModeColor = (mode: 'fence' | 'path' | 'waypoint') => {
    switch (mode) {
      case 'fence':
        return 'destructive';
      case 'path':
        return 'success';
      case 'waypoint':
        return 'default';
    }
  };

  return (
    <div className="w-80 h-full bg-sidebar border-r border-sidebar-border p-4 space-y-6 overflow-y-auto">
      {/* Drawing Tools */}
      <Card className="bg-sidebar-accent border-sidebar-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sidebar-foreground text-lg flex items-center gap-2">
            <PenTool className="w-5 h-5" />
            Drawing Tools
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-sidebar-foreground">Drawing Mode:</label>
            <div className="grid grid-cols-1 gap-2">
              {(['fence', 'path', 'waypoint'] as const).map((mode) => (
                <Button
                  key={mode}
                  variant={drawingMode === mode ? getDrawingModeColor(mode) : 'tool'}
                  size="sm"
                  onClick={() => onDrawingModeChange(mode)}
                  className="justify-start"
                >
                  {getDrawingModeIcon(mode)}
                  <span className="capitalize">{mode}</span>
                </Button>
              ))}
            </div>
          </div>

          <Separator className="bg-sidebar-border" />

          <div className="space-y-2">
            <Button
              variant={isDrawing ? 'warning' : 'default'}
              size="sm"
              onClick={onToggleDrawing}
              className="w-full"
            >
              {isDrawing ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {isDrawing ? 'Stop Drawing' : 'Start Drawing'}
            </Button>
            
            {isDrawing && (
              <div className="text-xs text-muted-foreground p-2 bg-surface-subtle rounded">
                Click on the map to add points. Press <kbd className="bg-surface-elevated px-1 rounded">Enter</kbd> to finish or <kbd className="bg-surface-elevated px-1 rounded">Esc</kbd> to cancel.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Path List */}
      <Card className="bg-sidebar-accent border-sidebar-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sidebar-foreground text-lg flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Route className="w-5 h-5" />
              Path List
            </span>
            <Badge variant="secondary" className="text-xs">
              {paths.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {paths.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm py-8">
              No paths created yet. Start drawing to create your first path.
            </div>
          ) : (
            <>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {paths.map((path) => (
                  <div 
                    key={path.id} 
                    className="p-3 bg-surface-elevated rounded-lg border border-border space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      {editingPath === path.id ? (
                        <div className="flex items-center gap-2 flex-1">
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="h-7 text-sm flex-1"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveEdit();
                              if (e.key === 'Escape') setEditingPath(null);
                            }}
                            autoFocus
                          />
                          <Button
                            size="sm"
                            variant="success"
                            onClick={handleSaveEdit}
                            className="h-7 px-2"
                          >
                            <Save className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2 flex-1">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: path.color }}
                            />
                            <span 
                              className="text-sm font-medium text-foreground cursor-pointer hover:text-primary transition-colors"
                              onClick={() => handleStartEdit(path)}
                            >
                              {path.name}
                            </span>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onPathDelete(path.id)}
                            className="h-7 px-2 hover:bg-destructive hover:text-destructive-foreground"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={path.type === 'fence' ? 'destructive' : path.type === 'path' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {path.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {path.points.length} points
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              <Separator className="bg-sidebar-border" />
              
              <Button
                variant="destructive"
                size="sm"
                onClick={onClearAll}
                className="w-full"
                disabled={paths.length === 0}
              >
                <RotateCcw className="w-4 h-4" />
                Clear All Paths
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="bg-sidebar-accent border-sidebar-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sidebar-foreground text-lg">Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <div>• Select a drawing mode (Fence, Path, or Waypoint)</div>
          <div>• Click "Start Drawing" to begin</div>
          <div>• Click on the 3D map to place points</div>
          <div>• Press Enter to finish the current path</div>
          <div>• Press Escape to cancel drawing</div>
          <div>• Use mouse to rotate, zoom, and pan the view</div>
          <div>• Click path names to rename them</div>
        </CardContent>
      </Card>
    </div>
  );
}