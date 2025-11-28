'use client';

import type { ReactNode } from 'react';
import Header from '../components/Header';

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
