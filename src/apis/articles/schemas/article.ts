import { z } from 'zod';

export const articleSourceSchema = z.enum(['newsapi', 'guardian', 'nyt']);

export const articleCategorySchema = z.enum([
  'business',
  'technology',
  'science',
  'sports',
  'health',
  'entertainment',
  'world',
]);

export const articleSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  url: z.string(),
  imageUrl: z.string().optional(),
  publishedAt: z.string(),
  author: z.string().optional(),
  source: articleSourceSchema,
  category: z.string().optional(),
});

export const getArticlesParamsSchema = z.object({
  query: z.string(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  category: articleCategorySchema.optional(),
  sources: z.array(articleSourceSchema).optional(),
  page: z.number().optional(),
});

export const articleErrorSchema = z.object({
  source: articleSourceSchema,
  message: z.string(),
});

export const articlesResultSchema = z.object({
  articles: z.array(articleSchema),
  errors: z.array(articleErrorSchema),
});

export type ArticleSource = z.infer<typeof articleSourceSchema>;
export type ArticleCategory = z.infer<typeof articleCategorySchema>;
export type Article = z.infer<typeof articleSchema>;
export type GetArticlesParams = z.infer<typeof getArticlesParamsSchema>;
export type ArticleError = z.infer<typeof articleErrorSchema>;
export type ArticlesResult = z.infer<typeof articlesResultSchema>;

export const DEFAULT_ARTICLE_SOURCES: ArticleSource[] = [
  'newsapi',
  'guardian',
  'nyt',
];
