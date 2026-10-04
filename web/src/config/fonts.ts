import {
  Fira_Code as FontMono,
  Newsreader as FontSerif,
  Source_Sans_3 as FontSans
} from 'next/font/google';

// The same pairing as drelijah.org: Newsreader for headings, Source Sans 3
// for body text.
export const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans'
});

export const fontSerif = FontSerif({
  subsets: ['latin'],
  variable: '--font-serif'
});

export const fontMono = FontMono({
  subsets: ['latin'],
  variable: '--font-mono'
});
