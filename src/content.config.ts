import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'astro/zod'
import { KIND_IDS } from './lib/kinds'

const logs = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/logs' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.coerce.date(),
      description: z.string().default(''),
      /** blog tags shown on the log page (Projects, Drawing, ...) */
      tags: z.array(z.string()).default([]),
      /** cover picture; used for cards and the shop. Optional: logs without one get a generated tile */
      image: image().optional(),
      /** move this picture of the log's gallery (1 = the cover) to the front so it opens first */
      defaultPic: z.number().int().min(1).optional(),
      imagePosition: z.string().optional(),
      kinds: z.array(z.enum(KIND_IDS)).default([]),
      /** true = this log is a project shown on the home page and /projects */
      onSite: z.boolean().default(false),
      cardTitle: z.string().optional(),
      /** software logs: link back to the GitHub repo and its main language */
      repo: z.url().optional(),
      lang: z.string().optional(),
    }),
})

export const collections = { logs }
