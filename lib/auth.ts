import { supabase } from './supabase'
import type { User } from '@supabase/supabase-js'

export async function signUp(email: string, password: string, username: string) {
  try {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    })

    if (authError) throw authError

    if (!authData.user) {
      throw new Error('Failed to create user')
    }

    // Create user profile in users table
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

    // Create player profile
    const { error: profileError } = await supabase
      .from('player_profiles')
      .insert({
        user_id: userData.id,
        display_name: username,
        chip_stack: 0,
      })

    if (profileError) throw profileError

    // Create player stats
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
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  } catch (error) {
    console.error('[v0] Sign out error:', error)
    throw error
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    return user || null
  } catch (error) {
    console.error('[v0] Get current user error:', error)
    return null
  }
}

export async function getCurrentUserProfile() {
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
