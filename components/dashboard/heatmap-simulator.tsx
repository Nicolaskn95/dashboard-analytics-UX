'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Home, ShoppingBag, ShoppingCart, CreditCard } from 'lucide-react'

type Pagina = 'home' | 'produto' | 'carrinho' | 'checkout'
const paginas: Pagina[] = ['home', 'produto', 'carrinho', 'checkout']

type ClickPoint = {
  x: number
  y: number
  elementId: string
  viewportWidth?: number
  viewportHeight?: number
}

type HeatmapData = Record<string, ClickPoint[]>

interface HeatmapSimulatorProps {
  heatmapData?: HeatmapData
}

function PageIcon({ pagina }: { pagina: Pagina }) {
  switch (pagina) {
    case 'home':
      return <Home className="h-4 w-4" />
    case 'produto':
      return <ShoppingBag className="h-4 w-4" />
    case 'carrinho':
      return <ShoppingCart className="h-4 w-4" />
    case 'checkout':
      return <CreditCard className="h-4 w-4" />
  }
}

function getPageLabel(pagina: Pagina): string {
  const labels: Record<Pagina, string> = {
    home: 'Home',
    produto: 'Produto',
    carrinho: 'Carrinho',
    checkout: 'Checkout',
  }
  return labels[pagina]
}

interface AreaClique {
  id: string
  x: number
  y: number
  cliques: number
  intensidade: number
}

const FALLBACK_VW = 1200
const FALLBACK_VH = 800

function processClicksToAreas(clicks: ClickPoint[]): AreaClique[] {
  if (!clicks || clicks.length === 0) return []

  // Group clicks into grid areas (10x10 grid)
  const gridSize = 10
  const areas: Map<string, { x: number; y: number; cliques: number; points: ClickPoint[] }> = new Map()

  clicks.forEach((click) => {
    const vw =
      typeof click.viewportWidth === "number" && click.viewportWidth > 0
        ? click.viewportWidth
        : FALLBACK_VW
    const vh =
      typeof click.viewportHeight === "number" && click.viewportHeight > 0
        ? click.viewportHeight
        : FALLBACK_VH

    // Normalize coordinates to percentage using the viewport captured with each click
    const xPercent = (click.x / vw) * 100
    const yPercent = (click.y / vh) * 100
    
    // Find grid cell
    const gridX = Math.floor(xPercent / gridSize)
    const gridY = Math.floor(yPercent / gridSize)
    const key = `${gridX}-${gridY}`

    if (!areas.has(key)) {
      areas.set(key, {
        x: gridX * gridSize + gridSize / 2,
        y: gridY * gridSize + gridSize / 2,
        cliques: 0,
        points: [],
      })
    }

    const area = areas.get(key)!
    area.cliques++
    area.points.push(click)
  })

  // Calculate max clicks for intensity normalization
  const maxClicks = Math.max(...Array.from(areas.values()).map((a) => a.cliques), 1)

  return Array.from(areas.entries()).map(([key, area]) => ({
    id: key,
    x: area.x,
    y: area.y,
    cliques: area.cliques,
    intensidade: Math.round((area.cliques / maxClicks) * 100),
  }))
}

