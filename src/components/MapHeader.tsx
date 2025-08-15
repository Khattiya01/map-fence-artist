import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  Navigation, 
  Edit3, 
  Blocks,
  Map
} from 'lucide-react';

interface MapHeaderProps {
  activeTab: 'home' | 'navigation' | 'edit' | 'blockly';
  onTabChange: (tab: 'home' | 'navigation' | 'edit' | 'blockly') => void;
  pathCount: number;
}

export function MapHeader({ activeTab, onTabChange, pathCount }: MapHeaderProps) {
  const tabs = [
    { id: 'home' as const, label: 'Home', icon: Home },
    { id: 'navigation' as const, label: 'Navigation', icon: Navigation },
    { id: 'edit' as const, label: 'Edit Map', icon: Edit3 },
    { id: 'blockly' as const, label: 'Blockly', icon: Blocks },
  ];

  return (
    <header className="h-16 bg-surface-elevated border-b border-border px-6 flex items-center justify-between shadow-elevated">
      <div className="flex items-center gap-6">
        {/* Logo/Title */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <Map className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold text-foreground">3D Map Editor</h1>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onTabChange(tab.id)}
                className="gap-2"
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </Button>
            );
          })}
        </nav>
      </div>

      {/* Status Info */}
      <div className="flex items-center gap-3">
        <Badge variant="secondary" className="gap-1">
          <span className="w-2 h-2 bg-accent rounded-full"></span>
          {pathCount} paths
        </Badge>
        
        <div className="text-sm text-muted-foreground">
          Use Mouse to Pan/Zoom/Rotate
        </div>
      </div>
    </header>
  );
}