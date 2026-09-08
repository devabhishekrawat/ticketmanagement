import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../config/supabaseConfig'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async (userId, userEmail) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error) throw error

      if (data) {
        setProfile(data)
      } else {

        const defaultProfile = {
          id: userId,
          email: userEmail,
          full_name: userEmail ? userEmail.split('@')[0] : 'Demo User',
          role: 'USER',
          department: 'General',
        }
        setProfile(defaultProfile)
      }
    } catch (err) {
      console.warn('Could not fetch profile from Supabase, using local defaults:', err.message)
      setProfile({
        id: userId,
        email: userEmail,
        full_name: userEmail ? userEmail.split('@')[0] : 'Demo User',
        role: 'USER',
        department: 'General',
      })
    }
  }

  useEffect(() => {
    let mounted = true

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user && mounted) {
          setUser(session.user)
          await fetchProfile(session.user.id, session.user.email)
        }
      } catch (err) {
        console.error('Session initialization error:', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    initAuth()

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user)
        await fetchProfile(session.user.id, session.user.email)
      } else {
        setUser(null)
        setProfile(null)
      }
      setLoading(false)
    })

    return () => {
      mounted = false
      authListener?.subscription?.unsubscribe?.()
    }
  }, [])

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  }

  const signUp = async ({ email, password, fullName, department }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) throw error

    if (data?.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        email: data.user.email || email,
        full_name: fullName,
        department: department || 'General',
        role: 'USER',
      })
      if (profileError) {
        console.warn('Profile insert:', profileError.message)
      }
    }

    return data
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
    } catch (err) {
      console.warn('Sign out error:', err)
    } finally {
      setUser(null)
      setProfile(null)
    }
  }

  const switchDemoRole = (targetRole) => {
    if (!profile) return
    setProfile((prev) => ({ ...prev, role: targetRole }))
  }

  const demoLogin = (role = 'USER') => {
    const dummyId = role === 'ADMIN' ? 'demo-admin-id' : 'demo-user-id'
    const dummyUser = { id: dummyId, email: `${role.toLowerCase()}@company.internal` }
    setUser(dummyUser)
    setProfile({
      id: dummyId,
      email: dummyUser.email,
      full_name: role === 'ADMIN' ? 'Sarah Admin' : 'Alex Employee',
      role: role,
      department: role === 'ADMIN' ? 'IT Operations' : 'Product Design',
    })
  }

  const value = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    switchDemoRole,
    demoLogin,
    isAdmin: profile?.role === 'ADMIN' || profile?.role === 'SUPER_ADMIN',
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
