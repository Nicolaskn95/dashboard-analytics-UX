"use client"

import { useState } from "react"
import { useTracking } from "@/hooks/use-tracking"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export default function CheckoutPage() {
  const { getABVersion } = useTracking("checkout")
  const abVersion = getABVersion()
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsProcessing(false)
    setIsComplete(true)
  }

  if (isComplete) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card id="success-card" className="max-w-md mx-auto text-center">
          <CardContent className="p-8">
            <div id="success-icon" className="w-16 h-16 rounded-full bg-green-100 mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 id="success-title" className="text-2xl font-bold text-foreground mb-2">
              Pedido Confirmado!
            </h1>
            <p id="success-message" className="text-muted-foreground mb-6">
              Obrigado pela sua compra. Você receberá um e-mail com os detalhes do pedido.
            </p>
            <p id="order-number" className="text-sm text-muted-foreground mb-6">
              Número do pedido: #UX{Date.now().toString().slice(-8)}
            </p>
            <Button id="back-to-home" onClick={() => window.location.href = "/teste"}>
              Voltar para a Loja
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 id="page-title" className="text-3xl font-bold text-foreground mb-8">
        Checkout
      </h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div id="checkout-form" className="lg:col-span-2 space-y-6">
            {/* Shipping Info */}
            <Card id="shipping-card">
              <CardHeader>
                <CardTitle id="shipping-title">Informações de Entrega</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Nome</Label>
                    <Input id="firstName" placeholder="João" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Sobrenome</Label>
                    <Input id="lastName" placeholder="Silva" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" type="email" placeholder="joao@email.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input id="phone" placeholder="(11) 99999-9999" required />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="address">Endereço</Label>
                    <Input id="address" placeholder="Rua das Flores, 123" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="number">Número</Label>
                    <Input id="number" placeholder="123" required />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cep">CEP</Label>
                    <Input id="cep" placeholder="01234-567" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">Cidade</Label>
                    <Input id="city" placeholder="São Paulo" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">Estado</Label>
                    <Input id="state" placeholder="SP" required />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card id="payment-card">
              <CardHeader>
                <CardTitle id="payment-title">Forma de Pagamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup
                  id="payment-methods"
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                  className="space-y-3"
                >
                  <div id="payment-card-option" className="flex items-center space-x-3 p-3 border border-border rounded-lg">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex-1 cursor-pointer">
                      <span className="font-medium">Cartão de Crédito</span>
                      <span className="block text-sm text-muted-foreground">Visa, Mastercard, Elo</span>
                    </Label>
                  </div>
                  <div id="payment-pix-option" className="flex items-center space-x-3 p-3 border border-border rounded-lg">
                    <RadioGroupItem value="pix" id="pix" />
                    <Label htmlFor="pix" className="flex-1 cursor-pointer">
                      <span className="font-medium">PIX</span>
                      <span className="block text-sm text-muted-foreground">Pagamento instantâneo</span>
                    </Label>
                  </div>
                  <div id="payment-boleto-option" className="flex items-center space-x-3 p-3 border border-border rounded-lg">
                    <RadioGroupItem value="boleto" id="boleto" />
                    <Label htmlFor="boleto" className="flex-1 cursor-pointer">
                      <span className="font-medium">Boleto Bancário</span>
                      <span className="block text-sm text-muted-foreground">Vencimento em 3 dias</span>
                    </Label>
                  </div>
                </RadioGroup>

                {paymentMethod === "card" && (
                  <div id="card-details" className="space-y-4 pt-4 border-t border-border">
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Número do Cartão</Label>
                      <Input id="cardNumber" placeholder="1234 5678 9012 3456" required />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-2 space-y-2">
                        <Label htmlFor="cardExpiry">Validade</Label>
                        <Input id="cardExpiry" placeholder="MM/AA" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cardCvv">CVV</Label>
                        <Input id="cardCvv" placeholder="123" required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cardName">Nome no Cartão</Label>
                      <Input id="cardName" placeholder="JOÃO SILVA" required />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div id="order-summary" className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle id="summary-title">Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div id="order-items" className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Headphone Premium (1x)</span>
                    <span className="text-foreground">R$ 239,99</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Smartwatch Pro (1x)</span>
                    <span className="text-foreground">R$ 499,99</span>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-border">
                  <div id="subtotal" className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">R$ 739,98</span>
                  </div>
                  <div id="shipping" className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Frete</span>
                    <span className="text-green-600">Grátis</span>
                  </div>
                  <div id="total" className="flex justify-between text-lg font-semibold pt-2 border-t border-border">
                    <span className="text-foreground">Total</span>
                    <span className="text-foreground">R$ 739,98</span>
                  </div>
                </div>

                <Button 
                  id="submit-order"
                  type="submit" 
                  size="lg" 
                  className="w-full font-semibold"
                  disabled={isProcessing}
                >
                  {isProcessing 
                    ? "Processando..." 
                    : abVersion === "A" 
                      ? "Confirmar Pedido" 
                      : "Finalizar Compra Segura"}
                </Button>

                <p id="terms" className="text-xs text-center text-muted-foreground">
                  Ao confirmar, você aceita nossos{" "}
                  <a href="#" className="underline">Termos de Uso</a> e{" "}
                  <a href="#" className="underline">Política de Privacidade</a>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>

      {/* A/B Version Indicator */}
      <div className="fixed bottom-4 right-4 bg-card border border-border px-3 py-1.5 rounded-full text-xs text-muted-foreground">
        Versão {abVersion}
      </div>
    </div>
  )
}
