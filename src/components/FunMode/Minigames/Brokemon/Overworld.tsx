import React, { useRef, useEffect, useState } from 'react';
import { HOOD_MAP, TILE_SIZE, MAP_WIDTH, MAP_HEIGHT, COLLISION_TILES, TILE_TYPES, ENCOUNTER_TILES } from './data/maps';

// Assets
import tilesetCity from './assets/tileset_city.png';
import charPlayer from './assets/char_player.png';

type Position = { x: number, y: number };

interface OverworldProps {
    onEncounter: () => void;
    playerPos: Position;
    setPlayerPos: React.Dispatch<React.SetStateAction<Position>>;
}

const Overworld: React.FC<OverworldProps> = ({ onEncounter, playerPos, setPlayerPos }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [direction, setDirection] = useState<'down' | 'up' | 'left' | 'right'>('down');
    const [isMoving, setIsMoving] = useState(false);
    
    // Calculated Camera Position (Top-Left coordinate of the viewport)
    // Viewport size in TILES (approx 10x10 for 320x320 canvas)
    const VIEWPORT_W = 10;
    const VIEWPORT_H = 10;

    // Load Sprites
    const tilesetRef = useRef<HTMLImageElement | null>(null);
    const playerSpriteRef = useRef<HTMLImageElement | null>(null);

    // Helper to remove background (Chroma Key - assumes top-left pixel is BG color)
    const makeTransparent = (img: HTMLImageElement): string => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return img.src;
        
        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        
        // Get BG color from 0,0
        const r = data[0];
        const g = data[1];
        const b = data[2];
        
        for(let i=0; i<data.length; i+=4) {
             if(Math.abs(data[i] - r) < 10 && Math.abs(data[i+1] - g) < 10 && Math.abs(data[i+2] - b) < 10) {
                 data[i+3] = 0; // Alpha 0
             }
        }
        
        ctx.putImageData(imgData, 0, 0);
        return canvas.toDataURL();
    };



