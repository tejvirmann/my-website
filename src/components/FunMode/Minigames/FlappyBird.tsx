import React, { useRef, useEffect, useState } from 'react';

const FlappyBird = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
    // Game state refs
    const gameState = useRef({
      gameOver: false,
      playing: false,
      score: 0,
      frames: 0
    });

    useEffect(() => {
      gameState.current.gameOver = gameOver;
    }, [gameOver]);
  
    useEffect(() => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
  
      let animationFrameId: number;

      // Responsive Canvas
      const updateSize = () => {
          canvas.width = container.clientWidth;
          canvas.height = container.clientHeight;
      };
      
      const resizeObserver = new ResizeObserver(() => {
          updateSize();
      });
      resizeObserver.observe(container);
      updateSize(); // Initial
      
      // Game variables
      const bird = {
        x: 50,
        y: 150,
        w: 24,
        h: 24,
        dy: 0,
        gravity: 0.25,
        jump: 4.6,
        radius: 12,
        rotation: 0,
        draw: () => {
           if (!ctx) return;
           ctx.save();
           ctx.translate(bird.x, bird.y);
           if (!gameState.current.playing) {
                ctx.rotate(0);
           } else {
                ctx.rotate(Math.min(Math.PI / 4, Math.max(-Math.PI / 4, (bird.dy * 0.2))));
           }
           
           // Body (Yellow)
           ctx.fillStyle = '#FFD700';
           ctx.beginPath();
           ctx.ellipse(0, 0, 14, 10, 0, 0, Math.PI * 2);
           ctx.fill();
           
           // Border
           ctx.lineWidth = 2;
           ctx.strokeStyle = '#000';
           ctx.stroke();
  
           // Wing
           ctx.fillStyle = '#FFF';
           ctx.beginPath();
           ctx.ellipse(-4, 2, 8, 5, 0, 0, Math.PI * 2);
           ctx.fill();
           ctx.stroke();
  
           // Beak
           ctx.fillStyle = '#FF9800';
           ctx.beginPath();
           ctx.moveTo(8, -4);
           ctx.lineTo(16, 0);
           ctx.lineTo(8, 4);
           ctx.fill();
           ctx.stroke();
  
           // Eye
           ctx.fillStyle = '#FFF';
           ctx.beginPath();
           ctx.arc(6, -6, 6, 0, Math.PI * 2);
           ctx.fill();
           ctx.stroke();
           
           ctx.fillStyle = '#000';
           ctx.beginPath();
           ctx.arc(8, -6, 2, 0, Math.PI * 2);
           ctx.fill();
  
           ctx.restore();
        },
        update: () => {
            if (gameState.current.playing) {
                bird.dy += bird.gravity;
                bird.y += bird.dy;
                
                if(bird.y + bird.radius >= canvas.height - 20) { // Hit ground
                    bird.y = canvas.height - 20 - bird.radius;
                    bird.dy = 0;
                    if (!gameState.current.gameOver) {
                        gameState.current.gameOver = true;
                        setGameOver(true);
                    }
                }
                if(bird.y - bird.radius <= 0) {
                    bird.y = bird.radius;
                    bird.dy = 0;
                }
            } else {
                // Hovering for title screen
                const time = Date.now() / 300;
                bird.y = canvas.height / 2 + Math.sin(time) * 10;
                bird.dy = 0; 
            }
        },
        flap: () => {
            bird.dy = -bird.jump;
        }
      };
  
      const pipes: {x: number, y: number, w: number, topH: number, bottomH: number, passed?: boolean}[] = [];
      const pipeWidth = 50;
      const pipeGap = 120; // Slightly tighter for smaller screens maybe?
      const pipeDx = 2;
  
      const loop = () => {
          if (gameState.current.gameOver) return;
  
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          gameState.current.frames++;
          
          // Draw Background (Sky)
          const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
          gradient.addColorStop(0, '#70c5ce');
          gradient.addColorStop(1, '#c2e9fb');
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
  
          // Draw Clouds
          ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
          const cloudOffset = (gameState.current.frames * 0.5) % canvas.width;
          [50, 150, 300].forEach((cx, i) => {
              let x = (cx - cloudOffset + canvas.width) % (canvas.width + 100) - 50;
              let y = 50 + i * 20;
              ctx.beginPath();
              ctx.arc(x, y, 30, 0, Math.PI * 2);
              ctx.arc(x + 25, y - 10, 35, 0, Math.PI * 2);
              ctx.arc(x + 50, y, 30, 0, Math.PI * 2);
              ctx.fill();
          });

          // Draw Ground
          const groundOffset = (gameState.current.frames * 2) % 20;
          ctx.fillStyle = '#ded895'; 
          ctx.fillRect(0, canvas.height - 20, canvas.width, 20);
          ctx.strokeStyle = '#5d4037';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(0, canvas.height - 20);
          ctx.lineTo(canvas.width, canvas.height - 20);
          ctx.stroke();
  
          // Update Bird Logic (Hover or Fall)
          bird.update();
          bird.draw();

          // Title Screen Overlay
          if (!gameState.current.playing) {
              const cx = canvas.width / 2;
              const cy = canvas.height / 2;

              // Title Text
              ctx.save();
              ctx.fillStyle = 'white'; 
              ctx.shadowColor = 'black';
              ctx.shadowBlur = 0;
              ctx.shadowOffsetX = 3;
              ctx.shadowOffsetY = 3;
              ctx.font = 'bold 36px Courier New';
              ctx.textAlign = 'center';
              ctx.fillText("FLAPPY", cx, cy - 60);
              ctx.fillText("BIRD", cx, cy - 20);
              ctx.restore();
              
              // Blink Prompt
              if (Math.floor(Date.now() / 500) % 2 === 0) {
                 ctx.save();
                 ctx.fillStyle = '#333';
                 ctx.font = 'bold 18px Courier New';
                 ctx.textAlign = 'center';
                 ctx.fillText("CLICK TO START", cx, cy + 80);
                 ctx.restore();
              }
              
              animationFrameId = requestAnimationFrame(loop);
              return; // SKIP PIPES AND GAME LOGIC
          }
  
          // Game Logic (Pipes)
          if (gameState.current.frames % 120 === 0) {
              const minHeight = 50;
              const groundHeight = 20;
              const maxHeight = canvas.height - pipeGap - minHeight - groundHeight;
              // Ensure maxHeight is valid (if canvas is too short)
              const safeMax = Math.max(minHeight + 10, maxHeight);
              
              const topHeight = Math.floor(Math.random() * (safeMax - minHeight + 1) + minHeight);
              
              pipes.push({
                  x: canvas.width,
                  y: 0,
                  w: pipeWidth,
                  topH: topHeight,
                  bottomH: canvas.height - pipeGap - topHeight - groundHeight
              });
          }
  
          for(let i = 0; i < pipes.length; i++) {
              let p = pipes[i];
              p.x -= pipeDx;
  
              const pipeColor = '#2ecc71';
              const pipeBorder = '#27ae60';
              
              const bottomY = canvas.height - p.bottomH - 20; 

              // Top Pipe
              ctx.fillStyle = pipeColor;
              ctx.fillRect(p.x, 0, p.w, p.topH);
              ctx.strokeStyle = pipeBorder;
              ctx.lineWidth = 2;
              ctx.strokeRect(p.x, 0, p.w, p.topH);
              ctx.fillRect(p.x - 2, p.topH - 20, p.w + 4, 20); // Rim
              ctx.strokeRect(p.x - 2, p.topH - 20, p.w + 4, 20);
  
              // Bottom Pipe
              ctx.fillStyle = pipeColor;
              ctx.fillRect(p.x, bottomY, p.w, p.bottomH);
              ctx.strokeRect(p.x, bottomY, p.w, p.bottomH);
              ctx.fillRect(p.x - 2, bottomY, p.w + 4, 20); // Rim
              ctx.strokeRect(p.x - 2, bottomY, p.w + 4, 20);
  
              // Collision
              const bx = bird.x - bird.radius;
              const by = bird.y - bird.radius;
              const bw = bird.radius * 2;
              const bh = bird.radius * 2;
  
              if (bx < p.x + p.w && bx + bw > p.x && by < p.topH) {
                   gameState.current.gameOver = true;
                   setGameOver(true);
              }
              if (bx < p.x + p.w && bx + bw > p.x && by + bh > bottomY) {
                   gameState.current.gameOver = true;
                   setGameOver(true);
              }
  
              // Score
              if(p.x + p.w < bx && !p.passed) {
                 setScore(prev => prev + 1);
                 gameState.current.score += 1;
                 p.passed = true;
              }
  
              if(p.x + p.w < -10) {
                  pipes.shift();
                  i--;
              }
          }
          
          if (!gameState.current.gameOver) {
             animationFrameId = requestAnimationFrame(loop);
          }
      };
  
      loop();
  
      const handleInput = (e: KeyboardEvent | TouchEvent | MouseEvent) => {
          if (e.type === 'keydown' && (e as KeyboardEvent).code !== 'Space') return;
          if (e.type === 'keydown') e.preventDefault();
  
          if (!gameState.current.playing) {
              gameState.current.playing = true;
              setIsPlaying(true);
              bird.flap();
              return;
          }

          if(gameState.current.gameOver) {
              setGameOver(false);
              setScore(0);
              // Reset
              bird.y = canvas.height / 2;
              bird.dy = 0;
              gameState.current.gameOver = false;
              gameState.current.playing = true; 
              setIsPlaying(true);
              gameState.current.score = 0;
              gameState.current.frames = 0;
              pipes.length = 0;
              loop();
          } else {
              bird.flap();
          }
      };
    
    window.addEventListener('keydown', handleInput);
    canvas.addEventListener('click', handleInput);
    canvas.addEventListener('touchstart', handleInput);

    return () => {
        resizeObserver.disconnect();
        window.removeEventListener('keydown', handleInput);
        canvas.removeEventListener('click', handleInput);
        canvas.removeEventListener('touchstart', handleInput);
        cancelAnimationFrame(animationFrameId);
    };
  }, [gameOver]); 

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%', minHeight: '320px', margin: '0 auto', overflow: 'hidden', backgroundColor: '#70c5ce' }}>
        <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
        {gameOver && (
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', zIndex: 10 }}>
                <h2 style={{ fontSize: '40px', color: 'white', textShadow: '2px 2px #000' }}>Game Over</h2>
                <p style={{ color: 'white', fontWeight: 'bold' }}>Score: {score}</p>
                <button 
                  style={{ padding: '10px 20px', fontSize: '18px', cursor: 'pointer', background: '#f1c40f', border: '2px solid #fff', borderRadius: '20px' }} 
                  onClick={() => setGameOver(false)}
                >
                    Play Again
                </button>
            </div>
        )}
        {/* Only show score if playing (or if game over, but Game Over screen has its own score) */}
        {isPlaying && !gameOver && (
            <div style={{ position: 'absolute', top: '10px', left: '0', width: '100%', textAlign: 'center', pointerEvents: 'none' }}>
                <span style={{ fontSize: '30px', fontWeight: 'bold', color: 'white', textShadow: '2px 2px #000' }}>{score}</span>
            </div>
        )}
    </div>
  );
};
export default FlappyBird;
