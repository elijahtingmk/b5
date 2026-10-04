import '@/styles/globals.css';
import { Metadata, Viewport } from 'next';
import { fontSans, fontSerif } from '@/config/fonts';
import { Providers } from '../providers';
import { Navbar } from '@/components/navbar';
import clsx from 'clsx';
import Footer from '@/components/footer';
import { ThemeProviderProps } from 'next-themes/dist/types';
import { GoogleAnalytics } from '@next/third-parties/google';
import { basePath, getNavItems, locales, siteConfig } from '@/config/site';
import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { isRtlLang } from 'rtl-detect';
import Script from 'next/script';
import CookieBanner from '@/components/cookie-consent';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;

  const { locale } = params;

  const t = await getTranslations({ locale, namespace: 'frontpage' });
  const s = await getTranslations({ locale, namespace: 'seo' });
  const alternatesLang = locales.reduce((a, v) => ({ ...a, [v]: `/${v}` }), {});
  return {
    title: {
      default: `${t('title')} · drelijah.org`,
      template: `%s · drelijah.org`
    },
    description: t('seo.description'),
    keywords: s('keywords'),
    authors: [{ name: siteConfig.creator, url: siteConfig.links.practice }],
    icons: {
      icon: [
        { url: '/favicon.svg', type: 'image/svg+xml' },
        { url: '/favicon.ico', sizes: '32x32' }
      ],
      apple: '/apple-touch-icon.png'
    },
    metadataBase: new URL(basePath),
    // alternates: {
    //   canonical: '/',
    //   languages: alternatesLang
    // },
    openGraph: {
      type: 'website',
      url: basePath,
      title: t('seo.title'),
      description: t('seo.description'),
      images: {
        url: `${basePath}/og-image.png`,
        alt: 'Big Five Snapshot by Elijah Ting, drelijah.org'
      }
    },
    twitter: {
      title: t('seo.title'),
      card: 'summary_large_image',
      description: t('seo.description'),
      site: basePath,
      creator: siteConfig.creator,
      images: {
        url: `${basePath}/og-image.png`,
        alt: 'Big Five Snapshot by Elijah Ting, drelijah.org'
      }
    }
  };
}
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fbf8f3' },
    { media: '(prefers-color-scheme: dark)', color: '#0c1424' }
  ]
};

export default async function RootLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const params = await props.params;

  const { locale } = params;

  const { children } = props;

  const gaId = process.env.NEXT_PUBLIC_ANALYTICS_ID || '';
  setRequestLocale(locale);
  const direction = isRtlLang(locale) ? 'rtl' : 'ltr';

  const navItems = await getNavItems({ locale, linkType: 'navItems' });
  const navMenuItems = await getNavItems({ locale, linkType: 'navMenuItems' });
  const footerLinks = await getNavItems({ locale, linkType: 'footerLinks' });

  return (
    <html lang={locale} dir={direction} suppressHydrationWarning>
      <head />
      <body
        className={clsx(
          'min-h-screen bg-background font-sans antialiased',
          fontSans.variable,
          fontSerif.variable
        )}
      >
        <Providers
          themeProps={
            { attribute: 'class', defaultTheme: 'light' } as ThemeProviderProps
          }
        >
          <div className='relative flex flex-col h-screen'>
            <Navbar navItems={navItems} navMenuItems={navMenuItems} />
            <main className='container mx-auto max-w-7xl pt-16 px-6 flex-grow'>
              {children}
              <CookieBanner />
            </main>
            <Footer footerLinks={footerLinks} />
          </div>
        </Providers>
        <Script src='/sw.js' strategy='beforeInteractive' />
      </body>
      {gaId && <GoogleAnalytics gaId={gaId} />}
    </html>
  );
}
