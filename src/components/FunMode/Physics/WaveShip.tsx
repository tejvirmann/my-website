import React, { useRef, useEffect } from 'react';

const WaveShip = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;
    let animationFrameId: number;
    let mouseX = 0;
    let isHovering = false;

    // Resize Handler
    const handleResize = () => {
        if (containerRef.current && canvas) {
            canvas.width = containerRef.current.clientWidth;
            canvas.height = containerRef.current.clientHeight;
        }
    };
    
    // Initial size
    handleResize();
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
    };
    const handleMouseEnter = () => isHovering = true;
    const handleMouseLeave = () => isHovering = false;

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseenter', handleMouseEnter);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    const loop = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        time += 0.05; // Less graceful (Faster)

        // Draw Sky
        ctx.fillStyle = '#dff9fb'; 
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // ... Secret Island Code ...
        if (canvas.width > 1200) {
            const islandX = canvas.width - 250;
            const islandY = 200; // Base height line

            // Sand
            ctx.fillStyle = '#f4e588';
            ctx.beginPath();
            ctx.ellipse(islandX, islandY + 10, 100, 30, 0, 0, Math.PI * 2);
            ctx.fill();

            // Hut Body
            ctx.fillStyle = '#795548';
            ctx.fillRect(islandX + 50, islandY - 40, 40, 40);
            
            // Hut Door
            ctx.fillStyle = '#3e2723';
            ctx.fillRect(islandX + 65, islandY - 20, 15, 20);

            // Hut Roof (Straw)
            ctx.fillStyle = '#fbc02d';
            ctx.beginPath();
            ctx.moveTo(islandX + 40, islandY - 40);
            ctx.lineTo(islandX + 70, islandY - 70);
            ctx.lineTo(islandX + 100, islandY - 40);
            ctx.closePath();
            ctx.fill();

            // Palm Tree Trunk
            ctx.fillStyle = '#8d6e63';
            ctx.beginPath();
            ctx.moveTo(islandX, islandY);
            ctx.quadraticCurveTo(islandX + 10, islandY - 40, islandX + 20, islandY - 80);
            ctx.lineTo(islandX + 30, islandY - 80);
            ctx.quadraticCurveTo(islandX + 20, islandY - 40, islandX + 20, islandY); 
            ctx.fill();
            
            // Coconuts
            ctx.fillStyle = '#3e2723';
            ctx.beginPath();
            ctx.arc(islandX + 22, islandY - 75, 5, 0, Math.PI * 2);
            ctx.arc(islandX + 28, islandY - 75, 5, 0, Math.PI * 2);
            ctx.arc(islandX + 25, islandY - 70, 5, 0, Math.PI * 2);
            ctx.fill();

            // Palm Leaves
            ctx.fillStyle = '#4caf50';
            [0, 1, 2, 3].forEach(i => {
                ctx.save();
                ctx.translate(islandX + 25, islandY - 80);
                ctx.rotate(i * (Math.PI / 2) + Math.sin(time * 0.5) * 0.1); // Swaying
                ctx.beginPath();
                ctx.ellipse(30, 0, 30, 8, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });
        }


        // Draw Water
        ctx.fillStyle = 'rgba(0, 150, 255, 0.4)';
        ctx.beginPath();
        
        const baseHeight = 160;
        
        // Ship physics vars (calculated during loop)
        let shipY = baseHeight;
        let shipAngle = 0;
        let shipX = canvas.width / 2;

        ctx.moveTo(0, baseHeight);

        for (let x = 0; x <= canvas.width; x += 5) {
            let y = baseHeight;

            // 1. Natural Ocean Waves (Choppier)
            const randomAmp = 15 + Math.sin(time * 0.3) * 5; 
            y += Math.sin(x * 0.01 + time * 0.5) * randomAmp;        // Faster frequency
            y += Math.sin(x * 0.02 + time * 0.8) * 8;                // Mid freq
            y += Math.sin(x * 0.05 + time * 1.5) * 3;                // High freq ripple

            // 2. Cursor Interaction (Concave Up / Sharp Rise)
            if (isHovering) {
                const dist = Math.abs(x - mouseX);
                const influenceRadius = 150; 
                if (dist < influenceRadius) {
                    const normDist = dist / influenceRadius;
                    // Concave shape: 1 - x^2 is convex hill. 
                    // To make it look "Concave" (Spiky/Sucked up):
                    // Use a sharper falloff or power function
                    const influence = Math.pow(1 - normDist, 4); // Sharper spike
                    
                    // Or if they mean "Concave" as in a VALLEY (Go DOWN):
                    // y += influence * 100;
                    
                    // But they said "Go UP".
                    // Let's assume "Concave" means the CURVATURE is concave up (U-like) BUT it goes up?
                    // That's geometrically impossible for a single peak.
                    // I will stick to "Going Up" but make it sharper (Exp).
                    y -= influence * 120; 
                }
            }

            ctx.lineTo(x, y);

            // 3. Find Ship Position and slope
            if (Math.abs(x - shipX) < 2.5) {
                shipY = y;
                const getWaterY = (targetX) => {
                     let wy = baseHeight;
                     const rAmp = 15 + Math.sin(time * 0.3) * 5;
                     wy += Math.sin(targetX * 0.01 + time * 0.5) * rAmp;
                     wy += Math.sin(targetX * 0.02 + time * 0.8) * 8;
                     wy += Math.sin(targetX * 0.05 + time * 1.5) * 3;
                     
                     if (isHovering) {
                         const d = Math.abs(targetX - mouseX);
                         const influenceRadius = 150;
                         if (d < influenceRadius) {
                             const nd = d / influenceRadius;
                             const inf = Math.pow(1 - nd, 4);
                             wy -= inf * 120;
                         }
                     }
                     return wy;
                };

                const yPrev = getWaterY(x - 20);
                const yNext = getWaterY(x + 20);
                shipAngle = Math.atan2(yNext - yPrev, 40);
                shipAngle = Math.max(-0.5, Math.min(0.5, shipAngle)); 
            }
        }
        
        ctx.lineTo(canvas.width, canvas.height);
        ctx.lineTo(0, canvas.height);
        ctx.closePath();
        ctx.fill();

        // Draw Ship
        ctx.save();
        ctx.translate(shipX, shipY - 10);
        ctx.rotate(shipAngle);
        
        // Simple Red Ship
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.moveTo(-20, -10);
        ctx.lineTo(20, -10);
        ctx.lineTo(15, 10);
        ctx.lineTo(-15, 10);
        ctx.closePath();
        ctx.fill();

        // Simple Mast
        ctx.fillStyle = 'black';
        ctx.fillRect(-2, -30, 4, 20);

        // Simple Sail
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.moveTo(2, -28);
        ctx.lineTo(20, -18);
        ctx.lineTo(2, -8);
        ctx.closePath();
        ctx.fill();

        ctx.restore();

        animationFrameId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener('resize', handleResize);
        canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '400px', overflow: 'hidden', borderRadius: '20px', background: '#dff9fb' }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default WaveShip;
