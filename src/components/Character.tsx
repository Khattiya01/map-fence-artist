import { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useBox, usePlane } from '@react-three/cannon';
import * as THREE from 'three';

interface CharacterProps {
  position: [number, number, number];
  paths: Array<{
    id: string;
    points: Array<{ x: number; y: number; z: number }>;
    type: 'fence' | 'path' | 'waypoint';
  }>;
}

export function Character({ position, paths }: CharacterProps) {
  const [ref, api] = useBox(() => ({
    mass: 1,
    position,
    args: [0.8, 1.6, 0.8],
    material: {
      friction: 0.8,
      restitution: 0.1,
    },
    fixedRotation: true, // ป้องกันไม่ให้ตัวละครล้ม
  }));

  const { camera, pointer, raycaster } = useThree();
  const [keys, setKeys] = useState<{ [key: string]: boolean }>({});
  const [targetPosition, setTargetPosition] = useState<THREE.Vector3 | null>(null);
  const velocity = useRef([0, 0, 0]);
  const currentPosition = useRef(position);
  const isMoving = useRef(false);

  console.log('Character component loaded with position:', position);

  // ฟังก์ชันตรวจสอบการชนเส้น fence
  const checkFenceCollision = (newPosition: THREE.Vector3) => {
    const fences = paths.filter(path => path.type === 'fence');
    
    for (const fence of fences) {
      if (fence.points.length < 2) continue;
      
      for (let i = 0; i < fence.points.length - 1; i++) {
        const start = new THREE.Vector3(fence.points[i].x, fence.points[i].y, fence.points[i].z);
        const end = new THREE.Vector3(fence.points[i + 1].x, fence.points[i + 1].y, fence.points[i + 1].z);
        
        // ตรวจสอบระยะห่างจากตัวละครถึงเส้น
        const line = new THREE.Line3(start, end);
        const closestPoint = new THREE.Vector3();
        line.closestPointToPoint(newPosition, true, closestPoint);
        
        const distance = newPosition.distanceTo(closestPoint);
        
        // ถ้าระยะห่างน้อยกว่า 0.5 หน่วย จะถือว่าชน
        if (distance < 0.5) {
          return true;
        }
      }
    }
    
    return false;
  };

  // จัดการคีย์บอร์ด
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      console.log('Key pressed:', event.code);
      setKeys(prev => ({ ...prev, [event.code]: true }));
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      console.log('Key released:', event.code);
      setKeys(prev => ({ ...prev, [event.code]: false }));
    };

    const handleClick = (event: MouseEvent) => {
      // ตรวจสอบว่าไม่ใช่การคลิกบน UI elements
      if ((event.target as HTMLElement).closest('.sidebar')) return;
      
      console.log('Canvas clicked for character movement');
      
      // คำนวณตำแหน่งที่คลิก
      const rect = (event.target as HTMLCanvasElement).getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      
      // ตรวจสอบการชนกับพื้น
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const intersectPoint = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, intersectPoint);
      
      if (intersectPoint) {
        // ตรวจสอบว่าตำแหน่งเป้าหมายไม่ชนกับ fence
        if (!checkFenceCollision(intersectPoint)) {
          setTargetPosition(intersectPoint.clone());
          console.log('Target position set:', intersectPoint);
        } else {
          console.log('Target blocked by fence');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    const canvas = document.querySelector('canvas');
    if (canvas) {
      canvas.addEventListener('click', handleClick);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (canvas) {
        canvas.removeEventListener('click', handleClick);
      }
    };
  }, [camera, pointer, raycaster, paths]);

  // อัพเดทตำแหน่งตัวละคร
  useFrame((state, delta) => {
    if (!api || !api.velocity) {
      console.log('API not ready');
      return;
    }

    // การเคลื่อนไหวด้วยคีย์บอร์ด
    const speed = 8;
    let moveX = 0;
    let moveZ = 0;

    if (keys['KeyW'] || keys['ArrowUp']) {
      moveZ -= speed;
      isMoving.current = true;
      console.log('Moving forward');
    }
    if (keys['KeyS'] || keys['ArrowDown']) {
      moveZ += speed;
      isMoving.current = true;
      console.log('Moving backward');
    }
    if (keys['KeyA'] || keys['ArrowLeft']) {
      moveX -= speed;
      isMoving.current = true;
      console.log('Moving left');
    }
    if (keys['KeyD'] || keys['ArrowRight']) {
      moveX += speed;
      isMoving.current = true;
      console.log('Moving right');
    }

    // การเคลื่อนไหวไปยังตำแหน่งเป้าหมาย
    if (targetPosition) {
      const direction = targetPosition.clone().sub(new THREE.Vector3(...currentPosition.current));
      direction.y = 0; // ไม่เคลื่อนที่ในแนวแกน Y
      
      if (direction.length() > 0.3) {
        direction.normalize();
        moveX += direction.x * speed;
        moveZ += direction.z * speed;
        isMoving.current = true;
        console.log('Moving to target:', targetPosition);
      } else {
        setTargetPosition(null);
        console.log('Reached target');
      }
    }

    // ตรวจสอบการชนกับ fence ก่อนเคลื่อนไหว
    const newPosition = new THREE.Vector3(
      currentPosition.current[0] + moveX * delta,
      currentPosition.current[1],
      currentPosition.current[2] + moveZ * delta
    );

    if (!checkFenceCollision(newPosition)) {
      api.velocity.set(moveX, velocity.current[1], moveZ);
      console.log('Setting velocity:', moveX, velocity.current[1], moveZ);
    } else {
      api.velocity.set(0, velocity.current[1], 0);
      setTargetPosition(null); // ยกเลิกเป้าหมายถ้าชน fence
      console.log('Movement blocked by fence');
    }

    if (!isMoving.current && Math.abs(moveX) === 0 && Math.abs(moveZ) === 0) {
      api.velocity.set(0, velocity.current[1], 0);
    }
    
    isMoving.current = false;

    // อัพเดทตำแหน่งปัจจุบัน
    api.position.subscribe((position) => {
      currentPosition.current = position;
    });

    api.velocity.subscribe((vel) => {
      velocity.current = vel;
    });
  });

  return (
    <mesh ref={ref as any} castShadow>
      <boxGeometry args={[0.8, 1.6, 0.8]} />
      <meshLambertMaterial color="#e67e22" />
      
      {/* หัวตัวละคร */}
      <mesh position={[0, 1, 0]}>
        <sphereGeometry args={[0.3, 8, 8]} />
        <meshLambertMaterial color="#f39c12" />
      </mesh>
      
      {/* ตาตัวละคร */}
      <mesh position={[-0.1, 1.1, 0.25]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshLambertMaterial color="#2c3e50" />
      </mesh>
      <mesh position={[0.1, 1.1, 0.25]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshLambertMaterial color="#2c3e50" />
      </mesh>

      {/* แสดงเป้าหมาย */}
      {targetPosition && (
        <mesh position={[targetPosition.x - currentPosition.current[0], 0.1, targetPosition.z - currentPosition.current[2]]}>
          <ringGeometry args={[0.3, 0.5, 16]} />
          <meshBasicMaterial color="#3498db" transparent opacity={0.6} />
        </mesh>
      )}
    </mesh>
  );
}