import { useState } from 'react';
import { MapCanvas } from '@/components/MapCanvas';
import { MapSidebar } from '@/components/MapSidebar';
import { MapHeader } from '@/components/MapHeader';
import { toast } from 'sonner';

interface Point {
  x: number;
  y: number;
  z: number;
}

interface Path {
  id: string;
  name: string;
  points: Point[];
  type: 'fence' | 'path' | 'waypoint';
  color: string;
}

const Index = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'navigation' | 'edit' | 'blockly'>('edit');
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingMode, setDrawingMode] = useState<'fence' | 'path' | 'waypoint'>('fence');
  const [paths, setPaths] = useState<Path[]>([]);
  const [lastCoordinate, setLastCoordinate] = useState<{x: number, y: number, z: number} | null>(null);
  const [hasCharacter, setHasCharacter] = useState(false);
  const [characterPosition, setCharacterPosition] = useState<[number, number, number]>([0, 0.8, 0]);

  const handlePathCreated = (newPath: Path) => {
    setPaths(prev => [...prev, newPath]);
    setIsDrawing(false);
    toast.success(`${newPath.type} created successfully with ${newPath.points.length} points`);
  };

  const handlePathDelete = (pathId: string) => {
    setPaths(prev => prev.filter(p => p.id !== pathId));
    toast.success('Path deleted successfully');
  };

  const handlePathRename = (pathId: string, newName: string) => {
    setPaths(prev => prev.map(p => p.id === pathId ? { ...p, name: newName } : p));
    toast.success('Path renamed successfully');
  };

  const handleClearAll = () => {
    setPaths([]);
    setIsDrawing(false);
    toast.success('All paths cleared');
  };

  const handleToggleDrawing = () => {
    setIsDrawing(!isDrawing);
    if (!isDrawing) {
      toast.info(`Started drawing ${drawingMode}. Click on the map to add points.`);
    } else {
      toast.info('Stopped drawing');
    }
  };

  const handleDrawingModeChange = (mode: 'fence' | 'path' | 'waypoint') => {
    setDrawingMode(mode);
    if (isDrawing) {
      toast.info(`Switched to ${mode} drawing mode`);
    }
  };

  const handleCoordinateClick = (x: number, y: number, z: number) => {
    setLastCoordinate({ x, y, z });
    toast.info(`Clicked at coordinates: X=${x}, Y=${y}, Z=${z}`);
  };

  const handleAddCharacter = () => {
    setHasCharacter(true);
    setCharacterPosition([0, 0.8, 0]);
    toast.success('Character added to the map');
  };

  const handleRemoveCharacter = () => {
    setHasCharacter(false);
    toast.success('Character removed from the map');
  };

  const handleResetCharacterPosition = () => {
    setCharacterPosition([0, 0.8, 0]);
    toast.success('Character position reset');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <MapHeader 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        pathCount={paths.length}
      />
      
      <div className="flex-1 flex">
        <MapSidebar
          isDrawing={isDrawing}
          drawingMode={drawingMode}
          onDrawingModeChange={handleDrawingModeChange}
          onToggleDrawing={handleToggleDrawing}
          paths={paths}
          onPathDelete={handlePathDelete}
          onPathRename={handlePathRename}
          onClearAll={handleClearAll}
          hasCharacter={hasCharacter}
          onAddCharacter={handleAddCharacter}
          onRemoveCharacter={handleRemoveCharacter}
          onResetCharacterPosition={handleResetCharacterPosition}
        />
        
        <main className="flex-1 p-4">
          <div className="h-full flex flex-col">
            {lastCoordinate && (
              <div className="mb-4 p-3 bg-card rounded-lg border">
                <p className="text-sm font-medium text-foreground">
                  พิกัดล่าสุด: X={lastCoordinate.x}, Y={lastCoordinate.y}, Z={lastCoordinate.z}
                </p>
              </div>
            )}
            <div className="flex-1">
              <MapCanvas
                isDrawing={isDrawing}
                drawingMode={drawingMode}
                onPathCreated={handlePathCreated}
                paths={paths}
                onCoordinateClick={handleCoordinateClick}
                hasCharacter={hasCharacter}
                characterPosition={characterPosition}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
