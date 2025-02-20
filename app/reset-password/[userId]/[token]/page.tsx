import React, { Suspense } from 'react';
import ResetPassword from '@/app/components/Auth/ResetPassword';

type Props = {
  params: {
    userId: string;
    token: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
};

export default async function ResetPasswordPage({ params }: Props) {
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
