import { MetadataRoute } from 'next';
import { basePath, locales } from '@/config/site';

const articles = [
  'agreeableness',
  'conscientiousness',
  'extraversion',
  'neuroticism',
  'openness',
  'conscientiousness_longevity',
  'bigfive_relationships',
  'personality_diseases',
  'the_dark_of_personality',
  'link_between_personality_trais_psychological_needs'
];

export default function sitemap(): MetadataRoute.Sitemap {
  const alternatesPageLang = (path: string = '') =>
    locales.reduce((a, v) => ({ ...a, [v]: basePath + `/${v}${path}` }), {});
  return [
    {
      url: basePath,
      lastModified: new Date(),
      alternates: {
        languages: alternatesPageLang()
      }
    },
    {
      url: basePath,
      lastModified: new Date(),
      alternates: {
        languages: alternatesPageLang('/result')
      }
    },
    {
      url: `${basePath}/test`,
      lastModified: new Date()
      // add lang
    },
    {
      url: `${basePath}/about`,
      lastModified: new Date()
    },
    {
      url: `${basePath}/faq`,
      lastModified: new Date()
    },
    {
      url: `${basePath}/privacy`,
      lastModified: new Date()
    },
    {
      url: `${basePath}/articles`,
      lastModified: new Date()
    },
    ...articles.map((article) => ({
      url: `${basePath}/articles/${article}`,
      lastModified: new Date()
    }))
  ];
}
