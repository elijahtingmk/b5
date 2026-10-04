import { Link as NextUILink } from '@nextui-org/link';
import { Link } from '../navigation';

import { Logo } from '@/components/icons';
import { siteConfig } from '@/config/site';

interface FooterProps {
  footerLinks: {
    label: string;
    href: string;
  }[];
}

export default function Footer({ footerLinks }: FooterProps) {
  const year = new Date().getFullYear();
  return (
    <footer className='container mx-auto max-w-7xl py-24 px-12'>
      <div className='container mx-auto flex justify-between'>
        <div className='w-1/2'>
          <span className='text-center'>
            <Logo />
          </span>
        </div>
        <div className='w-1/2 flex justify-end items-center'>
          <NextUILink
            isExternal
            href={siteConfig.links.practice}
            className='text-default-500'
          >
            drelijah.org
          </NextUILink>
        </div>
      </div>

      <div className='w-full flex justify-center mt-12'>
        <ul className='flex mt-3 text-sm font-medium text-gray-500 dark:text-gray-400 sm:mt-0'>
          {footerLinks.map((item, index) => (
            <li key={index}>
              <Link href={item.href} className='hover:underline me-4 md:me-6'>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className='flex text-sm text-gray-500 sm:ml-4 sm:pl-4 sm:py-2 mt-14 justify-center'>
        © {year} {siteConfig.creator}. Built on the open-source&nbsp;
        <NextUILink
          isExternal
          size='sm'
          href={siteConfig.links.upstream}
          className='text-gray-500'
        >
          bigfive-web
        </NextUILink>
        &nbsp;project.
      </div>
    </footer>
  );
}
