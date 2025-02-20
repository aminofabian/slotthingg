import React, { Suspense } from 'react';
import ResetPassword from '@/app/components/Auth/ResetPassword';

interface ResetPasswordPageProps {
  params: {
    userId: string;
    token: string;
  };
}

export default function ResetPasswordPage({ params }: ResetPasswordPageProps) {
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
