import type { Metadata } from 'next';
import App from '@/App';

export const metadata: Metadata = {
  title: 'Struction — Custom Websites for Modern Businesses',
  description: 'Struction builds high-performance, design-first websites tailored for your industry — restaurants, clinics, beauty salons, and more.',
  openGraph: {
    title: 'Struction — Custom Websites for Modern Businesses',
    description: 'Design-first websites tailored for restaurants, clinics, beauty salons, kiosks, and more.',
    url: 'https://struction.dev',
    siteName: 'Struction',
    type: 'website',
  },
};

export default function HomePage() {
  return <App />;
}
