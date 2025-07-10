import React, { useRef, useEffect, useState } from 'react'
import Layout from '@theme/Layout'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import LayoutTw from '@site/src/theme/LayoutTw'

import Ens from '../components/Homepage/Ens'

import Hero from '../components/Homepage/Hero'
import Club from '../components/Homepage/Club'
import Collections from '../components/Homepage/Collections'
import KittyVault from '../components/Homepage/KittyVault'
import Posts from '../components/Homepage/Posts'
import ActiveEvents from '../components/Homepage/ActiveEvents'
import RecentPosts from '../components/Homepage/RecentPosts'

import ShowcaseTagSelect from './projects/_components/ShowcaseTagSelect'
import ShowcaseFilterToggle, { type Operator, readOperator } from './projects/_components/ShowcaseFilterToggle'
import ShowcaseCard from './projects/_components/ShowcaseCard'
import { sortedResources, Tags, TagList, type Resource, type TagType } from '@site/src/data/projects'
import styles from './projects/styles.module.css'
import clsx from 'clsx'
import { useFilteredResources, SearchBar } from './projects/index'
import Translate, { translate } from '@docusaurus/Translate'
import CardGrid from '../components/Homepage/CardGrid/CardGrid'

import Slider from 'react-slick'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'

export default function Home() {
  const { siteConfig } = useDocusaurusContext()
  const filteredResources = useFilteredResources()
  const favoriteResources = sortedResources.filter(resource => resource.tags.includes('favorite'))
  const otherResources = sortedResources.filter(resource => !resource.tags.includes('favorite'))

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    draggable: true,
    swipe: true,
  }

  // Dynamic banner height for GIF background positioning
  const bannerRef = useRef(null)
  const [bannerHeight, setBannerHeight] = useState(0)
  useEffect(() => {
    function updateBannerHeight() {
      if (bannerRef.current) {
        setBannerHeight(bannerRef.current.offsetHeight)
      }
    }
    updateBannerHeight()
    window.addEventListener('resize', updateBannerHeight)
    return () => window.removeEventListener('resize', updateBannerHeight)
  }, [])

  return (
    <Layout
      // title={`${siteConfig.title}`}
      description="The official website of Tejvir S. Mann."
    >
      <LayoutTw>
        {/* Fixed, full-viewport mew.webp GIF background, starting at the bottom */}
        <div
          style={{
            position: 'fixed',
            top: 'calc(100vh - 33vh)',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '33vw',
            height: '33vh',
            zIndex: 0,
            pointerEvents: 'none',
            overflow: 'hidden',
          }}
          aria-hidden="true"
        >
          <img
            src="/img/home/mew.webp"
            alt="Mew GIF background"
            style={{
              width: '100%',
              height: '100%',
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'cover',
              display: 'block',
              pointerEvents: 'none',
              userSelect: 'none',
            }}
            draggable="false"
          />
        </div>
        {/* Third mew.webp GIF above the banner, always touching but never crossing the top of the banner */}
        <div style={{ position: 'relative', width: '100vw', height: bannerHeight || 320 }}>
          <img
            src="/img/home/mew.webp"
            alt="Mew GIF above banner"
            style={{
              position: 'absolute',
              bottom: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '25vw',
              maxWidth: '100%',
              height: 'auto',
              objectFit: 'contain',
              display: 'block',
              pointerEvents: 'none',
              userSelect: 'none',
            }}
            draggable="false"
          />
        </div>
        {/* Banner/slider remains at the top */}
        <div
          ref={bannerRef}
          style={{
            width: '100%',
            maxWidth: '100vw',
            margin: '0 auto',
            position: 'relative',
            overflow: 'hidden',
            marginTop: 0,
            paddingTop: 0,
          }}
        >
          {/* Floating Particles Background Effect */}
          {/* ...rest of banner/slider code... */}
          <div className="relative" style={{ marginBottom: 0, paddingBottom: 0, background: 'none' }}>
            {/* Enhanced Glassy Overlay for better contrast */}
            <div
              style={{
                position: 'absolute',
                top: '45%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 10,
                fontSize: 'clamp(2rem, 4.5vw, 4rem)',
                fontWeight: 450,
                textAlign: 'center',
                width: '100%',
                pointerEvents: 'none',
              }}
            >
              <div
                className="text-black dark:text-white dark:bg-black/20 dark:border-white/20"
                style={{
                  textShadow: '0 0 20px rgba(255,255,255,0.8), 0 0 40px rgba(255,255,255,0.4)',
                  padding: '1rem 2rem',
                  borderRadius: '20px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.05)',
                  width: 'fit-content',
                  margin: '0 auto',
                }}
              >
                Tejvir S. Mann
              </div>
            </div>

            <Slider {...settings}>
              <div>
                <Ens
                  title=""
                  subtitle=""
                  description=""
                  imageSrc="/img/home/cluster.gif"
                  furtherDesc=""
                  button="Forest Language"
                />
              </div>
              <div>
                <Ens
                  title=""
                  subtitle=""
                  description=""
                  imageSrc="/img/home/forestlang2.jpg"
                  furtherDesc=" "
                  button="Forest Language"
                />
              </div>
            </Slider>

            {/* Additional overlay for better image contrast */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(45deg, rgba(0,0,0,0.1), rgba(255,255,255,0.1))',
                mixBlendMode: 'overlay',
              }}
            />
          </div>
        </div>

        {/* Main homepage content with a scrollable mew.webp GIF background */}
        <div style={{ position: 'relative', marginTop: bannerHeight || 320, width: '100vw' }}>
          {/* Absolutely positioned GIF background below the banner */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              zIndex: 0,
              pointerEvents: 'none',
              overflow: 'hidden',
            }}
            aria-hidden="true"
          >
            <img
              src="/img/home/mew.webp"
              alt="Mew GIF background scrolling"
              style={{
                width: '25vw',
                maxWidth: '100%',
                height: 'auto',
                position: 'absolute',
                left: '50%',
                top: 0,
                transform: 'translateX(-50%)',
                objectFit: 'contain',
                display: 'block',
                pointerEvents: 'none',
                userSelect: 'none',
              }}
              draggable="false"
            />
          </div>
          {/* All homepage content goes here, with zIndex: 1+ */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            {/* Creative Polymath Gallery Section */}
            <section className="py-16 px-4">
              <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Film Domain */}
                  <div className="group relative overflow-hidden rounded-2xl bg-white/80 dark:bg-black/60 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-500 hover:shadow-2xl z-10">
                    <div className="absolute inset-0 bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative p-6 text-center">
                      <img
                        src="/img/home/cluster.gif"
                        alt="Film"
                        className="w-20 h-20 mx-auto mb-4 object-cover rounded-full border-2 border-black dark:border-white"
                      />
                      <h3 className="text-xl font-bold mb-2 text-black dark:text-white">Film</h3>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Visual storytelling through motion and emotion
                      </p>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>

                  {/* Writing Domain */}
                  <div className="group relative overflow-hidden rounded-2xl bg-white/80 dark:bg-black/60 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-500 hover:shadow-2xl z-10">
                    <div className="absolute inset-0 bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative p-6 text-center">
                      <img
                        src="/img/home/cluster.gif"
                        alt="Writing"
                        className="w-20 h-20 mx-auto mb-4 object-cover rounded-full border-2 border-black dark:border-white"
                      />
                      <h3 className="text-xl font-bold mb-2 text-black dark:text-white">Writing</h3>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Crafting narratives that transport and transform
                      </p>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>

                  {/* Software Domain */}
                  <div className="group relative overflow-hidden rounded-2xl bg-white/80 dark:bg-black/60 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-500 hover:shadow-2xl z-10">
                    <div className="absolute inset-0 bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative p-6 text-center">
                      <img
                        src="/img/home/cluster.gif"
                        alt="Software"
                        className="w-20 h-20 mx-auto mb-4 object-cover rounded-full border-2 border-black dark:border-white"
                      />
                      <h3 className="text-xl font-bold mb-2 text-black dark:text-white">Software</h3>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Building digital experiences that inspire
                      </p>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>

                  {/* Drawing Domain */}
                  <div className="group relative overflow-hidden rounded-2xl bg-white/80 dark:bg-black/60 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-500 hover:shadow-2xl z-10">
                    <div className="absolute inset-0 bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative p-6 text-center">
                      <img
                        src="/img/home/cluster.gif"
                        alt="Drawing"
                        className="w-20 h-20 mx-auto mb-4 object-cover rounded-full border-2 border-black dark:border-white"
                      />
                      <h3 className="text-xl font-bold mb-2 text-black dark:text-white">Drawing</h3>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Visual expression through lines and imagination
                      </p>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                </div>
              </div>
            </section>

            {/* Featured Project Showcase */}
            <section className="py-16 px-4 bg-white/70 dark:bg-black/50 z-10">
              <div className="max-w-7xl mx-auto">
                <div className="relative group overflow-hidden rounded-3xl bg-white/80 dark:bg-black/60 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-700 hover:shadow-2xl z-10">
                  <div className="absolute inset-0 bg-neutral-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                  <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 p-8 lg:p-12">
                    <div className="flex flex-col justify-center">
                      <div className="mb-4">
                        <span className="inline-block px-4 py-2 bg-neutral-800 text-white text-sm font-medium rounded-full animate-pulse-glow">
                          Latest Project
                        </span>
                      </div>
                      <h3 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800 dark:text-white">
                        Forest Language
                      </h3>
                      <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                        An experimental exploration of natural language processing and creative coding, blending the
                        organic patterns of nature with the precision of computational linguistics.
                      </p>
                      <div className="flex flex-wrap gap-2 mb-6">
                        <span className="px-3 py-1 bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-sm rounded-full">
                          AI/ML
                        </span>
                        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm rounded-full">
                          Creative Coding
                        </span>
                        <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm rounded-full">
                          Innovation
                        </span>
                      </div>
                      <button
                        className="inline-flex items-center px-6 py-3 bg-neutral-900 text-white font-medium rounded-full hover:bg-neutral-700 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                        onClick={() => window.open('https://forestlang.com', '_blank')}
                      >
                        Explore Project
                        <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 8l4 4m0 0l-4 4m4-4H3"
                          />
                        </svg>
                      </button>
                    </div>

                    <div className="relative overflow-hidden rounded-2xl">
                      <img
                        src="/img/home/forestlang2.jpg"
                        alt="Forest Language Project"
                        className="w-full h-64 lg:h-80 object-cover rounded-2xl group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="max-w-7xl px-3 sm:px-6 mx-auto z-10">
              <div className="p-4 bg-white/80 dark:bg-black/60 rounded-2xl z-10">
                <div className={clsx('margin-bottom--sm', styles.filterCheckbox)}>
                  <div>
                    <h2>Filters</h2>
                    <span>({filteredResources.length})</span>
                  </div>
                </div>
                <ul className={clsx('clean-list list-none', styles.checkboxList)}>
                  {TagList.map((tag, i) => {
                    const { label, description, color } = Tags[tag]
                    const id = `showcase_checkbox_id_${tag}`
                    return (
                      <li key={i} className={styles.checkboxListItem}>
                        <ShowcaseTagSelect tag={tag} id={id} label={label} text={description} color={color} />
                      </li>
                    )
                  })}
                </ul>
              </div>
            </section>

            <section className="py-6">
              {filteredResources.length === sortedResources.length ? (
                <>
                  <div className="max-w-7xl px-3 sm:px-6 mx-auto">
                    <div className={clsx('margin-bottom--md', styles.showcaseFavoriteHeader)}>
                      <h2>Featured</h2>
                      <span></span>
                      {/* <SearchBar /> */}
                    </div>
                    <ul className={clsx('max-w-7xl px-3 sm:px-6 mx-auto', 'clean-list', styles.showcaseList)}>
                      {favoriteResources.map(resource => (
                        <ShowcaseCard key={resource.title} resource={resource} />
                      ))}
                    </ul>
                  </div>

                  <div className="max-w-7xl px-3 sm:px-6 mx-auto margin-top--lg">
                    <div className={clsx('margin-bottom--md', styles.showcaseFavoriteHeader)}>
                      <h2>
                        <Translate id="showcase.usersList.allUsers">All</Translate>
                      </h2>
                    </div>
                    <ul className={clsx('clean-list', styles.showcaseList)}>
                      {otherResources.map(resource => (
                        <ShowcaseCard key={resource.title} resource={resource} />
                      ))}
                    </ul>
                  </div>
                </>
              ) : (
                <div className="max-w-7xl px-6 mx-auto">
                  <div className={clsx('margin-bottom--md', styles.showcaseFavoriteHeader)}>{/* <SearchBar /> */}</div>
                  <ul className={clsx('clean-list', styles.showcaseList)}>
                    {filteredResources.map(resource => (
                      <ShowcaseCard key={resource.title} resource={resource} />
                    ))}
                  </ul>
                </div>
              )}
            </section>
          </div>
        </div>
      </LayoutTw>
    </Layout>
  )
}
