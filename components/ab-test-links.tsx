'use client'

import { Button } from '@/components/ui/button'
import { FlaskConical, Shuffle } from 'lucide-react'

type ABMode = 'random' | 'A' | 'B'

const trackingStorageKeys = ['ux_session_id', 'ux_ab_version', 'ux_ab_source']

function getTargetPath() {
  if (typeof window === 'undefined') return '/teste'

  const path = window.location.pathname
  return path.startsWith('/teste') ? path : '/teste'
}

function resetTrackingSession() {
  trackingStorageKeys.forEach((key) => sessionStorage.removeItem(key))
}

function openTestStore(mode: ABMode) {
  resetTrackingSession()

  const path = getTargetPath()
  const search = mode === 'random' ? '' : `?ab=${mode}`
  window.location.assign(`${path}${search}`)
}

export function ABTestLinks({ compact = false }: { compact?: boolean }) {
  const buttonSize = compact ? 'sm' : 'default'

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size={buttonSize}
        onClick={() => openTestStore('random')}
        className="gap-2"
      >
        <Shuffle className="h-4 w-4" />
        Loja Aleatória
      </Button>
      <Button
        type="button"
        variant="secondary"
        size={buttonSize}
        onClick={() => openTestStore('A')}
        className="gap-2"
      >
        <FlaskConical className="h-4 w-4" />
        Ver Versão A
      </Button>
      <Button
        type="button"
        variant="secondary"
        size={buttonSize}
        onClick={() => openTestStore('B')}
        className="gap-2"
      >
        <FlaskConical className="h-4 w-4" />
        Ver Versão B
      </Button>
    </div>
  )
}
