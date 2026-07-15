import type { Metadata } from 'next';
import HomePageClient from '@/app/components/HomePageClient';

export const metadata: Metadata = {
  title: 'ホーム',
};

export default function Home() {
  return <HomePageClient />;
}
