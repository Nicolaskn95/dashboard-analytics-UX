import { NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, data } = body
    
    const db = await getDatabase()
    
    switch (type) {
      case "session_start": {
        const session = {
          sessionId: data.sessionId,
          userId: data.userId || null,
          startTime: new Date(),
          device: data.device,
          region: data.region,
          abVersion: data.abVersion,
          userAgent: data.userAgent,
        }
        await db.collection("sessions").insertOne(session)
        return NextResponse.json({ success: true, sessionId: data.sessionId })
      }
      
      case "session_end": {
        await db.collection("sessions").updateOne(
          { sessionId: data.sessionId },
          { $set: { endTime: new Date() } }
        )
        return NextResponse.json({ success: true })
      }
      
      case "page_view": {
        const pageView = {
          sessionId: data.sessionId,
          page: data.page,
          enteredAt: new Date(),
          converted: false,
        }
        await db.collection("pageViews").insertOne(pageView)
        return NextResponse.json({ success: true })
      }
      
      case "page_leave": {
        const enteredDoc = await db.collection("pageViews").findOne(
          { sessionId: data.sessionId, page: data.page, leftAt: null },
          { sort: { enteredAt: -1 } }
        )
        
        if (enteredDoc) {
          const timeOnPage = new Date().getTime() - new Date(enteredDoc.enteredAt).getTime()
          await db.collection("pageViews").updateOne(
            { _id: enteredDoc._id },
            { 
              $set: { 
                leftAt: new Date(),
                timeOnPage: Math.round(timeOnPage / 1000)
              } 
            }
          )
        }
        return NextResponse.json({ success: true })
      }
      
      case "click": {
        const clickEvent = {
          sessionId: data.sessionId,
          page: data.page,
          elementId: data.elementId,
          elementType: data.elementType,
          x: data.x,
          y: data.y,
          timestamp: new Date(),
          viewportWidth: data.viewportWidth,
          viewportHeight: data.viewportHeight,
        }
        await db.collection("clicks").insertOne(clickEvent)
        return NextResponse.json({ success: true })
      }
      
      case "conversion": {
        await db.collection("pageViews").updateOne(
          { sessionId: data.sessionId, page: data.fromPage },
          { $set: { converted: true } },
          { sort: { enteredAt: -1 } }
        )
        
        const conversionEvent = {
          sessionId: data.sessionId,
          fromPage: data.fromPage,
          toPage: data.toPage,
          timestamp: new Date(),
          timeToConvert: data.timeToConvert,
        }
        await db.collection("conversions").insertOne(conversionEvent)
        return NextResponse.json({ success: true })
      }
      
      default:
        return NextResponse.json({ error: "Tipo de evento inválido" }, { status: 400 })
    }
  } catch (error) {
    console.error("Erro no tracking:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
