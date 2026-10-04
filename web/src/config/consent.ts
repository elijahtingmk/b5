// Wording shown next to the opt-in boxes on the results page. The exact text
// a person agreed to is stored with their details, so change NOTICE_VERSION
// whenever this wording or the privacy page changes.
export const NOTICE_VERSION = '2026-10-04';

export const practitioner = {
  name: 'Elijah Ting, ED – L&D',
  legalName: 'Ting Moi Kieng',
  email: 'elijah@drelijah.org',
  website: 'https://drelijah.org',
  location: 'Sibu, Sarawak, Malaysia'
};

export const contactConsentText =
  'Yes, Elijah Ting (drelijah.org) may contact me by email about coaching ' +
  'and workplace programmes. I can withdraw this at any time.';

export const resultConsentText =
  'Elijah Ting may also view my test result to prepare for our ' +
  'conversation. It will not be shared with my employer or anyone else.';

export const leadRoles = [
  { id: 'hr-osh', label: 'HR, L&D or OSH lead' },
  { id: 'leader', label: 'Manager or team leader' },
  { id: 'individual', label: 'Individual' }
] as const;
