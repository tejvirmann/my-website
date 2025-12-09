import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Box, Cylinder, Sphere } from '@react-three/drei';
import * as THREE from 'three';

const Goomba = React.forwardRef(({ position, dead }, ref) => {
    const internalRef = useRef<any>(null);
    
    // Combine refs (simple version, or just trust the passed ref)
    // Actually simpler: just use the passed ref if provided? 
    // But we need internal ref for useFrame logic if parent doesn't provide one?
    // Parent DOES provide one.
    // Let's use useImperativeHandle or just assign the passed ref to mesh.
    // But wait, the parent callback `ref={el => ...}` is a callback ref.
    
    const [dir, setDir] = useState(1);
    
    // We need access to the mesh for animation too.
    // So let's use an internal ref and expose it, or just use the passed ref if it's an object?
    // Callback refs are tricky with internal usage.
    // Easiest: Let parent handle ref only for collision, and we use a separate local ref for animation?
    // No, we need the SAME mesh for both collision and animation.
    
    // Let's use a merge refs strategy manually or just use the forwarded ref if guaranteed object.
    // It's a callback in parent: `el => goombaRefs.current[index] = el`.
    // So `ref` here is a function.
    
    // Standard solution:
    const mesh = useRef<any>(null);
    React.useImperativeHandle(ref, () => mesh.current);

    useFrame(() => {
        if (dead || !mesh.current) return;
        mesh.current.position.x += 0.02 * dir;
        if (mesh.current.position.x > position[0] + 3) setDir(-1);
        if (mesh.current.position.x < position[0] - 3) setDir(1);
    });

    if (dead) return null;

    return (
        <mesh ref={mesh} position={position}>
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshStandardMaterial color="brown" />
            <mesh position={[0.2, 0.2, 0.4]}>
                <sphereGeometry args={[0.1, 8, 8]} />
                <meshStandardMaterial color="white" />
            </mesh>
            <mesh position={[-0.2, 0.2, 0.4]}>
                <sphereGeometry args={[0.1, 8, 8]} />
                <meshStandardMaterial color="white" />
            </mesh>
        </mesh>
    );
});
Goomba.displayName = 'Goomba';

const Player = ({ onKill, onDie, goombasRef }) => {
  const mesh = useRef<any>(null);
  const [position, setPosition] = useState(new THREE.Vector3(0, 1, 0));
  const velocity = useRef(new THREE.Vector3(0, 0, 0));
  const isJumping = useRef(false);
  const userInputs = useRef({ w: false, s: false, a: false, d: false });
  const cameraOffset = useRef(new THREE.Vector3(0, 5, 10));

  // Simple Physics
  useFrame((state) => {
    if (!mesh.current) return;

    // Movement relative to camera (simplified: forward is -z)
    if (userInputs.current.w) velocity.current.z -= 0.02;
    if (userInputs.current.s) velocity.current.z += 0.02;
    if (userInputs.current.a) velocity.current.x -= 0.02;
    if (userInputs.current.d) velocity.current.x += 0.02;

    // Friction
    velocity.current.x *= 0.9;
    velocity.current.z *= 0.9;

    // Gravity
    velocity.current.y -= 0.02;

    // Position Update
    const newPos = position.clone().add(velocity.current);

    // Floor Collision (y=0)
    if (newPos.y < 0.5) {
        newPos.y = 0.5;
        velocity.current.y = 0;
        isJumping.current = false;
    }

    setPosition(newPos);
    mesh.current.position.copy(newPos);
    
    // Camera Follow
    const idealCamPos = newPos.clone().add(cameraOffset.current);
    state.camera.position.lerp(idealCamPos, 0.1);
    state.camera.lookAt(newPos);

    // Goomba Collision
    if (goombasRef.current) {
        goombasRef.current.forEach((goombaMesh, index) => {
            if (!goombaMesh || !goombaMesh.position) return;

            const playerBoundingBox = new THREE.Box3().setFromObject(mesh.current);
            const goombaBoundingBox = new THREE.Box3().setFromObject(goombaMesh);

            if (playerBoundingBox.intersectsBox(goombaBoundingBox)) {
                // Collision detected
                const playerBottom = playerBoundingBox.min.y;
                const goombaTop = goombaBoundingBox.max.y;

                // If player is above goomba (stomping)
                if (playerBottom > goombaTop - 0.2 && velocity.current.y < 0) { // Small tolerance for stomping
                    onKill(index); // Notify parent to kill goomba
                    velocity.current.y = 0.3; // Small bounce for player
                    isJumping.current = true;
                } else {
                    // Player hit goomba from side or bottom
                    onDie(); // Notify parent that player died
                }
            }
        });
    }
  });

  useEffect(() => {
    const handleDown = (e: KeyboardEvent) => {
        if(e.key === 'w') userInputs.current.w = true;
        if(e.key === 's') userInputs.current.s = true;
        if(e.key === 'a') userInputs.current.a = true;
        if(e.key === 'd') userInputs.current.d = true;
        if(e.code === 'Space' && !isJumping.current) {
            velocity.current.y = 0.4; // Jump power
            isJumping.current = true;
        }
    };
    const handleUp = (e: KeyboardEvent) => {
        if(e.key === 'w') userInputs.current.w = false;
        if(e.key === 's') userInputs.current.s = false;
        if(e.key === 'a') userInputs.current.a = false;
        if(e.key === 'd') userInputs.current.d = false;
    };
    window.addEventListener('keydown', handleDown);
    window.addEventListener('keyup', handleUp);
    return () => {
        window.removeEventListener('keydown', handleDown);
        window.removeEventListener('keyup', handleUp);
    };
  }, []);

  return (
    <mesh ref={mesh} position={[0, 1, 0]}>
        {/* Mario-ish Red Shape */}
        <boxGeometry args={[0.8, 1, 0.8]} />
        <meshStandardMaterial color="red" />
        {/* Hat/Head */}
        <mesh position={[0, 0.6, 0]}>
             <sphereGeometry args={[0.4, 16, 16]} />
             <meshStandardMaterial color="red" />
        </mesh>
    </mesh>
  );
};

