import type { Metadata } from 'next';
import RestaurantsPage from '@/components/pages/restaurants/RestaurantsPage';

export const metadata: Metadata = {
  title: 'Розробка сайтів для ресторанів | Structio',
  description:
    'Створюємо сучасні сайти для ресторанів: онлайн-бронювання, мобільне меню, SEO та швидке завантаження. Запуск за 14 днів.',
  openGraph: {
    title: 'Розробка сайтів для ресторанів | Structio',
    description:
      'Сучасний сайт для вашого ресторану — онлайн-бронювання, мобільна оптимізація, SEO. Запуск за 14 днів.',
    url: 'https://structio.dev/restaurants',
    siteName: 'Structio',
    type: 'website',
    locale: 'uk_UA',
    images: [
      {
        url: '/struction-icon-512.png',
        width: 512,
        height: 512,
        alt: 'Structio — веб-розробка для ресторанів',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Розробка сайтів для ресторанів | Structio',
    description:
      'Сучасний сайт для ресторану: онлайн-бронювання, мобільна оптимізація, SEO. Запуск за 14 днів.',
  },
  alternates: {
    canonical: 'https://structio.dev/restaurants',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: 'Structio',
  description:
    'Розробка сайтів для ресторанів — сучасний дизайн, мобільна оптимізація, SEO та онлайн-бронювання.',
  url: 'https://structio.dev/restaurants',
  serviceType: 'Web Development',
  areaServed: {
    '@type': 'Country',
    name: 'Ukraine',
  },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Restaurant Website Development Services',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: 'Restaurant Website Design' },
      },
      {
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: 'Online Table Booking Integration' },
      },
      {
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: 'Mobile-First Development' },
      },
      {
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: 'SEO Optimization' },
      },
    ],
  },
};

export default function RestaurantsRoute() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <RestaurantsPage />
    </>
  );
}
