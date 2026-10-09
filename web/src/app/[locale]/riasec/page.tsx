import { setRequestLocale } from 'next-intl/server';
import { title } from '@/components/primitives';
import { OnetAttribution } from '@/components/onet-attribution';
import { Checklist } from './checklist';

export const metadata = {
  title: 'Career Interest Checklist (RIASEC)',
  description:
    'Free 60-activity career interest checklist based on the O*NET® Interest Profiler Short Form. See your Holland Code (RIASEC) interest areas.'
};

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function RiasecPage(props: Props) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  return (
    <section lang='en'>
      <h1 className={title()}>Career Interest Checklist</h1>
      <p className='mt-4 text-default-600'>
        O*NET® Interest Profiler Short Form · Holland Code (RIASEC) · 60
        activities · English only
      </p>
      <Checklist />
      <OnetAttribution />
    </section>
  );
}
