import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  TYPES_SITE_HOST,
  TYPES_SITE_ORIGIN,
  needs
} from '../src/config/enquiry.ts';
import {
  escapeHtml,
  formatStoredDate,
  leadMatches,
  renderAdminPage
} from '../src/lib/admin-page.ts';
import { toCsv } from '../src/lib/csv.ts';
import {
  adminCountsSql,
  exportQueries,
  exportTables,
  typesLeadsListSql,
  typesLeadsWhere
} from '../src/lib/exports.ts';
import {
  TYPE_DETAIL_MAX,
  enquiryReturnLocation,
  normaliseTypeCode,
  sharedTypeFromForm,
  sourcePageFor,
  typeAlertLines
} from '../src/lib/type-share.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const CODES = [
  'ENTJ',
  'ENTP',
  'ENFJ',
  'ENFP',
  'ESTJ',
  'ESTP',
  'ESFJ',
  'ESFP',
  'INTJ',
  'INTP',
  'INFJ',
  'INFP',
  'ISTJ',
  'ISTP',
  'ISFJ',
  'ISFP'
];

function migrate() {
  const db = new DatabaseSync(':memory:');
  const dir = join(root, 'migrations');
  for (const name of readdirSync(dir).sort()) {
    if (name.endsWith('.sql')) db.exec(readFileSync(join(dir, name), 'utf8'));
  }
  return db;
}

function insertEnquiry(db, row) {
  db.prepare(
    `INSERT INTO enquiries (name, email, organisation, need, size, hrd_corp,
       phone, message, source_page, notice_version, type_code, type_detail)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    row.name,
    row.email,
    row.organisation ?? null,
    row.need,
    row.size ?? null,
    row.hrd ?? null,
    row.phone ?? null,
    row.message ?? null,
    row.source_page ?? null,
    '2026-10-04',
    row.type_code ?? null,
    row.type_detail ?? null
  );
}

test('type codes are the sixteen letter pairs only', () => {
  assert.equal(CODES.length, 16);
  for (const code of CODES) {
    assert.equal(normaliseTypeCode(code), code);
    assert.equal(normaliseTypeCode(code.toLowerCase()), code);
    assert.equal(normaliseTypeCode(`  ${code}  `), code);
  }
  for (const bad of [
    'ENTX',
    'ENT',
    'ENTJJ',
    'ENTJ-A',
    'MBTI',
    'EN TJ',
    '',
    '1234'
  ]) {
    assert.equal(normaliseTypeCode(bad), null);
  }
});

test('type fields are stored only from the types site with share_type 1', () => {
  const opted = sharedTypeFromForm(true, {
    shareType: '1',
    typeCode: 'infp',
    typeDetail: '  N slightly over S  '
  });
  assert.deepEqual(opted, {
    typeCode: 'INFP',
    typeDetail: 'N slightly over S'
  });

  assert.deepEqual(
    sharedTypeFromForm(true, { shareType: ' 1 ', typeCode: 'ENTJ' }),
    { typeCode: 'ENTJ', typeDetail: null }
  );

  for (const shareType of [undefined, '', '0', 'true', 'on', 'yes']) {
    assert.deepEqual(
      sharedTypeFromForm(true, {
        shareType,
        typeCode: 'ENTJ',
        typeDetail: 'should not be kept'
      }),
      { typeCode: null, typeDetail: null }
    );
  }

  assert.deepEqual(
    sharedTypeFromForm(false, {
      shareType: '1',
      typeCode: 'ENTJ',
      typeDetail: 'from drelijah.org'
    }),
    { typeCode: null, typeDetail: null }
  );

  const invalidCode = sharedTypeFromForm(true, {
    shareType: '1',
    typeCode: 'ENTJ-A',
    typeDetail: 'leaning note'
  });
  assert.equal(invalidCode.typeCode, null);
  assert.equal(invalidCode.typeDetail, 'leaning note');

  const long = 'x'.repeat(TYPE_DETAIL_MAX + 40);
  const truncated = sharedTypeFromForm(true, {
    shareType: '1',
    typeCode: 'ESTJ',
    typeDetail: long
  });
  assert.equal(truncated.typeDetail?.length, TYPE_DETAIL_MAX);
});

test('alerts mention a type only when one was stored', () => {
  const stored = sharedTypeFromForm(true, {
    shareType: '1',
    typeCode: 'entj',
    typeDetail: 'Te then Ni'
  });
  assert.deepEqual(typeAlertLines(stored.typeCode, stored.typeDetail), [
    'Type: ENTJ',
    'Type detail: Te then Ni'
  ]);

  const declined = sharedTypeFromForm(true, {
    shareType: '',
    typeCode: 'ENTJ',
    typeDetail: 'secret'
  });
  assert.deepEqual(typeAlertLines(declined.typeCode, declined.typeDetail), []);
  assert.deepEqual(typeAlertLines(null, null), []);
});

test('redirect and source page stay put for drelijah.org', () => {
  assert.equal(TYPES_SITE_ORIGIN, 'https://types.drelijah.org');
  assert.equal(TYPES_SITE_HOST, 'types.drelijah.org');
  assert.equal(TYPES_SITE_ORIGIN, `https://${TYPES_SITE_HOST}`);

  assert.equal(
    enquiryReturnLocation(TYPES_SITE_ORIGIN, 'sent=1', TYPES_SITE_ORIGIN),
    'https://types.drelijah.org/contact.html?sent=1#book'
  );
  assert.equal(
    enquiryReturnLocation(TYPES_SITE_ORIGIN, 'error=verify', TYPES_SITE_ORIGIN),
    'https://types.drelijah.org/contact.html?error=verify#book'
  );
  assert.equal(
    enquiryReturnLocation('https://drelijah.org', 'sent=1', TYPES_SITE_ORIGIN),
    'https://drelijah.org/contact?sent=1#book'
  );
  assert.equal(
    enquiryReturnLocation(
      'https://www.drelijah.org',
      'error=invalid',
      TYPES_SITE_ORIGIN
    ),
    'https://www.drelijah.org/contact?error=invalid#book'
  );

  assert.equal(
    sourcePageFor(true, '/contact.html', TYPES_SITE_HOST),
    'types.drelijah.org/contact.html'
  );
  assert.equal(
    sourcePageFor(true, '/contact', TYPES_SITE_HOST),
    'types.drelijah.org/contact'
  );
  assert.equal(
    sourcePageFor(true, undefined, TYPES_SITE_HOST),
    'types.drelijah.org/contact.html'
  );
  assert.equal(sourcePageFor(false, '/prisma', TYPES_SITE_HOST), '/prisma');
  assert.equal(sourcePageFor(false, undefined, TYPES_SITE_HOST), undefined);
  assert.equal(sourcePageFor(false, 'contact', TYPES_SITE_HOST), undefined);
});

