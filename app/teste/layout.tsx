import Link from "next/link"
import { ABTestLinks } from "@/components/ab-test-links"

export default function TesteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex flex-wrap items-center justify-between gap-4">
            <Link href="/teste" className="text-xl font-bold text-foreground">
              Loja UX Test
            </Link>
            <div className="flex flex-wrap items-center gap-4">
              <Link 
                href="/teste" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Home
              </Link>
              <Link 
                href="/teste/produto" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Produto
              </Link>
              <Link 
                href="/teste/carrinho" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Carrinho
              </Link>
              <Link 
                href="/teste/checkout" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Checkout
              </Link>
            </div>
            <ABTestLinks compact />
            <Link 
              href="/" 
              className="text-xs text-muted-foreground hover:text-foreground transition-colors border border-border px-3 py-1.5 rounded-md"
            >
              Ver Dashboard
            </Link>
          </nav>
        </div>
      </header>
      <main>
        {children}
      </main>
    </div>
  )
}
