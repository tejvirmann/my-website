import React, { useEffect, useState } from 'react';
import styles from './styles.module.css';

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [trailing, setTrailing] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOver = (e: MouseEvent) => {
      if ((e.target as HTMLElement).tagName === 'A' || (e.target as HTMLElement).tagName === 'BUTTON') {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  // Simple interpolation for trailing effect
  useEffect(() => {
    let animationFrameId: number;
    
    const animateTrailing = () => {
      setTrailing(prev => ({
        x: prev.x + (position.x - prev.x) * 0.1,
        y: prev.y + (position.y - prev.y) * 0.1
      }));
      animationFrameId = requestAnimationFrame(animateTrailing);
    };
    
    animateTrailing();
    
    return () => cancelAnimationFrame(animationFrameId);
  }, [position]);

  return (
    <>
      <style>{`
        body { cursor: none; }
        a, button { cursor: none; }
      `}</style>
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          border: '2px solid white',
          pointerEvents: 'none',
          transform: `translate3d(${trailing.x - 16}px, ${trailing.y - 16}px, 0) scale(${isHovering ? 1.5 : 1})`,
          transition: 'transform 0.1s ease-out',
          zIndex: 9999,
          mixBlendMode: 'difference'
        }}
      />
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: '#00ffcc',
          pointerEvents: 'none',
          transform: `translate3d(${position.x - 4}px, ${position.y - 4}px, 0)`,
          zIndex: 9999,
          boxShadow: '0 0 10px #00ffcc'
        }} 
      />
    </>
  );
};

export default CustomCursor;
