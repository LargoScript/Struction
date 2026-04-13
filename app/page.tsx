import type { Metadata } from 'next';
import App from '@/App';

export const metadata: Metadata = {
  title: 'Structio — Custom Websites for Modern Businesses',
  description: 'Structio builds high-performance, design-first websites tailored for your industry — restaurants, clinics, beauty salons, and more.',
  openGraph: {
    title: 'Structio — Custom Websites for Modern Businesses',
    description: 'Design-first websites tailored for restaurants, clinics, beauty salons, kiosks, and more.',
    url: 'https://structio.dev',
    siteName: 'Structio',
    type: 'website',
  },
};

export default function HomePage() {
  return <App />;
}
