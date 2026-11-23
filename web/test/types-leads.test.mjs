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
  renderAdminPage,
  serialMatches
} from '../src/lib/admin-page.ts';
import { toCsv } from '../src/lib/csv.ts';
import {
  adminCountsSql,
  exportQueries,
  exportTables,
  typeResultCountsSql,
  typeResultsListSql,
  typesLeadsListSql,
  typesLeadsWhere
} from '../src/lib/exports.ts';
import {
  TYPE_RESULT_BODY_MAX,
  isJsonContentType,
  readLimitedBody
} from '../src/lib/type-result.ts';
import {
  TYPE_CODES,
  TYPE_DETAIL_MAX,
  countsByType,
  enquiryReturnLocation,
  normaliseResultId,
  normaliseTypeCode,
  parseTypeResultPayload,
  sharedTypeFromForm,
  sourcePageFor,
  typeAlertLines,
  typeResultCors
} from '../src/lib/type-share.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SERIAL = '0123456789abcdef01234567';

const emptyResults = {
  typeResults: [],
  typeResultTotal: 0,
  typeCounts: countsByType([]),
  resultsCapped: false
};

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
       phone, message, source_page, notice_version, type_code, type_detail,
       type_result_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
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
    row.type_detail ?? null,
    row.type_result_id ?? null
  );
}

function insertTypeResult(db, row) {
  db.prepare(
    `INSERT INTO type_results (id, type_code, type_detail, created_at)
     VALUES (?, ?, ?, ?)`
  ).run(row.id, row.type_code, row.type_detail ?? null, row.created_at);
}

