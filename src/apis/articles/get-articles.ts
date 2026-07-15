import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import axios, { isAxiosError } from 'axios';
import type { z } from 'zod';
import { queryKeys } from '@/apis/keys';
import type {
  Article,
  ArticleCategory,
  ArticleSource,
  ArticlesResult,
  GetArticlesParams,
} from '@/apis/articles/schemas/article';
import { DEFAULT_ARTICLE_SOURCES } from '@/apis/articles/schemas/article';
import { guardianResponseSchema } from '@/apis/articles/schemas/guardian';
import type { GuardianResult } from '@/apis/articles/schemas/guardian';
import { newsApiResponseSchema } from '@/apis/articles/schemas/newsapi';
import type { NewsApiArticle } from '@/apis/articles/schemas/newsapi';
import { nytResponseSchema } from '@/apis/articles/schemas/nyt';
import type { NytDoc } from '@/apis/articles/schemas/nyt';
import { env } from '@/helpers/env';

const NEWS_API_URL = 'https://newsapi.org/v2/everything';
const GUARDIAN_URL = 'https://content.guardianapis.com/search';
const NYT_URL = 'https://api.nytimes.com/svc/search/v2/articlesearch.json';

const PAGE_SIZE = 20;

const GUARDIAN_SECTION_MAP: Record<ArticleCategory, string> = {
  business: 'business',
  technology: 'technology',
  science: 'science',
  sports: 'sport',
  health: 'society',
  entertainment: 'culture',
  world: 'world',
};

const NYT_FQ_MAP: Record<ArticleCategory, string> = {
  business: 'news_desk:("Business")',
  technology: 'section_name:("Technology")',
  science: 'section_name:("Science")',
  sports: 'section_name:("Sports")',
  health: 'section_name:("Health")',
  entertainment: 'section_name:("Arts")',
  world: 'section_name:("World")',
};

type UseGetArticlesOptions = Omit<
  UseQueryOptions<ArticlesResult>,
  'queryKey' | 'queryFn'
>;

async function getJson<T>(
  url: string,
  schema: z.ZodType<T>,
  params?: Record<string, string | number | undefined>,
): Promise<T> {
  const { data } = await axios.get(url, { params });
  return schema.parse(data);
}

function toNytDate(date?: string): string | undefined {
  if (!date) return undefined;
  return date.replace(/-/g, '');
}

function buildNewsApiQuery(query: string, category?: ArticleCategory): string {
  if (!category) return query;
  return `${query} ${category}`;
}

function mapNewsApiArticle(article: NewsApiArticle): Article {
  return {
    id: article.url,
    title: article.title,
    description: article.description ?? '',
    url: article.url,
    imageUrl: article.urlToImage ?? undefined,
    publishedAt: article.publishedAt,
    author: article.author ?? undefined,
    source: 'newsapi',
  };
}

function mapGuardianArticle(result: GuardianResult): Article {
  return {
    id: result.id,
    title: result.fields?.headline ?? result.webTitle,
    description: result.fields?.trailText ?? '',
    url: result.webUrl,
    imageUrl: result.fields?.thumbnail,
    publishedAt: result.webPublicationDate,
    author: result.fields?.byline,
    source: 'guardian',
    category: result.sectionName,
  };
}

function mapNytArticle(doc: NytDoc): Article {
  const image = doc.multimedia.find(
    (item) => item.type === 'image' && item.subtype === 'xlarge',
  ) ?? doc.multimedia.find((item) => item.type === 'image');

  return {
    id: doc._id,
    title: doc.headline.main,
    description: doc.abstract,
    url: doc.web_url,
    imageUrl: image ? `https://www.nytimes.com/${image.url}` : undefined,
    publishedAt: doc.pub_date,
    author: doc.byline?.original,
    source: 'nyt',
    category: doc.section_name,
  };
}

async function fetchNewsApiArticles(
  params: GetArticlesParams,
): Promise<Article[]> {
  const response = await getJson(NEWS_API_URL, newsApiResponseSchema, {
    q: buildNewsApiQuery(params.query, params.category),
    from: params.dateFrom,
    to: params.dateTo,
    pageSize: PAGE_SIZE,
    page: params.page ?? 1,
    apiKey: env.newsApiKey,
  });

  return response.articles.map(mapNewsApiArticle);
}

async function fetchGuardianArticles(
  params: GetArticlesParams,
): Promise<Article[]> {
  const response = await getJson(GUARDIAN_URL, guardianResponseSchema, {
    q: params.query,
    'from-date': params.dateFrom,
    'to-date': params.dateTo,
    section: params.category
      ? GUARDIAN_SECTION_MAP[params.category]
      : undefined,
    'page-size': PAGE_SIZE,
    page: params.page ?? 1,
    'show-fields': 'headline,trailText,thumbnail,byline',
    'api-key': env.guardianApiKey,
  });

  return response.response.results.map(mapGuardianArticle);
}

async function fetchNytArticles(params: GetArticlesParams): Promise<Article[]> {
  const response = await getJson(NYT_URL, nytResponseSchema, {
    q: params.query,
    begin_date: toNytDate(params.dateFrom),
    end_date: toNytDate(params.dateTo),
    fq: params.category ? NYT_FQ_MAP[params.category] : undefined,
    page: params.page ?? 1,
    'api-key': env.nytApiKey,
  });

  return response.response.docs.map(mapNytArticle);
}

const SOURCE_FETCHERS: Record<
  ArticleSource,
  (params: GetArticlesParams) => Promise<Article[]>
> = {
  newsapi: fetchNewsApiArticles,
  guardian: fetchGuardianArticles,
  nyt: fetchNytArticles,
};

function getErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    return data?.message ?? error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Unknown error';
}

export async function fetchArticles(
  params: GetArticlesParams,
): Promise<ArticlesResult> {
  const sources = params.sources ?? DEFAULT_ARTICLE_SOURCES;
  const results = await Promise.allSettled(
    sources.map(async (source) => {
      const articles = await SOURCE_FETCHERS[source](params);
      return { source, articles };
    }),
  );

  const articles: Article[] = [];
  const errors: ArticlesResult['errors'] = [];

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    const source = sources[i];

    if (result.status === 'fulfilled') {
      articles.push(...result.value.articles);
      continue;
    }

    errors.push({
      source,
      message: getErrorMessage(result.reason),
    });
  }

  articles.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );

  return { articles, errors };
}

export function useGetArticles(
  params: GetArticlesParams,
  options?: UseGetArticlesOptions,
) {
  return useQuery({
    queryKey: [
      queryKeys.ARTICLES,
      params.query,
      params.dateFrom ?? '',
      params.dateTo ?? '',
      params.category ?? '',
      (params.sources ?? DEFAULT_ARTICLE_SOURCES).join(','),
      params.page ?? 1,
    ],
    queryFn: () => fetchArticles(params),
    ...options,
  });
}
