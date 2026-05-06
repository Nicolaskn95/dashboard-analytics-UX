"use client"

import { useEffect, useCallback, useRef } from "react"
import type { FunnelStage } from "@/lib/types"

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

function getDevice(): "desktop" | "mobile" | "tablet" {
  if (typeof window === "undefined") return "desktop"
  const width = window.innerWidth
  if (width < 768) return "mobile"
  if (width < 1024) return "tablet"
  return "desktop"
}

function getRegion(): string {
  const regions = ["BR", "US", "EU", "LATAM"]
  return regions[Math.floor(Math.random() * regions.length)]
}

function getABVersion(): "A" | "B" {
  return Math.random() > 0.5 ? "A" : "B"
}

export function useTracking(page: FunnelStage) {
  const sessionIdRef = useRef<string | null>(null)
  const pageEnteredAtRef = useRef<number>(Date.now())
  const hasStartedRef = useRef(false)

  const track = useCallback(async (type: string, data: Record<string, unknown>) => {
    try {
      await fetch("/api/tracking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, data }),
      })
    } catch (error) {
      console.error("Erro ao enviar tracking:", error)
    }
  }, [])

  const trackClick = useCallback((event: MouseEvent) => {
    const target = event.target as HTMLElement
    const sessionId = sessionIdRef.current
    
    if (!sessionId) return
    
    track("click", {
      sessionId,
      page,
      elementId: target.id || target.className || "unknown",
      elementType: target.tagName.toLowerCase(),
      x: event.clientX,
      y: event.clientY,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
    })
  }, [page, track])

  useEffect(() => {
    if (hasStartedRef.current) return
    hasStartedRef.current = true

    // Get or create session
    let sessionId = sessionStorage.getItem("ux_session_id")
    let isNewSession = false

    if (!sessionId) {
      sessionId = generateSessionId()
      sessionStorage.setItem("ux_session_id", sessionId)
      isNewSession = true
    }

    sessionIdRef.current = sessionId
    pageEnteredAtRef.current = Date.now()

    // Start session if new
    if (isNewSession) {
      const abVersion = getABVersion()
      sessionStorage.setItem("ux_ab_version", abVersion)
      
      track("session_start", {
        sessionId,
        device: getDevice(),
        region: getRegion(),
        abVersion,
        userAgent: navigator.userAgent,
      })
    }

    // Track page view
    track("page_view", {
      sessionId,
      page,
    })

    // Add click listener
    document.addEventListener("click", trackClick)

    // Cleanup on page leave
    return () => {
      document.removeEventListener("click", trackClick)
      
      if (sessionIdRef.current) {
        track("page_leave", {
          sessionId: sessionIdRef.current,
          page,
        })
      }
    }
  }, [page, track, trackClick])

  const trackConversion = useCallback((toPage: FunnelStage) => {
    const sessionId = sessionIdRef.current
    if (!sessionId) return

    const timeToConvert = Math.round((Date.now() - pageEnteredAtRef.current) / 1000)

    track("conversion", {
      sessionId,
      fromPage: page,
      toPage,
      timeToConvert,
    })
  }, [page, track])

  const getABVersion = useCallback((): "A" | "B" => {
    if (typeof window === "undefined") return "A"
    return (sessionStorage.getItem("ux_ab_version") as "A" | "B") || "A"
  }, [])

  return {
    trackConversion,
    getABVersion,
    sessionId: sessionIdRef.current,
  }
}