test('database keeps opted-in types on the enquiry and the admin query can see them', () => {
  const db = migrate();
  insertEnquiry(db, {
    name: 'Aina Yusuf',
    email: 'aina@example.com',
    organisation: 'Northwind Clinic',
    need: 'types16',
    message: 'Can we use this with a ward team?',
    source_page: 'types.drelijah.org/contact.html',
    type_code: 'ENTJ',
    type_detail: 'Te clearly over Ti'
  });
  insertEnquiry(db, {
    name: 'Ben Lim',
    email: 'ben@example.com',
    organisation: null,
    need: 'coaching',
    message: 'Just the profile, please.',
    source_page: 'types.drelijah.org/contact',
    type_code: 'INFP',
    type_detail: null
  });
  insertEnquiry(db, {
    name: 'Chandra Devi',
    email: 'chandra@example.com',
    organisation: 'Helix',
    need: 'types16',
    message: 'Please do not keep a type.',
    source_page: 'types.drelijah.org/contact.html',
    type_code: null,
    type_detail: null
  });
  insertEnquiry(db, {
    name: 'Dalia Ong',
    email: 'dalia@example.com',
    organisation: 'Harbour Co',
    need: 'prisma',
    message: 'Stage II question',
    source_page: '/prisma',
    type_code: 'ENTJ',
    type_detail: 'must not show in the types list'
  });

  const typesRows = db.prepare(typesLeadsListSql).all();
  assert.deepEqual(
    typesRows.map((row) => row.email),
    ['chandra@example.com', 'ben@example.com', 'aina@example.com']
  );
  assert.equal(
    typesRows.find((row) => row.email === 'aina@example.com').type_code,
    'ENTJ'
  );
  assert.equal(
    typesRows.find((row) => row.email === 'chandra@example.com').type_code,
    null
  );
  const sources = db
    .prepare(`SELECT source_page FROM enquiries WHERE ${typesLeadsWhere}`)
    .all();
  assert.ok(
    sources.every((row) => String(row.source_page).startsWith(TYPES_SITE_HOST))
  );
  assert.equal(sources.length, 3);

  const counts = db.prepare(adminCountsSql).get();
  assert.equal(counts.enquiries, 4);
  assert.equal(counts.types, 3);

  const allEnquiries = db.prepare(exportQueries.enquiries).all();
  assert.equal(allEnquiries.length, 4);
  assert.ok(allEnquiries.some((row) => row.source_page === '/prisma'));

  const typesExport = db.prepare(exportQueries.types).all();
  assert.equal(typesExport.length, 3);
  assert.ok(exportQueries.types.includes(typesLeadsWhere));
  assert.match(exportQueries.enquiries, /type_code, type_detail/);
  assert.doesNotMatch(exportQueries.enquiries, /WHERE/i);

  assert.throws(() =>
    insertEnquiry(db, {
      name: 'Bad Code',
      email: 'bad@example.com',
      need: 'types16',
      source_page: 'types.drelijah.org/contact.html',
      type_code: 'ENTX'
    })
  );
  assert.throws(() =>
    insertEnquiry(db, {
      name: 'Long Detail',
      email: 'long@example.com',
      need: 'types16',
      source_page: 'types.drelijah.org/contact.html',
      type_detail: 'y'.repeat(501)
    })
  );
});

