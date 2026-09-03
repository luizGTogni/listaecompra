import { z } from 'zod'

const zodIssueSchema = z.object({
  code: z.string(),
  path: z.array(z.union([z.string(), z.number()])),
  message: z.string()
})

export const zodErrorSchema = z.object({
  name: z.string(),
  message: z.string(),
  issues: z.array(zodIssueSchema)
})
