'use client'

import { createContext, useContext, useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

interface UserContextType {
  user: User | null
  loading: boolean
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
})

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Memoize the Supabase client to prevent recreation on every render
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    let isMounted = true
    
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (isMounted) {
          setUser(user)
        }
      } catch (error) {
        // Only log error if component is still mounted
        if (isMounted) {
          console.error('Error fetching user:', error)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [supabase])

  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUserContext() {
  return useContext(UserContext)
}
