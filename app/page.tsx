'use client'

import { useState, type ComponentType } from 'react'
import useSWR from 'swr'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ABTestLinks } from '@/components/ab-test-links'
import { KPICards } from '@/components/dashboard/kpi-cards'
import { FunnelChart } from '@/components/dashboard/funnel-chart'
import { DataTable } from '@/components/dashboard/data-table'
import { Filters } from '@/components/dashboard/filters'
import { HeatmapSimulator } from '@/components/dashboard/heatmap-simulator'
import { ThemeToggle } from '@/components/theme-toggle'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Activity,
  BarChart3,
  Clock,
  GitCompare,
  MapPinned,
  MonitorSmartphone,
  MousePointerClick,
  RefreshCw,
  Target,
  TrendingDown,
} from 'lucide-react'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

type Regiao = 'BR' | 'US' | 'EU' | 'LATAM'
type Dispositivo = 'desktop' | 'mobile' | 'tablet'
type Versao = 'A' | 'B'
type PageName = 'home' | 'produto' | 'carrinho' | 'checkout'

type Kpis = {
  conversionRate: number
  avgTimeOnPage: number
  totalClicks: number
  totalSessions: number
  totalConversions: number
}

type TableDataItem = {
  id: string
  user: string
  page: PageName
  clicks: number
  timeOnPage: number
  converted: boolean
  abVersion: Versao
  device: Dispositivo
  region: Regiao
}

type FunnelDataItem = {
  stage: PageName
  count: number
  conversions: number
}

type TimeByPageItem = {
  page: PageName
  views: number
  samples: number
  totalTime: number
  avgTime: number
}

type ClicksByPageItem = {
  page: PageName
  clicks: number
}

type ABComparisonItem = {
  version: Versao
  name: string
  sessions: number
  conversions: number
  conversionRate: number
  avgTime: number
  totalClicks: number
}

type SegmentMetric = {
  name: string
  sessions: number
  conversions: number
  conversionRate: number
  avgTime: number
  totalClicks: number
}

type DropOffMetric = {
  fromStage: PageName
  toStage: PageName
  fromCount: number
  toCount: number
  dropOff: number
  dropOffRate: number
}

type Insights = {
  biggestAbandonment: string
  bestABVersion: string
  bestDevice: string
  longestTimePage: string
  suggestedImprovement: string
}

const pageLabels: Record<PageName, string> = {
  home: 'Home',
  produto: 'Produto',
  carrinho: 'Carrinho',
  checkout: 'Checkout',
}

const chartColors = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)']

function pageLabel(page: PageName | string) {
  return pageLabels[page as PageName] || page
}

function formatPercent(value: number) {
  return `${(value || 0).toFixed(1)}%`
}

function formatSeconds(value: number) {
  return `${Math.round(value || 0)}s`
}

function InfoCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string
  value: string
  description: string
  icon: ComponentType<{ className?: string }>
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

function InsightCard({ question, answer }: { question: string; answer: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{question}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{answer}</p>
      </CardContent>
    </Card>
  )
}

