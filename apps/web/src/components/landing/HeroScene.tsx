import { useMemo, useRef, type ReactElement } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import type { Group, Mesh } from 'three';

const BRAND_COLORS = ['#dd2d4a', '#69dc9e', '#ea9010', '#ffffff'] as const;

interface BlobProps {
  position: [number, number, number];
  color: string;
  geometry: 'ico' | 'torus' | 'box' | 'sphere';
  scale?: number;
}

function Blob({ position, color, geometry, scale = 1 }: BlobProps) {
  const ref = useRef<Mesh>(null);
  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.x += delta * 0.25;
    ref.current.rotation.y += delta * 0.35;
  });
  const geo: Record<BlobProps['geometry'], ReactElement> = {
    ico: <icosahedronGeometry args={[1, 0]} />,
    torus: <torusGeometry args={[0.7, 0.28, 16, 40]} />,
    box: <boxGeometry args={[1.3, 1.3, 1.3]} />,
    sphere: <sphereGeometry args={[1, 32, 32]} />,
  };
  return (
    <Float speed={2} rotationIntensity={1.2} floatIntensity={1.6}>
      <mesh ref={ref} position={position} scale={scale} castShadow>
        {geo[geometry]}
        <meshStandardMaterial color={color} roughness={0.25} metalness={0.15} />
      </mesh>
    </Float>
  );
}

function ParallaxGroup() {
  const group = useRef<Group>(null);
  useFrame((state) => {
    if (!group.current) return;
    group.current.rotation.y += (state.pointer.x * 0.4 - group.current.rotation.y) * 0.04;
    group.current.rotation.x += (-state.pointer.y * 0.25 - group.current.rotation.x) * 0.04;
  });
  const blobs = useMemo<BlobProps[]>(
    () => [
      { position: [-2.6, 1.1, 0], color: BRAND_COLORS[0], geometry: 'ico', scale: 1.1 },
      { position: [2.7, 0.6, -1], color: BRAND_COLORS[1], geometry: 'torus', scale: 1.2 },
      { position: [0.2, -1.4, 0.5], color: BRAND_COLORS[2], geometry: 'box', scale: 0.8 },
      { position: [3.1, -1.6, -0.5], color: BRAND_COLORS[3], geometry: 'sphere', scale: 0.55 },
      { position: [-3.2, -1.1, -1], color: BRAND_COLORS[2], geometry: 'sphere', scale: 0.5 },
      { position: [-0.6, 1.9, -1], color: BRAND_COLORS[1], geometry: 'ico', scale: 0.6 },
    ],
    []
  );
  return (
    <group ref={group}>
      {blobs.map((b, i) => (
        <Blob key={i} {...b} />
      ))}
    </group>
  );
}

export default function HeroScene() {
  return (
    <Canvas camera={{ position: [0, 0, 7], fov: 45 }} dpr={[1, 1.8]} gl={{ antialias: true, alpha: true }} style={{ pointerEvents: 'none' }}>
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 5, 5]} intensity={1.6} />
      <pointLight position={[-5, -3, 2]} intensity={40} color="#dd2d4a" />
      <pointLight position={[5, 3, -2]} intensity={40} color="#69dc9e" />
      <ParallaxGroup />
    </Canvas>
  );
}
