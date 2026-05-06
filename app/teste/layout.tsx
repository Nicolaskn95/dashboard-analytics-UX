import Link from "next/link"

export default function TesteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <Link href="/teste" className="text-xl font-bold text-foreground">
              Loja UX Test
            </Link>
            <div className="flex items-center gap-6">
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
