'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Monitor, Smartphone, Tablet } from 'lucide-react'

interface RegistroUX {
  id: string
  usuario: string
  pagina: 'home' | 'produto' | 'carrinho' | 'checkout'
  cliques: number
  tempoNaPagina: number
  converteu: boolean
  versao: 'A' | 'B'
  dispositivo: 'desktop' | 'mobile' | 'tablet'
  regiao: 'BR' | 'US' | 'EU' | 'LATAM'
}

interface DataTableProps {
  data: RegistroUX[]
}

function DispositivoIcon({ dispositivo }: { dispositivo: string }) {
  switch (dispositivo) {
    case 'desktop':
      return <Monitor className="h-4 w-4" />
    case 'mobile':
      return <Smartphone className="h-4 w-4" />
    case 'tablet':
      return <Tablet className="h-4 w-4" />
    default:
      return null
  }
}

export function DataTable({ data }: DataTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dados de Usuários</CardTitle>
        <CardDescription>
          Registros detalhados de comportamento e interações
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Página</TableHead>
                <TableHead className="text-center">Cliques</TableHead>
                <TableHead className="text-center">Tempo (s)</TableHead>
                <TableHead className="text-center">Conversão</TableHead>
                <TableHead className="text-center">Versão</TableHead>
                <TableHead>Dispositivo</TableHead>
                <TableHead>Região</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    Nenhum dado encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                data.map((registro) => (
                  <TableRow key={registro.id}>
                    <TableCell className="font-mono text-xs">{registro.usuario.slice(-14)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{registro.pagina}</Badge>
                    </TableCell>
                    <TableCell className="text-center">{registro.cliques}</TableCell>
                    <TableCell className="text-center">{registro.tempoNaPagina}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={registro.converteu ? 'default' : 'secondary'}>
                        {registro.converteu ? 'Sim' : 'Não'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge 
                        variant="outline"
                        className={registro.versao === 'A' 
                          ? 'border-chart-1 text-chart-1' 
                          : 'border-chart-2 text-chart-2'
                        }
                      >
                        {registro.versao}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <DispositivoIcon dispositivo={registro.dispositivo} />
                        <span className="text-sm capitalize">{registro.dispositivo}</span>
                      </div>
                    </TableCell>
                    <TableCell>{registro.regiao}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
