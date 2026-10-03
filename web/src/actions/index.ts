'use server';

import { getDb, newId } from '@/db';
import { B5Error, DbResult, Feedback } from '@/types';
import { testSchema } from '@/schemas';
import { validId } from '@/lib/helpers';
import calculateScore from '@bigfive-org/score';
import generateResult, {
  getInfo,
  Language,
  Domain
} from '@bigfive-org/results';

const resultLanguages = getInfo().languages;

export type Report = {
  id: string;
  timestamp: number;
  availableLanguages: Language[];
  language: string;
  results: Domain[];
};

export async function getTestResult(
  id: string,
  language?: string
): Promise<Report | undefined> {
  'use server';
  try {
    const normalizedId = id.toLowerCase();
    const db = await getDb();
    const report = validId(normalizedId)
      ? await db
          .prepare(
            'SELECT id, lang, date_stamp, answers FROM results WHERE id = ?'
          )
          .bind(normalizedId)
          .first<{
            id: string;
            lang: string;
            date_stamp: string;
            answers: string;
          }>()
      : null;
    if (!report) {
      console.error(`The test results with id ${id} are not found!`);
      throw new B5Error({
        name: 'NotFoundError',
        message: `The test results with id ${id} is not found in the database!`
      });
    }
    const selectedLanguage =
      language ||
      (!!resultLanguages.find((l) => l.id == report.lang) ? report.lang : 'en');
    const scores = calculateScore({ answers: JSON.parse(report.answers) });
    const results = generateResult({ lang: selectedLanguage, scores });
    return {
      id: report.id,
      timestamp: Date.parse(report.date_stamp),
      availableLanguages: resultLanguages,
      language: selectedLanguage,
      results
    };
  } catch (error) {
    if (error instanceof B5Error) {
      throw error;
    }
    console.error(error);
    throw new Error('Something wrong happend. Failed to get test result!');
  }
}

export async function saveTest(testResult: DbResult) {
  'use server';
  try {
    const test = testSchema.parse(testResult);
    const id = newId();
    const db = await getDb();
    await db
      .prepare(
        `INSERT INTO results (id, test_id, lang, invalid, time_elapsed, date_stamp, answers)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        id,
        test.testId,
        test.lang,
        test.invalid ? 1 : 0,
        Math.round(test.timeElapsed),
        test.dateStamp.toISOString(),
        JSON.stringify(test.answers)
      )
      .run();
    return { id };
  } catch (error) {
    console.error(error);
    throw new B5Error({
      name: 'SavingError',
      message: 'Failed to save test result!'
    });
  }
}

export type FeebackState = {
  message: string;
  type: 'error' | 'success';
};

export async function saveFeedback(
  prevState: FeebackState,
  formData: FormData
): Promise<FeebackState> {
  'use server';
  const feedback: Feedback = {
    name: String(formData.get('name')),
    email: String(formData.get('email')),
    message: String(formData.get('message'))
  };
  try {
    const db = await getDb();
    await db
      .prepare('INSERT INTO feedback (name, email, message) VALUES (?, ?, ?)')
      .bind(
        feedback.name.slice(0, 200),
        feedback.email.slice(0, 200),
        feedback.message.slice(0, 5000)
      )
      .run();
    return {
      message: 'Sent successfully!',
      type: 'success'
    };
  } catch (error) {
    return {
      message: 'Error sending feedback!',
      type: 'error'
    };
  }
}
