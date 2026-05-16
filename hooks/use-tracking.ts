'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { FunnelStage } from '@/lib/types'

type ABVersion = 'A' | 'B'

const SESSION_ID_KEY = 'ux_session_id'
const AB_VERSION_KEY = 'ux_ab_version'
const AB_SOURCE_KEY = 'ux_ab_source'

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

function getDevice(): 'desktop' | 'mobile' | 'tablet' {
  if (typeof window === 'undefined') return 'desktop'
  const width = window.innerWidth
  if (width < 768) return 'mobile'
  if (width < 1024) return 'tablet'
  return 'desktop'
}

/** Região fixa para o protótipo. Para país real: geolocalização por IP na API ou GPS + geocoding reverso no cliente. */
function getRegion(): string {
  return 'BR'
}

function getRandomABVersion(): ABVersion {
  return Math.random() > 0.5 ? 'A' : 'B'
}

function isABVersion(value: string | null | undefined): value is ABVersion {
  return value === 'A' || value === 'B'
}

function getABVersionFromUrl(): ABVersion | null {
  if (typeof window === 'undefined') return null

  const value = new URLSearchParams(window.location.search).get('ab')?.toUpperCase()
  return isABVersion(value) ? value : null
}

function getStoredABVersion(): ABVersion | null {
  if (typeof window === 'undefined') return null

  const value = sessionStorage.getItem(AB_VERSION_KEY)
  return isABVersion(value) ? value : null
}

function createSession(abVersion: ABVersion, source: 'forced' | 'random') {
  const sessionId = generateSessionId()
  sessionStorage.setItem(SESSION_ID_KEY, sessionId)
  sessionStorage.setItem(AB_VERSION_KEY, abVersion)
  sessionStorage.setItem(AB_SOURCE_KEY, source)

  return sessionId
}

function resolveTrackingSession() {
  const forcedABVersion = getABVersionFromUrl()
  const storedABVersion = getStoredABVersion()
  let sessionId = sessionStorage.getItem(SESSION_ID_KEY)

  if (forcedABVersion) {
    if (!sessionId || storedABVersion !== forcedABVersion) {
      sessionId = createSession(forcedABVersion, 'forced')
      return { sessionId, abVersion: forcedABVersion, isNewSession: true }
    }

    sessionStorage.setItem(AB_VERSION_KEY, forcedABVersion)
    sessionStorage.setItem(AB_SOURCE_KEY, 'forced')
    return { sessionId, abVersion: forcedABVersion, isNewSession: false }
  }

  if (sessionId && storedABVersion) {
    return { sessionId, abVersion: storedABVersion, isNewSession: false }
  }

  const randomABVersion = getRandomABVersion()
  sessionId = createSession(randomABVersion, 'random')

  return { sessionId, abVersion: randomABVersion, isNewSession: true }
}

export function useTracking(page: FunnelStage) {
  const sessionIdRef = useRef<string | null>(null)
  const pageEnteredAtRef = useRef<number>(Date.now())
  const hasStartedRef = useRef(false)
  const [abVersion, setABVersion] = useState<ABVersion>('A')

  const track = useCallback(async (type: string, data: Record<string, unknown>) => {
    try {
      await fetch('/api/tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, data }),
      })
    } catch (error) {
      console.error('Erro ao enviar tracking:', error)
    }
  }, [])

  const trackClick = useCallback((event: MouseEvent) => {
    const target = event.target as HTMLElement
    const sessionId = sessionIdRef.current
    
    if (!sessionId) return
    
    track("click", {
      sessionId,
      page,
      elementId: target.id || target.className || 'unknown',
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

    const session = resolveTrackingSession()

    sessionIdRef.current = session.sessionId
    pageEnteredAtRef.current = Date.now()
    setABVersion(session.abVersion)

    // Start session if new
    if (session.isNewSession) {
      track('session_start', {
        sessionId: session.sessionId,
        device: getDevice(),
        region: getRegion(),
        abVersion: session.abVersion,
        userAgent: navigator.userAgent,
      })
    }

    // Track page view
    track('page_view', {
      sessionId: session.sessionId,
      page,
    })

    // Add click listener
    document.addEventListener('click', trackClick)

    // Cleanup on page leave
    return () => {
      document.removeEventListener('click', trackClick)
      
      if (sessionIdRef.current) {
        track('page_leave', {
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

    track('conversion', {
      sessionId,
      fromPage: page,
      toPage,
      timeToConvert,
    })
  }, [page, track])

  const getABVersion = useCallback((): ABVersion => abVersion, [abVersion])

  return {
    trackConversion,
    getABVersion,
    sessionId: sessionIdRef.current,
  }
}
