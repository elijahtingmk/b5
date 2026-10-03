import { getDb } from '@/db';
import { unstable_noStore as noStore } from 'next/cache';

interface ViewCounterProps {
  postId: string;
}

export async function ViewCounter({ postId }: ViewCounterProps) {
  'use server';
  noStore();
  let views: number;
  try {
    const db = await getDb();
    const row = await db
      .prepare(
        `INSERT INTO views (slug, count) VALUES (?, 1)
         ON CONFLICT(slug) DO UPDATE SET count = count + 1
         RETURNING count`
      )
      .bind(postId.replace('.md', ''))
      .first<{ count: number }>();
    views = row?.count ?? 0;
  } catch (error) {
    console.error(error);
    return null;
  }

  return <p>{Intl.NumberFormat('en-us').format(views)} views</p>;
}
