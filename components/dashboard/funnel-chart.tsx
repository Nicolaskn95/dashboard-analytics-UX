'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface FunnelData {
  etapa: string
  usuarios: number
}

interface FunnelChartProps {
  data: FunnelData[]
}

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))']

export function FunnelChart({ data }: FunnelChartProps) {
  const maxUsuarios = Math.max(...data.map(d => d.usuarios), 1)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Funil de Conversão</CardTitle>
        <CardDescription>
          Fluxo de usuários: Home → Produto → Carrinho → Checkout
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Nenhum dado de funil disponível
          </div>
        ) : (
          <>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" />
                  <YAxis dataKey="etapa" type="category" width={80} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload as FunnelData
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-sm">
                            <div className="font-medium">{item.etapa}</div>
                            <div className="text-sm text-muted-foreground">
                              Usuários: {item.usuarios}
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar dataKey="usuarios" radius={[0, 4, 4, 0]}>
                    {data.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        fillOpacity={0.3 + (entry.usuarios / maxUsuarios) * 0.7}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Visual Funnel Representation */}
            <div className="mt-6 flex flex-col items-center gap-1">
              {data.map((item, index) => {
                const widthPercent = maxUsuarios > 0 ? (item.usuarios / maxUsuarios) * 100 : 0
                const dropOff = index > 0 && data[index - 1].usuarios > 0
                  ? ((data[index - 1].usuarios - item.usuarios) / data[index - 1].usuarios * 100).toFixed(1)
                  : null
                
                return (
                  <div key={item.etapa} className="flex w-full items-center gap-4">
                    <div className="w-20 text-right text-sm font-medium">{item.etapa}</div>
                    <div className="flex-1">
                      <div
                        className="h-8 rounded transition-all duration-300"
                        style={{
                          width: `${Math.max(widthPercent, 10)}%`,
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      />
                    </div>
                    <div className="w-16 text-sm text-muted-foreground">
                      {item.usuarios} usr
                    </div>
                    {dropOff && (
                      <div className="w-20 text-right text-xs text-destructive">
                        -{dropOff}%
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
