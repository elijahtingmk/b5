// O*NET Interest Profiler Short Form, reproduced verbatim from the paper
// version published by the National Center for O*NET Development:
//   https://www.onetcenter.org/dl_tools/ipsf/Interest_Profiler.pdf (v1)
//   https://www.onetcenter.org/dl_tools/ipsf/IP_Score_Report.pdf (v1.1)
// Used under CC BY-ND 4.0 (https://www.onetcenter.org/license_tools.html).
// The licence does not allow modified versions: do not reword, translate,
// add, remove or rescore items here. Changes would need the O*NET Tools
// Developer License, which also requires validating the modified tool.

// Stored with each result, so a later change of form is visible in exports.
export const RIASEC_FORM_VERSION = 'onet-ipsf-v1';

export type RiasecCode = 'R' | 'I' | 'A' | 'S' | 'E' | 'C';

export type RiasecArea = {
  code: RiasecCode;
  name: string;
  description: string;
  // Ten activities, in the order they appear on the paper form
  // (left column, then right column).
  items: string[];
};

export const riasecAreas: RiasecArea[] = [
  {
    code: 'R',
    name: 'Realistic',
    description:
      'Work involves building, repairing, maintaining, installing, driving, or working with hands. People with Realistic interests often like work that includes plants, animals, electronics, real-world materials like wood, the outdoors, machines, equipment, or tools.',
    items: [
      'Build kitchen cabinets',
      'Lay brick or tile',
      'Repair household appliances',
      'Raise fish in a fish hatchery',
      'Assemble electronic parts',
      'Drive a truck to deliver packages to offices and homes',
      'Test the quality of parts before shipment',
      'Repair and install locks',
      'Set up and operate machines to make products',
      'Put out forest fires'
    ]
  },
  {
    code: 'I',
    name: 'Investigative',
    description:
      'Work involves studying, researching, testing, analyzing, diagnosing, discovering, thinking, or problem solving. People with Investigative interests often like work that includes science, knowledge, laboratory settings, ideas, or facts.',
    items: [
      'Develop a new medicine',
      'Study ways to reduce water pollution',
      'Conduct chemical experiments',
      'Study the movement of planets',
      'Examine blood samples using a microscope',
      'Investigate the cause of a fire',
      'Develop a way to better predict the weather',
      'Work in a biology lab',
      'Invent a replacement for sugar',
      'Do laboratory tests to identify diseases'
    ]
  },
  {
    code: 'A',
    name: 'Artistic',
    description:
      'Work involves creating, performing, writing, designing, dancing, composing, or self-expression. People with Artistic interests often like work that includes art, media, music, theatre, or graphics.',
    items: [
      'Write books or plays',
      'Play a musical instrument',
      'Compose or arrange music',
      'Draw pictures',
      'Create special effects for movies',
      'Paint sets for plays',
      'Write scripts for movies or television shows',
      'Perform jazz or tap dance',
      'Sing in a band',
      'Edit movies'
    ]
  },
  {
    code: 'S',
    name: 'Social',
    description:
      'Work involves helping, teaching, educating, guiding, advising, or nurturing. People with Social interests often like work that includes people, service, social activities, health, or communication.',
    items: [
      'Teach an individual an exercise routine',
      'Help people with personal or emotional problems',
      'Give career guidance to people',
      'Perform rehabilitation therapy',
      'Do volunteer work at a non-profit organization',
      'Teach children how to play sports',
      'Teach sign language to people who are deaf or hard of hearing',
      'Help conduct a group therapy session',
      'Take care of children at a day-care center',
      'Teach a high-school class'
    ]
  },
  {
    code: 'E',
    name: 'Enterprising',
    description:
      'Work involves managing, supervising, negotiating, marketing, selling, leading, or directing. People with Enterprising interests often like work that includes employees, customers, products, business, law, or politics.',
    items: [
      'Buy and sell stocks and bonds',
      'Manage a retail store',
      'Operate a beauty salon or barber shop',
      'Manage a department within a large company',
      'Start your own business',
      'Negotiate business contracts',
      'Represent a client in a lawsuit',
      'Market a new line of clothing',
      'Sell merchandise at a department store',
      'Manage a clothing store'
    ]
  },
  {
    code: 'C',
    name: 'Conventional',
    description:
      'Work involves organizing, recording, filing, sorting, inspecting, or attention to detail. People with Conventional interests often like work that includes information, data, regulations, office environments, procedures, files, or rules.',
    items: [
      'Develop a spreadsheet using computer software',
      'Proofread records or forms',
      'Install software across computers on a large network',
      'Operate a calculator',
      'Keep shipping and receiving records',
      'Calculate the wages of employees',
      'Inventory supplies using a hand-held computer',
      'Record rent payments',
      'Keep inventory records',
      'Stamp, sort, and distribute mail for an organization'
    ]
  }
];

