import React from 'react'
import './ClipartSection.css'

// Party gifs from party_gifs folder
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

export default function ClipartSection() {
  return (
    <div className="party-clipart-section py-8 px-4 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6 lg:gap-8">
          {partyGifs.map((gif, index) => (
            <img
              key={index}
              src={gif}
              alt="Party gif"
              className="party-clipart-item inline-block"
              style={{
                width: '4rem',
                height: '4rem',
                objectFit: 'contain',
                animation: `party-bounce ${2 + (index % 3)}s ease-in-out infinite`,
                animationDelay: `${index * 0.1}s`,
                transform: `rotate(${index * 15}deg)`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

