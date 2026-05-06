"use client"

import { useTracking } from "@/hooks/use-tracking"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"

const featuredProducts = [
  {
    id: 1,
    name: "Headphone Premium",
    price: 299.99,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
  },
  {
    id: 2,
    name: "Smartwatch Pro",
    price: 499.99,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
  },
  {
    id: 3,
    name: "Câmera 4K",
    price: 899.99,
    image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=400&fit=crop",
  },
]

export default function HomePage() {
  const { trackConversion, getABVersion } = useTracking("home")
  const abVersion = getABVersion()

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section 
        id="hero-section" 
        className="mb-12 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 p-8 md:p-12"
      >
        <div className="max-w-2xl">
          <h1 id="hero-title" className="text-4xl font-bold text-foreground mb-4">
            {abVersion === "A" 
              ? "Descubra Produtos Incríveis" 
              : "As Melhores Ofertas Estão Aqui"}
          </h1>
          <p id="hero-description" className="text-lg text-muted-foreground mb-6">
            {abVersion === "A"
              ? "Navegue pela nossa coleção exclusiva de eletrônicos e gadgets premium."
              : "Economize até 50% em produtos selecionados. Oferta por tempo limitado!"}
          </p>
          <Link href="/teste/produto" onClick={() => trackConversion("produto")}>
            <Button id="hero-cta" size="lg" className="font-semibold">
              {abVersion === "A" ? "Ver Produtos" : "Aproveitar Ofertas"}
            </Button>
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section id="featured-section" className="mb-12">
        <h2 id="featured-title" className="text-2xl font-bold text-foreground mb-6">
          Produtos em Destaque
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredProducts.map((product) => (
            <Card key={product.id} id={`product-card-${product.id}`} className="overflow-hidden">
              <div className="aspect-square relative bg-muted">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                  id={`product-image-${product.id}`}
                />
              </div>
              <CardHeader>
                <CardTitle id={`product-name-${product.id}`}>{product.name}</CardTitle>
                <CardDescription id={`product-price-${product.id}`}>
                  R$ {product.price.toFixed(2)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link 
                  href="/teste/produto" 
                  onClick={() => trackConversion("produto")}
                >
                  <Button 
                    id={`product-cta-${product.id}`} 
                    variant="outline" 
                    className="w-full"
                  >
                    Ver Detalhes
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section id="categories-section">
        <h2 id="categories-title" className="text-2xl font-bold text-foreground mb-6">
          Categorias
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {["Eletrônicos", "Acessórios", "Wearables", "Áudio"].map((category, index) => (
            <Link
              key={category}
              href="/teste/produto"
              onClick={() => trackConversion("produto")}
              id={`category-${index}`}
              className="p-6 rounded-lg bg-card border border-border text-center hover:bg-accent transition-colors"
            >
              <span className="font-medium text-foreground">{category}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* A/B Version Indicator */}
      <div className="fixed bottom-4 right-4 bg-card border border-border px-3 py-1.5 rounded-full text-xs text-muted-foreground">
        Versão {abVersion}
      </div>
    </div>
  )
}
