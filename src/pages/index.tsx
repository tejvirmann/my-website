import React, { useState, useRef, useEffect } from 'react'
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
import { sortedResources, Resources, Tags, TagList, type Resource, type TagType } from '@site/src/data/projects'
import styles from './projects/styles.module.css'
import clsx from 'clsx'
import { useFilteredResources, SearchBar } from './projects/index'
import Translate, { translate } from '@docusaurus/Translate'
import CardGrid from '../components/Homepage/CardGrid/CardGrid'
import Link from '@docusaurus/Link'

import Slider from 'react-slick'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'

import ClipartSection from '../components/PartyMode/ClipartSection'
import BackgroundClipart from '../components/PartyMode/BackgroundClipart'

export default function Home() {
  const { siteConfig } = useDocusaurusContext()
  const filteredResources = useFilteredResources()
  const favoriteResources = sortedResources.filter(resource => resource.tags.includes('favorite'))
  const otherResources = sortedResources.filter(resource => !resource.tags.includes('favorite'))

  // ============================================================================
  // ONLY HARDCODED PART: List of the 3 latest logs (newest to oldest)
  // When adding a new log, update this array - put the newest one first
  // ============================================================================
  const LATEST_LOG_TITLES = ['Shin Sakaino', 'Demon Faces', 'Human Face'] as const

  // Map of log titles to their dates (for display purposes only)
  const logDates: { [key: string]: string } = {
    'Shin Sakaino': '2024-9-25',
    'Demon Faces': '2024-8-25',
    'Human Face': '2024-8-25',
    'Another Day in the Carbonite': '2019-1-25',
    'Pencil Drawings 1.2.24': '2024-1-2',
    'Pink Pen': '2023-11-2',
    'Intermission': '2019-7-30',
  }

  // Automatically get the 3 latest logs in the specified order
  const latestLogs = React.useMemo(() => {
    return LATEST_LOG_TITLES.map(title => {
      const log = Resources.find(resource => resource.title === title)
      if (!log) {
        console.warn(`Latest log "${title}" not found in Resources array`)
      }
      return log
    }).filter((log): log is Resource => log !== undefined)
  }, [])

  // State for controlling the latest logs slider
  const [currentLogSlide, setCurrentLogSlide] = useState(0)
  const latestLogsSliderRef = useRef<any>(null)

  // Sync slider state after initialization to ensure correct starting slide
  useEffect(() => {
    // Reset to slide 0 whenever latestLogs changes
    setCurrentLogSlide(0)

    // Wait for slider to be fully initialized
    const timer = setTimeout(() => {
      if (latestLogsSliderRef.current && latestLogsSliderRef.current.innerSlider) {
        const innerSlider = latestLogsSliderRef.current.innerSlider
        const currentSlide = innerSlider.currentSlide || 0
        // Normalize the slide index in case infinite mode offset it
        const normalizedSlide = currentSlide % latestLogs.length
        // Always force go to 0 on initialization to ensure correct starting slide
        if (normalizedSlide !== 0 || currentSlide !== 0) {
          latestLogsSliderRef.current.slickGoTo(0, false)
          setCurrentLogSlide(0)
        } else {
          setCurrentLogSlide(0)
        }
      }
    }, 150)

    return () => clearTimeout(timer)
  }, [latestLogs.length, latestLogs])

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 7000,
  }

  const latestLogsSliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 13000,
    arrows: false,
    initialSlide: 0,
    afterChange: (current: number) => {
      // Normalize the index in case infinite mode offsets it
      // With infinite mode, react-slick can return indices >= slide count
      const normalizedSlide = current % latestLogs.length
      setCurrentLogSlide(normalizedSlide)
    },
    onInit: () => {
      // Ensure we start at slide 0 when slider initializes
      setCurrentLogSlide(0)
      // Force go to slide 0 after a brief delay to ensure it's applied
      setTimeout(() => {
        if (latestLogsSliderRef.current) {
          latestLogsSliderRef.current.slickGoTo(0, false)
        }
      }, 50)
    },
    responsive: [
      {
        breakpoint: 1024, // lg breakpoint - applies to screens < 1024px (mobile/tablet)
        settings: {
          infinite: false, // Disable infinite mode on mobile/tablet to prevent index misalignment
          initialSlide: 0, // Explicitly set initial slide to 0 on mobile
        },
      },
    ],
  }

  const goToLogSlide = (index: number) => {
    if (latestLogsSliderRef.current) {
      latestLogsSliderRef.current.slickGoTo(index)
      setCurrentLogSlide(index)
    }
  }

  const formatDate = (dateString: string) => {
    // Format: "September 25, 2024" from "2024-9-25"
    const [year, month, day] = dateString.split('-').map(Number)
    const date = new Date(year, month - 1, day)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  const truncateDescription = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength).trim() + '...'
  }

  return (
    <Layout
      // title={`${siteConfig.title}`}
      description="The official website of Tejvir S. Mann."
    >
      <LayoutTw>
        <div className="relative w-full" style={{ position: 'relative' }}>
          {/* Centered Text */}
          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 w-full text-center pointer-events-none transition-opacity duration-300 lg:group-hover:opacity-0"
            style={{
              fontSize: 'clamp(2rem, 4.5vw, 4rem)',
              fontWeight: 450,
            }}
          >
            <div className="text-white drop-shadow-[0_0_20px_rgba(0,0,0,0.8)] dark:drop-shadow-[0_0_20px_rgba(0,0,0,0.9)]">
              Tejvir S. Mann
            </div>
          </div>

          {/* Slider */}
          <div className="w-full overflow-hidden group" style={{ height: '60vh', minHeight: '500px' }}>
            <Slider {...settings}>
              <div>
                <Ens
                  title=""
                  subtitle=""
                  description=""
                  imageSrc="/party_gifs/mew.webp"
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
          </div>
        </div>

        {/* Party Mode Background Clipart */}
        <BackgroundClipart />

        {/* Party Mode Clipart Section 1 - Between top slider and latest logs */}
        <ClipartSection />

        {/* Latest Logs Showcase */}
        <section className="py-16 px-3 sm:px-6 bg-white dark:bg-[#101010] relative z-0">
          <div className="max-w-7xl mx-auto">
            {/* Slider for Latest Logs */}
            <div className="mb-8" style={{ width: '100%', overflow: 'hidden' }}>
              <Slider
                key={`latest-logs-${latestLogs.length}-${latestLogs[0]?.title || ''}`}
                ref={latestLogsSliderRef}
                {...latestLogsSliderSettings}
              >
                {latestLogs.map((log, index) => {
                  const date = logDates[log.title] || ''
                  const formattedDate = date ? formatDate(date) : ''

                  return (
                    <div key={log.title}>
                      <div
                        className="relative group overflow-hidden rounded-3xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-700 hover:shadow-2xl"
                        style={{ minHeight: '500px', height: '100%' }}
                      >
                        {/* Background image takes full area */}
                        <div className="absolute inset-0 select-none">
                          <img
                            src={require('../data/projects/img/' + log.image).default}
                            alt={log.title}
                            className="absolute w-full h-full object-cover"
                            style={{
                              objectPosition: log.title === 'Demon Faces' ? 'top' : 'center',
                            }}
                            draggable={false}
                          />
                          {/* Dark overlay for text readability */}
                          <div className="absolute inset-0 bg-black/40 dark:bg-black/30 pointer-events-none"></div>
                        </div>

                        {/* Content overlay */}
                        <div
                          className="relative flex lg:grid lg:grid-cols-2 gap-0"
                          style={{ minHeight: '500px', height: '100%' }}
                        >
                          {/* Content on right */}
                          <div className="absolute inset-0 lg:relative flex flex-col justify-center items-center lg:items-start p-6 sm:p-8 lg:p-12 lg:order-2 z-10">
                            {formattedDate && (
                              <p className="text-sm text-white/80 dark:text-white/70 mb-4">{formattedDate}</p>
                            )}
                            <h3 className="text-3xl md:text-4xl font-bold mb-4 text-white">{log.title}</h3>
                            <p className="text-lg text-white/90 dark:text-white/80 mb-6 leading-relaxed">
                              {truncateDescription(log.description, 100)}
                            </p>
                            <div className="flex items-center gap-3 flex-wrap">
                              <Link
                                to={log.website}
                                className="inline-flex items-center px-4 py-2 text-sm border-2 border-white/50 dark:border-white/30 bg-white/20 dark:bg-black/20 backdrop-blur-sm text-white font-medium rounded-full hover:border-white dark:hover:border-white/50 hover:bg-white/30 dark:hover:bg-black/30 transition-all duration-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-white dark:focus:ring-white/50"
                              >
                                View Log
                                <svg className="ml-2 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                                  />
                                </svg>
                              </Link>
                            </div>
                          </div>
                        </div>
                        {/* Tags in bottom right corner of entire card */}
                        <div className="absolute bottom-4 right-4 lg:bottom-8 lg:right-12 flex flex-wrap gap-2 justify-end z-20">
                          {log.tags.slice(0, 3).map(tag => {
                            const tagData = Tags[tag]
                            if (!tagData) return null
                            return (
                              <span
                                key={tag}
                                className="px-3 py-1 text-sm rounded-full border backdrop-blur-sm"
                                style={{
                                  borderColor: tagData.color + '40',
                                  color: tagData.color,
                                  backgroundColor: tag === 'favorite' ? tagData.color + '20' : tagData.color + '15',
                                }}
                              >
                                {tagData.label}
                              </span>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </Slider>
            </div>

            {/* Condensed Log Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
              {latestLogs.map((log, index) => {
                const date = logDates[log.title] || ''
                const formattedDate = date ? formatDate(date) : ''

                return (
                  <div
                    key={log.title}
                    onClick={() => goToLogSlide(index)}
                    className={`relative group overflow-hidden rounded-2xl bg-white dark:bg-[#101010] border transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 ${
                      currentLogSlide === index
                        ? 'border-black dark:border-white shadow-lg ring-2 ring-black dark:ring-white'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 focus:ring-black dark:focus:ring-white'
                    }`}
                    tabIndex={0}
                  >
                    <div className="p-3 lg:p-4">
                      {formattedDate && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{formattedDate}</p>
                      )}
                      <h4 className="text-base font-bold mb-1 text-gray-800 dark:text-white">{log.title}</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 mb-2">{log.description}</p>
                      <Link
                        to={log.website}
                        onClick={e => e.stopPropagation()}
                        className="inline-flex items-center text-sm text-blue-500 dark:text-blue-400 font-medium hover:underline"
                      >
                        View Log
                        <svg className="ml-1 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 8l4 4m0 0l-4 4m4-4H3"
                          />
                        </svg>
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Party Mode Clipart Section 2 - Between latest logs and projects */}
        <ClipartSection />

        {/* <h1>Gallery</h1> */}
        {/* <CardGrid /> */}

        {/* <ActiveEvents /> */}
        {/* <RecentPosts /> */}
        {/* <Hero /> */}
        {/* <main className="pt-0"> */}
        {/* <section className="relative max-w-7xl mx-auto lg:grid grid-cols-1 lg:grid-cols-5 gap-3 lg:px-3">
            <Club />
            <Collections />
          </section> */}
        {/* <Posts /> */}
        {/* <RecentPosts /> */}
        {/* <KittyVault /> */}
        {/* </main> */}

        <section className="max-w-7xl px-3 sm:px-6 mx-auto relative z-30">
          <div className="p-4 bg-white dark:bg-[#101010] rounded-2xl">
            <div className={clsx('margin-bottom--sm', styles.filterCheckbox)}>
              <div>
                <h2>Filters</h2>
                <span>({filteredResources.length})</span>
              </div>
              {/* <ShowcaseFilterToggle /> */}
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
            <div className="max-w-7xl px-3 sm:px-6 mx-auto">
              <div className={clsx('margin-bottom--md', styles.showcaseFavoriteHeader)}>{/* <SearchBar /> */}</div>
              <ul className={clsx('clean-list', styles.showcaseList)}>
                {filteredResources.map(resource => (
                  <ShowcaseCard key={resource.title} resource={resource} />
                ))}
              </ul>
            </div>
          )}
        </section>
      </LayoutTw>
    </Layout>
  )
}
