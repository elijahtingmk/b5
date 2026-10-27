// Wording shown next to the opt-in boxes on the results page. The exact text
// a person agreed to is stored with their details, so change NOTICE_VERSION
// whenever this wording or the privacy page changes.
export const NOTICE_VERSION = '2026-10-27.1';

export const practitioner = {
  name: 'Dr Elijah Ting, ED – L&D',
  // Public credential line. "Dr" has no full stop. Keep this identical to `name`.
  displayName: 'Dr Elijah Ting, ED – L&D',
  legalName: 'Ting Moi Kieng',
  email: 'elijah@drelijah.org',
  website: 'https://drelijah.org',
  location: 'Sibu, Sarawak, Malaysia'
};

export const contactConsentText =
  'Yes, Dr Elijah Ting (drelijah.org) may contact me by email about coaching ' +
  'and workplace programmes. I can withdraw this at any time.';

export const resultConsentText =
  'Dr Elijah Ting may also view my test result to prepare for our ' +
  'conversation. It will not be shared with my employer or anyone else.';

export const leadRoles = [
  { id: 'hr-osh', label: 'HR, L&D or OSH lead' },
  { id: 'leader', label: 'Manager or team leader' },
  { id: 'individual', label: 'Individual' }
] as const;
