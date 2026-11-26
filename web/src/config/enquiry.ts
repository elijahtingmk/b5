// The contact forms on drelijah.org and types.drelijah.org post here. Option
// ids must match the values in contact.html on those sites.

// Version of the drelijah.org privacy notice shown beside the form; stored
// with each enquiry. Change it when that notice changes.
export const MAIN_SITE_NOTICE_VERSION = '2026-10-04';

export const allowedOrigins = [
  'https://drelijah.org',
  'https://www.drelijah.org',
  'https://types.drelijah.org'
];

// The 16-type personality profile site. Enquiries from it are labelled with
// its hostname so they can be told apart from drelijah.org ones.
export const TYPES_SITE_ORIGIN = 'https://types.drelijah.org';
export const TYPES_SITE_HOST = new URL(TYPES_SITE_ORIGIN).host;

export const needs = {
  prisma: 'PRisMA compliance (Stage I / II / III)',
  resilience: 'Workplace Resilience training',
  leadership: 'Earned Leadership™',
  types16: '16-type personality profile',
  bigfive: 'Big Five assessment',
  coaching: '1:1 coaching',
  'career-direct': 'Career & Role-Fit Advisory (Career Direct®)',
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
