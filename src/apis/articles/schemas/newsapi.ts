import { z } from 'zod';

const newsApiArticleSchema = z.object({
  source: z.object({
    id: z.string().nullable(),
    name: z.string(),
  }),
  author: z.string().nullable(),
  title: z.string(),
  description: z.string().nullable(),
  url: z.string(),
  urlToImage: z.string().nullable(),
  publishedAt: z.string(),
  content: z.string().nullable(),
});

export const newsApiResponseSchema = z.object({
  status: z.string(),
  totalResults: z.number(),
  articles: z.array(newsApiArticleSchema),
});

export type NewsApiArticle = z.infer<typeof newsApiArticleSchema>;
export type NewsApiResponse = z.infer<typeof newsApiResponseSchema>;
