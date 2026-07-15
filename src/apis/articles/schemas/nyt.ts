import { z } from 'zod';

const nytMultimediaSchema = z.object({
  url: z.string(),
  format: z.string(),
  height: z.number(),
  width: z.number(),
  type: z.string(),
  subtype: z.string(),
});

const nytDocSchema = z.object({
  _id: z.string(),
  headline: z.object({
    main: z.string(),
  }),
  abstract: z.string(),
  web_url: z.string(),
  pub_date: z.string(),
  byline: z
    .object({
      original: z.string().optional(),
    })
    .optional(),
  multimedia: z.array(nytMultimediaSchema).default([]),
  section_name: z.string().optional(),
});

export const nytResponseSchema = z.object({
  status: z.string(),
  response: z.object({
    docs: z.array(nytDocSchema),
    meta: z
      .object({
        hits: z.number(),
      })
      .optional(),
  }),
});

export type NytDoc = z.infer<typeof nytDocSchema>;
export type NytResponse = z.infer<typeof nytResponseSchema>;
