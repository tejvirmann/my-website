import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useTexture } from '@react-three/drei';
import * as THREE from 'three';

const Car = ({ onUpdate, collisionTrigger }) => {
  const mesh = useRef<any>(null);
  const speed = useRef(0);
  const steering = useRef(0);
  const velocity = useRef(new THREE.Vector3(0,0,0));
  const keys = useRef({ w: false, s: false, a: false, d: false });

  // Handle Collision Bounce
  useEffect(() => {
     if (collisionTrigger) {
         speed.current = -0.4; // Bounce back
         // Optional: Spin
         // steering.current += Math.PI / 4; 
     }
  }, [collisionTrigger]); // Trigger when this prop changes (timestamp or id)

  useEffect(() => {
      const handleDown = (e: KeyboardEvent) => {
          if(e.key === 'w' || e.key === 'ArrowUp') keys.current.w = true;
          if(e.key === 's' || e.key === 'ArrowDown') keys.current.s = true;
          if(e.key === 'a' || e.key === 'ArrowLeft') keys.current.a = true;
          if(e.key === 'd' || e.key === 'ArrowRight') keys.current.d = true;
      };
      const handleUp = (e: KeyboardEvent) => {
          if(e.key === 'w' || e.key === 'ArrowUp') keys.current.w = false;
          if(e.key === 's' || e.key === 'ArrowDown') keys.current.s = false;
          if(e.key === 'a' || e.key === 'ArrowLeft') keys.current.a = false;
          if(e.key === 'd' || e.key === 'ArrowRight') keys.current.d = false;
      };
      // Bind to window for now as focus management in canvas can be tricky without a wrapper
      window.addEventListener('keydown', handleDown);
      window.addEventListener('keyup', handleUp);
      return () => {
          window.removeEventListener('keydown', handleDown);
          window.removeEventListener('keyup', handleUp);
      };
  }, []);

  useFrame(() => {
      if(!mesh.current) return;

      // Acceleration
      if(keys.current.w) speed.current = Math.min(speed.current + 0.01, 0.5);
      else if(keys.current.s) speed.current = Math.max(speed.current - 0.01, -0.2);
      else speed.current *= 0.95; // Friction

      // Steering
      if(Math.abs(speed.current) > 0.01) {
          if(keys.current.a) steering.current += 0.05;
          if(keys.current.d) steering.current -= 0.05;
      }
      
      mesh.current.rotation.y = steering.current;

      velocity.current.z = Math.cos(steering.current) * speed.current;
      velocity.current.x = Math.sin(steering.current) * speed.current;

      mesh.current.position.add(velocity.current);

      // Camera Follow
      onUpdate(mesh.current.position, mesh.current.rotation.y);
  });

  return (
    <group ref={mesh} position={[0, 0.5, 0]}>
        {/* Car Body */}
        <mesh position={[0, 0.25, 0]}>
            <boxGeometry args={[1, 0.5, 2]} />
            <meshStandardMaterial color="red" />
        </mesh>
        <mesh position={[0, 0.75, 0]}>
            <boxGeometry args={[0.8, 0.4, 1]} />
            <meshStandardMaterial color="red" />
        </mesh>
        
        {/* Wheels */}
        <mesh position={[0.6, 0, 0.6]} rotation={[0,0,Math.PI/2]}>
            <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
            <meshStandardMaterial color="black" />
        </mesh>
        <mesh position={[-0.6, 0, 0.6]} rotation={[0,0,Math.PI/2]}>
            <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
            <meshStandardMaterial color="black" />
        </mesh>
        <mesh position={[0.6, 0, -0.6]} rotation={[0,0,Math.PI/2]}>
            <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
            <meshStandardMaterial color="black" />
        </mesh>
        <mesh position={[-0.6, 0, -0.6]} rotation={[0,0,Math.PI/2]}>
            <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
            <meshStandardMaterial color="black" />
        </mesh>
    </group>
  );
};

const Zombie = ({ playerPos, onHit }) => {
    const mesh = useRef<any>(null);
    useFrame(() => {
        if(!mesh.current || !playerPos) return;
        
        // Simple Chase Logic
        const dist = mesh.current.position.distanceTo(playerPos);
        if (dist < 1.5) {
            onHit();
        }

        const dir = new THREE.Vector3().subVectors(playerPos, mesh.current.position).normalize();
        mesh.current.position.add(dir.multiplyScalar(0.008)); // Slower speed (was 0.05, then 0.02)
        mesh.current.lookAt(playerPos);
    });

    return (
        <mesh ref={mesh} position={[Math.random() * 40 - 20, 1, Math.random() * 40 - 20]}>
            <boxGeometry args={[0.8, 1.8, 0.8]} />
            <meshStandardMaterial color="green" />
            
            {/* Arms */}
            <mesh position={[0, 0.5, 0.5]}>
                <boxGeometry args={[0.8, 0.2, 0.8]} />
                <meshStandardMaterial color="green" />
            </mesh>
        </mesh>
    );
};

