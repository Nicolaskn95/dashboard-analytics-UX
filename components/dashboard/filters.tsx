'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RotateCcw } from 'lucide-react'

type Regiao = 'BR' | 'US' | 'EU' | 'LATAM'
type Dispositivo = 'desktop' | 'mobile' | 'tablet'
type Versao = 'A' | 'B'

const regioes: Regiao[] = ['BR', 'US', 'EU', 'LATAM']
const dispositivos: Dispositivo[] = ['desktop', 'mobile', 'tablet']
const versoes: Versao[] = ['A', 'B']

interface FiltersProps {
  regiao: Regiao | 'todas'
  dispositivo: Dispositivo | 'todos'
  versao: Versao | 'todas'
  onRegiaoChange: (value: Regiao | 'todas') => void
  onDispositivoChange: (value: Dispositivo | 'todos') => void
  onVersaoChange: (value: Versao | 'todas') => void
  onReset: () => void
}

export function Filters({
  regiao,
  dispositivo,
  versao,
  onRegiaoChange,
  onDispositivoChange,
  onVersaoChange,
  onReset,
}: FiltersProps) {
  return (
    <Card>
      <CardContent className="flex flex-wrap items-center gap-4 pt-6">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Região:</span>
          <Select value={regiao} onValueChange={onRegiaoChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              {regioes.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Dispositivo:</span>
          <Select value={dispositivo} onValueChange={onDispositivoChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {dispositivos.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Versão A/B:</span>
          <Select value={versao} onValueChange={onVersaoChange}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              {versoes.map((v) => (
                <SelectItem key={v} value={v}>
                  Versão {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button variant="outline" size="sm" onClick={onReset} className="ml-auto">
          <RotateCcw className="mr-2 h-4 w-4" />
          Limpar Filtros
        </Button>
      </CardContent>
    </Card>
  )
}