test('type codes are the sixteen letter pairs only', () => {
  const axes = ['EI', 'NS', 'TF', 'JP'];
  const all = [];
  for (const a of axes[0]) {
    for (const b of axes[1]) {
      for (const c of axes[2]) {
        for (const d of axes[3]) all.push(a + b + c + d);
      }
    }
  }
  assert.equal(TYPE_CODES.length, 16);
  assert.deepEqual(new Set(TYPE_CODES), new Set(all));
  for (const code of TYPE_CODES) {
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
    typeDetail: 'N slightly over S',
    typeResultId: null
  });

  assert.deepEqual(
    sharedTypeFromForm(true, { shareType: ' 1 ', typeCode: 'ENTJ' }),
    { typeCode: 'ENTJ', typeDetail: null, typeResultId: null }
  );

  for (const shareType of [undefined, '', '0', 'true', 'on', 'yes']) {
    assert.deepEqual(
      sharedTypeFromForm(true, {
        shareType,
        typeCode: 'ENTJ',
        typeDetail: 'should not be kept',
        typeResultId: SERIAL
      }),
      { typeCode: null, typeDetail: null, typeResultId: null }
    );
  }

  assert.deepEqual(
    sharedTypeFromForm(false, {
      shareType: '1',
      typeCode: 'ENTJ',
      typeDetail: 'from drelijah.org',
      typeResultId: SERIAL
    }),
    { typeCode: null, typeDetail: null, typeResultId: null }
  );

  assert.equal(
    sharedTypeFromForm(true, {
      shareType: '1',
      typeCode: 'infp',
      typeResultId: `  ${SERIAL.toUpperCase()}  `
    }).typeResultId,
    SERIAL
  );
  assert.equal(normaliseResultId(SERIAL), SERIAL);
  for (const bad of [
    SERIAL.slice(0, 23),
    `${SERIAL}a`,
    'gggggggggggggggggggggggg',
    '0123456789abcdef0123456g',
    '',
    undefined
  ]) {
    assert.equal(normaliseResultId(bad), null);
    assert.equal(
      sharedTypeFromForm(true, {
        shareType: '1',
        typeCode: 'ENTJ',
        typeResultId: bad
      }).typeResultId,
      null
    );
  }

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
  assert.deepEqual(typeAlertLines(stored.typeCode, stored.typeDetail, SERIAL), [
    'Type: ENTJ',
    'Type detail: Te then Ni',
    `Result number: ${SERIAL}`
  ]);
  assert.deepEqual(typeAlertLines(null, null, SERIAL), [
    `Result number: ${SERIAL}`
  ]);

  const declined = sharedTypeFromForm(true, {
    shareType: '',
    typeCode: 'ENTJ',
    typeDetail: 'secret',
    typeResultId: SERIAL
  });
  assert.deepEqual(
    typeAlertLines(
      declined.typeCode,
      declined.typeDetail,
      declined.typeResultId
    ),
    []
  );
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
    type_detail: 'Te over Ti',
    type_result_id: SERIAL
  };
  const declined = {
    created_at: '2026-11-22 02:00:00',
    name: 'Chandra Devi',
    email: 'chandra@example.com',
    organisation: null,
    need: 'coaching',
    message: null,
    type_code: null,
    type_detail: null,
    type_result_id: null
  };
  const serial = {
    id: SERIAL,
    created_at: '2026-11-23 00:30:00',
    type_code: 'ENTJ',
    type_detail: 'Te <over> Ti'
  };
  const other = {
    id: 'abcdef0123456789abcdef01',
    created_at: '2026-11-22 01:00:00',
    type_code: 'INFP',
    type_detail: null
  };
  const html = renderAdminPage({
    downloads: exportTables,
    counts: {
      enquiries: 2,
      types: 2,
      type_results: 2,
      results: 0,
      riasec: 0,
      leads: 0,
      feedback: 0
    },
    topicLabels: needs,
    typesLeads: [tricky, declined],
    typesTotal: 2,
    typeResults: [serial, other],
    typeResultTotal: 2,
    typeCounts: countsByType([
      { type_code: 'ENTJ', n: 1 },
      { type_code: 'INFP', n: 1 }
    ]),
    query: '',
    listCapped: false,
    resultsCapped: false
  });

  assert.match(html, /types<span>\.drelijah\.org<\/span> leads/);
  assert.match(html, /Aina &lt;script&gt;/);
  assert.match(html, /Northwind &amp; Co/);
  assert.match(html, /16-type personality profile/);
  assert.match(html, /Hello\n&lt;img src=x onerror=alert\(1\)&gt;/);
  assert.match(html, /ENTJ/);
  assert.match(html, /Te over Ti/);
  assert.match(html, new RegExp(`Result ${SERIAL}`));
  assert.match(html, /Not shared/);
  assert.match(html, /mailto:aina@example.com/);
  assert.match(html, /href="\/admin\/export\/types"/);
  assert.match(html, /href="\/admin\/export\/enquiries"/);
  assert.match(html, /href="\/admin\/export\/type_results"/);
  assert.match(html, />2 records</);
  assert.match(html, /Counts by type/);
  assert.match(html, /td::before\{[^}]*font:600 \.72rem\/1\.3 "Source Sans 3"/);
  assert.match(html, />ISFP<\/strong><span class="n">0<\/span>/);
  assert.match(html, />ENTJ<\/strong><span class="n">1<\/span>/);
  const serialTable = html.slice(
    html.indexOf('<table class="serials">'),
    html.indexOf('</table>', html.indexOf('<table class="serials">'))
  );
  assert.match(serialTable, /Result number/);
  assert.match(serialTable, /Te &lt;over&gt; Ti/);
  assert.match(serialTable, new RegExp(SERIAL));
  assert.doesNotMatch(serialTable, /Name|Email|Organisation|@/);
  assert.equal(serialMatches(serial, SERIAL), true);
  assert.equal(serialMatches(serial, 'entj'), true);
  assert.equal(serialMatches(serial, 'over'), true);
  assert.equal(serialMatches(other, SERIAL), false);
  assert.equal(leadMatches(tricky, SERIAL, needs), true);
  assert.equal(leadMatches(declined, SERIAL, needs), false);
  assert.equal(countsByType([]).length, 16);
  assert.equal(
    countsByType([]).every((row) => row.count === 0),
    true
  );
  assert.doesNotMatch(html, /<script>/);
  assert.doesNotMatch(html, /MBTI|Myers-Briggs|Myers Briggs/i);
  assert.match(formatStoredDate(tricky.created_at), /23 Nov 2026/);
  assert.match(formatStoredDate(tricky.created_at), /08:30/);

  const searched = renderAdminPage({
    ...emptyResults,
    downloads: [],
    counts: { types: 2 },
    topicLabels: needs,
    typesLeads: [tricky].filter((lead) => leadMatches(lead, 'entj', needs)),
    typesTotal: 2,
    typeResults: [serial].filter((row) => serialMatches(row, 'entj')),
    typeResultTotal: 2,
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
  assert.match(
    route,
    /typeAlertLines\(\s*shared\.typeCode,\s*shared\.typeDetail,\s*shared\.typeResultId\s*\)/
  );
  assert.match(route, /type_result_id/);
  assert.match(route, /typeResultId: field\('type_result_id'\)/);
  assert.match(
    route,
    /enquiryReturnLocation\(origin, query, TYPES_SITE_ORIGIN\)/
  );
  assert.match(route, /notifyOwner\(/);
  assert.match(route, /sendEnquiryEmail\(/);
  assert.match(notify, /sendOwnerEmail\(/);
  assert.match(
    notify,
    /typeAlertLines\(data\.typeCode, data\.typeDetail, data\.typeResultId\)/
  );
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
    'migrations/0006_type_results.sql',
    'src/app/api/types-result/route.ts',
    'src/lib/type-result.ts',
    'scripts/export-csv.mjs'
  ];
  for (const file of files) {
    assert.doesNotMatch(readFileSync(join(root, file), 'utf8'), banned, file);
  }
});

test('type_results stores a serial and a type, and nothing identifying', () => {
  const db = migrate();
  const columns = db
    .prepare('PRAGMA table_info(type_results)')
    .all()
    .map((column) => column.name);
  assert.deepEqual(columns, ['id', 'type_code', 'type_detail', 'created_at']);

  insertTypeResult(db, {
    id: SERIAL,
    type_code: 'ENTJ',
    type_detail: 'Te over Ti',
    created_at: '2026-11-23 00:30:00'
  });
  insertTypeResult(db, {
    id: 'abcdef0123456789abcdef01',
    type_code: 'INFP',
    type_detail: null,
    created_at: '2026-11-22 01:00:00'
  });
  insertTypeResult(db, {
    id: 'abcdef0123456789abcdef02',
    type_code: 'ENTJ',
    type_detail: null,
    created_at: '2026-11-21 01:00:00'
  });

  const listed = db.prepare(typeResultsListSql).all();
  assert.deepEqual(
    listed.map((row) => row.id),
    [SERIAL, 'abcdef0123456789abcdef01', 'abcdef0123456789abcdef02']
  );
  const byType = countsByType(db.prepare(typeResultCountsSql).all());
  assert.equal(byType.find((row) => row.code === 'ENTJ').count, 2);
  assert.equal(byType.find((row) => row.code === 'INFP').count, 1);
  assert.equal(byType.find((row) => row.code === 'ISFP').count, 0);
  assert.equal(byType.length, 16);
  assert.equal(db.prepare(adminCountsSql).get().type_results, 3);

  const exported = db.prepare(exportQueries.type_results).all();
  assert.deepEqual(Object.keys(exported[0]), [
    'id',
    'created_at',
    'type_code',
    'type_detail'
  ]);
  assert.doesNotMatch(
    exportQueries.type_results,
    /name|email|organisation|phone/i
  );

  insertEnquiry(db, {
    name: 'Fixture Lead',
    email: 'fixture@example.com',
    need: 'types16',
    source_page: 'types.drelijah.org/contact.html',
    type_code: 'ENTJ',
    type_detail: 'Te over Ti',
    type_result_id: SERIAL
  });
  assert.equal(db.prepare(typesLeadsListSql).get().type_result_id, SERIAL);

  assert.throws(() =>
    insertTypeResult(db, {
      id: 'short',
      type_code: 'ENTJ',
      created_at: '2026-11-23 00:30:00'
    })
  );
  assert.throws(() =>
    insertTypeResult(db, {
      id: SERIAL.toUpperCase(),
      type_code: 'ENTJ',
      created_at: '2026-11-23 00:30:00'
    })
  );
  assert.throws(() =>
    insertTypeResult(db, {
      id: 'fedcba9876543210fedcba98',
      type_code: 'entj',
      created_at: '2026-11-23 00:30:00'
    })
  );
  assert.throws(() =>
    insertTypeResult(db, {
      id: 'fedcba9876543210fedcba99',
      type_code: 'ENTJ',
      type_detail: 'z'.repeat(501),
      created_at: '2026-11-23 00:30:00'
    })
  );
  assert.throws(() =>
    insertEnquiry(db, {
      name: 'Bad Serial',
      email: 'bad-serial@example.com',
      need: 'types16',
      source_page: 'types.drelijah.org/contact.html',
      type_result_id: 'not-a-serial'
    })
  );
});

test('type result payload keeps the type and drops identity fields', async () => {
  assert.equal(typeResultCors('https://drelijah.org', TYPES_SITE_ORIGIN), null);
  assert.equal(
    typeResultCors('https://www.drelijah.org', TYPES_SITE_ORIGIN),
    null
  );
  assert.equal(
    typeResultCors('http://localhost:3000', TYPES_SITE_ORIGIN),
    null
  );
  assert.equal(typeResultCors(null, TYPES_SITE_ORIGIN), null);
  const headers = typeResultCors(TYPES_SITE_ORIGIN, TYPES_SITE_ORIGIN);
  assert.equal(headers['Access-Control-Allow-Origin'], TYPES_SITE_ORIGIN);
  assert.match(headers['Access-Control-Allow-Methods'], /POST/);
  assert.equal(isJsonContentType('application/json; charset=utf-8'), true);
  assert.equal(isJsonContentType('text/plain'), false);

  const parsed = parseTypeResultPayload({
    type_code: ' infp ',
    type_detail: '  N over S  ',
    name: 'Aina',
    email: 'aina@example.com',
    organisation: 'Northwind',
    ip: '203.0.113.4'
  });
  assert.deepEqual(parsed, {
    ok: true,
    typeCode: 'INFP',
    typeDetail: 'N over S'
  });
  assert.equal('email' in parsed, false);
  assert.equal('name' in parsed, false);

  assert.deepEqual(parseTypeResultPayload({ type_code: 'ESTJ' }), {
    ok: true,
    typeCode: 'ESTJ',
    typeDetail: null
  });
  assert.deepEqual(
    parseTypeResultPayload({ type_code: 'ESTJ', type_detail: '   ' }),
    { ok: true, typeCode: 'ESTJ', typeDetail: null }
  );
  const long = parseTypeResultPayload({
    type_code: 'ESTJ',
    type_detail: 'y'.repeat(TYPE_DETAIL_MAX + 40)
  });
  assert.equal(long.ok && long.typeDetail.length, TYPE_DETAIL_MAX);

  for (const value of [
    null,
    [],
    'ENTJ',
    {},
    { type_code: 'ENTX' },
    { type_code: 'ENTJ', type_detail: 12 }
  ]) {
    assert.deepEqual(parseTypeResultPayload(value), { ok: false });
  }

  const oversized = 'x'.repeat(TYPE_RESULT_BODY_MAX + 50);
  const refused = await readLimitedBody(
    new Request('https://big5.drelijah.org/api/types-result', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': String(oversized.length)
      },
      body: oversized
    }),
    TYPE_RESULT_BODY_MAX
  );
  assert.equal(refused.ok, false);
  assert.equal(refused.status, 413);

  const small = JSON.stringify({
    type_code: 'ENTJ',
    email: 'ignored@example.com'
  });
  const accepted = await readLimitedBody(
    new Request('https://big5.drelijah.org/api/types-result', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: small
    }),
    TYPE_RESULT_BODY_MAX
  );
  assert.equal(accepted.ok, true);
  assert.equal(accepted.text, small);

  const route = readFileSync(
    join(root, 'src/app/api/types-result/route.ts'),
    'utf8'
  );
  const csv = readFileSync(join(root, 'scripts/export-csv.mjs'), 'utf8');
  assert.match(
    route,
    /INSERT INTO type_results \(id, type_code, type_detail\)/
  );
  assert.match(
    route,
    /typeResultCors\(request\.headers\.get\('Origin'\), TYPES_SITE_ORIGIN\)/
  );
  assert.match(route, /return json\(\{ id \}/);
  assert.doesNotMatch(
    route,
    /notifyOwner|sendEnquiryEmail|sendOwnerEmail|TELEGRAM|ENQUIRY_EMAIL/
  );
  assert.match(
    csv,
    /type_results: `SELECT id, created_at, type_code, type_detail/
  );
});
