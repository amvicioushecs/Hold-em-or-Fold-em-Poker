"use client"

import * as React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface AuthFormProps {
  mode: "login" | "signup"
}

function AuthForm({ mode }: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // TODO: Implement actual authentication logic
    await new Promise((resolve) => setTimeout(resolve, 1000))
    
    setIsLoading(false)
  }

  const isSignup = mode === "signup"

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isSignup && (
        <div className="space-y-2">
          <label 
            htmlFor="username" 
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Username
          </label>
          <Input
            id="username"
            type="text"
            placeholder="Choose a username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            disabled={isLoading}
            className="h-12 text-base md:text-sm touch-manipulation active:scale-[0.99] transition-transform"
            autoComplete="username"
            required
          />
        </div>
      )}

      <div className="space-y-2">
        <label 
          htmlFor="email" 
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Email
        </label>
        <Input
          id="email"
          type="email"
          placeholder="name@example.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          disabled={isLoading}
          className="h-12 text-base md:text-sm touch-manipulation active:scale-[0.99] transition-transform"
          autoComplete={isSignup ? "email" : "username"}
          required
        />
      </div>

      <div className="space-y-2">
        <label 
          htmlFor="password" 
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Password
        </label>
        <Input
          id="password"
          type="password"
          placeholder={isSignup ? "Create a password" : "Enter your password"}
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          disabled={isLoading}
          className="h-12 text-base md:text-sm touch-manipulation active:scale-[0.99] transition-transform"
          autoComplete={isSignup ? "new-password" : "current-password"}
          required
          minLength={8}
        />
      </div>

      {isSignup && (
        <div className="space-y-2">
          <label 
            htmlFor="confirmPassword" 
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Confirm Password
          </label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            disabled={isLoading}
            className="h-12 text-base md:text-sm touch-manipulation active:scale-[0.99] transition-transform"
            autoComplete="new-password"
            required
          />
        </div>
      )}

      {mode === "login" && (
        <div className="flex items-center justify-between">
          <label className="flex items-center space-x-2 cursor-pointer touch-manipulation">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 focus:ring-primary touch-manipulation"
            />
            <span className="text-sm text-muted-foreground">Remember me</span>
          </label>
          <button
            type="button"
            className="text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Forgot password?
          </button>
        </div>
      )}

      <Button
        type="submit"
        className="w-full h-12 text-base font-semibold touch-manipulation active:scale-[0.98] transition-transform"
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            {isSignup ? "Creating account..." : "Signing in..."}
          </span>
        ) : (
          isSignup ? "Create Account" : "Sign In"
        )}
      </Button>

      {isSignup && (
        <p className="text-xs text-muted-foreground text-center">
          By creating an account, you agree to our{" "}
          <button type="button" className="text-primary hover:underline">
            Terms of Service
          </button>{" "}
          and{" "}
          <button type="button" className="text-primary hover:underline">
            Privacy Policy
          </button>
        </p>
      )}
    </form>
  )
}

function SocialLogin() {
  const handleSocialLogin = async (provider: string) => {
    // TODO: Implement social login
    console.log(`Login with ${provider}`)
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="outline"
          className="h-12 touch-manipulation active:scale-[0.98] transition-transform"
          onClick={() => handleSocialLogin("google")}
        >
          <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Google
        </Button>

        <Button
          type="button"
          variant="outline"
          className="h-12 touch-manipulation active:scale-[0.98] transition-transform"
          onClick={() => handleSocialLogin("apple")}
        >
          <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"
            />
          </svg>
          Apple
        </Button>
      </div>
    </div>
  )
}

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login")

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center p-4 md:p-6 lg:p-8 bg-gradient-to-br from-background via-background to-muted/20">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo and Header */}
        <div className="text-center mb-6 md:mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-primary text-primary-foreground mb-4 shadow-lg">
            <svg className="w-8 h-8 md:w-10 md:h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Welcome to Poker Game
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-2">
            Sign in to continue your journey
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-card rounded-2xl shadow-xl border border-border p-6 md:p-8">
          <Tabs
            defaultValue="login"
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as "login" | "signup")}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 h-12 mb-6 touch-manipulation">
              <TabsTrigger 
                value="login" 
                className="text-base font-medium data-[state=active]:h-10 data-[state=active]:transition-all"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger 
                value="signup" 
                className="text-base font-medium data-[state=active]:h-10 data-[state=active]:transition-all"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-6">
              <AuthForm mode="login" />
              <SocialLogin />
            </TabsContent>

            <TabsContent value="signup" className="space-y-6">
              <AuthForm mode="signup" />
              <SocialLogin />
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Protected by reCAPTCHA and subject to the{" "}
          <button className="hover:underline">Privacy Policy</button> and{" "}
          <button className="hover:underline">Terms of Service</button>.
        </p>
      </div>
    </div>
  )
}
