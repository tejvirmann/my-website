import React, { useRef, useEffect, useState } from 'react';

const PokemonStyle = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [playerPos, setPlayerPos] = useState({ x: 4, y: 4 });
  const [direction, setDirection] = useState('down'); 
  const [encounter, setEncounter] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const frameRef = useRef(0);

  // Map Data
  const mapWidth = 12;
  const mapHeight = 12;
  const tileSize = 32;

  // 1 = Tree, 0 = Grass, 2 = Tall Grass (Encounter)
  const map = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 2, 2, 2, 0, 0, 2, 2, 2, 0, 1],
    [1, 0, 2, 2, 2, 0, 0, 2, 2, 2, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 2, 2, 2, 2, 2, 2, 0, 0, 0, 1],
    [1, 0, 2, 2, 2, 2, 2, 2, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const draw = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (!gameStarted) {
            // Title Screen
            frameRef.current++;
            
            // Background Pattern
            ctx.fillStyle = '#222';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Pokemon-style Logo Text
            ctx.save();
            ctx.textAlign = 'center';
            ctx.fillStyle = '#ffcb05'; // Pokemon Yellow
            ctx.font = 'bold 30px Arial';
            ctx.strokeStyle = '#3b4cca'; // Pokemon Blue
            ctx.lineWidth = 4;
            ctx.strokeText("POKEMON", canvas.width/2, 100);
            ctx.fillText("POKEMON", canvas.width/2, 100);
            
            ctx.fillStyle = 'white';
            ctx.font = 'bold 24px Arial';
            ctx.fillText("WALKER", canvas.width/2, 130);
            
            // Pulse Start
            if (Math.floor(frameRef.current / 30) % 2 === 0) {
                 ctx.fillStyle = 'white';
                 ctx.font = '16px Arial';
                 ctx.fillText("PRESS START", canvas.width/2, 250);
            }
            
            // Draw a little bouncing sprite
            const bounceY = Math.sin(frameRef.current * 0.1) * 5;
            const px = canvas.width / 2 - 16;
            const py = 160 + bounceY;
             // Draw Player Sprite (Ash)
            ctx.fillStyle = '#FF0000'; // Hat
            ctx.fillRect(px + 8, py + 2, 16, 8);
            ctx.fillStyle = '#0000FF'; // Jacket
            ctx.fillRect(px + 6, py + 10, 20, 12);
            ctx.fillStyle = '#000'; // Pants
            ctx.fillRect(px + 10, py + 22, 12, 8);
            
            ctx.restore();
            
            animId = requestAnimationFrame(draw);
            return;
        }

        // Game Loop
        // Draw Map
        for(let y=0; y<mapHeight; y++) {
            for(let x=0; x<mapWidth; x++) {
                const tile = map[y][x];
                const tX = x * tileSize;
                const tY = y * tileSize;

                if (tile === 0) { // Grass
                    ctx.fillStyle = '#7CFC00'; 
                    ctx.fillRect(tX, tY, tileSize, tileSize);
                } else if (tile === 1) { // Tree
                    ctx.fillStyle = '#228B22'; 
                    ctx.fillRect(tX, tY, tileSize, tileSize);
                    ctx.fillStyle = '#006400';
                    ctx.beginPath();
                    ctx.arc(tX + 16, tY + 16, 14, 0, Math.PI * 2);
                    ctx.fill();
                } else if (tile === 2) { // Tall Grass
                    ctx.fillStyle = '#32CD32'; 
                    ctx.fillRect(tX, tY, tileSize, tileSize);
                    // Darker bits
                    ctx.fillStyle = '#006400';
                    ctx.fillRect(tX + 4, tY + 4, 4, 10);
                    ctx.fillRect(tX + 14, tY + 10, 4, 10);
                    ctx.fillRect(tX + 24, tY + 4, 4, 10);
                }
            }
        }

        // Draw Player (Ash-like colors)
        const px = playerPos.x * tileSize;
        const py = playerPos.y * tileSize;
        
        ctx.fillStyle = '#FF0000'; // Hat
        ctx.fillRect(px + 8, py + 2, 16, 8);
        ctx.fillStyle = '#0000FF'; // Jacket
        ctx.fillRect(px + 6, py + 10, 20, 12);
        ctx.fillStyle = '#000'; // Pants
        ctx.fillRect(px + 10, py + 22, 12, 8);

        // Direction indicator
        ctx.fillStyle = 'white';
        // Simple directional hint
        if (direction === 'down') ctx.fillRect(px + 12, py + 4, 8, 2); 
    };

    draw();
    return () => cancelAnimationFrame(animId);

  }, [playerPos, direction, gameStarted]);

  const movePlayer = (dx: number, dy: number, dir: string) => {
      if (encounter) return;

      setDirection(dir);
      const newX = playerPos.x + dx;
      const newY = playerPos.y + dy;
      
      if (newX >= 0 && newX < mapWidth && newY >= 0 && newY < mapHeight) {
          const tile = map[newY][newX];
          if (tile !== 1) { // Not a wall
              setPlayerPos({ x: newX, y: newY });
              
              // Wild Encounter Chance in Tall Grass
              if (tile === 2 && Math.random() < 0.15) {
                  setEncounter(true);
              }
          }
      }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
     // Only prevent default if scrolling keys to avoid page scroll when focused
     if(['ArrowUp','ArrowDown','Space'].includes(e.key)) {
         e.preventDefault();
     }
     
     if (!gameStarted) {
         setGameStarted(true);
         return;
     }
     
     if (encounter) {
         if (e.key === 'Enter' || e.key === ' ') setEncounter(false); // Run away
         return;
     }

     if (e.key === 'ArrowUp' || e.key === 'w') movePlayer(0, -1, 'up');
     if (e.key === 'ArrowDown' || e.key === 's') movePlayer(0, 1, 'down');
     if (e.key === 'ArrowLeft' || e.key === 'a') movePlayer(-1, 0, 'left');
     if (e.key === 'ArrowRight' || e.key === 'd') movePlayer(1, 0, 'right');
  };

  return (
    <div 
        style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', outline: 'none' }} 
        tabIndex={0} 
        onKeyDown={handleKeyDown}
        onClick={() => !gameStarted && setGameStarted(true)} // Click to start
        className="game-container"
    >
        <h3 style={{ color: 'white' }}>Pokemon Walker</h3>
        <p style={{ color: 'white', fontSize: '10px' }}>Arrow Keys to Walk. Watch for Tall Grass!</p>
        
        <div style={{ position: 'relative' }}>
            <canvas 
                ref={canvasRef} 
                width={mapWidth * tileSize} 
                height={mapHeight * tileSize}
                style={{ border: '4px solid white', borderRadius: '4px', background: '#333', cursor: gameStarted ? 'none' : 'pointer' }}
            />
            {encounter && (
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0, width: '100%', height: '100%',
                    background: 'black',
                    color: 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    animation: 'flash 0.5s'
                }}>
                    <style>{`@keyframes flash { 0% { opacity: 0; } 50% { opacity: 1; } 100% { opacity: 0; } }`}</style>
                    <h2>WILD POKEMON APPEARED!</h2>
                    <div style={{ width: '100px', height: '100px', background: 'purple', borderRadius: '50%', marginBottom: '20px' }}>
                        {/* Placeholder Sprite */}
                    </div>
                    <p>Press SPACE to Run!</p>
                </div>
            )}
        </div>
    </div>
  );
};

export default PokemonStyle;
