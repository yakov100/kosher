import { NextResponse } from 'next/server'
import { z } from 'zod'

const querySchema = z.object({
  videoId: z
    .string()
    .min(5)
    .max(32)
    .regex(/^[a-zA-Z0-9_-]+$/),
  maxResults: z
    .string()
    .optional()
    .transform((v) => {
      const n = v ? Number(v) : 12
      return Number.isFinite(n) ? Math.min(20, Math.max(1, Math.floor(n))) : 12
    }),
})

type RelatedVideo = {
  videoId: string
  title: string
  channelTitle: string
  thumbnailUrl: string
}

export async function GET(req: Request) {
  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'YOUTUBE_API_KEY is not set' },
      { status: 500 }
    )
  }

  const url = new URL(req.url)
  const parsed = querySchema.safeParse({
    videoId: url.searchParams.get('videoId'),
    maxResults: url.searchParams.get('maxResults') ?? undefined,
  })

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid query', details: parsed.error.issues },
      { status: 400 }
    )
  }

  const { videoId, maxResults } = parsed.data

  const ytUrl = new URL('https://www.googleapis.com/youtube/v3/search')
  ytUrl.searchParams.set('part', 'snippet')
  ytUrl.searchParams.set('type', 'video')
  ytUrl.searchParams.set('relatedToVideoId', videoId)
  ytUrl.searchParams.set('maxResults', String(maxResults))
  ytUrl.searchParams.set('safeSearch', 'strict')
  ytUrl.searchParams.set('key', apiKey)

  const res = await fetch(ytUrl.toString(), {
    headers: { 'Accept': 'application/json' },
    // Avoid caching surprises while iterating; can be tuned later.
    cache: 'no-store',
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    return NextResponse.json(
      { error: `YouTube API error: HTTP ${res.status}`, details: text.slice(0, 400) },
      { status: 502 }
    )
  }

  const data = (await res.json()) as any
  const items = Array.isArray(data?.items) ? data.items : []

  const videos: RelatedVideo[] = items
    .map((it: any) => {
      const vId = it?.id?.videoId
      const sn = it?.snippet
      const title = sn?.title
      const channelTitle = sn?.channelTitle
      const thumb =
        sn?.thumbnails?.medium?.url ||
        sn?.thumbnails?.high?.url ||
        sn?.thumbnails?.default?.url

      if (!vId || !title || !channelTitle || !thumb) return null
      return { videoId: vId, title, channelTitle, thumbnailUrl: thumb } satisfies RelatedVideo
    })
    .filter(Boolean)

  return NextResponse.json({ videos })
}