function HeatmapOverlay({ areas }: { areas: AreaClique[] }) {
  const [hoveredArea, setHoveredArea] = useState<string | null>(null)

  const getHeatColor = (intensidade: number) => {
    if (intensidade >= 80) return 'bg-red-500'
    if (intensidade >= 60) return 'bg-orange-500'
    if (intensidade >= 40) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  return (
    <div className="relative h-[400px] w-full overflow-hidden rounded-lg border bg-muted/30">
      {/* Simulated Page Layout */}
      <div className="absolute inset-4 flex flex-col gap-4">
        {/* Header simulation */}
        <div className="h-12 rounded bg-muted/50" />
        
        {/* Content simulation */}
        <div className="flex flex-1 gap-4">
          <div className="flex-1 rounded bg-muted/40" />
          <div className="w-1/3 rounded bg-muted/40" />
        </div>
        
        {/* Footer simulation */}
        <div className="h-16 rounded bg-muted/50" />
      </div>

      {areas.length === 0 ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-muted-foreground">Nenhum clique registrado nesta página</p>
        </div>
      ) : (
        /* Heatmap Overlays */
        areas.map((area) => {
          const size = 40 + (area.intensidade / 100) * 60
          const isHovered = hoveredArea === area.id

          return (
            <div
              key={area.id}
              className={`absolute cursor-pointer transition-all duration-200 ${
                isHovered ? 'z-20 scale-110' : 'z-10'
              }`}
              style={{
                left: `${area.x}%`,
                top: `${area.y}%`,
                transform: `translate(-50%, -50%) ${isHovered ? 'scale(1.1)' : ''}`,
              }}
              onMouseEnter={() => setHoveredArea(area.id)}
              onMouseLeave={() => setHoveredArea(null)}
            >
              {/* Heatmap circle */}
              <div
                className={`rounded-full ${getHeatColor(area.intensidade)} transition-all duration-200`}
                style={{
                  width: size,
                  height: size,
                  opacity: 0.4 + (area.intensidade / 100) * 0.4,
                  boxShadow: `0 0 ${size / 2}px ${size / 4}px ${
                    area.intensidade >= 80
                      ? 'rgba(239, 68, 68, 0.3)'
                      : area.intensidade >= 60
                      ? 'rgba(249, 115, 22, 0.3)'
                      : area.intensidade >= 40
                      ? 'rgba(234, 179, 8, 0.3)'
                      : 'rgba(34, 197, 94, 0.3)'
                  }`,
                }}
              />

              {/* Tooltip */}
              {isHovered && (
                <div className="absolute left-1/2 top-full z-30 mt-2 -translate-x-1/2 whitespace-nowrap rounded-lg border bg-background p-2 shadow-lg">
                  <div className="text-sm font-medium">{area.cliques} cliques</div>
                  <div className="text-xs text-muted-foreground">
                    Intensidade: {area.intensidade}%
                  </div>
                </div>
              )}
            </div>
          )
        })
      )}

      {/* Legend */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-1 rounded-lg border bg-background/90 p-3 backdrop-blur-sm">
        <div className="text-xs font-medium">Intensidade</div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-red-500" />
          <span className="text-xs">Alta (80-100%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-orange-500" />
          <span className="text-xs">Média-Alta (60-79%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-yellow-500" />
          <span className="text-xs">Média (40-59%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-green-500" />
          <span className="text-xs">Baixa (0-39%)</span>
        </div>
      </div>
    </div>
  )
}

function PageStats({ areas }: { areas: AreaClique[] }) {
  const totalCliques = areas.reduce((acc, a) => acc + a.cliques, 0)
  const mediaIntensidade = areas.length > 0 
    ? areas.reduce((acc, a) => acc + a.intensidade, 0) / areas.length 
    : 0
  const zonasMaisAtivas = areas.filter((a) => a.intensidade >= 70).length

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="rounded-lg border bg-card p-4">
        <div className="text-2xl font-bold">{totalCliques}</div>
        <div className="text-sm text-muted-foreground">Total de cliques</div>
      </div>
      <div className="rounded-lg border bg-card p-4">
        <div className="text-2xl font-bold">{mediaIntensidade.toFixed(0)}%</div>
        <div className="text-sm text-muted-foreground">Intensidade média</div>
      </div>
      <div className="rounded-lg border bg-card p-4">
        <div className="text-2xl font-bold">{zonasMaisAtivas}</div>
        <div className="text-sm text-muted-foreground">Zonas quentes</div>
      </div>
    </div>
  )
}

export function HeatmapSimulator({ heatmapData = {} }: HeatmapSimulatorProps) {
  const [selectedPage, setSelectedPage] = useState<Pagina>('home')

  // Process click data into areas for each page
  const processedData = useMemo(() => {
    const result: Record<Pagina, AreaClique[]> = {
      home: [],
      produto: [],
      carrinho: [],
      checkout: [],
    }

    paginas.forEach((pagina) => {
      const clicks = heatmapData[pagina] || []
      result[pagina] = processClicksToAreas(clicks)
    })

    return result
  }, [heatmapData])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Simulador de Mapa de Calor</CardTitle>
        <CardDescription>
          Visualização de áreas de cliques e interações por página (dados reais do MongoDB)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs
          value={selectedPage}
          onValueChange={(value) => setSelectedPage(value as Pagina)}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-4">
            {paginas.map((pagina) => (
              <TabsTrigger key={pagina} value={pagina} className="flex items-center gap-2">
                <PageIcon pagina={pagina} />
                <span className="hidden sm:inline">{getPageLabel(pagina)}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {paginas.map((pagina) => {
            const areas = processedData[pagina]
            const clicks = heatmapData[pagina] || []

            return (
              <TabsContent key={pagina} value={pagina} className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-sm">
                    <PageIcon pagina={pagina} />
                    <span className="ml-2">Página: {getPageLabel(pagina)}</span>
                  </Badge>
                  <Badge variant="secondary">
                    {clicks.length} cliques registrados
                  </Badge>
                </div>

                <HeatmapOverlay areas={areas} />
                
                <PageStats areas={areas} />
              </TabsContent>
            )
          })}
        </Tabs>
      </CardContent>
    </Card>
  )
}
