import { Metadata, Viewport } from 'next/types';

export const viewport: Viewport = {
  themeColor: '#0f172a'
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
    </>
  );
} 