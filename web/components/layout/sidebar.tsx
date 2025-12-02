"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import useSWR from "swr"
import type { Session, SessionResponse } from "@/lib/types"
import { getApiClient } from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"

const fetcher = async (url: string) => {
  const client = getApiClient()
  const response = await client.get(url)
  return response.data
}

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(true)
  const pathname = usePathname()
  const { isAuthenticated } = useAuth()
  const { data, isLoading } = useSWR<SessionResponse>(isAuthenticated ? "/sessions" : null, fetcher, {
    revalidateOnFocus: false,
  })

  const sessions = data?.data || []

  if (!isAuthenticated) {
    return null
  }

  return (
    <aside className={cn("border-r border-border bg-background transition-all duration-300", isOpen ? "w-64" : "w-20")}>
      <div className="flex flex-col h-full">
        {/* Toggle Button */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-border">
          {isOpen && <span className="text-sm font-semibold">Sessions</span>}
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)} className="ml-auto">
            <ChevronLeft className={cn("w-4 h-4 transition-transform", !isOpen && "rotate-180")} />
          </Button>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4">
              <p className="text-xs text-muted-foreground">Loading...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-4">
              <p className="text-xs text-muted-foreground">{isOpen ? "No sessions yet" : ""}</p>
            </div>
          ) : (
            <nav className="space-y-2 p-2">
              {sessions.map((session: Session) => {
                const isActive = pathname === `/session/${session.id}`
                const date = new Date(session.start_time).toLocaleDateString()
                const time = new Date(session.start_time).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })

                return (
                  <Link
                    key={session.id}
                    href={`/session/${session.id}`}
                    className={cn(
                      "block px-3 py-2 rounded-lg text-sm transition-colors",
                      isActive ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-secondary",
                    )}
                  >
                    {isOpen ? (
                      <div className="truncate">
                        <p className="font-medium truncate">{session.final_transcript.substring(0, 30)}...</p>
                        <p className="text-xs text-muted-foreground">{date}</p>
                      </div>
                    ) : (
                      <div className="w-8 h-8 flex items-center justify-center text-xs font-semibold">
                        {date.slice(-2)}
                      </div>
                    )}
                  </Link>
                )
              })}
            </nav>
          )}
        </div>
      </div>
    </aside>
  )
}
