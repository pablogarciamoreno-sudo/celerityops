"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { AppSidebar } from "./app-sidebar"
import { DashboardHeader } from "./dashboard-header"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { useAuth } from "@/lib/hooks/use-auth"
import { Loader2 } from "lucide-react"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { user, loading } = useAuth()
  const router = useRouter()
  const redirectAttempted = useRef(false)
  const [forceShow, setForceShow] = useState(false)

  // Timeout to force show content after 2 seconds (server already validated auth)
  useEffect(() => {
    const timer = setTimeout(() => {
      setForceShow(true)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!loading && !user && !redirectAttempted.current && !forceShow) {
      redirectAttempted.current = true
      router.push("/login")
    }
  }, [loading, user, router, forceShow])

  // Show content if: user loaded, OR timeout reached (server already validated)
  if (user || forceShow) {
    return (
      <SidebarProvider defaultOpen={sidebarOpen} onOpenChange={setSidebarOpen}>
        <AppSidebar />
        <SidebarInset>
          <DashboardHeader />
          <main className="flex-1 overflow-auto p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Cargando...</p>
      </div>
    </div>
  )
}
