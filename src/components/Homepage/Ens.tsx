import React from 'react'
import styles from './ens.module.scss'
import Link from '@docusaurus/Link'

export default function Ens() {
  return (
    <section className={'relative my-8 md:my-12 group ' + styles.sectionBg}>
      <div className="absolute inset-0 w-full h-full">
        <img className={'w-full h-full object-cover ' + styles.coverImg} src="/img/home/dishwasher.png" alt="" />
      </div>

      <div className={'absolute w-full top-0 h-4 p-3 transition-all duration-150 bg-gradient-to-b ' + styles.overlay} />
      <div
        className={'absolute w-full bottom-0 h-4 p-3 transition-all duration-150 bg-gradient-to-t ' + styles.overlay}
      />
      <div
        className={
          'absolute w-full top-0 h-24 group-hover:animate-pulse group-hover:h-16 p-3 transition-all duration-150 bg-gradient-to-b ' +
          styles.overlay
        }
      />
      <div
        className={
          'absolute w-full bottom-0 h-24 group-hover:animate-pulse group-hover:h-16 p-3 transition-all duration-150 bg-gradient-to-t ' +
          styles.overlay
        }
      />

      <div className="relative max-w-4xl mx-auto text-center py-16 lg:py-24 px-8 sm:px-12 lg:px-3">
        <h3 className="text-3xl md:text-5xl uppercase pb-4 tracking-widest">
          Dishwasher <span className="block pt-1 text-xl md:text-3xl tracking-normal font-light">THE ANIME</span>
        </h3>
        <div className="text-base sm:text-xl lg:text-lg xl:text-xl">
          <p>Dishwasher is an anime that I am creating.</p>
          <p>
            I am currently working on assembling a production team and learning all I can about animation and film. If you are interested please reach out!
          </p>
        </div>
        <div className="pt-8">
          <Link className="" to="/logs/projects/dishwasher">
            <span className="inline-block px-6 py-3 rounded-full bg-pink-500 hover:bg-white hover:shadow-lg hover:shadow-pink-500 text-base font-medium text-white hover:text-pink-500 transition-all duration-300 hover:-translate-y-1">
              Learn More
            </span>
          </Link>
        </div>
      </div>
    </section>
  )
}
