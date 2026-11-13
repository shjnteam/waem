import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'وائم | WAEM 360°',
  description: 'منصة وائم الذكية لإدارة المشروع والمال والقرار',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ar" dir="rtl"><body>{children}</body></html>;
}
