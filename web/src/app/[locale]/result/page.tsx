import { use } from 'react';
import { title } from '@/components/primitives';
import { useTranslations } from 'next-intl';
import { GetResultPage } from './get-result';
import { setRequestLocale } from 'next-intl/server';
import { pageMeta } from '@/lib/page-meta';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  return pageMeta({
    locale,
    path: '/result',
    title: 'Your Big Five result',
    description:
      'Your Big Five personality snapshot. Keep the result ID to open this page again.',
    noindex: true
  });
}

interface Props {
  params: Promise<{ locale: string }>;
}

export default function ResultPage(props: Props) {
  const params = use(props.params);

  const { locale } = params;

  setRequestLocale(locale);
  const t = useTranslations('getResult');

  return (
    <div className='h-[calc(60vh)]'>
      <h1 className={title()}>{t('result')}</h1>
      <div className='mt-10'>{t('explanation')}</div>
      <GetResultPage
        viewPreviousText={t('viewPrevious')}
        getResultsText={t('getResult')}
      />
    </div>
  );
}
