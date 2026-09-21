import { z } from 'zod'

const zodIssueSchema = z.object({
  code: z.string(),
  field: z.string(),
  message: z.string()
})

export const zodErrorSchema = z.object({
  name: z.string(),
  message: z.string(),
  fields: z.array(zodIssueSchema)
})