const Obstacle = ({ position }) => {
    return (
        <mesh position={position}>
            <cylinderGeometry args={[0.5, 0.5, 2, 8]} />
            <meshStandardMaterial color="#8B4513" /> {/* Cactus-ish trunk */}
            <mesh position={[0, 1.5, 0]}>
                 <sphereGeometry args={[1, 8, 8]} />
                 <meshStandardMaterial color="darkgreen" />
            </mesh>
        </mesh>
    );
};

const DrivingSection = () => {
  const [playerPos, setPlayerPos] = useState(new THREE.Vector3(0,0,0));
  const cameraRef = useRef<any>(null);
  const [lastCollision, setLastCollision] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  // Showroom Camera in Intro
  const ShowroomCamera = () => {
      useFrame((state) => {
          if (!gameStarted) {
             const t = state.clock.getElapsedTime() * 0.5;
             const x = Math.sin(t) * 8;
             const z = Math.cos(t) * 8;
             state.camera.position.lerp(new THREE.Vector3(x, 2, z), 0.1);
             state.camera.lookAt(0, 0.5, 0); 
          }
      });
      return null;
  };

  const handleUpdate = (pos, rot) => {
      if(!gameStarted) return; // Don't update camera in intro
      setPlayerPos(pos.clone());
      if(cameraRef.current) {
          // Third Person Camera Logic
          const offset = new THREE.Vector3(0, 5, -10);
          offset.applyAxisAngle(new THREE.Vector3(0,1,0), rot);
          const camPos = pos.clone().add(offset);
          cameraRef.current.position.lerp(camPos, 0.1);
          cameraRef.current.lookAt(pos);
      }
  };

  const handleCollision = () => {
      // Throttle collisions
      const now = Date.now();
      if (now - lastCollision > 500) {
          setLastCollision(now);
      }
  };

  // Listen for space to start
  useEffect(() => {
    const k = (e) => { 
        if(e.code === 'Space' && !gameStarted) {
           setGameStarted(true);
        }
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [gameStarted]);

  return (
    <div style={{ width: '100%', height: '100%', outline: 'none', position: 'relative' }} tabIndex={0} onClick={() => !gameStarted && setGameStarted(true)}>
        <Canvas camera={{ position: [5, 2, 5], fov: 60 }} onCreated={state => (cameraRef.current = state.camera)}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <directionalLight position={[-10, 20, 5]} intensity={0.8} castShadow />

            <ShowroomCamera />

            {/* Desert Ground */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
                <planeGeometry args={[100, 100]} />
                <meshStandardMaterial color="#F4A460" /> {/* Sandy Brown */}
            </mesh>
            
            <Car onUpdate={handleUpdate} collisionTrigger={lastCollision} />
            
            <Zombie playerPos={playerPos} onHit={handleCollision} />
            <Zombie playerPos={playerPos} onHit={handleCollision} />
            <Zombie playerPos={playerPos} onHit={handleCollision} />
            
            <Obstacle position={[5, 1, 5]} />
            <Obstacle position={[-5, 1, 8]} />
            <Obstacle position={[10, 1, -5]} />
            <Obstacle position={[-8, 1, -8]} />

        </Canvas>
        
        {/* Intro Overlay */}
         {!gameStarted && (
            <div style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                pointerEvents: 'none', background: 'rgba(0,0,0,0.2)'
            }}>
                <h1 style={{ color: '#d35400', textShadow: '4px 4px #000', fontSize: '48px', fontFamily: '"Arial Black", sans-serif', fontStyle: 'italic' }}>DESERT RALLY</h1>
                <p style={{ color: 'white', fontWeight: 'bold', fontSize: '20px', animation: 'blink 1s infinite' }}>CLICK TO DRIVE</p>
                <style>{`@keyframes blink { 0% { opacity: 1; } 50% { opacity: 0; } 100% { opacity: 1; } }`}</style>
            </div>
        )}
    </div>
  );
};

export default DrivingSection;
