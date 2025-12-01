'use client';

import type { ReactNode } from 'react';
import { Header } from '@/components/layout';

export default function ProfileLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}
