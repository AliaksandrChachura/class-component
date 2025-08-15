import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { NextIntlClientProvider } from 'next-intl';
import LanguageSwitcher from '../LanguageSwitcher';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  usePathname: () => '/en',
}));

// Mock next-intl
vi.mock('next-intl', async () => {
  const actual = await vi.importActual('next-intl');
  return {
    ...actual,
    useLocale: () => 'en',
    useTranslations: () => (key: string) => {
      // Return actual translated text for common keys
      if (key === 'language') return 'Language';
      return key;
    },
  };
});

const messages = {
  common: {
    language: 'Language',
  },
};

describe('LanguageSwitcher', () => {
  it('renders language switcher button', () => {
    render(
      <NextIntlClientProvider messages={messages} locale="en">
        <LanguageSwitcher />
      </NextIntlClientProvider>
    );

    expect(
      screen.getByRole('button', { name: 'Language' })
    ).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
  });

  it('shows dropdown when clicked', () => {
    render(
      <NextIntlClientProvider messages={messages} locale="en">
        <LanguageSwitcher />
      </NextIntlClientProvider>
    );

    const button = screen.getByRole('button', { name: 'Language' });
    fireEvent.click(button);

    // Check that both language options are in the dropdown
    expect(
      screen.getByText('English', { selector: '.language-switcher__option' })
    ).toBeInTheDocument();
    expect(
      screen.getByText('Русский', { selector: '.language-switcher__option' })
    ).toBeInTheDocument();
  });
});
