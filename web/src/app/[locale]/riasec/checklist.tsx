'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@nextui-org/button';
import { Card, CardBody } from '@nextui-org/card';
import { Checkbox } from '@nextui-org/react';
import { useRouter } from '@/navigation';
import { saveRiasec } from '@/actions/riasec';
import {
  RIASEC_ITEM_COUNT,
  riasecAreas,
  riasecInstructions
} from '@/config/riasec';

const DRAFT_KEY = 'riasecDraft';

export const Checklist = () => {
  const router = useRouter();
  const [checked, setChecked] = useState<boolean[]>(() =>
    Array(RIASEC_ITEM_COUNT).fill(false)
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const startedAt = useRef(Date.now());

  // Keep ticks if the page is reloaded before submitting.
  useEffect(() => {
    try {
      const draft = localStorage.getItem(DRAFT_KEY);
      if (draft && /^[01]+$/.test(draft) && draft.length === RIASEC_ITEM_COUNT)
        setChecked(draft.split('').map((c) => c === '1'));
    } catch {}
  }, []);

  const toggle = (index: number, value: boolean) => {
    setChecked((prev) => {
      const next = [...prev];
      next[index] = value;
      try {
        localStorage.setItem(
          DRAFT_KEY,
          next.map((v) => (v ? '1' : '0')).join('')
        );
      } catch {}
      return next;
    });
  };

  const total = checked.filter(Boolean).length;

  async function submit() {
    setSaving(true);
    setError('');
    try {
      const { id } = await saveRiasec({
        answers: checked.map((v) => (v ? '1' : '0')).join(''),
        timeElapsed: (Date.now() - startedAt.current) / 1000
      });
      try {
        localStorage.removeItem(DRAFT_KEY);
        localStorage.setItem('riasecResultId', id);
      } catch {}
      router.push(`/riasec/result/${id}`);
    } catch {
      setError('Sorry, your answers could not be saved. Please try again.');
      setSaving(false);
    }
  }

  let offset = 0;
  return (
    <div lang='en'>
      <p className='mt-6 text-lg font-medium'>{riasecInstructions}</p>
      <p className='mt-2 text-default-500'>
        The site counts your checks for you and shows your three highest
        interest areas.
      </p>
      <div className='mt-8 flex flex-col gap-6'>
        {riasecAreas.map((area) => {
          const start = offset;
          offset += area.items.length;
          const count = checked
            .slice(start, start + area.items.length)
            .filter(Boolean).length;
          return (
            <Card key={area.code} shadow='sm'>
              <CardBody className='p-5'>
                <div className='grid gap-x-8 gap-y-3 md:grid-cols-2 md:grid-flow-col md:grid-rows-5'>
                  {area.items.map((item, i) => (
                    <Checkbox
                      key={item}
                      isSelected={checked[start + i]}
                      onValueChange={(v) => toggle(start + i, v)}
                      classNames={{ label: 'text-medium' }}
                    >
                      {item}
                    </Checkbox>
                  ))}
                </div>
                <p className='mt-4 text-right text-small font-semibold text-default-600'>
                  {area.name} checks = {count}
                </p>
              </CardBody>
            </Card>
          );
        })}
      </div>
      <div className='mt-8 flex flex-col items-start gap-2'>
        {total === 0 && (
          <p className='text-small text-default-500'>
            Check at least one activity to see your results.
          </p>
        )}
        {error && (
          <p className='text-small text-danger' role='alert'>
            {error}
          </p>
        )}
        <Button
          color='primary'
          size='lg'
          radius='full'
          isDisabled={total === 0}
          isLoading={saving}
          onPress={submit}
        >
          See my results
        </Button>
      </div>
    </div>
  );
};
