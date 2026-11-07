// Writes public/contributions.json from GitHub's official GraphQL API.
// Run by .github/workflows/contributions.yml; needs GH_TOKEN. Keeps the old file if anything fails.
import { readFileSync, writeFileSync } from 'node:fs'

const user = JSON.parse(readFileSync('src/data/site.json', 'utf8')).ghUser
const token = process.env.GH_TOKEN
if (!token) { console.error('GH_TOKEN not set'); process.exit(1) }

const query = `query($u:String!){user(login:$u){contributionsCollection{contributionCalendar{weeks{contributionDays{date contributionCount contributionLevel}}}}}}`
const res = await fetch('https://api.github.com/graphql', {
  method: 'POST',
  headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json', 'user-agent': 'my-website-contributions' },
  body: JSON.stringify({ query, variables: { u: user } }),
})
const json = await res.json()
const weeks = json?.data?.user?.contributionsCollection?.contributionCalendar?.weeks
if (!res.ok || !weeks?.length) { console.error('GitHub API failed:', res.status, JSON.stringify(json).slice(0, 300)); process.exit(1) }

const lv = { NONE: 0, FIRST_QUARTILE: 1, SECOND_QUARTILE: 2, THIRD_QUARTILE: 3, FOURTH_QUARTILE: 4 }
const days = weeks.flatMap(w => w.contributionDays).map(d => ({ date: d.date, count: d.contributionCount, level: lv[d.contributionLevel] ?? 0 }))
writeFileSync('public/contributions.json', JSON.stringify({ user, updated: new Date().toISOString(), days }) + '\n')
console.log(`wrote ${days.length} days for ${user}`)
