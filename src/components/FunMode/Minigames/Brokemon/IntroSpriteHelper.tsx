import React, { useEffect, useRef, useState } from 'react';
import charGangster from './assets/char_gangster.png';

const IntroSprite = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    
    // Animation State
    const [frame, setFrame] = useState(0);
    const spriteRef = useRef<HTMLImageElement | null>(null);

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
        
        const r = data[0];
        const g = data[1];
        const b = data[2];
        
        for(let i=0; i<data.length; i+=4) {
             if(Math.abs(data[i] - r) < 30 && Math.abs(data[i+1] - g) < 30 && Math.abs(data[i+2] - b) < 30) {
                 data[i+3] = 0;
             }
        }
        
        ctx.putImageData(imgData, 0, 0);
        return canvas.toDataURL();
    };



// ...
    // Load Image
    useEffect(() => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        // Use char_gangster for Professor O-G
        img.src = charGangster; // Webpack import returns URL
        img.onload = () => {
             const transparentSrc = makeTransparent(img);
             const finalImg = new Image();
             finalImg.src = transparentSrc;
             finalImg.onload = () => {
                  spriteRef.current = finalImg;
             };
        };
    }, []);

    // Animation Loop
    useEffect(() => {
        const interval = setInterval(() => {
            setFrame(f => (f + 1) % 4);
        }, 200); // 200ms per frame
        return () => clearInterval(interval);
    }, []);

    // Render Loop
    useEffect(() => {
          const canvas = canvasRef.current;
          if (!canvas || !spriteRef.current) return;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;
          
          ctx.imageSmoothingEnabled = false;
          ctx.clearRect(0,0, canvas.width, canvas.height);

          const img = spriteRef.current;
          // Assuming 4x4 sheet. 
          const sw = img.width / 4;
          const sh = img.height / 4;
          
          // Draw current frame (row 0 - walking down)
          const sx = frame * sw;
          const sy = 0; 
          
          // Draw scaled up to fit 128x128 canvas
          // Center the sprite in the 128x128 box
          // Sprite is likely small (32x32), so scale 4x
          ctx.drawImage(img, sx, sy, sw, sh, 0, 0, 128, 128);
          
    }, [frame]); // Re-render when frame changes

    return <canvas ref={canvasRef} width={128} height={128} className="image-pixelated" />;
};

export default IntroSprite;
