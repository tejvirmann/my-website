import React, { useState } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import RunningAnimal from './RunningAnimal';
import ColorSettings from './ColorSettings';
import styles from './styles.module.css';

const FunLayout = ({ children }) => {
  const { siteConfig } = useDocusaurusContext();
  const [gradientStart, setGradientStart] = useState('#FF9A9E');
  const [gradientEnd, setGradientEnd] = useState('#FECFEF'); // Default pinkish
  const [logoColor, setLogoColor] = useState('white');

  return (
    <div className="fun-mode-container" style={{
      width: '100vw',
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${gradientStart} 0%, ${gradientEnd} 100%)`, 
      overflowX: 'hidden',
      color: '#333',
      fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif',
      position: 'relative'
    }}>
      <style>{`
         /* Default Pointer (Glove Hand) */
         * { 
             cursor: pointer !important;
         }
      `}</style>

      <ColorSettings 
        onBgStartChange={setGradientStart} 
        onBgEndChange={setGradientEnd} 
        onLogoChange={setLogoColor} 
      />

      <header style={{
        position: 'absolute',
        top: 0,
        left: 0,
        padding: '1rem',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
      }}>
        {/* Actual Logo from static/img/logo-pcca.svg */}
        {/* Use filters to force black or white silhouette based on logoColor state */}
        <img 
            src="/img/logo-pcca.svg" 
            alt="Logo" 
            style={{ 
                height: '45px', 
                width: 'auto',
                filter: logoColor === 'white' ? 'brightness(0) invert(1)' : 'brightness(0)' 
            }} 
        />
      </header>
      
      <RunningAnimal />

      <main style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </main>
    </div>
  );
};

export default FunLayout;
