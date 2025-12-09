import React, { useRef, useEffect, useState } from 'react';

const Mario2D = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [gameOver, setGameOver] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;
        
        // Game State
        const player = { x: 50, y: 200, w: 30, h: 30, vx: 0, vy: 0, grounded: false, dead: false };
        const keys = { right: false, left: false, up: false };
        const platforms = [
            { x: 0, y: 350, w: 800, h: 50 }, // Ground
            { x: 200, y: 250, w: 100, h: 20 },
            { x: 400, y: 200, w: 100, h: 20 },
            { x: 600, y: 150, w: 100, h: 20 },
        ];
        const goombas = [
            { x: 300, y: 320, w: 30, h: 30, vx: -1, dead: false },
            { x: 500, y: 320, w: 30, h: 30, vx: 1, dead: false },
        ];

        // Input
        const handleDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight' || e.key === 'd') keys.right = true;
            if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = true;
            if ((e.key === 'ArrowUp' || e.key === 'w' || e.key === ' ') && player.grounded) {
                player.vy = -12;
                player.grounded = false;
            }
            if(!gameStarted && (e.key === 'Enter' || e.key === ' ')) {
                setGameStarted(true);
            }
        };
        const handleUp = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight' || e.key === 'd') keys.right = false;
            if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = false;
        };
        window.addEventListener('keydown', handleDown);
        window.addEventListener('keyup', handleUp);

        const update = () => {
            if (!gameStarted) {
                // Title Screen Loop
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = '#5c94fc';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // Platforms
                ctx.fillStyle = '#e52521'; 
                platforms.forEach(p => ctx.fillRect(p.x, p.y, p.w, p.h));

                // Title
                ctx.save();
                ctx.textAlign = 'center';
                ctx.font = 'bold 40px Arial';
                ctx.strokeStyle = 'white';
                ctx.lineWidth = 2;
                ctx.fillStyle = '#e52521';
                ctx.strokeText("HIT LIST BROS", canvas.width / 2, 120);
                ctx.fillText("HIT LIST BROS", canvas.width / 2, 120);
                
                // Prompt
                if (Math.floor(Date.now() / 500) % 2 === 0) {
                     ctx.fillStyle = 'white';
                     ctx.font = '20px Arial';
                     ctx.fillText("PRESS CLICK OR SPACE", canvas.width / 2, 280);
                }
                
                // Mario Logic for Title!
                // Just animate him jumping
                const jumpY = 250 + Math.sin(Date.now() * 0.01) * 50;
                ctx.fillStyle = '#ff0000';
                ctx.fillRect(canvas.width / 2 - 15, jumpY, 30, 30);
                
                ctx.restore();
                
                animationId = requestAnimationFrame(update);
                return;
            }

            if (player.dead) return;

            // Physics
            if (keys.right) player.vx += 0.5;
            if (keys.left) player.vx -= 0.5;
            player.vx *= 0.9; // Friction
            player.vy += 0.6; // Gravity

            player.x += player.vx;
            player.y += player.vy;

            // Platform Collision
            player.grounded = false;
            platforms.forEach(p => {
                // AABB
                if (player.x < p.x + p.w && player.x + player.w > p.x &&
                    player.y < p.y + p.h && player.y + player.h > p.y) {
                    
                    // Simple floor collision (if falling down)
                    if (player.vy > 0 && player.y + player.h - player.vy < p.y + 10) {
                        player.y = p.y - player.h;
                        player.vy = 0;
                        player.grounded = true;
                    }
                }
            });

            // Bounds
            if (player.y > canvas.height) { player.dead = true; setGameOver(true); }

            // Goombas
            goombas.forEach(g => {
                if (g.dead) return;
                g.x += g.vx;
                // Patrol limits (simple)
                if (Math.random() < 0.01) g.vx *= -1;

                // Player <-> Goomba Collision
                if (player.x < g.x + g.w && player.x + player.w > g.x &&
                    player.y < g.y + g.h && player.y + player.h > g.y) {
                    
                    // Stomp? (Player bottom is close to Goomba top, and Player moving down)
                    if (player.vy > 0 && player.y + player.h - player.vy < g.y + 10) {
                        g.dead = true;
                        player.vy = -8; // Bounce
                    } else {
                        // Hurt
                        player.dead = true;
                        setGameOver(true);
                    }
                }
            });

            // Draw
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Background
            ctx.fillStyle = '#5c94fc';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Platforms
            ctx.fillStyle = '#e52521'; // Bricks
            platforms.forEach(p => ctx.fillRect(p.x, p.y, p.w, p.h));

            // Goombas
            ctx.fillStyle = '#8e5436';
            goombas.forEach(g => {
                if (!g.dead) ctx.fillRect(g.x, g.y, g.w, g.h);
            });

            // Player (Mario)
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(player.x, player.y, player.w, player.h);

            animationId = requestAnimationFrame(update);
        };

        update();

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('keydown', handleDown);
            window.removeEventListener('keyup', handleUp);
        };
    }, [gameOver, gameStarted]);

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }} tabIndex={0} onClick={() => !gameStarted && setGameStarted(true)}>
            <canvas ref={canvasRef} width={800} height={400} style={{ width: '100%', height: '100%' }} />
            {gameOver && (
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'red', fontSize: '30px', fontWeight: 'bold' }}>
                    GAME OVER (Press R to Reset)
                </div>
            )}
        </div>
    );
};

export default Mario2D;