test('admin page lists types leads and escapes what people typed', () => {
  const tricky = {
    created_at: '2026-11-23 00:30:00',
    name: 'Aina <script>',
    email: 'aina@example.com',
    organisation: 'Northwind & Co',
    need: 'types16',
    message: 'Hello\n<img src=x onerror=alert(1)>',
    type_code: 'ENTJ',
    type_detail: 'Te over Ti'
  };
  const declined = {
    created_at: '2026-11-22 02:00:00',
    name: 'Chandra Devi',
    email: 'chandra@example.com',
    organisation: null,
    need: 'coaching',
    message: null,
    type_code: null,
    type_detail: null
  };
  const html = renderAdminPage({
    downloads: exportTables,
    counts: {
      enquiries: 2,
      types: 2,
      results: 0,
      riasec: 0,
      leads: 0,
      feedback: 0
    },
    topicLabels: needs,
    typesLeads: [tricky, declined],
    typesTotal: 2,
    query: '',
    listCapped: false
  });

  assert.match(html, /types<span>\.drelijah\.org<\/span> leads/);
  assert.match(html, /Aina &lt;script&gt;/);
  assert.match(html, /Northwind &amp; Co/);
  assert.match(html, /16-type personality profile/);
  assert.match(html, /Hello\n&lt;img src=x onerror=alert\(1\)&gt;/);
  assert.match(html, /ENTJ/);
  assert.match(html, /Te over Ti/);
  assert.match(html, /Not shared/);
  assert.match(html, /mailto:aina@example.com/);
  assert.match(html, /href="\/admin\/export\/types"/);
  assert.match(html, /href="\/admin\/export\/enquiries"/);
  assert.match(html, />2 records</);
  assert.doesNotMatch(html, /<script>/);
  assert.doesNotMatch(html, /MBTI|Myers-Briggs|Myers Briggs/i);
  assert.match(formatStoredDate(tricky.created_at), /23 Nov 2026/);
  assert.match(formatStoredDate(tricky.created_at), /08:30/);

  const searched = renderAdminPage({
    downloads: [],
    counts: { types: 2 },
    topicLabels: needs,
    typesLeads: [tricky].filter((lead) => leadMatches(lead, 'entj', needs)),
    typesTotal: 2,
    query: '"><script>',
    listCapped: false
  });
  assert.match(searched, /value="&quot;&gt;&lt;script&gt;"/);
  assert.equal(leadMatches(declined, '16-type', needs), false);
  assert.equal(leadMatches(tricky, '16-type', needs), true);
  assert.equal(leadMatches(tricky, 'ward', needs), false);
  assert.equal(
    escapeHtml(toCsv([{ name: '=cmd', type_code: 'ENTJ' }])).includes('=cmd'),
    true
  );
  assert.match(toCsv([{ name: '=cmd', type_code: 'ENTJ' }]), /'=cmd/);
});

test('enquiry route and alerts keep the opt-in gate', () => {
  const route = readFileSync(
    join(root, 'src/app/api/enquiry/route.ts'),
    'utf8'
  );
  const notify = readFileSync(join(root, 'src/lib/notify.ts'), 'utf8');
  const csv = readFileSync(join(root, 'scripts/export-csv.mjs'), 'utf8');
  assert.match(route, /sharedTypeFromForm\(fromTypesSite/);
  assert.match(route, /typeCode: shared\.typeCode/);
  assert.match(route, /typeAlertLines\(shared\.typeCode, shared\.typeDetail\)/);
  assert.match(
    route,
    /enquiryReturnLocation\(origin, query, TYPES_SITE_ORIGIN\)/
  );
  assert.match(route, /notifyOwner\(/);
  assert.match(route, /sendEnquiryEmail\(/);
  assert.match(notify, /sendOwnerEmail\(/);
  assert.match(notify, /typeAlertLines\(data\.typeCode, data\.typeDetail\)/);
  assert.match(notify, /ENQUIRY_EMAIL_RELAY_URL/);
  assert.match(notify, /TELEGRAM_BOT_TOKEN/);
  assert.match(csv, /source_page LIKE 'types\.drelijah\.org%'/);
  assert.match(csv, /type_code, type_detail/);

  const banned = /MBTI|Myers-Briggs|Myers Briggs/i;
  const files = [
    '../README.md',
    'src/app/admin/route.ts',
    'src/app/api/enquiry/route.ts',
    'src/lib/admin-page.ts',
    'src/lib/exports.ts',
    'src/lib/notify.ts',
    'src/lib/type-share.ts',
    'src/config/enquiry.ts',
    'migrations/0005_enquiry_type_share.sql',
    'scripts/export-csv.mjs'
  ];
  for (const file of files) {
    assert.doesNotMatch(readFileSync(join(root, file), 'utf8'), banned, file);
  }
});
