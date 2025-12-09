import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sky, Cloud, OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';

const Birds = () => {
  const birdsRef = useRef<any>(null);
  
  // Create 10 birds
  const birds = useMemo(() => {
    return new Array(10).fill(0).map((_, i) => ({
      position: [Math.random() * 20 - 10, 10 + Math.random() * 5, Math.random() * 20 - 10],
      speed: 0.05 + Math.random() * 0.05,
      offset: Math.random() * 100
    }));
  }, []);

  useFrame((state) => {
    if (!birdsRef.current) return;
    birdsRef.current.children.forEach((bird, i) => {
       const b = birds[i];
       const time = state.clock.elapsedTime * b.speed + b.offset;
       // Circle flight path
       const r = 10;
       bird.position.x = Math.sin(time) * r;
       bird.position.z = Math.cos(time) * r;
       bird.position.y = b.position[1] + Math.sin(time * 3) * 0.5;
       
       // Face direction
       bird.lookAt(
           Math.sin(time + 0.1) * r, 
           b.position[1], 
           Math.cos(time + 0.1) * r
       );
    });
  });

  return (
    <group ref={birdsRef}>
      {birds.map((_, i) => (
        <mesh key={i}>
          {/* Bird Shape: Simple V or Cone */}
          <coneGeometry args={[0.2, 0.8, 4]} />
          <meshStandardMaterial color="white" />
          <group rotation={[0, 0, Math.PI / 2]}>
             <mesh position={[0, -0.2, 0]} rotation={[0,0,0]}>
                <boxGeometry args={[0.1, 1, 0.05]} />
                <meshStandardMaterial color="white" />
             </mesh>
          </group>
        </mesh>
      ))}
    </group>
  );
};

const Mountain = ({ position, scale }) => {
    return (
        <mesh position={position} scale={scale}>
            <coneGeometry args={[5, 10, 4]} />
            <meshStandardMaterial color="#5D4037" roughness={0.8} />
             {/* Snow cap */}
             <mesh position={[0, 3.5, 0]}>
                <coneGeometry args={[1.8, 3.5, 4]} />
                <meshStandardMaterial color="white" />
             </mesh>
        </mesh>
    );
};

const Grass = () => {
    // Simple ground with noise-like coloration implies grass for now. 
    // Full instanced grass might be heavy for this quick implementation, 
    // let's rely on nice colors and maybe a second layer of "hills".
    return (
        <group>
            <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, -0.5, 0]}>
                <planeGeometry args={[100, 100]} />
                <meshStandardMaterial color="#4CAF50" />
            </mesh>
            {/* Rolling Hills (Spheres buried in ground) */}
            <mesh position={[-10, -2, -10]}>
                <sphereGeometry args={[10, 32, 32]} />
                <meshStandardMaterial color="#43A047" />
            </mesh>
            <mesh position={[10, -3, 5]}>
                <sphereGeometry args={[12, 32, 32]} />
                <meshStandardMaterial color="#66BB6A" />
            </mesh>
        </group>
    );
};

const CloudLayer = () => {
    return (
        <group>
            <Cloud position={[-4, -2, -10]} args={[3, 2]} speed={0.2} opacity={0.5} />
            <Cloud position={[4, 2, -15]} args={[3, 2]} speed={0.2} opacity={0.5} />
            <Cloud position={[0, 10, 0]} args={[3, 2]} speed={0.2} opacity={1} />
            <Cloud position={[8, 5, 10]} args={[3, 2]} speed={0.2} opacity={0.5} />
            <Cloud position={[-8, 8, 5]} args={[3, 2]} speed={0.2} opacity={0.5} />
        </group>
    );
};

const ZenEnvironment = () => {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas camera={{ position: [0, 5, 15], fov: 60 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[100, 100, 100]} intensity={1} />
        <Sky sunPosition={[10, 10, -10]} inclination={0.5} azimuth={0.25} turbidity={0.5} rayleigh={0.5} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <OrbitControls enableZoom={true} maxPolarAngle={Math.PI / 2 - 0.1} />

        <Grass />
        
        {/* Mountains in background */}
        <Mountain position={[-15, 0, -20]} scale={[1, 1.5, 1]} />
        <Mountain position={[15, 0, -25]} scale={[1.5, 2, 1.5]} />
        <Mountain position={[0, 0, -30]} scale={[2, 2.5, 2]} />
        
        <CloudLayer />
        <Birds />
        
      </Canvas>
    </div>
  );
};

export default ZenEnvironment;
