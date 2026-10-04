import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Big Five Snapshot · drelijah.org',
    short_name: 'Big Five',
    description:
      'A free Big Five personality snapshot from Elijah Ting, ED – L&D (drelijah.org).',
    start_url: '/',
    display: 'standalone',
    background_color: '#fbf8f3',
    theme_color: '#0c1424',
    icons: [
      { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
      {
        src: '/icon-maskable-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable'
      }
    ]
  };
}