const Platform = ({ position, color = "#2c3e50" }) => {
    return (
        <mesh position={position}>
            <boxGeometry args={[3, 1, 3]} />
            <meshStandardMaterial color={color} />
        </mesh>
    );
};

const Coin = ({ position }) => {
    const mesh = useRef<any>(null);
    useFrame((state) => {
        if(mesh.current) {
            mesh.current.rotation.y += 0.05;
            mesh.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.2;
        }
    });
    return (
        <mesh ref={mesh} position={position} rotation={[Math.PI/2, 0, 0]}>
            <cylinderGeometry args={[0.5, 0.5, 0.1, 16]} />
            <meshStandardMaterial color="gold" metalness={1} roughness={0.3} />
        </mesh>
    );
};

const MarioPlatformer = () => {
  const [goombas, setGoombas] = useState([{ id: 1, pos: [3, 1, -3], dead: false }, { id: 2, pos: [-3, 1, -8], dead: false }]);
  const [gameStarted, setGameStarted] = useState(false);
  const goombaRefs = useRef([]);
  const canvasRef = useRef<any>(null);

  // Intro Camera Rotator
  const IntroCamera = () => {
      useFrame((state) => {
          if(!gameStarted) {
             const t = state.clock.getElapsedTime() * 0.2;
             const x = Math.sin(t) * 15;
             const z = Math.cos(t) * 15;
             state.camera.position.lerp(new THREE.Vector3(x, 8, z), 0.05);
             state.camera.lookAt(0, 0, 0);
          }
      });
      return null;
  };

  const handleGoombaKill = (index) => {
    setGoombas(prevGoombas => {
        const newGoombas = [...prevGoombas];
        if (newGoombas[index]) {
            newGoombas[index].dead = true;
        }
        return newGoombas;
    });
  };

  const handlePlayerDie = () => {
    setGameStarted(false); // Reset to intro on death
    alert("Game Over! Mario Died!");
    setGoombas([{ id: 1, pos: [3, 1, -3], dead: false }, { id: 2, pos: [-3, 1, -8], dead: false }]);
  };

  const handleStart = () => {
      if(!gameStarted) setGameStarted(true);
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
    <div style={{ width: '100%', height: '100%', position: 'relative' }} tabIndex={0} onClick={handleStart}>
        <Canvas>
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
            
            <IntroCamera />

            {/* Ground */}
            <mesh position={[0, -0.5, 0]}>
                <boxGeometry args={[50, 1, 50]} />
                <meshStandardMaterial color="#7bed9f" />
            </mesh>
             {/* Decor */}
             <mesh position={[-10, 2, -10]}>
                <cylinderGeometry args={[1, 1, 4, 16]} />
                <meshStandardMaterial color="green" />
             </mesh>
             <mesh position={[15, 3, 5]}>
                <boxGeometry args={[4, 4, 4]} />
                <meshStandardMaterial color="#d35400" />
             </mesh>

            {gameStarted && <Player onKill={handleGoombaKill} onDie={handlePlayerDie} goombasRef={goombaRefs} />}

            {/* Goombas */}
            {goombas.map((g, index) => (
                <Goomba key={g.id} position={g.pos} dead={g.dead} ref={el => goombaRefs.current[index] = el} />
            ))}

            {/* Platforms */}
            <Platform position={[-5, 1, -5]} color="#e67e22" />
            <Platform position={[5, 2, -5]} color="#e74c3c" />
            <Platform position={[0, 3, -10]} color="#8e44ad" />
            <Platform position={[8, 4, -12]} color="#2980b9" />
            <Platform position={[-8, 5, -15]} color="#f1c40f" />

            {/* Coins */}
            <Coin position={[-5, 2.5, -5]} />
            <Coin position={[5, 3.5, -5]} />
            <Coin position={[0, 4.5, -10]} />
            <Coin position={[8, 5.5, -12]} />
            <Coin position={[-8, 6.5, -15]} />
            
        </Canvas>
        
        {/* Intro Overlay */}
        {!gameStarted && (
            <div style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                pointerEvents: 'none', background: 'rgba(0,0,0,0.2)'
            }}>
                <h1 style={{ color: '#ff4757', textShadow: '4px 4px #000', fontSize: '42px', fontFamily: 'Impact, sans-serif' }}>SUPER MARIO 3D</h1>
                <p style={{ color: 'white', fontSize: '20px', animation: 'blink 1s infinite' }}>CLICK OR SPACE TO START</p>
                <style>{`@keyframes blink { 0% { opacity: 1; } 50% { opacity: 0; } 100% { opacity: 1; } }`}</style>
            </div>
        )}

        {gameStarted && (
            <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(0,0,0,0.5)', color: 'white', padding: '10px', borderRadius: '5px', pointerEvents: 'none' }}>
                <p>WASD to Move, Space to Jump</p>
            </div>
        )}
    </div>
  );
};

export default MarioPlatformer;
