import SimpleSignUp from '@/app/components/Auth/SimpleSignUp';

export default function SignupPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md space-y-8">
        <SimpleSignUp />
      </div>
    </div>
  );
} 