"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Eye, EyeOff, Lock, User, Shield, ArrowRight, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { signIn, signUp, resetPassword } from "@/lib/auth"

type AuthTab = "login" | "signup"

interface AuthScreenProps {
  initialTab?: AuthTab
  redirectTo?: string
}

export default function AuthScreen({ initialTab = "login", redirectTo = "/" }: AuthScreenProps) {
  const router = useRouter()
  const [tab, setTab] = useState<AuthTab>(initialTab)
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState("")
  const [info, setInfo] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setInfo("")
    setIsLoading(true)

    try {
      if (tab === "login") {
        await signIn(email.trim(), password)
        if (remember && typeof window !== "undefined") {
          localStorage.setItem("hof-remember-email", email.trim())
        }
        router.push(redirectTo)
        router.refresh()
      } else {
        const name = username.trim() || email.split("@")[0]
        await signUp(email.trim(), password, name)
        setInfo("Account created. Entering the arena…")
        router.push(redirectTo)
        router.refresh()
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong. Try again."
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotKey = async () => {
    if (!email.trim()) {
      setError("Enter your email above to reset your security key.")
      return
    }
    setError("")
    setInfo("")
    try {
      await resetPassword(email.trim())
      setInfo("If that email exists, a reset link was sent.")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Could not send reset email."
      setError(message)
    }
  }

  return (
    <div className="screen-mobile relative flex h-dvh w-full flex-col overflow-y-auto overflow-x-hidden bg-[#07090E]">
      <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))]">
        {/* Logo + tagline */}
        <div className="relative mb-6 flex flex-col items-center pt-2">
          <div className="pointer-events-none absolute top-[-24px] h-36 w-36 rounded-xl bg-[rgba(229,169,60,0.1)] blur-[32px]" />
          <Image
            src="/logo.png"
            alt="Hold'em or Fold'em Poker"
            width={131}
            height={152}
            priority
            className="relative z-10 h-[120px] w-auto object-contain drop-shadow-[0_0_24px_rgba(229,169,60,0.25)]"
          />
          <p className="mt-3 flex items-center gap-1.5 text-center text-xs text-slate-400">
            <span>Enter the Arena</span>
            <span className="text-[#E5A93C]">·</span>
            <span>Certified High Stakes</span>
          </p>
        </div>

        {/* Segmented tabs */}
        <div className="mb-6 flex h-[46px] items-center rounded-lg border border-slate-800 bg-[#0B0E14] p-1 shadow-[inset_0_2px_4px_1px_rgba(0,0,0,0.05)]">
          <button
            type="button"
            onClick={() => {
              setTab("login")
              setError("")
              setInfo("")
            }}
            className={cn(
              "flex h-9 flex-1 items-center justify-center rounded text-[13px] font-bold transition",
              tab === "login"
                ? "border border-[rgba(229,169,60,0.3)] bg-[#191C22] text-[#E5A93C] shadow-[0_0_12px_rgba(229,169,60,0.15)]"
                : "text-slate-400",
            )}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("signup")
              setError("")
              setInfo("")
            }}
            className={cn(
              "flex h-9 flex-1 items-center justify-center rounded text-[13px] font-bold transition",
              tab === "signup"
                ? "border border-[rgba(229,169,60,0.3)] bg-[#191C22] text-[#E5A93C] shadow-[0_0_12px_rgba(229,169,60,0.15)]"
                : "text-slate-400",
            )}
          >
            Sign Up
          </button>
        </div>

        {/* Card */}
        <div className="relative isolate flex flex-col gap-5 rounded-2xl border border-slate-800 bg-[rgba(25,28,34,0.9)] p-5 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] backdrop-blur-[6px]">
          <div className="pointer-events-none absolute top-px right-px left-px h-0.5 rounded-t-2xl bg-gradient-to-r from-transparent via-[rgba(229,169,60,0.6)] to-transparent" />

          {(error || info) && (
            <div
              className={cn(
                "rounded-lg border px-3 py-2 text-xs font-medium",
                error
                  ? "border-red-500/40 bg-red-500/10 text-red-200"
                  : "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
              )}
            >
              {error || info}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {tab === "signup" && (
              <Field label="Player Name">
                <div className="relative">
                  <User className="pointer-events-none absolute top-1/2 left-3.5 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    autoComplete="username"
                    placeholder="CardShark"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isLoading}
                    className="h-11 w-full rounded border border-slate-800 bg-[#10131A] py-3 pr-3 pl-10 text-[13px] text-slate-200 placeholder:text-slate-600 focus:border-[#E5A93C]/50 focus:outline-none"
                  />
                </div>
              </Field>
            )}

            <Field label="Email or Player ID">
              <div className="relative">
                <User className="pointer-events-none absolute top-1/2 left-3.5 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="cardshark@foldem.io"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                  className="h-11 w-full rounded border border-slate-800 bg-[#10131A] py-3 pr-3 pl-10 text-[13px] text-slate-200 placeholder:text-slate-600 focus:border-[#E5A93C]/50 focus:outline-none"
                />
              </div>
            </Field>

            <Field
              label="Security Key"
              trailing={
                tab === "login" ? (
                  <button
                    type="button"
                    onClick={handleForgotKey}
                    className="text-[11px] font-semibold text-[#E5A93C]"
                  >
                    Forgot Key?
                  </button>
                ) : null
              }
            >
              <div className="relative">
                <Lock className="pointer-events-none absolute top-1/2 left-3.5 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete={tab === "login" ? "current-password" : "new-password"}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  minLength={6}
                  className="h-11 w-full rounded border border-slate-800 bg-[#10131A] py-3 pr-11 pl-10 text-[13px] text-slate-200 placeholder:text-slate-600 focus:border-[#E5A93C]/50 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute top-1/2 right-1 flex h-9 w-10 -translate-y-1/2 items-center justify-center text-slate-500"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>

            {tab === "login" && (
              <label className="flex cursor-pointer items-center gap-2.5 pt-0.5">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded-sm border border-slate-600 bg-[#10131A] accent-[#E5A93C]"
                />
                <span className="text-xs text-slate-400">Remember this terminal</span>
              </label>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="mt-1 flex h-11 w-full items-center justify-center gap-2 rounded bg-gradient-to-r from-[#E5A93C] to-[#FABC4D] text-[13px] font-bold text-black shadow-[0_0_18px_rgba(229,169,60,0.35)] transition active:scale-[0.99] disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {tab === "login" ? "Entering…" : "Creating…"}
                </>
              ) : (
                <>
                  {tab === "login" ? "Enter Table" : "Join the Arena"}
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center py-1">
            <div className="h-px flex-1 bg-slate-800" />
            <span className="absolute left-1/2 -translate-x-1/2 bg-[#191C22] px-2.5 text-[10px] tracking-[1px] text-slate-500 uppercase">
              Or continue with
            </span>
          </div>

          {/* Social */}
          <div className="flex gap-2.5">
            <SocialButton label="Google" onClick={() => setInfo("Google sign-in coming soon.")}>
              <GoogleIcon />
            </SocialButton>
            <SocialButton label="Apple" onClick={() => setInfo("Apple sign-in coming soon.")}>
              <AppleIcon />
            </SocialButton>
          </div>
        </div>

        {/* Bottom switcher */}
        <p className="mt-5 flex items-center justify-center gap-1 text-center text-[13px] text-slate-400">
          {tab === "login" ? (
            <>
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => setTab("signup")}
                className="inline-flex items-center gap-0.5 font-bold text-[#E5A93C]"
              >
                Sign up free
                <ArrowRight className="h-2.5 w-2.5" />
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setTab("login")}
                className="inline-flex items-center gap-0.5 font-bold text-[#E5A93C]"
              >
                Log in
                <ArrowRight className="h-2.5 w-2.5" />
              </button>
            </>
          )}
        </p>

        {/* Trust row */}
        <div className="mt-6 mb-2 flex flex-wrap items-center justify-center gap-4 text-[10px] tracking-[0.5px] text-slate-500 uppercase">
          <span className="inline-flex items-center gap-1">
            <Shield className="h-3 w-3 text-[#E5A93C]" />
            Certified RNG
          </span>
          <span className="inline-flex items-center gap-1">
            <Lock className="h-3 w-3 text-emerald-400" />
            256-Bit SSL
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Fast-Seat Ready
          </span>
        </div>

        <p className="pb-2 text-center text-[10px] text-slate-600">
          <Link href="/" className="hover:text-slate-400">
            Continue as guest →
          </Link>
        </p>
      </div>
    </div>
  )
}

function Field({
  label,
  trailing,
  children,
}: {
  label: string
  trailing?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="flex w-full flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-bold tracking-[0.55px] text-slate-400 uppercase">{label}</label>
        {trailing}
      </div>
      {children}
    </div>
  )
}

function SocialButton({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-10 flex-1 items-center justify-center rounded border border-slate-800 bg-[#10131A] text-slate-300 transition active:scale-[0.98]"
    >
      {children}
    </button>
  )
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}

function AppleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden className="text-slate-300">
      <path d="M16.365 1.43c0 1.14-.46 2.2-1.22 2.98-.8.84-2.12 1.49-3.24 1.4-.14-1.1.44-2.26 1.2-3.02.82-.82 2.22-1.42 3.26-1.36zM20.9 17.4c-.52 1.16-.77 1.68-1.44 2.7-.94 1.42-2.26 3.18-3.9 3.2-1.46.02-1.84-.94-3.82-.93-1.98.01-2.4.95-3.86.93-1.64-.02-2.9-1.62-3.84-3.04C2.1 17.3.9 12.9 2.86 9.86c.98-1.5 2.54-2.46 4.06-2.46 1.52 0 2.48.95 3.74.95 1.22 0 1.96-.96 3.72-.96 1.34 0 2.76.73 3.76 1.98-3.3 1.8-2.76 6.5.76 8.03z" />
    </svg>
  )
}
