'use client';

import { useActionState, useEffect, useState } from 'react';
import { Input } from '@nextui-org/input';
import { Button } from '@nextui-org/button';
import { Card, CardBody } from '@nextui-org/card';
import { Checkbox } from '@nextui-org/react';
import { Radio, RadioGroup } from '@nextui-org/radio';
import { LeadState, saveLead } from '@/actions';
import { Link } from '@/navigation';
import {
  contactConsentText,
  leadRoles,
  practitioner,
  resultConsentText
} from '@/config/consent';

interface LeadFormProps {
  resultId: string;
  locale: string;
  test?: 'big5' | 'riasec';
}

// localStorage key each test uses for the result taken in this browser.
const ownedResultKey = { big5: 'resultId', riasec: 'riasecResultId' };

export const LeadForm = ({
  resultId,
  locale,
  test = 'big5'
}: LeadFormProps) => {
  const [state, formAction, pending] = useActionState<LeadState, FormData>(
    saveLead,
    { status: 'idle', message: '' }
  );
  const [contactConsent, setContactConsent] = useState(false);
  // Result pages are public to anyone with the link. Only offer to attach the
  // result when this browser is the one that took the test.
  const [ownsResult, setOwnsResult] = useState(false);
  useEffect(() => {
    try {
      setOwnsResult(localStorage.getItem(ownedResultKey[test]) === resultId);
    } catch {}
  }, [resultId, test]);

  return (
    <Card className='mt-16 print:hidden' shadow='sm'>
      <CardBody className='gap-4 p-6'>
        <h2 className='text-2xl font-semibold'>
          Want to talk through your profile?
        </h2>
        {test === 'riasec' ? (
          <p className='text-default-600'>
            Interest areas are a starting point, not a verdict. In 1:1 career
            coaching, {practitioner.name} helps you weigh your interests against
            your strengths, values and the options open to you. Leave your
            details if you would like to hear more. This is optional, and your
            results stay available either way.
          </p>
        ) : (
          <p className='text-default-600'>
            This free snapshot uses public-domain IPIP Big Five items. In 1:1
            leadership and career coaching, {practitioner.name} uses the
            WorkPlace Big Five Profile®, a separate workplace-focused
            assessment. Leave your details if you would like to hear more. This
            is optional, and your results stay available either way.
          </p>
        )}
        {state.status === 'success' ? (
          <p className='font-medium text-success-600' role='status'>
            {state.message}
          </p>
        ) : (
          <form action={formAction} className='flex flex-col gap-4'>
            <input type='hidden' name='locale' value={locale} />
            <input type='hidden' name='resultId' value={resultId} />
            <input type='hidden' name='resultTest' value={test} />
            <input
              type='text'
              name='website'
              tabIndex={-1}
              autoComplete='off'
              aria-hidden='true'
              className='hidden'
            />
            <div className='flex flex-col md:flex-row gap-4'>
              <Input
                name='name'
                label='Name'
                isRequired
                maxLength={100}
                autoComplete='name'
              />
              <Input
                name='email'
                type='email'
                label='Email'
                isRequired
                maxLength={200}
                autoComplete='email'
              />
            </div>
            <RadioGroup
              name='role'
              label='I am a… (optional)'
              orientation='horizontal'
              size='sm'
            >
              {leadRoles.map((role) => (
                <Radio key={role.id} value={role.id}>
                  {role.label}
                </Radio>
              ))}
            </RadioGroup>
            <Checkbox
              name='contactConsent'
              value='on'
              isSelected={contactConsent}
              onValueChange={setContactConsent}
              classNames={{ label: 'text-small' }}
            >
              {contactConsentText}
            </Checkbox>
            {ownsResult && (
              <Checkbox
                name='shareResult'
                value='on'
                classNames={{ label: 'text-small' }}
              >
                {resultConsentText} (optional)
              </Checkbox>
            )}
            <p className='text-small text-default-500'>
              Individual results are never shared with employers. See the{' '}
              <Link href='/privacy' className='underline'>
                privacy notice
              </Link>{' '}
              for how your details are used and how to have them deleted.
            </p>
            {state.status === 'error' && (
              <p className='text-small text-danger' role='alert'>
                {state.message}
              </p>
            )}
            <div>
              <Button
                type='submit'
                color='primary'
                isLoading={pending}
                isDisabled={!contactConsent}
              >
                Send
              </Button>
            </div>
          </form>
        )}
      </CardBody>
    </Card>
  );
};
