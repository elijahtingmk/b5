'use client';
import { title } from '@/components/primitives';
import { Accordion, AccordionItem } from '@nextui-org/accordion';
import { practitioner } from '@/config/consent';

export default function FaqPage() {
  const faq = [
    {
      question: 'Who runs this site?',
      answer: `${practitioner.displayName}, a leadership, workplace resilience and psychosocial safety practitioner in ${practitioner.location}. See ${practitioner.website}.`
    },
    {
      question: 'Is this a clinical or diagnostic test?',
      answer:
        'No. It is a self-reflection tool based on public-domain IPIP items. It does not diagnose anything and should not be used for hiring or employment decisions.'
    },
    {
      question: 'Will my employer see my results?',
      answer:
        'No. Individual results are never shared with employers. Anyone who has your result ID or link can open your result page, so share it only with people you choose.'
    },
    {
      question: 'Do I need to give my name or email?',
      answer:
        'No. The test and your results work without them. Leaving your details on the results page is optional and only used to contact you if you ask.'
    },
    {
      question: 'How is this different from the WorkPlace Big Five Profile®?',
      answer:
        'This is a free snapshot using public-domain items. The WorkPlace Big Five Profile® is a separate, certified workplace-focused assessment, and the one Elijah normally uses in 1:1 leadership and career coaching. For a lower-cost option, coaching can build on your results from this free test instead.'
    },
    {
      question:
        'How is the Career Interest Checklist different from Career Direct®?',
      answer:
        'The checklist is a free, 60-activity interest profile from the O*NET® Interest Profiler. Career Direct® is a separate career assessment that Elijah normally uses in 1:1 career coaching. For a lower-cost option, coaching can build on your checklist results instead.'
    },
    {
      question: 'How do I print my test results?',
      answer:
        'Use the PDF button on the results page, or print the page from your browser.'
    },
    {
      question: 'How do I get my data deleted?',
      answer: `Email ${practitioner.email}. To delete a test result, include its result ID.`
    },
    {
      question:
        'Where can I find more information about the questions and the evaluation?',
      answer:
        'The questions and scoring come from the International Personality Item Pool (ipip.ori.org).'
    },
    {
      question: 'I found an error on this website',
      answer: `Please email ${practitioner.email}.`
    }
  ];
  return (
    <div>
      <h1 className={title()}>Frequently asked questions.</h1>
      <Accordion className='mt-10'>
        {faq.map((item, index) => (
          <AccordionItem
            key={index}
            textValue={item.question}
            title={
              <span className='text-foreground text-large font-medium'>
                {item.question}
              </span>
            }
          >
            <div className='py-2 pt-0 pb-6 text-base text-default-500'>
              {item.answer}
            </div>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
