'use client';

import React, { Suspense, useEffect, useState } from 'react';
import ResetPassword from '@/app/components/Auth/ResetPassword';
import { useSearchParams } from 'next/navigation';

export default function ResetPasswordPage() {
  const [params, setParams] = useState({ userId: '', token: '' });
  
  useEffect(() => {
    // Extract userId and token from the URL path
    const path = window.location.pathname;
    const matches = path.match(/\/reset-password\/([^\/]+)\/([^\/]+)/);
    
    if (matches) {
      setParams({
        userId: matches[1],
        token: matches[2]
      });
    }
  }, []);

  return (
    <main className="min-h-screen bg-[#002222]">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-[#00ffff] text-lg">Loading...</div>
        </div>
      }>
        <ResetPassword userId={params.userId} token={params.token} />
      </Suspense>
    </main>
  );
}