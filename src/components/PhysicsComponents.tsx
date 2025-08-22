import { usePlane, useBox } from '@react-three/cannon';

// พื้นที่มี physics
export function GroundPlane() {
  const [ref] = usePlane(() => ({ 
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, 0, 0],
    material: {
      friction: 0.8,
      restitution: 0.1,
    },
  }));

  return (
    <mesh ref={ref as any} receiveShadow>
      <planeGeometry args={[50, 50]} />
      <meshLambertMaterial 
        color="#2c3e50" 
        transparent 
        opacity={0.9}
      />
    </mesh>
  );
}

// เครื่องจักรที่มี physics
export function PhysicsMachinery() {
  const [ref1] = useBox(() => ({ 
    position: [-6, 0.5, -6], 
    args: [3, 1, 2],
    type: 'Static',
  }));
  
  const [ref2] = useBox(() => ({ 
    position: [6, 0.5, -6], 
    args: [2, 1, 3],
    type: 'Static',
  }));
  
  const [ref3] = useBox(() => ({ 
    position: [-3, 0.5, 5], 
    args: [4, 1, 2],
    type: 'Static',
  }));
  
  const [ref4] = useBox(() => ({ 
    position: [5, 0.5, 6], 
    args: [2, 1, 2],
    type: 'Static',
  }));
  
  const [ref5] = useBox(() => ({ 
    position: [0, 0.2, 0], 
    args: [12, 0.4, 1],
    type: 'Static',
  }));

  return (
    <>
      <mesh ref={ref1 as any}>
        <boxGeometry args={[3, 1, 2]} />
        <meshStandardMaterial color="#e74c3c" />
      </mesh>
      <mesh ref={ref2 as any}>
        <boxGeometry args={[2, 1, 3]} />
        <meshStandardMaterial color="#3498db" />
      </mesh>
      <mesh ref={ref3 as any}>
        <boxGeometry args={[4, 1, 2]} />
        <meshStandardMaterial color="#f39c12" />
      </mesh>
      <mesh ref={ref4 as any}>
        <boxGeometry args={[2, 1, 2]} />
        <meshStandardMaterial color="#9b59b6" />
      </mesh>
      <mesh ref={ref5 as any}>
        <boxGeometry args={[12, 0.4, 1]} />
        <meshStandardMaterial color="#95a5a6" />
      </mesh>
    </>
  );
}