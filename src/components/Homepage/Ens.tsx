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
  return (
    <section className={'relative mb-8 md:mb-12 group ' + styles.sectionBg}>
      <div className="absolute inset-0 w-full h-full">
        <img className={'w-full h-full object-cover ' + styles.coverImg} src={imageSrc} alt="" />
      </div>

      <div className={'absolute w-full top-0 h-4 p-3'} />
      <div
        className={'absolute w-full bottom-0 h-4 p-3 transition-all duration-150 bg-gradient-to-t ' + styles.overlay}
      />
      <div
        className={
          'absolute w-full top-0 h-5 group-hover:h-5 p-3 transition-all duration-15 bg-gradient-to-b ' + styles.overlay
        }
      />
      <div
        className={
          'absolute w-full bottom-0 h-5 group-hover:animate-pulse group-hover:h-5 p-3 transition-all duration-15 bg-gradient-to-t ' +
          styles.overlay
        }
      />

      <div className="relative max-w-4xl mx-auto text-center py-32 lg:py-48 px-8 sm:px-12 lg:px-3">
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
