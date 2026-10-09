import { notFound } from 'next/navigation';
import { Chip } from '@nextui-org/react';
import { Snippet } from '@nextui-org/snippet';
import { getRiasecResult } from '@/actions/riasec';
import { heading, title } from '@/components/primitives';
import { OnetAttribution } from '@/components/onet-attribution';
import {
  jobZones,
  onetLinks,
  riasecAreas,
  riasecTieRule
} from '@/config/riasec';
import { Link } from '@/navigation';
import { LeadForm } from '../../../result/[id]/lead-form';

export const metadata = {
  title: 'Your career interest results',
  robots: { index: false }
};

interface Props {
  params: Promise<{ id: string; locale: string }>;
}

const ExternalLink = ({
  href,
  children
}: {
  href: string;
  children: React.ReactNode;
}) => (
  <a
    href={href}
    target='_blank'
    rel='noopener noreferrer'
    className='underline'
  >
    {children}
  </a>
);

export default async function RiasecResultPage(props: Props) {
  const { id, locale } = await props.params;
  const report = await getRiasecResult(id.substring(0, 24));
  if (!report) notFound();

  // Highest first; equal scores keep the R-I-A-S-E-C order.
  const ranked = [...report.scores].sort((a, b) => b.score - a.score);
  const topThree = ranked.slice(0, 3);
  // A tie matters when it decides which areas make the top three.
  const hasTie = ranked.some(
    (s, i) => i > 0 && i <= 3 && s.score === ranked[i - 1].score
  );
  const describe = (code: string) =>
    riasecAreas.find((area) => area.code === code)!;

  return (
    <section lang='en'>
      <div className='flex justify-end'>
        <Chip>{new Date(report.timestamp).toLocaleDateString()}</Chip>
      </div>
      <p className='text-center mt-4'>
        <span className='font-bold'>Keep this ID</span> to reopen your results
        later.
      </p>
      <div className='flex mt-4'>
        <Snippet
          hideSymbol
          color='primary'
          className='w-full justify-center'
          size='lg'
        >
          {report.id}
        </Snippet>
      </div>

      <h1 className={title({ class: 'mt-10 block' })}>
        Your career interest areas
      </h1>
      <ol className='mt-6 grid gap-4 md:grid-cols-3'>
        {topThree.map((s, i) => (
          <li
            key={s.code}
            className='rounded-large border border-default-200 p-4'
          >
            <div className='text-small text-default-500'>
              {i === 0 ? 'Primary interest' : i === 1 ? 'Second' : 'Third'}
            </div>
            <div className='text-2xl font-semibold'>{s.name}</div>
            <div className='text-default-600'>{s.score} of 10 checks</div>
          </li>
        ))}
      </ol>
      {hasTie && (
        <p className='mt-4 text-default-600'>
          Some of your scores are tied. {riasecTieRule}
        </p>
      )}

      <h2 className={heading({ class: 'mt-12' })}>All six scores</h2>
      <ul className='mt-4 flex flex-col gap-3'>
        {ranked.map((s) => (
          <li
            key={s.code}
            className='grid grid-cols-[8rem_1fr_2rem] items-center gap-3'
          >
            <span>{s.name}</span>
            <span
              className='h-3 rounded-full bg-default-100 overflow-hidden'
              aria-hidden='true'
            >
              <span
                className='block h-full rounded-full bg-primary'
                style={{ width: `${s.score * 10}%` }}
              />
            </span>
            <span className='text-right tabular-nums'>{s.score}</span>
          </li>
        ))}
      </ul>

      <h2 className={heading({ class: 'mt-12' })}>
        What do your Interests mean?
      </h2>
      <dl className='mt-4 flex flex-col gap-4'>
        {ranked.map((s) => (
          <div key={s.code}>
            <dt className='font-semibold'>{s.name}</dt>
            <dd className='text-default-600'>{describe(s.code).description}</dd>
          </div>
        ))}
      </dl>

      <h2 className={heading({ class: 'mt-12' })}>What is Your Job Zone?</h2>
      <p className='mt-4 text-default-600'>
        To figure out what careers to explore, it’s helpful to know how much
        education, training, and experience you need to do a job. This level of
        preparation is known as a Job Zone. Careers that require similar levels
        of preparation are grouped into the same Job Zone.
      </p>
      <div className='mt-4 flex flex-col gap-4'>
        {jobZones.map((zone) => (
          <div key={zone.zone}>
            <div className='font-semibold'>
              Job Zone {zone.zone} — {zone.title}
            </div>
            <ul className='list-disc pl-6 text-default-600'>
              {zone.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <h2 className={heading({ class: 'mt-12' })}>
        Exploring Careers Using Your Interests and Your Job Zone
      </h2>
      <p className='mt-4 text-default-600'>
        Using your Primary Interest and Job Zone allows you to find careers that
        match your interests and fit your amount of job preparation.
      </p>
      <ul className='mt-4 list-disc pl-6 flex flex-col gap-2'>
        <li>
          <ExternalLink href={onetLinks.careerListings}>
            O*NET Career Listings (PDF)
          </ExternalLink>{' '}
          — careers for each Interest and Job Zone. Find your Primary Interest,
          then your Job Zone.
        </li>
        <li>
          <ExternalLink href={onetLinks.interestBrowse}>
            My Next Move: browse careers by interest
          </ExternalLink>{' '}
          — a longer list, with details on tasks, skills, education and outlook.
          These pages describe the United States job market.
        </li>
      </ul>
      <p className='mt-6 text-default-600'>
        Want a second view? You can also take the free{' '}
        <Link href='/test' className='underline'>
          Big Five personality snapshot
        </Link>
        .
      </p>

      <LeadForm resultId={report.id} locale={locale} test='riasec' />
      <OnetAttribution />
    </section>
  );
}
