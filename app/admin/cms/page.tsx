"use client";
import dynamic from 'next/dynamic';

// CMSPage uses browser APIs (window, localStorage, BroadcastChannel) — disable SSR
const CMSPage = dynamic(() => import('@/components/CMSPage'), { ssr: false });

export default function CMSRoute() {
  return <CMSPage />;
}
