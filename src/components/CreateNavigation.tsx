'use client';

import { createNavigation } from 'next-intl/navigation';
import { useLocale } from 'next-intl';
import { useEffect } from 'react';

export const { Link, redirect, usePathname, useRouter } = createNavigation({
  locales: ['en', 'ru'],
  pathnames: {
    '/': '/',
    '/about': '/about',
    '/results': '/results',
    '/results/[id]': '/results/[id]',
  },
});

export default function CreateNavigation({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = useLocale();

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return <>{children}</>;
}
