import { title } from '@/components/primitives';
import { useTranslations } from 'next-intl';
import { ComparePeople } from './compare-people';
import { setRequestLocale } from 'next-intl/server';
import { Suspense, use } from 'react';

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ id: string }>;
}

export default function ComparePage(props: Props) {
  const searchParams = use(props.searchParams);

  const { id } = searchParams;

  const params = use(props.params);

  const { locale } = params;

  setRequestLocale(locale);
  const t = useTranslations('getCompare');
  return (
    <div className='h-[calc(60vh)]'>
      <h1 className={title()}>{t('title')}</h1>
      <br />
      <br />
      <span className='mt-2'>{t('description1')}</span>
      <Suspense fallback='loading...'>
        <ComparePeople
          addPersonText={t('addPerson')}
          comparePeopleText={t('comparePeople')}
          paramId={id}
        />
      </Suspense>
    </div>
  );
}
