import { HeartBoldIcon } from '@/components/icons';
import { title } from '@/components/primitives';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Feedback from './feedback';
import { Link } from '@/navigation';
import { practitioner } from '@/config/consent';
import { siteConfig } from '@/config/site';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}) {
  const params = await props.params;

  const { locale } = params;

  const t = await getTranslations({ locale, namespace: 'about' });
  return {
    title: t('seo.title'),
    description: t('seo.description')
  };
}

export default async function AboutPage(props: Props) {
  const params = await props.params;

  const { locale } = params;

  setRequestLocale(locale);

  return (
    <>
      <div className='text-center justify-center mt-10'>
        <h1 className={title()}>About</h1>
      </div>
      <div className='mt-2 text-medium lg:mt-4 lg:text-large space-y-4'>
        <p>
          This free Big Five personality test is offered by{' '}
          <a href={practitioner.website} className='underline'>
            {practitioner.name}
          </a>
          , a leadership, workplace resilience and psychosocial safety
          practitioner based in {practitioner.location}.
        </p>
        <p>
          The test measures five broad dimensions of personality: Openness,
          Conscientiousness, Extraversion, Agreeableness and Neuroticism, each
          with six facets. It uses public-domain items from the International
          Personality Item Pool (IPIP) and is built on the open-source{' '}
          <a href={siteConfig.links.upstream} className='underline'>
            bigfive-web
          </a>{' '}
          project.
        </p>
        <p>
          It is a self-reflection tool. It is not a clinical or diagnostic
          assessment, and it should not be used for hiring or employment
          decisions. For leadership and career coaching, Elijah uses the
          WorkPlace Big Five Profile®, a separate workplace-focused assessment.
        </p>
        <p>
          Questions? Read the{' '}
          <Link href='/faq' className='underline'>
            FAQ
          </Link>{' '}
          or email{' '}
          <a href={`mailto:${practitioner.email}`} className='underline'>
            {practitioner.email}
          </a>
          .
        </p>
      </div>
      <section>
        <div className='text-center justify-center mt-20'>
          <h2 className={title()}>We love feedback!&nbsp;</h2>
          <div className='flex md:inline-flex flex-col md:flex-row items-center'>
            <HeartBoldIcon
              className='text-pink-500 animate-heartbeat'
              size={50}
              style={{
                animationDuration: '2.5s'
              }}
            />
          </div>
          <div className='mt-2 text-medium lg:mt-4 lg:text-large'>
            Send us feedback about how our features can be improved or specific
            issues.
          </div>
        </div>
        <Feedback />
      </section>
    </>
  );
}
