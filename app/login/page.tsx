'use client';

import { Suspense } from 'react';
import Login from '../components/Auth/Login';

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#002222]">
        <div className="animate-pulse text-[#00ffff]">Loading...</div>
      </div>
    }>
      <Login />
    </Suspense>
  );
}
