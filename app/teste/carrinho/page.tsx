"use client"

import { useState } from "react"
import { useTracking } from "@/hooks/use-tracking"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import Image from "next/image"

const initialCartItems = [
  {
    id: 1,
    name: "Headphone Premium Wireless",
    price: 239.99,
    quantity: 1,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop",
  },
  {
    id: 2,
    name: "Smartwatch Pro",
    price: 499.99,
    quantity: 1,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop",
  },
]

export default function CartPage() {
  const { trackConversion, getABVersion } = useTracking("carrinho")
  const abVersion = getABVersion()
  const [cartItems, setCartItems] = useState(initialCartItems)
  const [couponCode, setCouponCode] = useState("")
  const [couponApplied, setCouponApplied] = useState(false)

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity < 1) return
    setCartItems(items =>
      items.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    )
  }

  const removeItem = (id: number) => {
    setCartItems(items => items.filter(item => item.id !== id))
  }

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const discount = couponApplied ? subtotal * 0.1 : 0
  const shipping = subtotal > 200 ? 0 : 29.90
  const total = subtotal - discount + shipping

  const applyCoupon = () => {
    if (couponCode.toLowerCase() === "desconto10") {
      setCouponApplied(true)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 id="page-title" className="text-3xl font-bold text-foreground mb-8">
        Seu Carrinho
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div id="cart-items" className="lg:col-span-2 space-y-4">
          {cartItems.length === 0 ? (
            <Card id="empty-cart">
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground mb-4">Seu carrinho está vazio</p>
                <Link href="/teste">
                  <Button id="continue-shopping-empty">Continuar Comprando</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            cartItems.map((item) => (
              <Card key={item.id} id={`cart-item-${item.id}`}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={96}
                        height={96}
                        className="object-cover w-full h-full"
                        id={`item-image-${item.id}`}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 id={`item-name-${item.id}`} className="font-medium text-foreground">
                        {item.name}
                      </h3>
                      <p id={`item-price-${item.id}`} className="text-sm text-muted-foreground">
                        R$ {item.price.toFixed(2)}
                      </p>
                      <div className="flex items-center gap-3 mt-3">
                        <Button
                          id={`decrease-${item.id}`}
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          -
                        </Button>
                        <span id={`quantity-${item.id}`} className="w-8 text-center">
                          {item.quantity}
                        </span>
                        <Button
                          id={`increase-${item.id}`}
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <p id={`item-total-${item.id}`} className="font-semibold text-foreground">
                        R$ {(item.price * item.quantity).toFixed(2)}
                      </p>
                      <Button
                        id={`remove-${item.id}`}
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => removeItem(item.id)}
                      >
                        Remover
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}

          {cartItems.length > 0 && (
            <div id="continue-shopping-section" className="flex justify-between items-center pt-4">
              <Link href="/teste/produto">
                <Button id="continue-shopping" variant="outline">
                  Continuar Comprando
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div id="order-summary" className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle id="summary-title">Resumo do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Coupon Section */}
              <div id="coupon-section" className="flex gap-2">
                <Input
                  id="coupon-input"
                  placeholder="Código do cupom"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  disabled={couponApplied}
                />
                <Button
                  id="apply-coupon"
                  variant="outline"
                  onClick={applyCoupon}
                  disabled={couponApplied}
                >
                  Aplicar
                </Button>
              </div>
              {couponApplied && (
                <p id="coupon-success" className="text-sm text-green-600">
                  Cupom aplicado com sucesso! -10%
                </p>
              )}

              <div className="space-y-2 pt-4 border-t border-border">
                <div id="subtotal-row" className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">R$ {subtotal.toFixed(2)}</span>
                </div>
                {couponApplied && (
                  <div id="discount-row" className="flex justify-between text-sm">
                    <span className="text-green-600">Desconto</span>
                    <span className="text-green-600">-R$ {discount.toFixed(2)}</span>
                  </div>
                )}
                <div id="shipping-row" className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Frete</span>
                  <span className={shipping === 0 ? "text-green-600" : "text-foreground"}>
                    {shipping === 0 ? "Grátis" : `R$ ${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div id="total-row" className="flex justify-between text-lg font-semibold pt-2 border-t border-border">
                  <span className="text-foreground">Total</span>
                  <span className="text-foreground">R$ {total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Link 
                href="/teste/checkout" 
                onClick={() => trackConversion("checkout")}
                className="w-full"
              >
                <Button id="checkout-button" size="lg" className="w-full font-semibold">
                  {abVersion === "A" ? "Finalizar Compra" : "Pagar com Segurança"}
                </Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Trust Badges */}
          <div id="trust-badges" className="mt-4 p-4 bg-card rounded-lg border border-border">
            <div className="flex items-center justify-center gap-4 text-muted-foreground">
              <div id="badge-secure" className="flex items-center gap-1 text-xs">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Pagamento Seguro
              </div>
              <div id="badge-encrypted" className="flex items-center gap-1 text-xs">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                SSL Certificado
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* A/B Version Indicator */}
      <div className="fixed bottom-4 right-4 bg-card border border-border px-3 py-1.5 rounded-full text-xs text-muted-foreground">
        Versão {abVersion}
      </div>
    </div>
  )
}
