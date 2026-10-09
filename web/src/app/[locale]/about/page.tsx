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

  const t = await getTranslations({ locale, namespace: 'toolbar' });
  return {
    title: t('about'),
    description: `A free Big Five personality snapshot and career interest checklist offered by ${practitioner.displayName}, ${practitioner.location}.`
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
          These free tools are offered by{' '}
          <a href={practitioner.website} className='underline'>
            {practitioner.displayName}
          </a>
          , a leadership, workplace resilience and psychosocial safety
          practitioner based in {practitioner.location}.
        </p>
        <p>
          The{' '}
          <Link href='/test' className='underline'>
            Big Five personality test
          </Link>{' '}
          measures five broad dimensions of personality: Openness,
          Conscientiousness, Extraversion, Agreeableness and Neuroticism, each
          with six facets. It uses public-domain items from the International
          Personality Item Pool (IPIP) and is built on the open-source{' '}
          <a href={siteConfig.links.upstream} className='underline'>
            bigfive-web
          </a>{' '}
          project.
        </p>
        <p>
          The{' '}
          <Link href='/riasec' className='underline'>
            Career Interest Checklist
          </Link>{' '}
          shows your three strongest of the six Holland Code (RIASEC) interest
          areas: Realistic, Investigative, Artistic, Social, Enterprising and
          Conventional. It is the O*NET® Interest Profiler Short Form,
          reproduced word for word from the version developed by the National
          Center for O*NET Development for the U.S. Department of Labor, and
          used under the{' '}
          <a
            href='https://creativecommons.org/licenses/by-nd/4.0/'
            className='underline'
          >
            CC BY-ND 4.0
          </a>{' '}
          license.
        </p>
        <p>
          Both are self-reflection tools. They are not clinical or diagnostic
          assessments, and they should not be used for hiring or employment
          decisions. In leadership and career coaching, Elijah normally uses the
          WorkPlace Big Five Profile® and Career Direct®. For a lower-cost
          option, coaching can build on your results from these free tools
          instead.
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
              className='text-brand-gold animate-heartbeat'
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
