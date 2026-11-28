import { compareDesc } from 'date-fns';
import { allPosts } from 'contentlayer/generated';
import { PostCard } from '@/components/post-card';
import { setRequestLocale } from 'next-intl/server';
import { pageMeta } from '@/lib/page-meta';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata(props: Props) {
  const { locale } = await props.params;
  return pageMeta({
    locale,
    path: '/articles',
    title: 'Personality articles',
    description:
      'Articles on the Big Five traits and how personality shows up in relationships, health, and daily life.'
  });
}

export default async function ArticlesPage(props: Props) {
  const params = await props.params;

  const { locale } = params;

  setRequestLocale(locale);
  const posts = allPosts.sort((a, b) =>
    compareDesc(new Date(a.date), new Date(b.date))
  );

  return (
    <div className='w-full lg:px-16 mt-12'>
      <div className='text-center'>
        <h1 className='mb-2 font-bold text-4xl'>Personality articles</h1>
        <h5 className='text-default-500 text-lg'>
          All the latest and greatest news and articles on Personality
        </h5>
      </div>

      <div className='mt-10 grid gap-4 grid-cols-[repeat(auto-fill,minmax(300px,1fr))]'>
        {posts.map((post, idx) => (
          <PostCard key={idx} {...post} />
        ))}
      </div>
    </div>
  );
}
