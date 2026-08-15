import { supabase, isSupabaseConfigured } from './supabase'
import type { User } from '@supabase/supabase-js'

// Simple LocalStorage Mock Auth implementation for testing
const getMockUsers = (): any[] => {
  if (typeof window === 'undefined') return []
  return JSON.parse(localStorage.getItem('mock_users') || '[]')
}

const saveMockUsers = (users: any[]) => {
  if (typeof window === 'undefined') return
  localStorage.setItem('mock_users', JSON.stringify(users))
}

const getMockCurrentUser = (): any | null => {
  if (typeof window === 'undefined') return null
  return JSON.parse(localStorage.getItem('mock_current_user') || 'null')
}

const setMockCurrentUser = (user: any | null) => {
  if (typeof window === 'undefined') return
  if (user) {
    localStorage.setItem('mock_current_user', JSON.stringify(user))
  } else {
    localStorage.removeItem('mock_current_user')
  }
}

export async function signUp(email: string, password: string, username: string) {
  if (!isSupabaseConfigured) {
    const users = getMockUsers()
    if (users.some((u) => u.email === email)) {
      throw new Error('User already exists')
    }

    const mockUser = {
      id: `mock-user-${Date.now()}`,
      email,
      user_metadata: { username },
    }

    const mockProfile = {
      id: `mock-profile-${Date.now()}`,
      auth_id: mockUser.id,
      email,
      username,
      chip_stack: 10000,
    }

    users.push({ ...mockUser, password, profile: mockProfile })
    saveMockUsers(users)
    setMockCurrentUser(mockUser)

    return { user: mockUser, profile: mockProfile }
  }

  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
      },
    })

    if (authError) throw authError
    if (!authData.user) throw new Error('Failed to create user')

    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        auth_id: authData.user.id,
        email,
        username,
      })
      .select()
      .single()

    if (userError) throw userError

    const { error: profileError } = await supabase
      .from('player_profiles')
      .insert({
        user_id: userData.id,
        display_name: username,
        chip_stack: 0,
      })

    if (profileError) throw profileError

    const { error: statsError } = await supabase
      .from('player_stats')
      .insert({
        user_id: userData.id,
      })

    if (statsError) throw statsError

    return { user: authData.user, profile: userData }
  } catch (error) {
    console.error('[v0] Sign up error:', error)
    throw error
  }
}

export async function signIn(email: string, password: string) {
  if (!isSupabaseConfigured) {
    const users = getMockUsers()
    const found = users.find((u) => u.email === email && u.password === password)
    if (!found) {
      throw new Error('Invalid credentials')
    }

    const mockUser = {
      id: found.id,
      email: found.email,
      user_metadata: found.user_metadata,
    }
    setMockCurrentUser(mockUser)
    return { user: mockUser }
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    return data
  } catch (error) {
    console.error('[v0] Sign in error:', error)
    throw error
  }
}

export async function signOut() {
  if (!isSupabaseConfigured) {
    setMockCurrentUser(null)
    return
  }

  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  } catch (error) {
    console.error('[v0] Sign out error:', error)
    throw error
  }
}

export async function getCurrentUser(): Promise<User | null> {
  if (!isSupabaseConfigured) {
    return getMockCurrentUser() as any
  }

  try {
    const { data: { user } } = await supabase.auth.getUser()
    return user || null
  } catch (error) {
    console.error('[v0] Get current user error:', error)
    return null
  }
}

export async function getCurrentUserProfile() {
  if (!isSupabaseConfigured) {
    const currentUser = getMockCurrentUser()
    if (!currentUser) return null
    const users = getMockUsers()
    const found = users.find((u) => u.id === currentUser.id)
    return found?.profile || null
  }

  try {
    const user = await getCurrentUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', user.id)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('[v0] Get user profile error:', error)
    return null
  }
}

export async function updateUserProfile(updates: any) {
  if (!isSupabaseConfigured) {
    const currentUser = getMockCurrentUser()
    if (!currentUser) throw new Error('Not authenticated')
    const users = getMockUsers()
    const userIdx = users.findIndex((u) => u.id === currentUser.id)
    if (userIdx === -1) throw new Error('User profile not found')
    
    users[userIdx].profile = { ...users[userIdx].profile, ...updates }
    saveMockUsers(users)
    return users[userIdx].profile
  }

  try {
    const user = await getCurrentUser()
    if (!user) throw new Error('Not authenticated')

    const userProfile = await getCurrentUserProfile()
    if (!userProfile) throw new Error('User profile not found')

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userProfile.id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('[v0] Update profile error:', error)
    throw error
  }
}

export async function getPlayerProfile(userId: string) {
  if (!isSupabaseConfigured) {
    const users = getMockUsers()
    const found = users.find((u) => u.id === userId)
    return found?.profile || null
  }

  try {
    const { data, error } = await supabase
      .from('player_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('[v0] Get player profile error:', error)
    throw error
  }
}

export async function updatePlayerProfile(userId: string, updates: any) {
  if (!isSupabaseConfigured) {
    const users = getMockUsers()
    const userIdx = users.findIndex((u) => u.id === userId)
    if (userIdx === -1) throw new Error('Player profile not found')
    users[userIdx].profile = { ...users[userIdx].profile, ...updates }
    saveMockUsers(users)
    return users[userIdx].profile
  }

  try {
    const { data, error } = await supabase
      .from('player_profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('[v0] Update player profile error:', error)
    throw error
  }
}

export async function resetPassword(email: string) {
  if (!isSupabaseConfigured) {
    return
  }

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) throw error
  } catch (error) {
    console.error('[v0] Reset password error:', error)
    throw error
  }
}
