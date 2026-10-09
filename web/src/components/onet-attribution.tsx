import { onetLinks } from '@/config/riasec';

const A = ({ href, children }: { href: string; children: string }) => (
  <a
    href={href}
    target='_blank'
    rel='noopener noreferrer'
    className='underline'
  >
    {children}
  </a>
);

// Credit wording as required by the O*NET Career Exploration Tools licence
// (https://www.onetcenter.org/license_tools.html, option 1). Keep it verbatim.
export const OnetAttribution = () => (
  <aside
    lang='en'
    className='mt-16 border-t border-default-200 pt-6 text-small text-default-500 space-y-2'
  >
    <p>
      This page includes information from the{' '}
      <A href={onetLinks.tools}>O*NET Career Exploration Tools</A> by the{' '}
      <A href={onetLinks.usdolEta}>
        U.S. Department of Labor, Employment and Training Administration
      </A>{' '}
      (USDOL/ETA). Used under the <A href={onetLinks.license}>CC BY-ND 4.0</A>{' '}
      license. O*NET® is a trademark of USDOL/ETA.
    </p>
    <p>
      The O*NET Career Exploration Tools are sponsored by the U.S. Department of
      Labor, Employment and Training Administration (USDOL/ETA), and developed
      by the National Center for O*NET Development.
    </p>
    <p>
      drelijah.org is independent and is not affiliated with or endorsed by
      USDOL/ETA or the National Center for O*NET Development.
    </p>
  </aside>
);
