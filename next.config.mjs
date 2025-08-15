import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export', // Commented out for development
  // distDir: './dist', // Commented out for development
  // basePath: '/src/app', // Commented out - incorrect path
};

export default withNextIntl(nextConfig);