export const RIASEC_ITEM_COUNT = riasecAreas.reduce(
  (n, area) => n + area.items.length,
  0
);

export const riasecInstructions =
  'Read the 60 work activities below. Place a check in the box by the ' +
  'activities you would like to do. Do not think about how much ' +
  'education/training is needed or how much money you will make!';

export const riasecTieRule =
  'If there are ties, choose the interest with activities that you think ' +
  'are the best fit for you.';

export const jobZones = [
  {
    zone: 1,
    title: 'Careers need Little or No Preparation',
    points: [
      'No previous skills, knowledge, or experience is needed.',
      'May require a high school diploma or GED certificate.',
      'May need from a few days to a few months of training.'
    ]
  },
  {
    zone: 2,
    title: 'Careers need Some Preparation',
    points: [
      'Usually need a high school diploma.',
      'Some previous skills, knowledge, or experience is usually needed.',
      'May need from a few months to one year of working with experienced employees.'
    ]
  },
  {
    zone: 3,
    title: 'Careers need Medium Preparation',
    points: [
      'Usually requires training in vocational schools, related on–the-job experience, or an associate’s degree.',
      'Previous skills, knowledge, or experience needed.',
      'Need one or two years of training.'
    ]
  },
  {
    zone: 4,
    title: 'Careers need High Preparation',
    points: [
      'Most careers require a four-year bachelor’s degree, but some do not.',
      'Long-term skills, knowledge, or experience needed.',
      'Need several years of work-related experience and training.'
    ]
  },
  {
    zone: 5,
    title: 'Careers need Extensive Preparation',
    points: [
      'Most of these careers need a graduate school education.',
      'Extensive skills, knowledge, and experience are needed; many requiring more than five years of experience.',
      'May need some on-the-job training; however, the person will usually have the needed skills, knowledge, work-related experience, and training before starting the job.'
    ]
  }
];

export const onetLinks = {
  careerListings:
    'https://www.onetcenter.org/dl_tools/ipsf/IP_Career_Listings.pdf',
  interestBrowse: 'https://www.mynextmove.org/find/interests',
  myNextMove: 'https://www.mynextmove.org/',
  tools: 'https://www.onetcenter.org/tools.html',
  usdolEta: 'https://www.doleta.gov/',
  license: 'https://creativecommons.org/licenses/by-nd/4.0/'
};

// Answers are stored as a 60-character string of 0s and 1s, one per item in
// the order above. A score is the number of checks in an area (0 to 10).
export const answersPattern = new RegExp(`^[01]{${RIASEC_ITEM_COUNT}}$`);

export type RiasecScore = { code: RiasecCode; name: string; score: number };

export function scoreRiasec(answers: string): RiasecScore[] {
  let offset = 0;
  return riasecAreas.map((area) => {
    const slice = answers.slice(offset, offset + area.items.length);
    offset += area.items.length;
    return {
      code: area.code,
      name: area.name,
      score: slice.split('').filter((c) => c === '1').length
    };
  });
}
