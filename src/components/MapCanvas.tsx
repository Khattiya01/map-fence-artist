import { useRef, useState, useCallback, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Plane, Line, Box, Text } from '@react-three/drei';
import * as THREE from 'three';

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

interface MapCanvasProps {
  isDrawing: boolean;
  drawingMode: 'fence' | 'path' | 'waypoint';
  onPathCreated: (path: Path) => void;
  paths: Path[];
  onCoordinateClick?: (x: number, y: number, z: number) => void;
}

function MapMesh({ isDrawing, drawingMode, onPathCreated, paths, onCoordinateClick }: MapCanvasProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { camera, raycaster, pointer, scene } = useThree();
  const [currentPath, setCurrentPath] = useState<Point[]>([]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!isDrawing || !meshRef.current) return;

      // Update raycaster with current mouse position
      const rect = (event.target as HTMLCanvasElement).getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObject(meshRef.current);

      if (intersects.length > 0) {
        const point = intersects[0].point;
        const newPoint = { x: point.x, y: point.y, z: point.z };
        
        // Show coordinates to user
        onCoordinateClick?.(
          Math.round(point.x * 100) / 100, 
          Math.round(point.y * 100) / 100, 
          Math.round(point.z * 100) / 100
        );
        
        setCurrentPath(prev => [...prev, newPoint]);
      }
    };

    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && currentPath.length > 0) {
        // Finalize the current path
        const newPath: Path = {
          id: Date.now().toString(),
          name: `${drawingMode}_${Date.now()}`,
          points: currentPath,
          type: drawingMode,
          color: drawingMode === 'fence' ? '#ef4444' : drawingMode === 'path' ? '#22c55e' : '#3b82f6'
        };
        onPathCreated(newPath);
        setCurrentPath([]);
      } else if (event.key === 'Escape') {
        // Cancel current path
        setCurrentPath([]);
      }
    };

    const canvas = document.querySelector('canvas');
    if (canvas) {
      canvas.addEventListener('click', handleClick);
      window.addEventListener('keydown', handleKeyPress);
    }

    return () => {
      if (canvas) {
        canvas.removeEventListener('click', handleClick);
        window.removeEventListener('keydown', handleKeyPress);
      }
    };
  }, [isDrawing, drawingMode, currentPath, camera, raycaster, pointer, onPathCreated]);

  // Clear current path when drawing mode changes
  useEffect(() => {
    if (!isDrawing) {
      setCurrentPath([]);
    }
  }, [isDrawing]);

  return (
    <>
      {/* Factory floor */}
      <Plane 
        ref={meshRef}
        args={[20, 20]} 
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
      >
        <meshStandardMaterial 
          color="#2c3e50" 
          transparent 
          opacity={0.9}
          wireframe={false}
        />
      </Plane>

      {/* Factory grid - more industrial look */}
      <gridHelper args={[20, 40, '#34495e', '#34495e']} position={[0, 0.01, 0]} />
      
      {/* Factory machinery/equipment areas */}
      <Box position={[-6, 0.5, -6]} args={[3, 1, 2]}>
        <meshStandardMaterial color="#e74c3c" />
      </Box>
      <Box position={[6, 0.5, -6]} args={[2, 1, 3]}>
        <meshStandardMaterial color="#3498db" />
      </Box>
      <Box position={[-3, 0.5, 5]} args={[4, 1, 2]}>
        <meshStandardMaterial color="#f39c12" />
      </Box>
      <Box position={[5, 0.5, 6]} args={[2, 1, 2]}>
        <meshStandardMaterial color="#9b59b6" />
      </Box>
      
      {/* Assembly line */}
      <Box position={[0, 0.2, 0]} args={[12, 0.4, 1]}>
        <meshStandardMaterial color="#95a5a6" />
      </Box>

      {/* Render saved paths */}
      {paths.map((path) => {
        if (path.points.length < 2) return null;
        
        const pathPoints = path.points.map(p => [p.x, p.y + 0.1, p.z] as [number, number, number]);
        
        return (
          <Line
            key={path.id}
            points={pathPoints}
            color={path.color}
            lineWidth={3}
          />
        );
      })}

      {/* Render current drawing path */}
      {currentPath.length > 1 && (
        <Line
          points={currentPath.map(p => [p.x, p.y + 0.1, p.z] as [number, number, number])}
          color={drawingMode === 'fence' ? '#ef4444' : drawingMode === 'path' ? '#22c55e' : '#3b82f6'}
          lineWidth={4}
          dashed
        />
      )}

      {/* Render current drawing points */}
      {currentPath.map((point, index) => (
        <mesh key={index} position={[point.x, point.y + 0.2, point.z]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial 
            color={drawingMode === 'fence' ? '#ef4444' : drawingMode === 'path' ? '#22c55e' : '#3b82f6'} 
            emissive={drawingMode === 'fence' ? '#7f1d1d' : drawingMode === 'path' ? '#166534' : '#1e3a8a'}
          />
        </mesh>
      ))}
    </>
  );
}

export function MapCanvas({ isDrawing, drawingMode, onPathCreated, paths, onCoordinateClick }: MapCanvasProps) {
  return (
    <div className="w-full h-full bg-background rounded-lg overflow-hidden shadow-elevated">
      <Canvas
        camera={{ position: [0, 15, 15], fov: 50 }}
        style={{ background: 'hsl(220 13% 12%)' }}
      >
        <ambientLight intensity={0.3} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={0.8}
          color="#ffffff"
          castShadow
        />
        <pointLight position={[0, 10, 0]} intensity={0.5} color="#00d9ff" />
        
        <MapMesh 
          isDrawing={isDrawing}
          drawingMode={drawingMode}
          onPathCreated={onPathCreated}
          paths={paths}
          onCoordinateClick={onCoordinateClick}
        />
        
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={50}
          maxPolarAngle={Math.PI / 2.1}
        />
      </Canvas>
    </div>
  );
}