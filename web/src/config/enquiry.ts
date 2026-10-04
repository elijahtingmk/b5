// The contact form on drelijah.org posts here. Option ids must match the
// values in contact.html on drelijah.org.

// Version of the drelijah.org privacy notice shown beside the form; stored
// with each enquiry. Change it when that notice changes.
export const MAIN_SITE_NOTICE_VERSION = '2026-10-04';

export const allowedOrigins = [
  'https://drelijah.org',
  'https://www.drelijah.org'
];

export const needs = {
  prisma: 'PRisMA compliance (Stage I / II / III)',
  resilience: 'Workplace Resilience training',
  leadership: 'Earned Leadership™',
  coaching: '1:1 coaching',
  unsure: 'Not sure yet'
} as const;

export const sizes = {
  me: 'Just me (coaching)',
  'under-30': 'Under 30',
  '30-100': '30–100',
  '100-500': '100–500',
  '500-plus': '500+'
} as const;

export const hrdCorp = { yes: 'Yes', no: 'No', unsure: 'Not sure' } as const;
