'use server';

import { getDb, newId } from '@/db';
import { validId } from '@/lib/helpers';
import { riasecSchema } from '@/schemas';
import { RIASEC_FORM_VERSION, RiasecScore, scoreRiasec } from '@/config/riasec';

export type RiasecReport = {
  id: string;
  timestamp: number;
  scores: RiasecScore[];
};

export async function saveRiasec(input: {
  answers: string;
  timeElapsed: number;
}): Promise<{ id: string }> {
  const { answers, timeElapsed } = riasecSchema.parse(input);
  const scores = scoreRiasec(answers);
  const id = newId();
  const db = await getDb();
  await db
    .prepare(
      `INSERT INTO riasec_results (id, form_version, time_elapsed, answers,
         realistic, investigative, artistic, social, enterprising, conventional)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      id,
      RIASEC_FORM_VERSION,
      Math.round(timeElapsed),
      answers,
      ...scores.map((s) => s.score)
    )
    .run();
  return { id };
}

export async function getRiasecResult(
  id: string
): Promise<RiasecReport | undefined> {
  const normalizedId = id.toLowerCase();
  if (!validId(normalizedId)) return undefined;
  const db = await getDb();
  const row = await db
    .prepare('SELECT id, created_at, answers FROM riasec_results WHERE id = ?')
    .bind(normalizedId)
    .first<{ id: string; created_at: string; answers: string }>();
  if (!row) return undefined;
  return {
    id: row.id,
    // D1 stores CURRENT_TIMESTAMP as "YYYY-MM-DD HH:MM:SS" in UTC.
    timestamp: Date.parse(row.created_at.replace(' ', 'T') + 'Z'),
    scores: scoreRiasec(row.answers)
  };
}
