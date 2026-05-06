"use client"

import { useState } from "react"
import { useTracking } from "@/hooks/use-tracking"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"

export default function ProductPage() {
  const { trackConversion, getABVersion } = useTracking("produto")
  const abVersion = getABVersion()
  const [selectedColor, setSelectedColor] = useState("black")
  const [quantity, setQuantity] = useState(1)

  const colors = [
    { id: "black", name: "Preto", hex: "#1a1a1a" },
    { id: "white", name: "Branco", hex: "#f5f5f5" },
    { id: "blue", name: "Azul", hex: "#3b82f6" },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div id="product-gallery" className="space-y-4">
          <div className="aspect-square relative rounded-xl overflow-hidden bg-muted">
            <Image
              src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop"
              alt="Headphone Premium"
              fill
              className="object-cover"
              id="main-product-image"
            />
            <Badge id="discount-badge" className="absolute top-4 left-4">
              -20% OFF
            </Badge>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <button
                key={i}
                id={`thumbnail-${i}`}
                className="aspect-square rounded-lg overflow-hidden bg-muted border-2 border-transparent hover:border-primary transition-colors"
              >
                <Image
                  src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop"
                  alt={`Thumbnail ${i}`}
                  width={200}
                  height={200}
                  className="object-cover w-full h-full"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div id="product-info" className="space-y-6">
          <div>
            <p id="product-brand" className="text-sm text-muted-foreground mb-1">AudioTech</p>
            <h1 id="product-title" className="text-3xl font-bold text-foreground mb-2">
              Headphone Premium Wireless
            </h1>
            <div className="flex items-center gap-2">
              <div id="product-rating" className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`w-5 h-5 ${star <= 4 ? "text-yellow-400" : "text-muted"}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span id="review-count" className="text-sm text-muted-foreground">(128 avaliações)</span>
            </div>
          </div>

          <div id="price-section" className="flex items-baseline gap-3">
            <span id="current-price" className="text-3xl font-bold text-foreground">R$ 239,99</span>
            <span id="original-price" className="text-lg text-muted-foreground line-through">R$ 299,99</span>
          </div>

          {/* Color Selection */}
          <div id="color-selection">
            <p className="text-sm font-medium text-foreground mb-3">Cor: {colors.find(c => c.id === selectedColor)?.name}</p>
            <div className="flex gap-2">
              {colors.map((color) => (
                <button
                  key={color.id}
                  id={`color-${color.id}`}
                  onClick={() => setSelectedColor(color.id)}
                  className={`w-10 h-10 rounded-full border-2 transition-all ${
                    selectedColor === color.id ? "border-primary scale-110" : "border-border"
                  }`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div id="quantity-selection">
            <p className="text-sm font-medium text-foreground mb-3">Quantidade</p>
            <div className="flex items-center gap-3">
              <Button
                id="quantity-decrease"
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                -
              </Button>
              <span id="quantity-value" className="w-12 text-center font-medium">{quantity}</span>
              <Button
                id="quantity-increase"
                variant="outline"
                size="icon"
                onClick={() => setQuantity(quantity + 1)}
              >
                +
              </Button>
            </div>
          </div>

          {/* CTA Buttons */}
          <div id="cta-section" className="flex flex-col gap-3">
            <Link 
              href="/teste/carrinho" 
              onClick={() => trackConversion("carrinho")}
              className="w-full"
            >
              <Button id="add-to-cart" size="lg" className="w-full font-semibold">
                {abVersion === "A" ? "Adicionar ao Carrinho" : "Comprar Agora - Frete Grátis"}
              </Button>
            </Link>
            <Button id="add-to-wishlist" variant="outline" size="lg" className="w-full">
              Adicionar aos Favoritos
            </Button>
          </div>

          {/* Product Features */}
          <Card id="features-card">
            <CardContent className="p-4 space-y-3">
              <div id="feature-shipping" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-foreground">Frete Grátis</p>
                  <p className="text-sm text-muted-foreground">Para todo o Brasil</p>
                </div>
              </div>
              <div id="feature-warranty" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-foreground">Garantia de 2 Anos</p>
                  <p className="text-sm text-muted-foreground">Cobertura total</p>
                </div>
              </div>
              <div id="feature-return" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-foreground">Devolução Grátis</p>
                  <p className="text-sm text-muted-foreground">Em até 30 dias</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* A/B Version Indicator */}
      <div className="fixed bottom-4 right-4 bg-card border border-border px-3 py-1.5 rounded-full text-xs text-muted-foreground">
        Versão {abVersion}
      </div>
    </div>
  )
}
