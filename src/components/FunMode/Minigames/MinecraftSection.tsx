import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

// Steve Component (Simple Voxel Character)
const Steve = ({ position, rotation }) => {
  return (
    <group position={position} rotation={rotation}>
      {/* Head */}
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color="#F9E4B7" />
      </mesh>
      {/* Body */}
      <mesh position={[0, 0.75, 0]}>
        <boxGeometry args={[0.5, 0.75, 0.25]} />
        <meshStandardMaterial color="cyan" />
      </mesh>
      {/* Arms */}
      <mesh position={[-0.375, 0.75, 0]}>
        <boxGeometry args={[0.25, 0.75, 0.25]} />
        <meshStandardMaterial color="#F9E4B7" />
      </mesh>
      <mesh position={[0.375, 0.75, 0]}>
        <boxGeometry args={[0.25, 0.75, 0.25]} />
        <meshStandardMaterial color="#F9E4B7" />
      </mesh>
      {/* Legs */}
      <mesh position={[-0.125, 0, 0]}>
        <boxGeometry args={[0.25, 0.75, 0.25]} />
        <meshStandardMaterial color="blue" />
      </mesh>
      <mesh position={[0.125, 0, 0]}>
        <boxGeometry args={[0.25, 0.75, 0.25]} />
        <meshStandardMaterial color="blue" />
      </mesh>
    </group>
  );
};

// Tree Component
const Tree = ({ position }) => {
    return (
        <group position={position}>
            {/* Trunk */}
            <mesh position={[0, 1, 0]}>
                <boxGeometry args={[0.5, 2, 0.5]} />
                <meshStandardMaterial color="#8B4513" />
            </mesh>
            {/* Leaves */}
            <mesh position={[0, 2.5, 0]}>
                <boxGeometry args={[2, 1, 2]} />
                <meshStandardMaterial color="#2ecc71" />
            </mesh>
            <mesh position={[0, 3.25, 0]}>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color="#2ecc71" />
            </mesh>
        </group>
    );
};

const MinecraftSection = () => {
  const [blocks, setBlocks] = useState([
    { position: [0, 0, 0], type: 'grass' },
    { position: [1, 0, 0], type: 'grass' },
    { position: [-1, 0, 0], type: 'grass' },
    { position: [0, 0, 1], type: 'grass' },
    { position: [0, 0, -1], type: 'grass' },
    { position: [2, 1, 2], type: 'gold' }, // Secret block
  ]);

  const [stevePos, setStevePos] = useState([0, 0, 0]);
  const [steveRot, setSteveRot] = useState([0, 0, 0]);
  
  // WASD Logic
  useEffect(() => {
    const handleKeyDown = (e) => {
        setStevePos(prev => {
            const [x, y, z] = prev;
            const speed = 0.5;
            let newX = x, newZ = z;
            let rot = 0;
            
            if (e.key === 'w' || e.key === 'W') { newZ -= speed; rot = Math.PI; }
            if (e.key === 's' || e.key === 'S') { newZ += speed; rot = 0; }
            if (e.key === 'a' || e.key === 'A') { newX -= speed; rot = -Math.PI/2; }
            if (e.key === 'd' || e.key === 'D') { newX += speed; rot = Math.PI/2; }
            
            // Should verify bounds or collision? Nah, infinite world feel.
            setSteveRot([0, rot, 0]);
            return [newX, y, newZ];
        });
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const addBlock = (e) => {
    e.stopPropagation();
    const { point, face } = e;
    if (!face) return;
    const pos = [
      Math.round(point.x + face.normal.x * 0.5),
      Math.round(point.y + face.normal.y * 0.5),
      Math.round(point.z + face.normal.z * 0.5),
    ];
    setBlocks([...blocks, { position: pos, type: 'grass' }]);
  };

  const removeBlock = (e, index, type) => {
    e.stopPropagation();
    if (type === 'gold') {
        alert("You found the secret gold!");
        window.location.href = "/secret-gifs";
    } else if (e.altKey) {
        setBlocks(blocks.filter((_, i) => i !== index));
    }
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas camera={{ position: [5, 5, 5], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <OrbitControls />

        {/* Large Ground Plane */}
        <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, -0.5, 0]}>
             <planeGeometry args={[100, 100]} />
             <meshStandardMaterial color="#27ae60" />
        </mesh>

        <Steve position={stevePos} rotation={steveRot} />
        
        {/* Environment Trees */}
        <Tree position={[-5, -0.5, -5]} />
        <Tree position={[8, -0.5, 5]} />
        <Tree position={[-8, -0.5, 8]} />

        {blocks.map((block, i) => (
          <mesh
            key={i}
            position={block.position}
            onClick={(e) => removeBlock(e, i, block.type)}
            onPointerMissed={addBlock} 
          >
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={block.type === 'gold' ? 'gold' : '#8e44ad'} /> 
          </mesh>
        ))}
      </Canvas>
      <div style={{ position: 'absolute', bottom: 10, left: 10, color: 'white', background: 'rgba(0,0,0,0.5)', padding: '5px' }}>
        WASD to Move Steve | Alt+Click to Break | Click to Build
      </div>
    </div>
  );
};

export default MinecraftSection;
