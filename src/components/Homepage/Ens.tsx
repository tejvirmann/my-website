import React from 'react'
import styles from './ens.module.scss'
import Link from '@docusaurus/Link'

// Define the interface for the component's props
interface EnsProps {
  title: string
  subtitle: string
  description: string
  imageSrc: string
  furtherDesc: string
  button: string
}

export default function Ens({ title, subtitle, description, imageSrc, furtherDesc, button }: EnsProps) {
  // Determine background color based on image
  const getBackgroundColor = () => {
    if (imageSrc.includes('party_gifs')) {
      return '#FFFFFF' // White for party gifs
    }
    if (imageSrc.includes('forestlang2.jpg')) {
      return '#000000' // Black for forest image
    }
    return '#000000' // Default black
  }

  const isPartyGif = imageSrc.includes('party_gifs')

  return (
    <section 
      className={'relative group ' + styles.sectionBg} 
      style={{ 
        height: '100%', 
        minHeight: '500px',
        backgroundColor: getBackgroundColor(),
      }}
    >
      <div className="absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden z-0">
        <img 
          className={styles.coverImg} 
          src={imageSrc} 
          alt="" 
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            objectPosition: 'center',
          }}
        />
      </div>

      {/* Shaded overlay on top of image for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/40 dark:from-black/50 dark:via-black/40 dark:to-black/50 pointer-events-none z-10 touch-none"></div>

      <div className={'absolute w-full top-0 h-4 p-3'} />
      <div
        className={'absolute w-full bottom-0 h-4 p-3 transition-all duration-150 bg-gradient-to-t ' + styles.overlay}
      />
      <div
        className={
          'absolute w-full top-0 h-5 lg:group-hover:h-5 p-3 transition-all duration-15 bg-gradient-to-b ' + styles.overlay
        }
      />
      <div
        className={
          'absolute w-full bottom-0 h-5 lg:group-hover:animate-pulse lg:group-hover:h-5 p-3 transition-all duration-15 bg-gradient-to-t ' +
          styles.overlay
        }
      />

      <div className="relative max-w-4xl mx-auto text-center px-8 sm:px-12 lg:px-3 z-20" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <h3 className="text-3xl md:text-5xl pb-4 tracking-widest">
          {title} <span className="block pt-1 text-xl md:text-3xl tracking-normal font-light">{subtitle}</span>
        </h3>
        <div className="text-base sm:text-xl lg:text-lg xl:text-xl">
          <p>{description}</p>
          <p>{furtherDesc}</p>
        </div>
        {/* <div className="pt-8">
          <Link className="" to="/logs/projects/forestlanguage">
            <span className="inline-block px-6 py-3 rounded-full bg-green-500 hover:bg-white hover:shadow-lg hover:shadow-green-500 text-base font-medium text-white hover:text-green-500 transition-all duration-300 hover:-translate-y-1">
              {button}
            </span>
          </Link>
        </div> */}
      </div>
    </section>
  )
}
