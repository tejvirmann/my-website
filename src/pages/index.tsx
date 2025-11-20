import React, { useState, useRef } from 'react'
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

export default function Home() {
  const { siteConfig } = useDocusaurusContext()
  const filteredResources = useFilteredResources()
  const favoriteResources = sortedResources.filter(resource => resource.tags.includes('favorite'))
  const otherResources = sortedResources.filter(resource => !resource.tags.includes('favorite'))

  // Map of log titles to their dates (YYYY-M-D format)
  // When adding new logs, add their date here to enable automatic sorting
  const logDates: { [key: string]: string } = {
    'Shin Sakaino': '2024-9-25',
    'Demon Faces': '2024-8-25',
    'Human Face': '2024-8-25',
    'Another Day in the Carbonite': '2019-1-25',
    'Pencil Drawings 1.2.24': '2024-1-2',
    'Pink Pen': '2023-11-2',
    'Aleopard': '',
    'Gallify': '',
    'Depressed Spirit': '',
    'Last Supper 231': '',
    'Blue Bird': '',
    'Asterisk': '',
    'Tejvir Mann Show': '',
    'CODAmarket UI': '',
    'Bravv UI': '',
    'Pink Sky Rocks': '',
    'Purple Dragon': '',
    'Hope Tiger': '',
    'Intermission': '2019-7-30',
    'Forest Language': '',
  }

  // Get logs with dates, sort by date (newest first), and take the top 3
  const latestLogs = Resources.filter(resource => {
    const date = logDates[resource.title]
    return date && date.trim() !== '' // Only include logs with actual dates
  })
    .map(resource => ({
      ...resource,
      date: logDates[resource.title],
    }))
    .sort((a, b) => {
      const dateA = new Date(a.date)
      const dateB = new Date(b.date)
      return dateB.getTime() - dateA.getTime() // Newest first
    })
    .slice(0, 3)
    .map(({ date, ...resource }) => resource) // Remove date from final objects

  // State for controlling the latest logs slider
  const [currentLogSlide, setCurrentLogSlide] = useState(0)
  const latestLogsSliderRef = useRef<any>(null)

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
    autoplay: false,
    arrows: false,
    beforeChange: (current: number, next: number) => setCurrentLogSlide(next),
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

  return (
    <Layout
      // title={`${siteConfig.title}`}
      description="The official website of Tejvir S. Mann."
    >
      <LayoutTw>
        <div className="relative w-full" style={{ position: 'relative' }}>
          {/* Centered Text */}
          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 w-full text-center pointer-events-none"
            style={{
              fontSize: 'clamp(2rem, 4.5vw, 4rem)',
              fontWeight: 450,
            }}
          >
            <div className="text-black dark:text-white">Tejvir S. Mann</div>
          </div>

          {/* Slider */}
          <div className="w-full overflow-hidden">
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
          </div>
        </div>

        {/* Latest Logs Showcase */}
        <section className="py-16 px-3 sm:px-6 bg-gray-50/50 dark:bg-gray-900/50">
          <div className="max-w-7xl mx-auto">
            {/* Slider for Latest Logs */}
            <div className="mb-8" style={{ width: '100%', overflow: 'hidden' }}>
              <Slider ref={latestLogsSliderRef} {...latestLogsSliderSettings}>
                {latestLogs.map((log, index) => {
                  const date = logDates[log.title] || ''
                  const formattedDate = date ? formatDate(date) : ''

                  return (
                    <div key={log.title}>
                      <div className="relative group overflow-hidden rounded-3xl bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-700 hover:shadow-2xl">
                        <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-0">
                          {/* Image takes full space on left */}
                          <div className="relative overflow-hidden w-full h-64 lg:h-[500px] order-2 lg:order-1">
                            <img
                              src={require('../data/projects/img/' + log.image).default}
                              alt={log.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                          </div>

                          {/* Content on right */}
                          <div className="flex flex-col justify-center p-8 lg:p-12 order-1 lg:order-2">
                            <div className="mb-4 flex items-center gap-3">
                              <span className="inline-block px-4 py-2 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-full">
                                Latest Log
                              </span>
                              {formattedDate && (
                                <p className="text-sm text-gray-500 dark:text-gray-400">{formattedDate}</p>
                              )}
                            </div>
                            <h3 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800 dark:text-white">
                              {log.title}
                            </h3>
                            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                              {log.description}
                            </p>
                            <div className="flex flex-wrap gap-2 mb-6">
                              {log.tags.slice(0, 3).map(tag => {
                                const tagData = Tags[tag]
                                if (!tagData) return null
                                return (
                                  <span
                                    key={tag}
                                    className="px-3 py-1 text-sm rounded-full border"
                                    style={{
                                      borderColor: tagData.color + '40',
                                      color: tagData.color,
                                      backgroundColor: tag === 'favorite' ? tagData.color + '10' : tagData.color + '08',
                                    }}
                                  >
                                    {tagData.label}
                                  </span>
                                )
                              })}
                            </div>
                            <Link
                              to={log.website}
                              className="inline-flex items-center px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-full hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-300 hover:scale-105 hover:shadow-lg w-fit"
                            >
                              View Log
                              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    className={`relative group overflow-hidden rounded-2xl bg-white/50 dark:bg-black/20 border transition-all duration-300 cursor-pointer ${
                      currentLogSlide === index
                        ? 'border-blue-500 dark:border-blue-400 shadow-lg scale-105'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="p-4 lg:p-6">
                      <div className="relative overflow-hidden rounded-xl mb-4">
                        <img
                          src={require('../data/projects/img/' + log.image).default}
                          alt={log.title}
                          className="w-full h-32 lg:h-40 object-cover rounded-xl group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl"></div>
                      </div>
                      {formattedDate && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{formattedDate}</p>
                      )}
                      <h4 className="text-lg font-bold mb-2 text-gray-800 dark:text-white">{log.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">{log.description}</p>
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

        <section className="max-w-7xl px-3 sm:px-6 mx-auto">
          <div className="p-4 bg-white/50 dark:bg-black/20 rounded-2xl">
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
