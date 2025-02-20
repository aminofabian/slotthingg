'use client';

import React, { Suspense } from 'react';
import { useParams } from 'next/navigation';
import ResetPassword from '@/app/components/Auth/ResetPassword';

export default function ResetPasswordPage() {
  const params = useParams();
  const uid = params?.uid as string;
  const access_token = params?.access_token as string;

  return (
    <main className="min-h-screen bg-[#002222]">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-[#00ffff] text-lg">Loading...</div>
        </div>
      }>
        <ResetPassword userId={uid} token={access_token} />
      </Suspense>
    </main>
  );
}
