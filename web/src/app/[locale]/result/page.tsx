import { use } from 'react';
import { title } from '@/components/primitives';
import { useTranslations } from 'next-intl';
import { GetResultPage } from './get-result';
import { setRequestLocale } from 'next-intl/server';

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
