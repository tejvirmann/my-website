import React from 'react';

const RunningAnimal = () => {
  return (
    <div style={{
        position: 'fixed',
        bottom: '0',
        left: '0',
        width: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        height: '100px',
        overflow: 'hidden'
    }}>
        <style>{`
            @keyframes runAround {
                /* Moonwalking: Moving Left->Right but facing Left (scaleX(-1)) */
                0% { left: -100px; bottom: 20px; transform: scaleX(-1); }
                40% { left: 100vw; bottom: 20px; transform: scaleX(-1); }
                45% { left: 100vw; bottom: 20px; transform: scaleX(-1) rotate(-90deg); }
                50% { left: 100vw; bottom: 100vh; transform: scaleX(-1) rotate(-90deg); }
                
                /* Turn around to moonwalk back: Moving Right->Left but facing Right (scaleX(1)) */
                55% { left: 100vw; bottom: 100vh; transform: scaleX(1) rotate(0deg); } 
                90% { left: -100px; bottom: 100vh; transform: scaleX(1); }
                95% { left: -100px; bottom: 100vh; transform: scaleX(1) rotate(90deg); }
                100% { left: -100px; bottom: 20px; transform: scaleX(1) rotate(90deg); }
            }
            .runner {
                position: fixed;
                width: 80px; /* Adjust size for GIF */
                height: auto;
                animation: runAround 40s linear infinite; /* Slower (was 20s) */
                z-index: -1;
                pointer-events: none;
            }
        `}</style>
        <img src="/img/dog.gif" alt="Running Dog" className="runner" />
    </div>
  );
};


export default RunningAnimal;
