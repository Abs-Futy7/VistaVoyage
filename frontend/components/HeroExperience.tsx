'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { PlaneModel } from '@/components/Cartoon_plane';
import { useRef } from 'react';
import * as THREE from 'three';

function AnimatedPlane() {
  const ref = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.y = Math.sin(clock.elapsedTime) * 5 - 10;
    }
  });

  return (
    <group ref={ref}>
      <PlaneModel 
        scale={21} 
        position={[-8, 7, 0]} 
        rotation={[0, Math.PI / 5, 0]}
        castShadow 
      />
      <mesh 
        position={[0, 2, 0]} 
        rotation={[Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#87CEEB" />
      </mesh>
    </group>
  );
}

export default function HeroExperience() {
  return (
    <Canvas
      gl={{ alpha: true }}
      style={{ background: 'transparent' }}
      camera={{ position: [0, 2, 60], fov: 55 }}
      shadows
    >
      <ambientLight intensity={1} />
      <directionalLight 
        position={[50, 50, 100]} 
        intensity={2.5}
      />
      <AnimatedPlane />
    </Canvas>
  );
}

