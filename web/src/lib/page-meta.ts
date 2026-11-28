import type { Metadata } from 'next';
import { basePath, siteConfig } from '@/config/site';

// English is the default locale and is served without a prefix. /en redirects
// to /, so the canonical URL omits /en. Other locales keep /<locale>.
const DEFAULT_LOCALE = 'en';

const ogImage = {
  url: `${basePath}/og-image.png`,
  alt: 'Big Five Snapshot by Dr Elijah Ting · drelijah.org'
};

export function metaDescription(description: string): string {
  const clean = description.replace(/\s+/g, ' ').trim();
  if (clean.length <= 155) return clean;
  const cut = clean.slice(0, 154);
  const space = cut.lastIndexOf(' ');
  const base = (space > 80 ? cut.slice(0, space) : cut).replace(/[.,;:]+$/, '');
  return `${base}…`;
}

export function pageMeta({
  locale,
  path = '',
  title,
  description,
  noindex = false
}: {
  locale: string;
  path?: string;
  title: string;
  description: string;
  noindex?: boolean;
}): Metadata {
  const branded = `${title} · drelijah.org`;
  const prefix = locale === DEFAULT_LOCALE ? '' : `/${locale}`;
  const url = `${basePath}${prefix}${path}`;
  const summary = metaDescription(description);
  const metadata: Metadata = {
    title: { absolute: branded },
    description: summary,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      url,
      title: branded,
      description: summary,
      images: ogImage
    },
    twitter: {
      card: 'summary_large_image',
      title: branded,
      description: summary,
      site: basePath,
      creator: siteConfig.creator,
      images: ogImage
    }
  };
  if (noindex) metadata.robots = { index: false };
  return metadata;
}
