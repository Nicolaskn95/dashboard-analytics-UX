'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, Clock, MousePointerClick } from 'lucide-react'

interface KPICardsProps {
  conversaoTotal: number
  tempoMedioNaPagina: number
  totalCliques: number
}

export function KPICards({ conversaoTotal, tempoMedioNaPagina, totalCliques }: KPICardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Conversão Total</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{conversaoTotal.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground">Taxa de conversão geral</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tempo médio na página</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{tempoMedioNaPagina.toFixed(0)}s</div>
          <p className="text-xs text-muted-foreground">Média entre todas as visualizações</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Cliques</CardTitle>
          <MousePointerClick className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCliques.toLocaleString('pt-BR')}</div>
          <p className="text-xs text-muted-foreground">Interações registradas</p>
        </CardContent>
      </Card>
    </div>
  )
}
