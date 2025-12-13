import React, { useEffect, useState, useRef } from 'react'
import { useColorMode } from '@docusaurus/theme-common'
import Link from '@docusaurus/Link'

type GitHubContributionsProps = {
  username: string
}

type ContributionDay = {
  date: string
  count: number
  level: number
}

type ContributionStats = {
  total: number
  longestStreak: number
  currentStreak: number
  longestStreakStart: string
  longestStreakEnd: string
  currentStreakStart: string
  lastContributionDate: string
}

export default function GitHubContributions({ username }: GitHubContributionsProps) {
  const { isDarkTheme } = useColorMode()
  const [contributions, setContributions] = useState<ContributionDay[]>([])
  const [stats, setStats] = useState<ContributionStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [hoveredDay, setHoveredDay] = useState<{ date: string; count: number; x: number; y: number } | null>(null)

  // Fetch contribution data from GitHub Contribution Calendar API
  useEffect(() => {
    const fetchContributions = async () => {
      try {
        setLoading(true)
        setError(null)

        // Helper function to fetch with timeout
        const fetchWithTimeout = (url: string, timeout = 10000) => {
          return Promise.race([
            fetch(url),
            new Promise<Response>((_, reject) =>
              setTimeout(() => reject(new Error('Request timeout')), timeout)
            ),
          ])
        }

        // Use the GitHub Contribution Calendar API
        // https://github.com/rschristian/github-contribution-calendar-api
        const apiUrl = `https://gh-calendar.rschristian.dev/user/${username}`
        let response: Response | null = null
        let data: any = null
        
        try {
          response = await fetchWithTimeout(apiUrl, 10000)
          if (response && response.ok) {
            try {
              data = await response.json()
              console.log('Primary API response received:', { 
                hasData: !!data, 
                hasContributions: !!(data && data.contributions),
                contributionsLength: data && data.contributions ? data.contributions.length : 0 
              })
            } catch (jsonError) {
              console.error('Failed to parse JSON response:', jsonError)
              data = null
            }
          } else if (response) {
            console.warn(`Primary API returned status ${response.status}, trying fallback...`)
          }
        } catch (fetchError) {
          console.warn('Primary API failed, trying fallback...', fetchError)
          data = null
        }

        // The API returns: { total: number, contributions: [[{date, intensity, count}, ...], ...] }
        // contributions is an array of arrays (weeks), where each week is an array of days
        const days: ContributionDay[] = []

        // Handle the actual API format: data.contributions is an array of arrays (weeks)
        if (data && data.contributions && Array.isArray(data.contributions)) {
          data.contributions.forEach((week: any) => {
            if (Array.isArray(week)) {
              week.forEach((day: any) => {
                if (day && day.date) {
                  const count = day.count || 0
                  // Use intensity if available, otherwise calculate level from count
                  let level = 0
                  if (day.intensity !== undefined) {
                    level = parseInt(day.intensity, 10) || 0
                  } else {
                    // Calculate level based on count (GitHub's levels)
                    if (count > 0 && count <= 3) level = 1
                    else if (count >= 4 && count <= 6) level = 2
                    else if (count >= 7 && count <= 9) level = 3
                    else if (count >= 10) level = 4
                  }

                  days.push({
                    date: day.date,
                    count,
                    level,
                  })
                }
              })
            }
          })
        }
        // Fallback: weeks array with contributionDays (GitHub GraphQL format)
        else if (data && data.weeks && Array.isArray(data.weeks)) {
          data.weeks.forEach((week: any) => {
            if (week.contributionDays && Array.isArray(week.contributionDays)) {
              week.contributionDays.forEach((day: any) => {
                if (day.date) {
                  const count = day.contributionCount || day.count || 0
                  let level = 0
                  if (count > 0 && count <= 3) level = 1
                  else if (count >= 4 && count <= 6) level = 2
                  else if (count >= 7 && count <= 9) level = 3
                  else if (count >= 10) level = 4

                  days.push({
                    date: day.date,
                    count,
                    level,
                  })
                }
              })
            }
          })
        }

        // If no data found, try fallback: fetch from GitHub directly via CORS proxy
        if (days.length === 0) {
          console.warn('API returned no data, trying fallback method...')
          
          // Try multiple CORS proxy services as fallbacks
          const proxyServices = [
            `https://api.allorigins.win/get?url=${encodeURIComponent(
              `https://github.com/users/${username}/contributions`
            )}`,
            `https://corsproxy.io/?${encodeURIComponent(
              `https://github.com/users/${username}/contributions`
            )}`,
            `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(
              `https://github.com/users/${username}/contributions`
            )}`,
          ]

          for (const proxyUrl of proxyServices) {
            try {
              const proxyResponse = await fetchWithTimeout(proxyUrl, 8000)

              if (proxyResponse.ok) {
                const proxyData = await proxyResponse.json()
                // Different proxies return data in different formats
                const html = proxyData.contents || proxyData.data || proxyData

                if (html && typeof html === 'string') {
                  // Parse HTML using regex to find contribution data
                  const rectRegex = /<rect[^>]*data-date="([^"]+)"[^>]*data-count="(\d+)"[^>]*data-level="(\d+)"[^>]*>/gi
                  let match
                  const foundDays = new Map<string, ContributionDay>()

                  while ((match = rectRegex.exec(html)) !== null) {
                    const date = match[1]
                    const count = parseInt(match[2], 10)
                    const level = parseInt(match[3], 10)

                    if (date && !isNaN(count)) {
                      foundDays.set(date, { date, count, level })
                    }
                  }

                  if (foundDays.size > 0) {
                    days.push(...Array.from(foundDays.values()))
                    console.log('Fallback method succeeded, found', days.length, 'days')
                    break // Success, exit the loop
                  }
                }
              }
            } catch (fallbackError) {
              console.warn(`Fallback proxy failed, trying next...`, fallbackError)
              continue // Try next proxy
            }
          }
        }

        // Final check
        if (days.length === 0) {
          const errorMsg = data 
            ? `No contribution data found in API response. Please verify your username "${username}" is correct and has public contributions.`
            : `Failed to fetch contribution data. The API may be temporarily unavailable. Please try again later.`
          console.error('No contribution days found:', { 
            hasData: !!data, 
            dataKeys: data ? Object.keys(data) : [],
            username 
          })
          throw new Error(errorMsg)
        }

        // Sort days by date
        days.sort((a, b) => a.date.localeCompare(b.date))

        setContributions(days)

        // Calculate stats
        const calculatedStats = calculateStats(days)
        setStats(calculatedStats)
        setLoading(false)

        // Scroll to rightmost (most recent) after calendar is rendered
        setTimeout(() => {
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth
          }
        }, 100) // Small delay to ensure rendering
      } catch (err) {
        console.error('Error fetching contributions:', err)
        setError(`Failed to load contributions: ${err instanceof Error ? err.message : 'Unknown error'}`)
        setLoading(false)
      }
    }

    fetchContributions()
  }, [username])

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (hoveredDay && !(e.target as HTMLElement).closest('[data-contribution-day]')) {
        setHoveredDay(null)
      }
    }

    if (hoveredDay) {
      document.addEventListener('click', handleClickOutside)
      return () => {
        document.removeEventListener('click', handleClickOutside)
      }
    }
  }, [hoveredDay])

  // Calculate statistics from contribution data
  const calculateStats = (days: ContributionDay[]): ContributionStats => {
    let total = 0
    let longestStreak = 0
    let currentStreak = 0
    let longestStreakStart = ''
    let longestStreakEnd = ''
    let currentStreakStart = ''
    let lastContributionDate = ''

    let currentStreakCount = 0
    let longestStreakCount = 0
    let tempStreakStart = ''
    let tempStreakEnd = ''

    // Sort days by date
    const sortedDays = [...days].sort((a, b) => a.date.localeCompare(b.date))

    // Calculate longest streak (forward through time)
    sortedDays.forEach((day, index) => {
      total += day.count

      if (day.count > 0) {
        lastContributionDate = day.date

        // Longest streak
        if (index === 0 || tempStreakStart === '') {
          tempStreakStart = day.date
          tempStreakEnd = day.date
          longestStreakCount = 1
        } else {
          const prevDay = sortedDays[index - 1]
          const dayDate = new Date(day.date)
          const prevDate = new Date(prevDay.date)
          const daysDiff = Math.floor((dayDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24))

          if (daysDiff === 1) {
            tempStreakEnd = day.date
            longestStreakCount++
          } else {
            if (longestStreakCount > longestStreak) {
              longestStreak = longestStreakCount
              longestStreakStart = tempStreakStart
              longestStreakEnd = tempStreakEnd
            }
            tempStreakStart = day.date
            tempStreakEnd = day.date
            longestStreakCount = 1
          }
        }
      } else {
        // No contributions on this day
        if (longestStreakCount > longestStreak) {
          longestStreak = longestStreakCount
          longestStreakStart = tempStreakStart
          longestStreakEnd = tempStreakEnd
        }
        tempStreakStart = ''
        tempStreakEnd = ''
        longestStreakCount = 0
      }
    })

    // Check final longest streak
    if (longestStreakCount > longestStreak) {
      longestStreak = longestStreakCount
      longestStreakStart = tempStreakStart
      longestStreakEnd = tempStreakEnd
    }

    // Calculate current streak (backwards from most recent contribution)
    // GitHub counts consecutive days with contributions, working backwards from today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Create a map for quick lookup
    const contributionMap = new Map<string, number>()
    sortedDays.forEach(day => {
      contributionMap.set(day.date, day.count)
    })
    
    // Find the most recent day with contributions
    let mostRecentContributionDate: Date | null = null
    for (let i = sortedDays.length - 1; i >= 0; i--) {
      if (sortedDays[i].count > 0) {
        mostRecentContributionDate = new Date(sortedDays[i].date)
        mostRecentContributionDate.setHours(0, 0, 0, 0)
        break
      }
    }
    
    if (mostRecentContributionDate) {
      // Check if the most recent contribution is today or yesterday (within 1 day)
      const daysSinceLastContribution = Math.floor((today.getTime() - mostRecentContributionDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysSinceLastContribution <= 1) {
        // Count backwards from the most recent contribution day
        currentStreakCount = 1
        currentStreakStart = mostRecentContributionDate.toISOString().split('T')[0]
        
        // Work backwards day by day
        let currentDate = new Date(mostRecentContributionDate)
        currentDate.setDate(currentDate.getDate() - 1)
        
        while (currentDate >= new Date(sortedDays[0].date)) {
          const dateStr = currentDate.toISOString().split('T')[0]
          const count = contributionMap.get(dateStr) || 0
          
          if (count > 0) {
            currentStreakCount++
            currentStreakStart = dateStr
            currentDate.setDate(currentDate.getDate() - 1)
          } else {
            // No contribution on this day, streak is broken
            break
          }
        }
      }
    }

    currentStreak = currentStreakCount

    return {
      total,
      longestStreak,
      currentStreak,
      longestStreakStart,
      longestStreakEnd,
      currentStreakStart,
      lastContributionDate,
    }
  }

  // Generate calendar grid
  const generateCalendar = () => {
    if (contributions.length === 0) return null

    const weeks: ContributionDay[][] = []
    const today = new Date()
    const oneYearAgo = new Date(today)
    oneYearAgo.setFullYear(today.getFullYear() - 1)

    // Create a map for quick lookup
    const contributionMap = new Map<string, ContributionDay>()
    contributions.forEach((day) => {
      contributionMap.set(day.date, day)
    })

    // Generate all days in the past year
    const allDays: ContributionDay[] = []
    for (let d = new Date(oneYearAgo); d <= today; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0]
      const contribution = contributionMap.get(dateStr) || { date: dateStr, count: 0, level: 0 }
      allDays.push(contribution)
    }

    // Group into weeks (starting from Sunday)
    let currentWeek: ContributionDay[] = []
    allDays.forEach((day, index) => {
      const date = new Date(day.date)
      const dayOfWeek = date.getDay()

      if (dayOfWeek === 0 && currentWeek.length > 0) {
        weeks.push([...currentWeek])
        currentWeek = [day]
      } else {
        currentWeek.push(day)
      }

      // Push last week
      if (index === allDays.length - 1 && currentWeek.length > 0) {
        weeks.push(currentWeek)
      }
    })

    return weeks
  }

  const weeks = generateCalendar()
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  // Color scheme
  const colors = isDarkTheme
    ? {
        level0: '#161b22',
        level1: '#0e4429',
        level2: '#006d32',
        level3: '#26a641',
        level4: '#39d353',
      }
    : {
        level0: '#ebedf0',
        level1: '#9be9a8',
        level2: '#40c463',
        level3: '#30a14e',
        level4: '#216e39',
      }

  // Format date for display
  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A'
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  // Format date for tooltip (e.g., "November 27th")
  const formatDateForTooltip = (dateStr: string) => {
    if (!dateStr) return 'N/A'
    const date = new Date(dateStr)
    const day = date.getDate()
    const month = date.toLocaleDateString('en-US', { month: 'long' })
    
    // Add ordinal suffix
    const suffix = day === 1 || day === 21 || day === 31 ? 'st' :
                   day === 2 || day === 22 ? 'nd' :
                   day === 3 || day === 23 ? 'rd' : 'th'
    
    return `${month} ${day}${suffix}`
  }

  return (
    <section className="pt-12 pb-4 px-3 sm:px-6 bg-white dark:bg-[#101010]">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-[#0d1117] border border-gray-200 dark:border-[#30363d] rounded-xl p-4 sm:p-6 overflow-hidden shadow-sm dark:shadow-none">
          {loading && (
            <div className="text-center text-gray-400 dark:text-gray-500 py-12">
              Loading the data just for you.
            </div>
          )}

          {error && (
            <div className="text-center text-red-500 dark:text-red-400 py-12">{error}</div>
          )}

          {!loading && !error && weeks && (
            <>
              {/* Calendar Grid - Centered and Responsive */}
              <div
                ref={scrollContainerRef}
                className="w-full overflow-x-auto overflow-y-visible pb-2 flex justify-center"
                style={{
                  WebkitOverflowScrolling: 'touch',
                  scrollbarWidth: 'thin',
                }}
              >
                <div className="inline-block min-w-max mx-auto">
                  <div className="flex gap-1">
                    {/* Day labels - show Mon, Wed, Fri */}
                    <div className="flex flex-col gap-1 pr-2">
                      {weekDays.map((day, idx) => {
                        // Show only Mon (1), Wed (3), Fri (5)
                        const shouldShow = idx === 1 || idx === 3 || idx === 5
                        return (
                          <div
                            key={day}
                            className="text-xs text-gray-500 dark:text-gray-400"
                            style={{
                              height: '11px',
                              lineHeight: '11px',
                              visibility: shouldShow ? 'visible' : 'hidden',
                            }}
                          >
                            {day}
                          </div>
                        )
                      })}
                    </div>

                    {/* Calendar weeks */}
                    <div className="flex gap-1">
                      {weeks.map((week, weekIdx) => (
                        <div key={weekIdx} className="flex flex-col gap-1">
                          {week.map((day, dayIdx) => {
                            const colorKey = `level${day.level}` as keyof typeof colors
                            // Format tooltip: always show contributions count and date
                            const dateStr = day.date ? formatDateForTooltip(day.date) : 'Unknown date'
                            const tooltipText = day.count > 0
                              ? `${day.count} contribution${day.count === 1 ? '' : 's'} on ${dateStr}`
                              : `No contributions on ${dateStr}`
                            
                            const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
                              const rect = e.currentTarget.getBoundingClientRect()
                              setHoveredDay({
                                date: day.date,
                                count: day.count,
                                x: rect.left + rect.width / 2,
                                y: rect.top - 10,
                              })
                            }
                            
                            const handleMouseLeave = () => {
                              setHoveredDay(null)
                            }
                            
                            const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
                              const rect = e.currentTarget.getBoundingClientRect()
                              setHoveredDay({
                                date: day.date,
                                count: day.count,
                                x: rect.left + rect.width / 2,
                                y: rect.top - 10,
                              })
                            }
                            
                            return (
                              <div
                                key={`${day.date}-${dayIdx}`}
                                data-contribution-day
                                className="rounded-sm cursor-pointer hover:ring-2 hover:ring-gray-400 dark:hover:ring-gray-600 transition-all relative"
                                style={{
                                  width: '11px',
                                  height: '11px',
                                  backgroundColor: colors[colorKey],
                                  minWidth: '11px',
                                  minHeight: '11px',
                                }}
                                onMouseEnter={handleMouseEnter}
                                onMouseLeave={handleMouseLeave}
                                onClick={handleClick}
                                aria-label={tooltipText}
                              />
                            )
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Custom Tooltip - GitHub style */}
              {hoveredDay && (
                <div
                  className="fixed z-50 pointer-events-none"
                  style={{
                    left: `${hoveredDay.x}px`,
                    top: `${hoveredDay.y}px`,
                    transform: 'translate(-50%, -100%)',
                  }}
                >
                  <div className="bg-gray-900 dark:bg-[#161b22] text-white text-xs font-medium px-2.5 py-1.5 rounded shadow-lg whitespace-nowrap border border-gray-700 dark:border-[#30363d] mb-1">
                    {hoveredDay.count > 0
                      ? `${hoveredDay.count} contribution${hoveredDay.count === 1 ? '' : 's'} on ${formatDateForTooltip(hoveredDay.date)}`
                      : `No contributions on ${formatDateForTooltip(hoveredDay.date)}`}
                  </div>
                  {/* Tooltip arrow */}
                  <div
                    className="absolute top-full left-1/2 transform -translate-x-1/2"
                    style={{
                      width: 0,
                      height: 0,
                      borderLeft: '4px solid transparent',
                      borderRight: '4px solid transparent',
                      borderTop: isDarkTheme ? '4px solid rgb(22, 27, 34)' : '4px solid rgb(17, 24, 39)', // Match tooltip bg
                    }}
                  />
                </div>
              )}

              {/* Stats - Minimal and inline with GitHub icon */}
              {stats && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-[#30363d]">
                  <div className="flex flex-wrap items-center gap-3 sm:gap-5 justify-center">
                    <div className="text-center">
                      <span className="text-base font-semibold text-gray-900 dark:text-gray-100">
                        {stats.total.toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-1.5">contributions</span>
                    </div>

                    <div className="text-center">
                      <span className="text-base font-semibold text-gray-900 dark:text-gray-100">
                        {stats.longestStreak}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-1.5">day longest streak</span>
                    </div>

                    <div className="text-center">
                      <span className="text-base font-semibold text-gray-900 dark:text-gray-100">
                        {stats.currentStreak}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-1.5">day current streak</span>
                    </div>

                    {/* GitHub icon inline - vertically centered */}
                    <div className="flex-shrink-0 flex items-center">
                      <Link
                        to={`https://github.com/${username}`}
                        className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors inline-flex items-center"
                        aria-label="View on GitHub"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path
                            fillRule="evenodd"
                            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482 3.97-1.32 6.833-5.08 6.833-9.503C22 6.484 17.522 2 12 2z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              )}

            </>
          )}
        </div>
      </div>
    </section>
  )
}
