import React, { useState } from 'react';

interface GameCardProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

const GameCard: React.FC<GameCardProps> = ({ title, children, defaultExpanded = false }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const handleExpand = () => setIsExpanded(true);
  const handleCollapse = (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsExpanded(false);
  };

  if (isExpanded) {
    return (
      <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.8)',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backdropFilter: 'blur(5px)'
      }}>
          <div style={{
              width: '90%',
              height: '90%',
              background: 'white',
              borderRadius: '20px',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
          }}>
              <div style={{ 
                  padding: '1rem', 
                  background: '#333', 
                  color: 'white', 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center'
              }}>
                  <h2 style={{ margin: 0 }}>{title}</h2>
                  <button 
                    onClick={handleCollapse}
                    style={{
                        background: 'red',
                        color: 'white',
                        border: 'none',
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                  >
                      X
                  </button>
              </div>
              <div style={{ flex: 1, position: 'relative', background: '#222' }}>
                  {children}
              </div>
          </div>
      </div>
    );
  }

  return (
    <div 
        onClick={handleExpand}
        style={{
            width: '320px',
            height: '320px',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '20px',
            padding: '1rem',
            cursor: 'pointer',
            transition: 'transform 0.2s',
            backdropFilter: 'blur(5px)',
            border: '2px solid rgba(255,255,255,0.4)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
        }}
    >
        <h3 style={{ color: 'white', marginBottom: '1rem' }}>{title}</h3>
        <div style={{ 
            width: '100%', 
            flex: 1, 
            borderRadius: '10px', 
            overflow: 'hidden', 
            position: 'relative',
            pointerEvents: 'none' // Prevent interaction when collapsed
        }}>
            {children}
        </div>
        <p style={{ marginTop: '0.5rem', color: 'white', fontSize: '0.8rem' }}>Click to Play</p>
    </div>
  );
};

export default GameCard;
