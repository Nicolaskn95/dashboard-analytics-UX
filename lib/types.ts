import { ObjectId } from "mongodb"

export interface Session {
  _id?: ObjectId
  sessionId: string
  userId?: string
  startTime: Date
  endTime?: Date
  device: "desktop" | "mobile" | "tablet"
  region: string
  abVersion: "A" | "B"
  userAgent: string
  ip?: string
}

export interface PageView {
  _id?: ObjectId
  sessionId: string
  page: "home" | "produto" | "carrinho" | "checkout"
  enteredAt: Date
  leftAt?: Date
  timeOnPage?: number
  converted: boolean
}

export interface ClickEvent {
  _id?: ObjectId
  sessionId: string
  page: "home" | "produto" | "carrinho" | "checkout"
  elementId: string
  elementType: string
  x: number
  y: number
  timestamp: Date
  viewportWidth: number
  viewportHeight: number
}

export interface ConversionEvent {
  _id?: ObjectId
  sessionId: string
  fromPage: string
  toPage: string
  timestamp: Date
  timeToConvert: number
}

export type FunnelStage = "home" | "produto" | "carrinho" | "checkout"
