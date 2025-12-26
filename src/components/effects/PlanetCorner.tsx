import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Float } from '@react-three/drei';

function PlanetMesh() {
  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1}>
        <Sphere args={[1, 32, 32]} scale={1.8}>
            <MeshDistortMaterial
                color="#8b5cf6" // Violet
                attach="material"
                distort={0.4}
                speed={2}
                roughness={0.4}
                metalness={0.8}
            />
        </Sphere>
    </Float>
  );
}

const Planet3DCanvas = () => {
    return (
         <div className="w-full h-full">
            <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} />
                <PlanetMesh />
            </Canvas>
         </div>
    );
};

// Lazy load the 3D part
const PlanetLazy = React.lazy(async () => ({ default: Planet3DCanvas }));

export function PlanetCorner() {
    // Only render on adequate devices (simplified check, could use GPU tier)
    // For now, always render but lazy loaded.
    
    return (
        <div className="absolute top-0 right-0 w-32 h-32 md:w-48 md:h-48 pointer-events-none z-0 opacity-80 mix-blend-screen">
             <Suspense fallback={<div className="w-full h-full rounded-full bg-violet-500/20 blur-xl animate-pulse" />}>
                 <PlanetLazy />
             </Suspense>
        </div>
    );
}
