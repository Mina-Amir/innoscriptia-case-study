import { z } from 'zod';

const guardianFieldsSchema = z.object({
  headline: z.string().optional(),
  trailText: z.string().optional(),
  thumbnail: z.string().optional(),
  byline: z.string().optional(),
});

const guardianResultSchema = z.object({
  id: z.string(),
  webTitle: z.string(),
  webUrl: z.string(),
  webPublicationDate: z.string(),
  sectionName: z.string().optional(),
  fields: guardianFieldsSchema.optional(),
});

export const guardianResponseSchema = z.object({
  response: z.object({
    status: z.string(),
    total: z.number(),
    results: z.array(guardianResultSchema),
  }),
});

export type GuardianResult = z.infer<typeof guardianResultSchema>;
export type GuardianResponse = z.infer<typeof guardianResponseSchema>;
