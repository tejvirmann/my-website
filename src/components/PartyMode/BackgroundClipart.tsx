import React from 'react'
import './BackgroundClipart.css'

// Party gifs from party_gifs folder for background
const partyGifs = [
  '/party_gifs/bird-0199.gif',
  '/party_gifs/bird-0333.gif',
  '/party_gifs/i-22899.gif',
  '/party_gifs/i-37830.gif',
  '/party_gifs/i-47893.gif',
  '/party_gifs/i-49995.gif',
  '/party_gifs/i-62901.gif',
  '/party_gifs/i-72752.gif',
  '/party_gifs/i-77048.gif',
  '/party_gifs/mew.webp',
  '/party_gifs/sparkles4.gif',
]

// Background gifs that float around
const backgroundClipart = [
  { gif: partyGifs[0], size: '3rem', top: '10%', left: '5%', delay: '0s' },
  { gif: partyGifs[1], size: '2.5rem', top: '20%', left: '15%', delay: '1s' },
  { gif: partyGifs[2], size: '2rem', top: '30%', left: '8%', delay: '2s' },
  { gif: partyGifs[3], size: '3.5rem', top: '15%', left: '25%', delay: '0.5s' },
  { gif: partyGifs[4], size: '4rem', top: '40%', left: '3%', delay: '1.5s' },
  { gif: partyGifs[5], size: '3rem', top: '50%', left: '12%', delay: '2.5s' },
  { gif: partyGifs[6], size: '2.5rem', top: '60%', left: '7%', delay: '0.8s' },
  { gif: partyGifs[7], size: '5rem', top: '70%', left: '20%', delay: '1.2s' },
  { gif: partyGifs[8], size: '4rem', top: '25%', left: '85%', delay: '0.3s' },
  { gif: partyGifs[9], size: '3.5rem', top: '35%', left: '92%', delay: '1.8s' },
  { gif: partyGifs[10], size: '3rem', top: '45%', left: '88%', delay: '0.6s' },
  { gif: partyGifs[0], size: '4rem', top: '55%', left: '95%', delay: '2.2s' },
  { gif: partyGifs[1], size: '3rem', top: '65%', left: '90%', delay: '1s' },
  { gif: partyGifs[2], size: '4.5rem', top: '75%', left: '85%', delay: '1.5s' },
  { gif: partyGifs[3], size: '3rem', top: '80%', left: '10%', delay: '0.4s' },
  { gif: partyGifs[4], size: '5rem', top: '5%', left: '50%', delay: '2s' },
  { gif: partyGifs[5], size: '4rem', top: '85%', left: '50%', delay: '1.2s' },
  { gif: partyGifs[6], size: '4.5rem', top: '10%', left: '60%', delay: '0.7s' },
  { gif: partyGifs[7], size: '5rem', top: '90%', left: '70%', delay: '1.8s' },
  { gif: partyGifs[8], size: '4rem', top: '20%', left: '75%', delay: '0.9s' },
]

export default function BackgroundClipart() {
  return (
    <div className="party-clipart-bg">
      {backgroundClipart.map((item, index) => (
        <img
          key={index}
          src={item.gif}
          alt="Party background gif"
          className="party-bg-clipart"
          style={{
            position: 'absolute',
            top: item.top,
            left: item.left,
            width: item.size,
            height: item.size,
            objectFit: 'contain',
            opacity: 0.25,
            animation: `party-float-bg ${15 + (index % 10)}s ease-in-out infinite`,
            animationDelay: item.delay,
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
      ))}
    </div>
  )
}

