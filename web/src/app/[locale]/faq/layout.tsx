import { pageMeta } from '@/lib/page-meta';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  return pageMeta({
    locale,
    path: '/faq',
    title: 'Frequently asked questions',
    description:
      'Answers about the free Big Five test, results, and the career interest checklist from Dr Elijah Ting.'
  });
}

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return children;
}