function BarChartCard({
  title,
  description,
  data,
  dataKey,
  color = 'var(--chart-1)',
}: {
  title: string
  description: string
  data: Array<Record<string, string | number>>
  dataKey: string
  color?: string
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

function ABComparisonChart({
  title,
  description,
  data,
  dataKey,
}: {
  title: string
  description: string
  data: Array<Record<string, string | number>>
  dataKey: string
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Bar dataKey={dataKey} radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={entry.label} fill={chartColors[index % chartColors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const [regiao, setRegiao] = useState<Regiao | 'todas'>('todas')
  const [dispositivo, setDispositivo] = useState<Dispositivo | 'todos'>('todos')
  const [versao, setVersao] = useState<Versao | 'todas'>('todas')

  const params = new URLSearchParams()
  if (regiao !== 'todas') params.set('region', regiao)
  if (dispositivo !== 'todos') params.set('device', dispositivo)
  if (versao !== 'todas') params.set('abVersion', versao)

  const queryString = params.toString()
  const apiUrl = `/api/analytics${queryString ? `?${queryString}` : ''}`

  const { data, error, isLoading, mutate } = useSWR(apiUrl, fetcher, {
    refreshInterval: 5000,
  })

  const resetFilters = () => {
    setRegiao('todas')
    setDispositivo('todos')
    setVersao('todas')
  }

  const kpis: Kpis = data?.kpis || {
    conversionRate: 0,
    avgTimeOnPage: 0,
    totalClicks: 0,
    totalSessions: 0,
    totalConversions: 0,
  }
  const funnelData: FunnelDataItem[] = data?.funnelData || []
  const tableData: TableDataItem[] = data?.tableData || []
  const heatmapData = data?.heatmapData || {}
  const timeByPage: TimeByPageItem[] = data?.timeByPage || []
  const clicksByPage: ClicksByPageItem[] = data?.clicksByPage || []
  const abComparison: ABComparisonItem[] = data?.abComparison || []
  const deviceSegments: SegmentMetric[] = data?.profileSegments?.devices || []
  const regionSegments: SegmentMetric[] = data?.profileSegments?.regions || []
  const biggestDropOff: DropOffMetric | null = data?.biggestDropOff || null
  const insights: Insights = data?.insights || {
    biggestAbandonment: 'Ainda não há dados suficientes.',
    bestABVersion: 'Ainda não há dados suficientes.',
    bestDevice: 'Ainda não há dados suficientes.',
    longestTimePage: 'Ainda não há dados suficientes.',
    suggestedImprovement: 'Gere mais navegações na loja de teste para interpretar os resultados.',
  }

  const dadosFunil = funnelData.map((item) => ({
    etapa: pageLabel(item.stage),
    usuarios: item.count,
  }))

  const tabelaDados = tableData.map((item) => ({
    id: item.id,
    usuario: item.user,
    pagina: item.page,
    cliques: item.clicks,
    tempoNaPagina: item.timeOnPage,
    converteu: item.converted,
    versao: item.abVersion,
    dispositivo: item.device,
    regiao: item.region,
  }))

  const clicksChartData = clicksByPage.map((item) => ({
    label: pageLabel(item.page),
    clicks: item.clicks,
  }))
  const timeChartData = timeByPage.map((item) => ({
    label: pageLabel(item.page),
    avgTime: item.avgTime,
  }))
  const abChartData = abComparison.map((item) => ({
    label: item.version,
    conversionRate: item.conversionRate,
    avgTime: item.avgTime,
  }))
  const deviceChartData = deviceSegments.map((item) => ({
    label: item.name,
    conversionRate: item.conversionRate,
  }))
  const regionChartData = regionSegments.map((item) => ({
    label: item.name,
    conversionRate: item.conversionRate,
  }))
  const hasNoData = !isLoading && tableData.length === 0

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex min-h-16 flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <Activity className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">UX Analytics</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ABTestLinks compact />
            <Button variant="ghost" size="sm" onClick={() => mutate()} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Atualizar
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto space-y-6 px-4 py-6">
        {error && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-center">
            <p className="text-destructive">Erro ao carregar dados. Verifique a conexão com o MongoDB.</p>
          </div>
        )}

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
            {hasNoData && (
              <Card>
                <CardContent className="space-y-4 p-6 text-center">
                  <p className="text-muted-foreground">
                    Nenhum dado encontrado para os filtros atuais. Gere dados navegando pela loja de teste.
                  </p>
                  <div className="flex justify-center">
                    <ABTestLinks />
                  </div>
                </CardContent>
              </Card>
            )}

            <Tabs defaultValue="geral" className="space-y-6">
              <TabsList className="grid h-auto min-h-9 w-full grid-cols-2 md:grid-cols-5">
                <TabsTrigger value="geral" className="gap-2">
                  <Target className="h-4 w-4" />
                  Visão Geral
                </TabsTrigger>
                <TabsTrigger value="funil" className="gap-2">
                  <TrendingDown className="h-4 w-4" />
                  Funil
                </TabsTrigger>
                <TabsTrigger value="comportamento" className="gap-2">
                  <MousePointerClick className="h-4 w-4" />
                  Comportamento
                </TabsTrigger>
                <TabsTrigger value="ab" className="gap-2">
                  <GitCompare className="h-4 w-4" />
                  Teste A/B
                </TabsTrigger>
                <TabsTrigger value="perfil" className="gap-2">
                  <MonitorSmartphone className="h-4 w-4" />
                  Perfil
                </TabsTrigger>
              </TabsList>

              <TabsContent value="geral" className="space-y-6">
                <KPICards
                  totalUsuarios={kpis.totalSessions}
                  conversaoTotal={kpis.conversionRate}
                  tempoMedioNaPagina={kpis.avgTimeOnPage}
                  totalCliques={kpis.totalClicks}
                />

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                  <InsightCard question="Qual página tem maior abandono?" answer={insights.biggestAbandonment} />
                  <InsightCard question="Qual versão converte mais?" answer={insights.bestABVersion} />
                  <InsightCard question="Qual dispositivo tem melhor desempenho?" answer={insights.bestDevice} />
                  <InsightCard question="Onde o usuário passa mais tempo?" answer={insights.longestTimePage} />
                  <InsightCard question="Qual melhoria sugerida?" answer={insights.suggestedImprovement} />
                </div>

                <DataTable data={tabelaDados} />
              </TabsContent>

              <TabsContent value="funil" className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <InfoCard
                    title="Conversões"
                    value={kpis.totalConversions.toLocaleString('pt-BR')}
                    description="Sessões que chegaram ao checkout"
                    icon={Target}
                  />
                  <InfoCard
                    title="Taxa de Conversão"
                    value={formatPercent(kpis.conversionRate)}
                    description="Conversões divididas por usuários"
                    icon={BarChart3}
                  />
                  <InfoCard
                    title="Maior Abandono"
                    value={biggestDropOff ? formatPercent(biggestDropOff.dropOffRate) : '0.0%'}
                    description={
                      biggestDropOff
                        ? `${pageLabel(biggestDropOff.fromStage)} para ${pageLabel(biggestDropOff.toStage)}`
                        : 'Sem dados de abandono'
                    }
                    icon={TrendingDown}
                  />
                </div>
                <FunnelChart data={dadosFunil} />
              </TabsContent>

              <TabsContent value="comportamento" className="space-y-6">
                <div className="grid gap-4 lg:grid-cols-2">
                  <BarChartCard
                    title="Cliques por Página"
                    description="Monitoramento de cliques agrupado por etapa do fluxo"
                    data={clicksChartData}
                    dataKey="clicks"
                    color="var(--chart-2)"
                  />
                  <BarChartCard
                    title="Tempo Médio por Página"
                    description="Tempo médio de uso agrupado por página acessada"
                    data={timeChartData}
                    dataKey="avgTime"
                    color="var(--chart-3)"
                  />
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Resumo de Tempo por Página</CardTitle>
                    <CardDescription>Página onde o usuário passa mais tempo e amostras calculadas</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    {timeByPage.map((item) => (
                      <div key={item.page} className="rounded-md border p-4">
                        <div className="flex items-center justify-between gap-3">
                          <Badge variant="outline">{pageLabel(item.page)}</Badge>
                          <Clock className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="mt-3 text-2xl font-bold">{formatSeconds(item.avgTime)}</div>
                        <p className="text-xs text-muted-foreground">
                          {item.samples} amostras com tempo de {item.views} visitas
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <HeatmapSimulator heatmapData={heatmapData} />
              </TabsContent>

              <TabsContent value="ab" className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  {abComparison.map((item) => (
                    <Card key={item.version}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          Versão {item.version}
                          <Badge variant="outline">A/B</Badge>
                        </CardTitle>
                        <CardDescription>Comparação de conversão, tempo e cliques</CardDescription>
                      </CardHeader>
                      <CardContent className="grid gap-4 sm:grid-cols-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Conversão</p>
                          <p className="text-2xl font-bold">{formatPercent(item.conversionRate)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Tempo Médio</p>
                          <p className="text-2xl font-bold">{formatSeconds(item.avgTime)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Cliques</p>
                          <p className="text-2xl font-bold">{item.totalClicks.toLocaleString('pt-BR')}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <ABComparisonChart
                    title="Conversão A vs B"
                    description="Taxa de conversão por versão testada"
                    data={abChartData}
                    dataKey="conversionRate"
                  />
                  <ABComparisonChart
                    title="Tempo Médio A vs B"
                    description="Tempo médio de navegação por versão"
                    data={abChartData}
                    dataKey="avgTime"
                  />
                </div>
              </TabsContent>

              <TabsContent value="perfil" className="space-y-6">
                <div className="grid gap-4 lg:grid-cols-2">
                  <BarChartCard
                    title="Desempenho por Dispositivo"
                    description="Taxa de conversão segmentada por desktop, mobile e tablet"
                    data={deviceChartData}
                    dataKey="conversionRate"
                    color="var(--chart-4)"
                  />
                  <BarChartCard
                    title="Desempenho por Região"
                    description="Taxa de conversão segmentada por região"
                    data={regionChartData}
                    dataKey="conversionRate"
                    color="var(--chart-5)"
                  />
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MonitorSmartphone className="h-5 w-5" />
                        Segmentação por Dispositivo
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {deviceSegments.map((item) => (
                        <div key={item.name} className="flex items-center justify-between rounded-md border p-3">
                          <div>
                            <p className="font-medium capitalize">{item.name}</p>
                            <p className="text-xs text-muted-foreground">{item.sessions} usuários</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{formatPercent(item.conversionRate)}</p>
                            <p className="text-xs text-muted-foreground">{formatSeconds(item.avgTime)}</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPinned className="h-5 w-5" />
                        Segmentação por Região
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {regionSegments.map((item) => (
                        <div key={item.name} className="flex items-center justify-between rounded-md border p-3">
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-xs text-muted-foreground">{item.sessions} usuários</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{formatPercent(item.conversionRate)}</p>
                            <p className="text-xs text-muted-foreground">{formatSeconds(item.avgTime)}</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>

      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          Dashboard de Análise UX • Conectado ao MongoDB
        </div>
      </footer>
    </div>
  )
}
