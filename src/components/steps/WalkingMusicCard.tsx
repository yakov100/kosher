'use client'

import { useEffect, useMemo, useState } from 'react'
import { Music2, ChevronDown, ChevronUp, Link2, CheckCircle2, AlertTriangle } from 'lucide-react'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const STORAGE_KEYS = {
  embedUrl: 'walking_music_embed_url',
  expanded: 'walking_music_expanded',
  provider: 'walking_music_provider',
} as const

type SpotifyEmbedTargetType = 'playlist' | 'album' | 'track' | 'show' | 'episode'
type Provider = 'spotify' | 'youtube'

type Preset = {
  label: string
  type: SpotifyEmbedTargetType
  id: string
}

const PRESETS: Preset[] = [
  { label: 'אנרגטי', type: 'playlist', id: '37i9dQZF1DX70RN3TfWWJh' }, // Power Workout
  { label: 'פופ להליכה', type: 'playlist', id: '37i9dQZF1DXcBWIGoYBM5M' }, // Today's Top Hits
  { label: 'רגוע', type: 'playlist', id: '37i9dQZF1DX4sWSpwq3LiO' }, // Peaceful Piano
]

function buildSpotifyEmbedUrl(type: SpotifyEmbedTargetType, id: string) {
  return `https://open.spotify.com/embed/${type}/${id}`
}

function normalizeSpotifyToEmbedUrl(input: string): string | null {
  const raw = input.trim()
  if (!raw) return null

  // spotify:playlist:ID
  if (raw.startsWith('spotify:')) {
    const parts = raw.split(':').filter(Boolean)
    // spotify:{type}:{id}
    if (parts.length >= 3) {
      const type = parts[1] as SpotifyEmbedTargetType
      const id = parts[2]
      if (id && ['playlist', 'album', 'track', 'show', 'episode'].includes(type)) {
        return buildSpotifyEmbedUrl(type, id)
      }
    }
    return null
  }

  // https://open.spotify.com/...
  let url: URL
  try {
    url = new URL(raw)
  } catch {
    return null
  }

  if (url.hostname !== 'open.spotify.com') return null

  // Already embed
  if (url.pathname.startsWith('/embed/')) {
    return `https://open.spotify.com${url.pathname}`
  }

  // Find {type}/{id} in path segments (supports /playlist/{id}, /user/.../playlist/{id}, etc)
  const segments = url.pathname.split('/').filter(Boolean)
  const validTypes: SpotifyEmbedTargetType[] = ['playlist', 'album', 'track', 'show', 'episode']
  const typeIndex = segments.findIndex((s) => validTypes.includes(s as SpotifyEmbedTargetType))
  if (typeIndex === -1) return null

  const type = segments[typeIndex] as SpotifyEmbedTargetType
  const id = segments[typeIndex + 1]
  if (!id) return null

  return buildSpotifyEmbedUrl(type, id)
}

function buildYouTubeEmbedUrlFromVideoId(videoId: string) {
  return `https://www.youtube.com/embed/${videoId}`
}

function buildYouTubeEmbedUrlFromPlaylistId(playlistId: string) {
  return `https://www.youtube.com/embed/videoseries?list=${playlistId}`
}

function normalizeYouTubeToEmbedUrl(input: string): string | null {
  const raw = input.trim()
  if (!raw) return null

  let url: URL
  try {
    url = new URL(raw)
  } catch {
    return null
  }

  const host = url.hostname.replace(/^www\./, '')
  const isYouTube =
    host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com' || host === 'youtu.be'
  if (!isYouTube) return null

  // youtu.be/VIDEO
  if (host === 'youtu.be') {
    const videoId = url.pathname.split('/').filter(Boolean)[0]
    if (!videoId) return null
    return buildYouTubeEmbedUrlFromVideoId(videoId)
  }

  // If already embed
  if (url.pathname.startsWith('/embed/')) {
    return `https://www.youtube.com${url.pathname}${url.search}`
  }

  const list = url.searchParams.get('list')

  // Playlist link: /playlist?list=...
  if (url.pathname === '/playlist' && list) {
    return buildYouTubeEmbedUrlFromPlaylistId(list)
  }

  // Watch link: /watch?v=...
  if (url.pathname === '/watch') {
    const v = url.searchParams.get('v')
    if (list) return buildYouTubeEmbedUrlFromPlaylistId(list)
    if (v) return buildYouTubeEmbedUrlFromVideoId(v)
  }

  return null
}

