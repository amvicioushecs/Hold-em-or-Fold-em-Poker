'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import AuthScreen from '@/components/auth-screen'

function LoginForm() {
  const searchParams = useSearchParams()
  const redirectedFrom = searchParams.get('redirectedFrom') || '/'

  return <AuthScreen initialTab="login" redirectTo={redirectedFrom} />
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-dvh w-full items-center justify-center bg-[#07090E] text-sm text-slate-400">
          Loading…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
