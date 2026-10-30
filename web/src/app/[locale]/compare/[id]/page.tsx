import { notFound } from 'next/navigation';
import { base64url } from '@/lib/helpers';
import { getTestResult } from '@/actions';
import { title } from '@/components/primitives';
import { DomainComparePage } from './domain';
import { BarChartCompare } from '@/components/bar-chart-generic';

interface ComparePageProps {
  params: Promise<{
    id: string;
  }>;
}

type Person = {
  id: string;
  name: string;
};

// Malformed or unknown compare links should give a 404, not a server error.
const parsePeople = (id: string): Person[] | null => {
  let decoded: unknown;
  try {
    decoded = base64url.decode(id);
  } catch {
    return null;
  }
  if (!Array.isArray(decoded) || decoded.length === 0) return null;
  const isPerson = (p: unknown): p is Person =>
    typeof p === 'object' &&
    p !== null &&
    typeof (p as Person).id === 'string' &&
    typeof (p as Person).name === 'string';
  return decoded.every(isPerson) ? decoded : null;
};

const isNotFoundError = (error: unknown): boolean =>
  error instanceof Error && error.name === 'NotFoundError';

export default async function ComparePage(props: ComparePageProps) {
  const params = await props.params;

  const { id } = params;

  const people = parsePeople(id);
  if (!people) notFound();

  const reports = await Promise.all(
    people.map(async (person) => {
      const report = await getTestResult(person.id).catch(
        (error: unknown): never => {
          if (isNotFoundError(error)) notFound();
          throw error;
        }
      );
      if (!report) notFound();
      return {
        name: person.name,
        report
      };
    })
  );

  const categories = reports[0].report.results.map((result) => result.title);

  const series = reports.map(({ name, report }) => {
    return {
      name,
      data: report.results.map((result) => result.score)
    };
  });
  const getNamedFacets = (domain: string) =>
    reports.map((report) => {
      const domainResult = report.report.results.find(
        (result) => result.domain === domain
      );
      return {
        name: report.name,
        facets: domainResult?.facets
      };
    });

  return (
    <>
      <h1 className={title()}>Overview</h1>
      <BarChartCompare max={120} categories={categories} series={series} />
      {reports[0].report.results.map((domain) => (
        <DomainComparePage
          key={domain.domain}
          title={domain.title}
          shortDescription={domain.shortDescription}
          // @ts-ignore
          domain={getNamedFacets(domain.domain)}
        />
      ))}
    </>
  );
}
