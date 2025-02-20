'use client';

import React, { Suspense } from 'react';
import ResetPassword from '@/app/components/Auth/ResetPassword';

interface Props {
  params: {
    uid: string;
    access_token: string;
  };
}

export default function ResetPasswordPage({ params }: Props) {
  return (
    <main className="min-h-screen bg-[#002222]">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-[#00ffff] text-lg">Loading...</div>
        </div>
      }>
        <ResetPassword userId={params.uid} token={params.access_token} />
      </Suspense>
    </main>
  );
}