// ... (Effect) ...
    useEffect(() => {
        const tImg = new Image();
        tImg.src = tilesetCity;
        tImg.onload = () => {
             // Optional: Tileset transparency if needed, but usually tiles overlap okay
             tilesetRef.current = tImg;
             // Force re-render just in case
             setAssetsLoaded(prev => !prev); 
        };

        const pImg = new Image();
        pImg.crossOrigin = "Anonymous";
        pImg.src = charPlayer + `?t=${Date.now()}`; // Append timestamp to imported URL if needed, though webpack hash usually handles cache. Let's keep it for safety if hash not changed.
        pImg.onload = () => {
            const transparentSrc = makeTransparent(pImg);
            const finalImg = new Image();
            finalImg.src = transparentSrc;
            finalImg.onload = () => {
                 playerSpriteRef.current = finalImg;
                 setAssetsLoaded(true);
            };
        };
        pImg.onerror = (e) => console.error("Player sprite failed to load", e);

    }, []);

    // ... (NPCs remain same)
    const npcs = [
        { x: 30, y: 30, name: "G-KING", defeated: false }
    ];

    const [walkingFrame, setWalkingFrame] = useState(0);
    const [isWalking, setIsWalking] = useState(false);
    const [showMap, setShowMap] = useState(false);
    const [assetsLoaded, setAssetsLoaded] = useState(false);
    
    // Use Ref for current player pos to avoid re-binding key listeners constantly
    const playerPosRef = useRef(playerPos);
    useEffect(() => { playerPosRef.current = playerPos; }, [playerPos]);
    
    const directionRef = useRef(direction);
    useEffect(() => { directionRef.current = direction; }, [direction]);

    // ... (Render Effect remains mostly same, remove previous useEffect deps if needed)
    // Actually, Render Effect needs playerPos for camera. That's fine to re-run or rely on ref.
    // Let's keep Render Effect simple (it relies on state for reacting to updates).
    
    // Effect for Rendering Loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;

        const render = () => {
             // Retrieve latest state from params or refs if needed, but since we re-bind on state change, it works.
             // Wait, if we optimize key listeners, we don't assume render loop updates?
             // Render loop uses closure values. It needs to be updated or use refs.
             // BETTER: Use Refs inside render loop for positions to avoid dependency churn!
             
            const pPos = playerPos; // Currently using state closure.
            
            // ... (Camera Logic using pPos) ...
            let camX = pPos.x - VIEWPORT_W / 2;
            let camY = pPos.y - VIEWPORT_H / 2;

            // Clamp
            camX = Math.max(0, Math.min(camX, MAP_WIDTH - VIEWPORT_W));
            camY = Math.max(0, Math.min(camY, MAP_HEIGHT - VIEWPORT_H));

            ctx.fillStyle = '#111';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            if (showMap) {
                 // ... (Map logic)
                 const scale = canvas.width / MAP_WIDTH; 
                 // ... (Draw Map Loop)
                 for (let y = 0; y < MAP_HEIGHT; y++) {
                    for (let x = 0; x < MAP_WIDTH; x++) {
                        const tileId = HOOD_MAP[y][x];
                        if(tileId === TILE_TYPES.STREET) ctx.fillStyle = '#333';
                        else if(tileId === TILE_TYPES.BUILDING) ctx.fillStyle = '#555';
                        else if(tileId === TILE_TYPES.DIRT) ctx.fillStyle = '#4a3f2d';
                        else ctx.fillStyle = '#000';
                        ctx.fillRect(x * scale, y * scale, scale, scale);
                    }
                }
                ctx.fillStyle = 'red';
                ctx.fillRect(pPos.x * scale, pPos.y * scale, scale*2, scale*2); // Player
                
            } else {
                 // NORMAL VIEW
                 const startX = Math.floor(camX);
                 const startY = Math.floor(camY);
                 const endX = startX + VIEWPORT_W + 1; 
                 const endY = startY + VIEWPORT_H + 1;
     
                 for (let y = startY; y < endY; y++) {
                     for (let x = startX; x < endX; x++) {
                         if (y >= 0 && y < MAP_HEIGHT && x >= 0 && x < MAP_WIDTH) {
                             const tileId = HOOD_MAP[y][x];
                             // ... (Draw Tile)
                            const drawX = (x - camX) * TILE_SIZE;
                            const drawY = (y - camY) * TILE_SIZE;

                            if (tilesetRef.current) { 
                                const sx = tileId * 32; 
                                ctx.drawImage(tilesetRef.current, sx, 0, 32, 32, drawX, drawY, TILE_SIZE, TILE_SIZE);
                            } else {
                                // Fallback
                                ctx.fillStyle = '#333';
                                ctx.fillRect(drawX, drawY, TILE_SIZE, TILE_SIZE);
                            }
                         }
                     }
                 }
     
                 // Draw Player
                 const pDrawX = (pPos.x - camX) * TILE_SIZE;
                 const pDrawY = (pPos.y - camY) * TILE_SIZE;
                 
                 // Use Ref for sprite so it's always latest
                 if (playerSpriteRef.current) {
                      const spriteW = playerSpriteRef.current.width / 4;
                      const spriteH = playerSpriteRef.current.height / 4;
                      const frame = isWalking ? Math.floor(Date.now() / 150) % 4 : 0;
                      const sx = frame * spriteW;
                      let row = 0;
                      if (direction === 'left') row = 1;
                      if (direction === 'right') row = 2;
                      if (direction === 'up') row = 3;
                      
                      ctx.drawImage(playerSpriteRef.current, sx, row * spriteH, spriteW, spriteH, pDrawX, pDrawY, TILE_SIZE, TILE_SIZE);
                 } else {
                      ctx.fillStyle = 'red';
                      ctx.fillRect(pDrawX + 8, pDrawY + 8, 16, 16);
                 }
            }
            
            animationFrameId = requestAnimationFrame(render);
        };

        render();
        return () => cancelAnimationFrame(animationFrameId);
    }, [playerPos, direction, showMap, isWalking]); // Dependencies ensure render restarts on state change, which is fine.


    // Input Handling - Optimized with Refs and Functional Updates
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'm' || e.key === 'M') {
                setShowMap(prev => !prev);
                return;
            }

            // Prevent scrolling
            if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) {
                e.preventDefault();
            }

            if (showMap) return; 

            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(e.key)) {
                setIsWalking(true);
            }

            // Calculate Move based on CURRENT pos (ref) or functional update
            // We need to check collision synchronously.
            // Using functional setPlayerPos allows atomic updates, but we need to READ current map data.
            // Map data is constant.
            
            let dx = 0;
            let dy = 0;
            let newDir = directionRef.current; // Use Ref for checking current dir

            if (e.key === 'ArrowUp' || e.key === 'w') { dy = -1; newDir = 'up'; }
            if (e.key === 'ArrowDown' || e.key === 's') { dy = 1; newDir = 'down'; }
            if (e.key === 'ArrowLeft' || e.key === 'a') { dx = -1; newDir = 'left'; }
            if (e.key === 'ArrowRight' || e.key === 'd') { dx = 1; newDir = 'right'; }
            
            // Interaction
            if (e.key === ' ' || e.key === 'Enter') {
                // Check Ref
                const currentPos = playerPosRef.current;
                const checkX = currentPos.x + (directionRef.current === 'right' ? 1 : directionRef.current === 'left' ? -1 : 0);
                const checkY = currentPos.y + (directionRef.current === 'down' ? 1 : directionRef.current === 'up' ? -1 : 0);
                const npc = npcs.find(n => n.x === checkX && n.y === checkY);
                if (npc) onEncounter(); 
            }

            if (dx !== 0 || dy !== 0) {
                setDirection(newDir);
                
                // Functional update to ensure we use latest Position even if effect is stale (though with empty deps it would be stale, but we re-bind... wait)
                // If we re-bind on [playerPos], we don't need Refs?
                // Correct. But re-binding on every step causes lag.
                // WE WANT to bind ONCE. So deps = [] (or [onEncounter]).
                // THEN we must use Refs or Functional Updates.
                
                setPlayerPos(prev => {
                    const nextX = prev.x + dx;
                    const nextY = prev.y + dy;
                    
                    if (nextX >= 0 && nextX < MAP_WIDTH && nextY >= 0 && nextY < MAP_HEIGHT) {
                         const tile = HOOD_MAP[nextY][nextX];
                         const npcHere = npcs.find(n => n.x === nextX && n.y === nextY);
                         if (!COLLISION_TILES.includes(tile) && !npcHere) {
                             // Check Encounter
                             // Temporarily disabled for debugging
                             /*if (ENCOUNTER_TILES.includes(tile) && Math.random() < 0.15) {
                                  onEncounter();
                             }*/
                             return { x: nextX, y: nextY };
                         }
                    }
                    return prev; // No move
                });
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
             if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(e.key)) {
                 setIsWalking(false);
             }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []); // EMPTY DEPS for optimization!

    return (
        <canvas 
            ref={canvasRef}
            width={VIEWPORT_W * TILE_SIZE}
            height={VIEWPORT_H * TILE_SIZE}
            style={{ 
                border: '4px solid #333', 
                background: '#000',
                imageRendering: 'pixelated'
            }}
        />
    );
};

export default Overworld;