export function WalkingMusicCard() {
  const defaultEmbedUrl = useMemo(() => buildSpotifyEmbedUrl(PRESETS[0].type, PRESETS[0].id), [])
  const [expanded, setExpanded] = useState(false)
  const [embedUrl, setEmbedUrl] = useState<string>(defaultEmbedUrl)
  const [provider, setProvider] = useState<Provider>('spotify')
  const [customUrl, setCustomUrl] = useState('')
  const [status, setStatus] = useState<'idle' | 'saved' | 'invalid'>('idle')

  // Load persisted preferences
  useEffect(() => {
    try {
      const savedUrl = localStorage.getItem(STORAGE_KEYS.embedUrl)
      const savedExpanded = localStorage.getItem(STORAGE_KEYS.expanded)
      const savedProvider = localStorage.getItem(STORAGE_KEYS.provider) as Provider | null
      if (savedUrl) setEmbedUrl(savedUrl)
      if (savedExpanded === '1') setExpanded(true)
      if (savedProvider === 'spotify' || savedProvider === 'youtube') setProvider(savedProvider)
    } catch {
      // ignore storage errors
    }
  }, [])

  // Persist expansion
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.expanded, expanded ? '1' : '0')
    } catch {
      // ignore
    }
  }, [expanded])

  // Persist embed URL
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.embedUrl, embedUrl)
    } catch {
      // ignore
    }
  }, [embedUrl])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.provider, provider)
    } catch {
      // ignore
    }
  }, [provider])

  const applyCustomUrl = () => {
    const normalized = provider === 'spotify' ? normalizeSpotifyToEmbedUrl(customUrl) : normalizeYouTubeToEmbedUrl(customUrl)
    if (!normalized) {
      setStatus('invalid')
      return
    }
    setEmbedUrl(normalized)
    setExpanded(true)
    setCustomUrl('')
    setStatus('saved')
    window.setTimeout(() => setStatus('idle'), 1500)
  }

  return (
    <Card>
      <CardHeader
        title="מוזיקה להליכה"
        subtitle="נגן Spotify מוטמע בתוך האפליקציה"
        icon={<Music2 size={20} />}
        action={
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setExpanded((v) => !v)}
            icon={expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          >
            {expanded ? 'הסתר' : 'הצג'}
          </Button>
        }
      />

      {/* Fallback toggle (always visible even on narrow layouts) */}
      <Button
        type="button"
        variant="secondary"
        size="sm"
        fullWidth
        onClick={() => setExpanded((v) => !v)}
        className="mb-3"
      >
        {expanded ? 'הסתר נגן' : 'הצג נגן'}
      </Button>

      {/* Provider selector */}
      <div className="flex gap-2 mb-3">
        <button
          type="button"
          onClick={() => setProvider('spotify')}
          className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
            provider === 'spotify' ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Spotify
        </button>
        <button
          type="button"
          onClick={() => setProvider('youtube')}
          className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
            provider === 'youtube' ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          YouTube
        </button>
      </div>

      {/* Presets */}
      {provider === 'spotify' && (
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={`${p.type}:${p.id}`}
              type="button"
              onClick={() => {
                setEmbedUrl(buildSpotifyEmbedUrl(p.type, p.id))
                setExpanded(true)
                setStatus('idle')
              }}
              className="px-3 py-1.5 rounded-lg text-sm transition-all bg-gray-100 text-gray-600 hover:bg-gray-200"
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      {/* Custom URL */}
      <div className="mt-4 grid gap-2">
        <Input
          value={customUrl}
          onChange={(e) => {
            setCustomUrl(e.target.value)
            if (status !== 'idle') setStatus('idle')
          }}
          placeholder={provider === 'spotify' ? 'הדבק קישור Spotify (פלייליסט/שיר/אלבום) או spotify:...' : 'הדבק קישור YouTube (וידאו/פלייליסט)'}
          dir="ltr"
          inputMode="url"
        />

        <div className="flex items-center justify-between gap-3">
          <div className="text-xs text-gray-400">
            {provider === 'spotify'
              ? 'טיפ: אפשר להדביק גם https://open.spotify.com/playlist/... וגם spotify:playlist:... (אם לא נטען באייפון/ספארי, נסה לעבור ל-YouTube)'
              : 'טיפ: אפשר להדביק קישור של YouTube לוידאו (watch) או פלייליסט (playlist)'}
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={applyCustomUrl}
            disabled={!customUrl.trim()}
            icon={<Link2 size={18} />}
          >
            החל
          </Button>
        </div>

        {status === 'saved' && (
          <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 p-2 rounded-lg flex items-center gap-2">
            <CheckCircle2 size={18} />
            נשמר והוחל
          </div>
        )}

        {status === 'invalid' && (
          <div className="text-sm text-rose-700 bg-rose-50 border border-rose-100 p-2 rounded-lg flex items-center gap-2">
            <AlertTriangle size={18} />
            הקישור לא נראה כמו קישור Spotify תקין
          </div>
        )}
      </div>

      {/* Player */}
      {expanded && (
        <div className="mt-4">
          <iframe
            title="Walking music"
            src={embedUrl}
            width="100%"
            height={provider === 'spotify' ? '152' : '220'}
            frameBorder="0"
            allow={
              provider === 'spotify'
                ? 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture'
                : 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
            }
            loading="lazy"
            className="rounded-xl"
          />
        </div>
      )}
    </Card>
  )
}

