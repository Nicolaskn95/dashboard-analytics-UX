'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { KPICards } from '@/components/dashboard/kpi-cards'
import { FunnelChart } from '@/components/dashboard/funnel-chart'
import { DataTable } from '@/components/dashboard/data-table'
import { Filters } from '@/components/dashboard/filters'
import { HeatmapSimulator } from '@/components/dashboard/heatmap-simulator'
import { ThemeToggle } from '@/components/theme-toggle'
import { BarChart3, MousePointerClick, Activity, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Spinner } from '@/components/ui/spinner'

const fetcher = (url: string) => fetch(url).then(res => res.json())

type Regiao = 'BR' | 'US' | 'EU' | 'LATAM'
type Dispositivo = 'desktop' | 'mobile' | 'tablet'
type Versao = 'A' | 'B'

export default function DashboardPage() {
  const [regiao, setRegiao] = useState<Regiao | 'todas'>('todas')
  const [dispositivo, setDispositivo] = useState<Dispositivo | 'todos'>('todos')
  const [versao, setVersao] = useState<Versao | 'todas'>('todas')

  // Build query params
  const params = new URLSearchParams()
  if (regiao !== 'todas') params.set('region', regiao)
  if (dispositivo !== 'todos') params.set('device', dispositivo)
  if (versao !== 'todas') params.set('abVersion', versao)
  
  const queryString = params.toString()
  const apiUrl = `/api/analytics${queryString ? `?${queryString}` : ''}`

  const { data, error, isLoading, mutate } = useSWR(apiUrl, fetcher, {
    refreshInterval: 5000, // Auto-refresh every 5 seconds
  })

  const resetFilters = () => {
    setRegiao('todas')
    setDispositivo('todos')
    setVersao('todas')
  }

  // Transform data for components
  const kpis = data?.kpis || { conversionRate: 0, avgTimeOnPage: 0, totalClicks: 0 }
  const funnelData = data?.funnelData || []
  const tableData = data?.tableData || []
  const heatmapData = data?.heatmapData || {}

  // Transform funnel data to expected format
  const dadosFunil = funnelData.map((item: { stage: string; count: number }) => ({
    etapa: item.stage.charAt(0).toUpperCase() + item.stage.slice(1),
    usuarios: item.count,
  }))

  // Transform table data to expected format
  const tabelaDados = tableData.map((item: {
    id: string
    page: string
    clicks: number
    timeOnPage: number
    converted: boolean
    abVersion: string
    device: string
    region: string
  }) => ({
    id: item.id,
    pagina: item.page as 'home' | 'produto' | 'carrinho' | 'checkout',
    cliques: item.clicks,
    tempoNaPagina: item.timeOnPage,
    converteu: item.converted,
    versao: item.abVersion as 'A' | 'B',
    dispositivo: item.device as 'desktop' | 'mobile' | 'tablet',
    regiao: item.region as 'BR' | 'US' | 'EU' | 'LATAM',
  }))

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Activity className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">UX Analytics</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/teste">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                Abrir Loja de Teste
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={() => mutate()}>
              Atualizar
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {error && (
          <div className="mb-6 rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-center">
            <p className="text-destructive">Erro ao carregar dados. Verifique a conexão com o MongoDB.</p>
          </div>
        )}

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="heatmap" className="flex items-center gap-2">
              <MousePointerClick className="h-4 w-4" />
              Mapa de Calor
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Filters */}
            <Filters
              regiao={regiao}
              dispositivo={dispositivo}
              versao={versao}
              onRegiaoChange={setRegiao}
              onDispositivoChange={setDispositivo}
              onVersaoChange={setVersao}
              onReset={resetFilters}
            />

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Spinner className="h-8 w-8" />
              </div>
            ) : (
              <>
                {/* KPI Cards */}
                <KPICards
                  conversaoTotal={kpis.conversionRate}
                  tempoMedioNaPagina={kpis.avgTimeOnPage}
                  totalCliques={kpis.totalClicks}
                />

                {/* Funnel Chart */}
                <FunnelChart data={dadosFunil} />

                {/* Data Table */}
                <DataTable data={tabelaDados} />

                {tableData.length === 0 && (
                  <div className="rounded-lg border border-border bg-card p-8 text-center">
                    <p className="text-muted-foreground mb-4">
                      Nenhum dado registrado ainda. Navegue pela loja de teste para gerar dados.
                    </p>
                    <Link href="/teste">
                      <Button>Ir para Loja de Teste</Button>
                    </Link>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="heatmap" className="space-y-6">
            <HeatmapSimulator heatmapData={heatmapData} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          Dashboard de Análise UX • Conectado ao MongoDB
        </div>
      </footer>
    </div>
  )
}
