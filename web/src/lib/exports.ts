const domainScore = (domain: string, name: string) =>
  `SUM(CASE WHEN json_extract(a.value, '$.domain') = '${domain}' ` +
  `THEN json_extract(a.value, '$.score') END) AS ${name}`;

// The 30 facets (6 per domain) of the IPIP-NEO-120, named as in the site's
// result report. Each facet is the sum of its 4 answers, from 4 to 20.
const facets: [domain: string, names: string[]][] = [
  [
    'O',
    [
      'Imagination',
      'Artistic Interests',
      'Emotionality',
      'Adventurousness',
      'Intellect',
      'Liberalism'
    ]
  ],
  [
    'C',
    [
      'Self-Efficacy',
      'Orderliness',
      'Dutifulness',
      'Achievement-Striving',
      'Self-Discipline',
      'Cautiousness'
    ]
  ],
  [
    'E',
    [
      'Friendliness',
      'Gregariousness',
      'Assertiveness',
      'Activity Level',
      'Excitement-Seeking',
      'Cheerfulness'
    ]
  ],
  [
    'A',
    ['Trust', 'Morality', 'Altruism', 'Cooperation', 'Modesty', 'Sympathy']
  ],
  [
    'N',
    [
      'Anxiety',
      'Anger',
      'Depression',
      'Self-Consciousness',
      'Immoderation',
      'Vulnerability'
    ]
  ]
];

const facetColumns = facets
  .flatMap(([domain, names]) =>
    names.map(
      (name, i) =>
        `SUM(CASE WHEN json_extract(a.value, '$.domain') = '${domain}' ` +
        `AND json_extract(a.value, '$.facet') = ${i + 1} ` +
        `THEN json_extract(a.value, '$.score') END) AS "${domain}${i + 1} ${name}"`
    )
  )
  .join(',\n      ');

export const exportQueries = {
  results: `SELECT r.id, r.date_stamp, r.lang, r.time_elapsed AS seconds,
      ${domainScore('O', 'openness')},
      ${domainScore('C', 'conscientiousness')},
      ${domainScore('E', 'extraversion')},
      ${domainScore('A', 'agreeableness')},
      ${domainScore('N', 'neuroticism')},
      ${facetColumns}
    FROM results r, json_each(r.answers) a
    GROUP BY r.id ORDER BY r.date_stamp DESC`,
  riasec: `SELECT id, created_at, form_version, time_elapsed AS seconds,
      realistic, investigative, artistic, social, enterprising, conventional,
      -- As text Excel will not turn into a number: x = checked, . = not.
      replace(replace(answers, '0', '.'), '1', 'x')
        AS "activities (60, form order, x = checked)"
    FROM riasec_results ORDER BY created_at DESC`,
  leads: `SELECT created_at, name, email, role, locale, result_test,
      result_id, notice_version, contact_consent_text, result_consent_text
    FROM leads ORDER BY created_at DESC`,
  feedback: `SELECT created_at, name, email, message
    FROM feedback ORDER BY created_at DESC`,
  enquiries: `SELECT created_at, name, email, phone, organisation, need, size,
      hrd_corp, message, source_page, notice_version
    FROM enquiries ORDER BY created_at DESC`
} as const;

export type ExportTable = keyof typeof exportQueries;

export const exportTables: { id: ExportTable; label: string }[] = [
  { id: 'enquiries', label: 'Scoping-call requests (drelijah.org)' },
  { id: 'results', label: 'Big Five test results (with trait scores)' },
  { id: 'riasec', label: 'Career interest results (RIASEC scores)' },
  { id: 'leads', label: 'Enquiries (people who left their details)' },
  { id: 'feedback', label: 'Feedback messages' }
];
