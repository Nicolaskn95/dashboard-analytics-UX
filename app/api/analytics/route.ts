import { NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase()
    const searchParams = request.nextUrl.searchParams
    
    const region = searchParams.get("region")
    const device = searchParams.get("device")
    const abVersion = searchParams.get("abVersion")
    
    // Build filter for sessions
    const sessionFilter: Record<string, string> = {}
    if (region && region !== "all") sessionFilter.region = region
    if (device && device !== "all") sessionFilter.device = device
    if (abVersion && abVersion !== "all") sessionFilter.abVersion = abVersion
    
    // Get filtered session IDs
    const sessions = await db.collection("sessions").find(sessionFilter).toArray()
    const sessionIds = sessions.map(s => s.sessionId)
    
    // Check if we have any filters applied
    const hasFilters = Object.keys(sessionFilter).length > 0
    
    // Get page views, clicks and conversions
    // If no filters, get all data. If filters, only get data from filtered sessions
    const dataFilter = hasFilters && sessionIds.length > 0
      ? { sessionId: { $in: sessionIds } }
      : {}
    
    const pageViews = await db.collection("pageViews").find(dataFilter).toArray()
    const clicks = await db.collection("clicks").find(dataFilter).toArray()
    const conversions = await db.collection("conversions").find(dataFilter).toArray()
    
    // If no filters, also get all sessions for the stats
    const allSessions = hasFilters ? sessions : await db.collection("sessions").find({}).toArray()
    
    // Calculate funnel data
    const funnelStages = ["home", "produto", "carrinho", "checkout"]
    const funnelData = funnelStages.map(stage => {
      const stageViews = pageViews.filter(pv => pv.page === stage)
      const uniqueSessions = [...new Set(stageViews.map(pv => pv.sessionId))]
      return {
        stage,
        count: uniqueSessions.length,
        conversions: stageViews.filter(pv => pv.converted).length
      }
    })
    
    // Calculate KPIs
    const totalConversions = conversions.filter(c => c.toPage === "checkout").length
    const totalSessions = allSessions.length
    const conversionRate = totalSessions > 0 
      ? ((totalConversions / totalSessions) * 100).toFixed(1)
      : "0"
    
    const avgTimeOnPage = pageViews.length > 0
      ? Math.round(
          pageViews
            .filter(pv => pv.timeOnPage)
            .reduce((acc, pv) => acc + (pv.timeOnPage || 0), 0) / 
          pageViews.filter(pv => pv.timeOnPage).length || 1
        )
      : 0
    
    const totalClicks = clicks.length
    
    // Build table data
    const tableData = pageViews.map(pv => {
      const session = allSessions.find(s => s.sessionId === pv.sessionId)
      const pageClicks = clicks.filter(
        c => c.sessionId === pv.sessionId && c.page === pv.page
      ).length
      
      return {
        id: pv._id?.toString() || "",
        sessionId: pv.sessionId,
        page: pv.page,
        clicks: pageClicks,
        timeOnPage: pv.timeOnPage || 0,
        converted: pv.converted,
        abVersion: session?.abVersion || "A",
        device: session?.device || "desktop",
        region: session?.region || "BR",
      }
    })
    
    // Build heatmap data (viewport per click so coordinates normalize correctly per device)
    const defaultVw = 1200
    const defaultVh = 800
    const heatmapData: Record<
      string,
      Array<{ x: number; y: number; elementId: string; viewportWidth: number; viewportHeight: number }>
    > = {}
    funnelStages.forEach(stage => {
      heatmapData[stage] = clicks
        .filter(c => c.page === stage)
        .map(c => ({
          x: c.x,
          y: c.y,
          elementId: c.elementId,
          viewportWidth:
            typeof c.viewportWidth === "number" && c.viewportWidth > 0 ? c.viewportWidth : defaultVw,
          viewportHeight:
            typeof c.viewportHeight === "number" && c.viewportHeight > 0 ? c.viewportHeight : defaultVh,
        }))
    })
    
    console.log("[v0] API Analytics - Total clicks:", clicks.length)
    console.log("[v0] API Analytics - heatmapData:", JSON.stringify(Object.keys(heatmapData).map(k => ({ [k]: heatmapData[k]?.length || 0 }))))
    
    // Get unique regions and devices for filters
    const regions = [...new Set(sessions.map(s => s.region))]
    const devices = [...new Set(sessions.map(s => s.device))]
    
    return NextResponse.json({
      kpis: {
        conversionRate: parseFloat(conversionRate),
        avgTimeOnPage,
        totalClicks,
        totalSessions,
      },
      funnelData,
      tableData,
      heatmapData,
      filters: {
        regions,
        devices,
      }
    })
  } catch (error) {
    console.error("Erro ao buscar analytics:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
