'use client';

import { Button, Tooltip } from '@nextui-org/react';
import { CopyIcon, FacebookIcon, PDFIcon, TwitterIcon } from './icons';
import { Link as NextUiLink } from '@nextui-org/link';
import { Report } from '@/actions/index';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { useEffect, useState } from 'react';
import { basePath } from '@/config/site';

interface ShareBarProps {
  report: Report;
}

export default function ShareBar({ report }: ShareBarProps) {
  const [_, copy] = useCopyToClipboard();

  const handleCopy = (text: string) => async () => await copy(text);

  // Share links must point at whichever domain this copy of the site is
  // served from, otherwise they lead to a site that doesn't have the result.
  const [origin, setOrigin] = useState(basePath);
  useEffect(() => setOrigin(window.location.origin), []);
  const resultUrl = `${origin}/result/${report.id}`;

  return (
    <>
      <Tooltip color='secondary' content='Share on facebook'>
        <Button
          isIconOnly
          aria-label='Share on facebook'
          radius='full'
          size='md'
          variant='light'
          as={NextUiLink}
          isExternal
          href={`https://www.facebook.com/sharer/sharer.php?u=${resultUrl}`}
        >
          <FacebookIcon size={48} />
        </Button>
      </Tooltip>
      <Tooltip color='secondary' content='Share on X'>
        <Button
          isIconOnly
          aria-label='Share on X'
          radius='full'
          size='md'
          variant='light'
          target='_blank'
          as={NextUiLink}
          href={`https://twitter.com/intent/tweet?text=See my personality traits!&url=${resultUrl}`}
        >
          <TwitterIcon size={42} />
        </Button>
      </Tooltip>
      <Tooltip color='secondary' content='Download PDF'>
        <Button
          isIconOnly
          aria-label='Download pdf'
          radius='full'
          size='md'
          variant='light'
          onPress={() => window.print()}
        >
          <PDFIcon size={32} />
        </Button>
      </Tooltip>
      <Tooltip color='secondary' content='Copy link'>
        <Button
          isIconOnly
          aria-label='Copy link'
          radius='full'
          size='md'
          variant='light'
          onPress={handleCopy(resultUrl)}
        >
          <CopyIcon size={42} />
        </Button>
      </Tooltip>
    </>
  );
}
