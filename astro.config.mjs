import { defineConfig } from 'astro/config'
import vercel from '@astrojs/vercel'
import { unified } from '@astrojs/markdown-remark'
import rehypeLog from './src/lib/rehype-log.mjs'

// Static site. Only src/pages/api/* run as serverless functions on Vercel.
export default defineConfig({
  site: 'https://tejvirmann.com',
  adapter: vercel(),
  markdown: { processor: unified({ rehypePlugins: [rehypeLog] }) },
})
