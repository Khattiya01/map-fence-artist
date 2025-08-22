import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Play, 
  Square,
  RotateCcw,
  Mouse,
  Keyboard
} from 'lucide-react';

interface CharacterControlsProps {
  hasCharacter: boolean;
  onAddCharacter: () => void;
  onRemoveCharacter: () => void;
  onResetPosition: () => void;
}

export function CharacterControls({ 
  hasCharacter, 
  onAddCharacter, 
  onRemoveCharacter, 
  onResetPosition 
}: CharacterControlsProps) {
  return (
    <Card className="bg-sidebar-accent border-sidebar-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sidebar-foreground text-lg flex items-center gap-2">
          <User className="w-5 h-5" />
          Character Control
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {!hasCharacter ? (
            <Button
              variant="success"
              size="sm"
              onClick={onAddCharacter}
              className="w-full"
            >
              <Play className="w-4 h-4" />
              Add Character
            </Button>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-2">
                <Button
                  variant="warning"
                  size="sm"
                  onClick={onResetPosition}
                  className="flex-1"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset Position
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={onRemoveCharacter}
                  className="flex-1"
                >
                  <Square className="w-4 h-4" />
                  Remove
                </Button>
              </div>
              
              <div className="text-xs text-muted-foreground p-3 bg-surface-subtle rounded space-y-2">
                <div className="font-medium flex items-center gap-2">
                  <Keyboard className="w-3 h-3" />
                  Keyboard Controls:
                </div>
                <div>• <kbd className="bg-surface-elevated px-1 rounded">W/↑</kbd> Move Forward</div>
                <div>• <kbd className="bg-surface-elevated px-1 rounded">S/↓</kbd> Move Backward</div>
                <div>• <kbd className="bg-surface-elevated px-1 rounded">A/←</kbd> Move Left</div>
                <div>• <kbd className="bg-surface-elevated px-1 rounded">D/→</kbd> Move Right</div>
                
                <div className="font-medium flex items-center gap-2 pt-2">
                  <Mouse className="w-3 h-3" />
                  Mouse Controls:
                </div>
                <div>• Click on map to move character</div>
                <div>• <span className="text-destructive">Red fences</span> block movement</div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}