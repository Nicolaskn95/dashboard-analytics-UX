import { NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

const funnelStages = ["home", "produto", "carrinho", "checkout"] as const
const abVersions = ["A", "B"] as const
const deviceTypes = ["desktop", "mobile", "tablet"] as const
const regions = ["BR", "US", "EU", "LATAM"] as const

type FunnelStage = (typeof funnelStages)[number]
type ABVersion = (typeof abVersions)[number]

type SessionDoc = {
  sessionId: string
  userId?: string | null
  device?: string
  region?: string
  abVersion?: ABVersion
}

type PageViewDoc = {
  _id?: { toString(): string }
  sessionId: string
  page: FunnelStage
  timeOnPage?: number
  converted?: boolean
}

type ClickDoc = {
  sessionId: string
  page: FunnelStage
  elementId?: string
  x?: number
  y?: number
  viewportWidth?: number
  viewportHeight?: number
}

type ConversionDoc = {
  sessionId: string
  fromPage?: FunnelStage
  toPage?: FunnelStage
}

type SegmentMetric = {
  name: string
  sessions: number
  conversions: number
  conversionRate: number
  avgTime: number
  totalClicks: number
}

function isABVersion(value: string | null): value is ABVersion {
  return value === "A" || value === "B"
}

function getTimedViews(pageViews: PageViewDoc[]) {
  return pageViews.filter(
    (pv) => typeof pv.timeOnPage === "number" && Number.isFinite(pv.timeOnPage) && pv.timeOnPage > 0
  )
}

function getTimeStats(pageViews: PageViewDoc[]) {
  const timedViews = getTimedViews(pageViews)
  const totalTime = timedViews.reduce((acc, pv) => acc + (pv.timeOnPage || 0), 0)

  return {
    samples: timedViews.length,
    totalTime,
    avgTime: timedViews.length > 0 ? Math.round(totalTime / timedViews.length) : 0,
  }
}

function getConversionRate(conversions: number, sessions: number) {
  return sessions > 0 ? Number(((conversions / sessions) * 100).toFixed(1)) : 0
}

function pickBestSegment(segments: SegmentMetric[]) {
  return segments.reduce<SegmentMetric | null>((best, segment) => {
    if (segment.sessions === 0) return best
    if (!best) return segment
    if (segment.conversionRate !== best.conversionRate) {
      return segment.conversionRate > best.conversionRate ? segment : best
    }
    return segment.avgTime > best.avgTime ? segment : best
  }, null)
}

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase()
    const searchParams = request.nextUrl.searchParams

    const region = searchParams.get("region")
    const device = searchParams.get("device")
    const abVersion = searchParams.get("abVersion")

    const sessionFilter: Record<string, string> = {}
    if (region && region !== "all") sessionFilter.region = region
    if (device && device !== "all") sessionFilter.device = device
    if (isABVersion(abVersion)) sessionFilter.abVersion = abVersion

    const hasFilters = Object.keys(sessionFilter).length > 0
    const sessions = await db.collection<SessionDoc>("sessions").find(sessionFilter).toArray()
    const sessionIds = sessions.map((session) => session.sessionId).filter(Boolean)
    const dataFilter = hasFilters ? { sessionId: { $in: sessionIds } } : {}

    const pageViews = await db.collection<PageViewDoc>("pageViews").find(dataFilter).toArray()
    const clicks = await db.collection<ClickDoc>("clicks").find(dataFilter).toArray()
    const conversions = await db.collection<ConversionDoc>("conversions").find(dataFilter).toArray()
    const sessionById = new Map(sessions.map((session) => [session.sessionId, session]))
    const checkoutConversions = conversions.filter((conversion) => conversion.toPage === "checkout")
    const convertedSessionIds = new Set(checkoutConversions.map((conversion) => conversion.sessionId))

    const funnelData = funnelStages.map((stage) => {
      const stageViews = pageViews.filter((pv) => pv.page === stage)
      const uniqueSessions = new Set(stageViews.map((pv) => pv.sessionId))

      return {
        stage,
        count: uniqueSessions.size,
        conversions: stageViews.filter((pv) => pv.converted).length,
      }
    })

    const dropOffData = funnelData.slice(0, -1).map((stage, index) => {
      const nextStage = funnelData[index + 1]
      const dropOff = Math.max(stage.count - nextStage.count, 0)

      return {
        fromStage: stage.stage,
        toStage: nextStage.stage,
        fromCount: stage.count,
        toCount: nextStage.count,
        dropOff,
        dropOffRate: stage.count > 0 ? Number(((dropOff / stage.count) * 100).toFixed(1)) : 0,
      }
    })

    const biggestDropOff = dropOffData.reduce<(typeof dropOffData)[number] | null>((best, current) => {
      if (!best) return current
      return current.dropOffRate > best.dropOffRate ? current : best
    }, null)

    const totalSessions = sessions.length
    const totalConversions = [...convertedSessionIds].filter((sessionId) => sessionById.has(sessionId)).length
    const timeStats = getTimeStats(pageViews)
    const totalClicks = clicks.length

    const timeByPage = funnelStages.map((page) => {
      const pageItems = pageViews.filter((pv) => pv.page === page)
      const stats = getTimeStats(pageItems)

      return {
        page,
        views: pageItems.length,
        samples: stats.samples,
        totalTime: stats.totalTime,
        avgTime: stats.avgTime,
      }
    })

    const topTimePage = timeByPage.reduce<(typeof timeByPage)[number] | null>((best, current) => {
      if (!best) return current
      return current.avgTime > best.avgTime ? current : best
    }, null)

    const clicksByPage = funnelStages.map((page) => ({
      page,
      clicks: clicks.filter((click) => click.page === page).length,
    }))

    const getMetricsForSessions = (name: string, groupSessions: SessionDoc[]): SegmentMetric => {
      const groupSessionIds = new Set(groupSessions.map((session) => session.sessionId))
      const groupPageViews = pageViews.filter((pv) => groupSessionIds.has(pv.sessionId))
      const groupClicks = clicks.filter((click) => groupSessionIds.has(click.sessionId))
      const groupConversions = new Set(
        checkoutConversions
          .filter((conversion) => groupSessionIds.has(conversion.sessionId))
          .map((conversion) => conversion.sessionId)
      )
      const groupTimeStats = getTimeStats(groupPageViews)

      return {
        name,
        sessions: groupSessions.length,
        conversions: groupConversions.size,
        conversionRate: getConversionRate(groupConversions.size, groupSessions.length),
        avgTime: groupTimeStats.avgTime,
        totalClicks: groupClicks.length,
      }
    }

    const abComparison = abVersions.map((version) => ({
      version,
      ...getMetricsForSessions(
        `Versão ${version}`,
        sessions.filter((session) => session.abVersion === version)
      ),
    }))

    const deviceSegments = deviceTypes.map((deviceType) =>
      getMetricsForSessions(
        deviceType,
        sessions.filter((session) => session.device === deviceType)
      )
    )

    const regionSegments = regions.map((regionName) =>
      getMetricsForSessions(
        regionName,
        sessions.filter((session) => session.region === regionName)
      )
    )

    const bestABVersion = abComparison.reduce<(typeof abComparison)[number] | null>((best, current) => {
      if (current.sessions === 0) return best
      if (!best) return current
      if (current.conversionRate !== best.conversionRate) {
        return current.conversionRate > best.conversionRate ? current : best
      }
      return current.avgTime > best.avgTime ? current : best
    }, null)
    const bestDevice = pickBestSegment(deviceSegments)

    const fallbackInsight = "Ainda não há dados suficientes."
    const longestTimePageText =
      topTimePage && topTimePage.avgTime > 0
        ? `${topTimePage.page} (${topTimePage.avgTime}s em média)`
        : fallbackInsight
    const biggestAbandonmentText =
      biggestDropOff && biggestDropOff.fromCount > 0
        ? `${biggestDropOff.fromStage} para ${biggestDropOff.toStage} (${biggestDropOff.dropOffRate}% de abandono)`
        : fallbackInsight
    const bestABVersionText = bestABVersion
      ? `Versão ${bestABVersion.version} (${bestABVersion.conversionRate}% de conversão)`
      : fallbackInsight
    const bestDeviceText = bestDevice
      ? `${bestDevice.name} (${bestDevice.conversionRate}% de conversão)`
      : fallbackInsight
    const suggestedImprovement =
      biggestDropOff && biggestDropOff.fromCount > 0
        ? `Revisar CTA, clareza de oferta e fricções na etapa ${biggestDropOff.fromStage}, onde ocorre a maior perda do funil.`
        : "Gerar mais navegações na loja de teste para sustentar uma recomendação com base quantitativa."

    const defaultVw = 1200
    const defaultVh = 800
    const heatmapData: Record<
      string,
      Array<{ x: number; y: number; elementId: string; viewportWidth: number; viewportHeight: number }>
    > = {}
    funnelStages.forEach((stage) => {
      heatmapData[stage] = clicks
        .filter((click) => click.page === stage)
        .map((click) => ({
          x: click.x || 0,
          y: click.y || 0,
          elementId: click.elementId || "unknown",
          viewportWidth:
            typeof click.viewportWidth === "number" && click.viewportWidth > 0 ? click.viewportWidth : defaultVw,
          viewportHeight:
            typeof click.viewportHeight === "number" && click.viewportHeight > 0 ? click.viewportHeight : defaultVh,
        }))
    })

    return NextResponse.json({
      kpis: {
        conversionRate: getConversionRate(totalConversions, totalSessions),
        avgTimeOnPage: timeStats.avgTime,
        totalClicks,
        totalSessions,
        totalConversions,
      },
      funnelData,
      dropOffData,
      biggestDropOff,
      timeByPage,
      topTimePage,
      clicksByPage,
      abComparison,
      profileSegments: {
        devices: deviceSegments,
        regions: regionSegments,
      },
      insights: {
        biggestAbandonment: biggestAbandonmentText,
        bestABVersion: bestABVersionText,
        bestDevice: bestDeviceText,
        longestTimePage: longestTimePageText,
        suggestedImprovement,
      },
      tableData: pageViews.map((pv) => {
        const session = sessionById.get(pv.sessionId)
        const pageClicks = clicks.filter(
          (click) => click.sessionId === pv.sessionId && click.page === pv.page
        ).length

        return {
          id: pv._id?.toString() || `${pv.sessionId}-${pv.page}`,
          user: session?.userId || pv.sessionId,
          sessionId: pv.sessionId,
          page: pv.page,
          clicks: pageClicks,
          timeOnPage: pv.timeOnPage || 0,
          converted: Boolean(pv.converted),
          abVersion: session?.abVersion || "A",
          device: session?.device || "desktop",
          region: session?.region || "BR",
        }
      }),
      heatmapData,
      filters: {
        regions: [...new Set(sessions.map((session) => session.region).filter(Boolean))],
        devices: [...new Set(sessions.map((session) => session.device).filter(Boolean))],
      },
    })
  } catch (error) {
    console.error("Erro ao buscar analytics:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
