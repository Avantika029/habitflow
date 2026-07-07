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

interface RandomPick {
  imgId: number
  caption: string
  emoji: string
}

function pickRandom(): RandomPick {
  return {
    imgId: getRandom(CUTE_IDS),
    caption: getRandom(CAPTIONS),
    emoji: getRandom(CUTE_EMOJIS),
  }
}

export default function CutePictures() {
  // `picked` stays null until the client-only randomization effect below
  // runs — deterministic on the server AND on the first client render, so
  // no hydration mismatch. This has to be React STATE, not a ref: React
  // Compiler hard-blocks reading ref.current anywhere its value feeds
  // into rendered output ("Cannot access refs during render" — not a
  // lint suggestion, an actual compile error with no escape hatch for
  // this use case). State is the only thing the compiler allows here.
  const [picked, setPicked] = useState<RandomPick | null>(null)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [key, setKey] = useState(0)

  const mounted = picked !== null
  const imgId = picked?.imgId ?? CUTE_IDS[0]
  const caption = picked?.caption ?? CAPTIONS[0]
  const emoji = picked?.emoji ?? CUTE_EMOJIS[0]

  // One-time client-only randomization. This IS a direct setState call
  // in an effect body, which eslint-plugin-react-hooks' newer
  // `set-state-in-effect` rule flags — but that rule is a known false
  // positive for exactly this "avoid hydration mismatch" pattern (see
  // react/react#34743, and next-themes' own official example hitting the
  // identical warning: pacocoursey/next-themes#374). It's a lint opinion,
  // not a React Compiler hard error like the ref one above, so
  // suppressing it here is safe and intentional.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: one-time client-only randomization to avoid SSR/client hydration mismatch, not a cascading-render risk (single set call, empty deps, never re-fires)
    setPicked(pickRandom())
  }, [])

  // Auto-refresh every 45 seconds — gated on `mounted` so it can never
  // fire before the client has caught up to the server-matching render.
  // The setState calls inside refresh() happen inside the interval's
  // callback (an update triggered by an external timer, not synchronously
  // in the effect body itself), which the lint rule has no issue with.
  useEffect(() => {
    if (!mounted) return
    const interval = setInterval(refresh, 45000)
    return () => clearInterval(interval)
  }, [mounted])

  function refresh() {
    setLoading(true)
    setLiked(false)
    setPicked(pickRandom())
    setKey((k) => k + 1)
  }

  const showPlaceholder = loading || !mounted

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
            animate={{ opacity: showPlaceholder ? 0 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            onLoad={() => setLoading(false)}
            onError={() => setLoading(false)}
            className="h-full w-full object-cover"
          />
        </AnimatePresence>

        {/* Loading shimmer */}
        {showPlaceholder && (
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
