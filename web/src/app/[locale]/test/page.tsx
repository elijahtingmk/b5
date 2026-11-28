import { use } from 'react';
import { getItems, getInfo } from '@bigfive-org/questions';
import { Survey } from './survey';
import { useTranslations } from 'next-intl';
import { saveTest } from '@/actions';
import { setRequestLocale } from 'next-intl/server';
import { TestLanguageSwitch } from './test-language-switch';
import { pageMeta } from '@/lib/page-meta';

const questionLanguages = getInfo().languages;

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  return pageMeta({
    locale,
    path: '/test',
    title: 'Take the Big Five test',
    description:
      '120 questions, about 10 minutes, no registration. A free Big Five personality snapshot from Dr Elijah Ting.'
  });
}

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ lang?: string }>;
}

export default function TestPage(props: Props) {
  const searchParams = use(props.searchParams);

  const { lang } = searchParams;

  const params = use(props.params);

  const { locale } = params;

  setRequestLocale(locale);
  const language =
    lang || (questionLanguages.some((l) => l.id === locale) ? locale : 'en');
  const questions = getItems(language);
  const t = useTranslations('test');
  return (
    <>
      <div className='flex'>
        <TestLanguageSwitch
          availableLanguages={questionLanguages}
          language={language}
        />
      </div>
      <Survey
        questions={questions}
        nextText={t('next')}
        prevText={t('back')}
        resultsText={t('seeResults')}
        saveTest={saveTest}
        language={language}
      />
    </>
  );
}
