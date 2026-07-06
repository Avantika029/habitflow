'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw, Heart } from 'lucide-react'

const CUTE_EMOJIS = [
  '🐱',
  '🐶',
  '🐰',
  '🐹',
  '🐼',
  '🦊',
  '🐨',
  '🦔',
  '🐸',
  '🦋',
  '🐧',
  '🦜',
]
const CAPTIONS = [
  'You got this! 🌸',
  'Keep going! ✨',
  'So proud of you! 💕',
  'One habit at a time 🌱',
  'You are amazing! 🌟',
  'Stay consistent! 🔥',
  'Great job today! 🎉',
  'Building greatness 💪',
]

const CUTE_IDS = [
  237, 433, 577, 582, 593, 614, 659, 669, 783, 815, 816, 837, 866, 883, 1003,
  1025, 1084, 274, 326, 360, 396, 400, 403, 429, 447, 490, 509, 524, 534,
]

function getRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function getImageUrl(id: number): string {
  return `https://picsum.photos/id/${id}/240/130`
}

// This component is only ever mounted via next/dynamic with ssr:false
// (see the import site), so it never runs during SSR — it's safe to pick
// random values directly in useState's lazy initializer. No mount-gating
// or "hydration-safe" effect needed anywhere in this file.
export default function CutePictures() {
  const [imgId, setImgId] = useState(() => getRandom(CUTE_IDS))
  const [caption, setCaption] = useState(() => getRandom(CAPTIONS))
  const [emoji, setEmoji] = useState(() => getRandom(CUTE_EMOJIS))
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [key, setKey] = useState(0)

  // Auto-refresh every 45 seconds — a legitimate effect, since it's
  // subscribing to a timer (an external system) rather than computing an
  // initial value.
  useEffect(() => {
    const interval = setInterval(refresh, 45000)
    return () => clearInterval(interval)
  }, [])

  function refresh() {
    setLoading(true)
    setLiked(false)
    setImgId(getRandom(CUTE_IDS))
    setCaption(getRandom(CAPTIONS))
    setEmoji(getRandom(CUTE_EMOJIS))
    setKey((k) => k + 1)
  }

  return (
    <div className="shrink-0 overflow-hidden rounded-2xl border border-stone-100 bg-white dark:border-stone-800 dark:bg-(--surface-card)">
      {/* Image container */}
      <div className="relative w-full" style={{ height: '130px' }}>
        <AnimatePresence mode="wait">
          <motion.img
            key={key}
            src={getImageUrl(imgId)}
            alt="cute picture"
            initial={{ opacity: 0 }}
            animate={{ opacity: loading ? 0 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            onLoad={() => setLoading(false)}
            onError={() => setLoading(false)}
            className="h-full w-full object-cover"
          />
        </AnimatePresence>

        {/* Loading shimmer */}
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-(--surface-hover)">
            <span className="text-3xl">{emoji}</span>
          </div>
        )}

        {/* Buttons */}
        <div className="absolute top-2 right-2 flex gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setLiked((l) => !l)
            }}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-black/30 transition-colors hover:bg-black/50"
          >
            <Heart
              size={11}
              className={liked ? 'fill-pink-400 text-pink-400' : 'text-white'}
            />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              refresh()
            }}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-black/30 text-white transition-colors hover:bg-black/50"
          >
            <RefreshCw size={11} />
          </button>
        </div>

        {/* Gradient overlay */}
        <div className="absolute right-0 bottom-0 left-0 h-8 bg-gradient-to-t from-black/30 to-transparent" />
      </div>

      {/* Caption */}
      <div className="flex items-center gap-1.5 px-3 py-2">
        <span className="text-sm">{emoji}</span>
        <p className="flex-1 truncate text-[11px] font-medium text-(--text-primary)">
          {caption}
        </p>
      </div>
    </div>
  )
}
