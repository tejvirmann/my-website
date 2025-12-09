import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

interface ColorSettingsProps {
    onBgStartChange: (color: string) => void;
    onBgEndChange: (color: string) => void;
    onLogoChange: (color: string) => void;
}

const ColorSettings: React.FC<ColorSettingsProps> = ({ onBgStartChange, onBgEndChange, onLogoChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [bgStart, setBgStart] = useState('#FF9A9E');
  const [bgEnd, setBgEnd] = useState('#FECFEF');
  const [logoColor, setLogoColor] = useState('white');

  useEffect(() => {
      const savedBgStart = Cookies.get('funModeBgStart');
      const savedBgEnd = Cookies.get('funModeBgEnd');
      const savedLogo = Cookies.get('funModeLogo');
      
      if (savedBgStart) {
          setBgStart(savedBgStart);
          onBgStartChange(savedBgStart);
      }
      if (savedBgEnd) {
          setBgEnd(savedBgEnd);
          onBgEndChange(savedBgEnd);
      }
      if (savedLogo) {
          setLogoColor(savedLogo);
          onLogoChange(savedLogo);
      }
  }, []);

  const handleBgStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const color = e.target.value;
      setBgStart(color);
      onBgStartChange(color);
      Cookies.set('funModeBgStart', color, { expires: 365 });
  };

  const handleBgEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const color = e.target.value;
      setBgEnd(color);
      onBgEndChange(color);
      Cookies.set('funModeBgEnd', color, { expires: 365 });
  };

  const handleLogoToggle = () => {
      const newColor = logoColor === 'white' ? 'black' : 'white';
      setLogoColor(newColor);
      onLogoChange(newColor);
      Cookies.set('funModeLogo', newColor, { expires: 365 });
  };

  return (
    <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 10000,
        background: 'rgba(255,255,255,0.9)',
        padding: '10px',
        borderRadius: '20px',
        boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        transition: 'all 0.3s'
    }}>
        <button 
            onClick={() => setIsOpen(!isOpen)}
            style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                padding: '0 5px'
            }}
        >
            🎨
        </button>
        
        {isOpen && (
            <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '150px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <label style={{ fontSize: '12px' }}>Gradient Start</label>
                    <input type="color" value={bgStart} onChange={handleBgStartChange} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <label style={{ fontSize: '12px' }}>Gradient End</label>
                    <input type="color" value={bgEnd} onChange={handleBgEndChange} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                     <label style={{ fontSize: '12px' }}>Logo Color</label>
                     <button onClick={handleLogoToggle} style={{ 
                         width: '24px', 
                         height: '24px', 
                         borderRadius: '50%', 
                         background: logoColor, 
                         border: '1px solid #ccc',
                         cursor: 'pointer'
                     }} />
                </div>
            </div>
        )}
    </div>
  );
};

export default ColorSettings;
