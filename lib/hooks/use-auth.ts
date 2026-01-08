"use client"

import { createClient } from "@/lib/supabase/client"
import type { Role, Site } from "@/lib/types/database"
import { useRouter } from "next/navigation"
import { useEffect, useState, useCallback, useRef } from "react"

export type AuthUser = {
  id: string
  email: string
  full_name: string
  role: Role
  site: Site | null
  is_active: boolean
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()
  const initialized = useRef(false)

  const fetchUserProfile = useCallback(
    async (authId: string) => {
      const { data, error } = await supabase
        .from("users")
        .select(`
        *,
        role:roles(*),
        site:sites(*)
      `)
        .eq("auth_id", authId)
        .single()

      if (error || !data) {
        return null
      }

      return {
        id: data.id,
        email: data.email,
        full_name: data.full_name,
        role: data.role,
        site: data.site,
        is_active: data.is_active,
      } as AuthUser
    },
    [supabase],
  )

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    const initAuth = async () => {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser()

        if (authUser) {
          const profile = await fetchUserProfile(authUser.id)
          setUser(profile)
        }
      } catch (error) {
        console.error("Error checking auth:", error)
      }

      setLoading(false)
    }

    initAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        const profile = await fetchUserProfile(session.user.id)
        setUser(profile)
      } else if (event === "SIGNED_OUT") {
        setUser(null)
        router.push("/login")
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase, fetchUserProfile, router])

  const signOut = async () => {
    initialized.current = false
    await supabase.auth.signOut()
    setUser(null)
    router.push("/login")
  }

  const getDashboardPath = () => {
    if (!user?.role) return "/dashboard"

    switch (user.role.name) {
      case "COO":
        return "/dashboard/coo"
      case "Site Lead":
        return "/dashboard/site-lead"
      case "Study Coordinator":
        return "/dashboard/coordinator"
      case "Regulatory Specialist":
        return "/dashboard/regulatory"
      case "Data Entry Specialist":
        return "/dashboard/data-entry"
      case "QA Manager":
        return "/dashboard/qa"
      default:
        return "/dashboard"
    }
  }

  return {
    user,
    loading,
    signOut,
    getDashboardPath,
    isAuthenticated: !!user,
    isCOO: user?.role?.name === "COO",
    isSiteLead: user?.role?.name === "Site Lead",
    isQA: user?.role?.name === "QA Manager",
    canViewAllSites: user?.role?.name === "COO" || user?.role?.name === "QA Manager",
  }
}
