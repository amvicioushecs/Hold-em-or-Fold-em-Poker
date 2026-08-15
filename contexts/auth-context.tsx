'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { getCurrentUser, getCurrentUserProfile } from '@/lib/auth'

interface AuthContextType {
  user: User | null
  userProfile: any
  isLoading: boolean
  isAuthenticated: boolean
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  isLoading: true,
  isAuthenticated: false,
  refreshProfile: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshProfile = async () => {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
      if (currentUser) {
        const profile = await getCurrentUserProfile()
        setUserProfile(profile)
      } else {
        setUserProfile(null)
      }
    } catch (e) {
      console.error("Failed to refresh profile", e)
    }
  }

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)

        if (currentUser) {
          const profile = await getCurrentUserProfile()
          setUserProfile(profile)
        }
      } catch (error) {
        console.error('[v0] Auth initialization error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()

    if (isSupabaseConfigured && supabase) {
      // Subscribe to auth changes if Supabase is configured
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event: any, session: any) => {
          setUser(session?.user ?? null)
          if (session?.user) {
            const profile = await getCurrentUserProfile()
            setUserProfile(profile)
          } else {
            setUserProfile(null)
          }
        }
      )

      return () => {
        subscription?.unsubscribe()
      }
    } else {
      // Simple local polling or event listener for mock auth changes
      const handleStorageChange = () => {
        initializeAuth()
      }
      window.addEventListener('storage', handleStorageChange)
      
      // Also poll every 2 seconds to capture local changes in same tab
      const interval = setInterval(initializeAuth, 2000)

      return () => {
        window.removeEventListener('storage', handleStorageChange)
        clearInterval(interval)
      }
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        isLoading,
        isAuthenticated: !!user,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
