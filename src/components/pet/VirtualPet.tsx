'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGamificationStore } from '@/lib/store'

type PetMood =
  | 'happy'
  | 'excited'
  | 'sleepy'
  | 'celebrating'
  | 'idle'
  | 'hungry'

const MESSAGES: Record<PetMood, string[]> = {
  happy: [
    "You're doing great! 💕",
    "I'm so proud of you! 🌸",
    'Keep it up! ✨',
    "You're my hero! 🦸",
  ],
  excited: [
    'WOW you completed a habit!! 🎉',
    'YAYYYY!! 🌟',
    "You're on fire!! 🔥",
    'AMAZING!! 💫',
  ],
  sleepy: [
    'Yawn... complete a habit? 😴',
    'zzz... I believe in you... zzz 💤',
    'So sleepy... but cheering for you 💕',
  ],
  celebrating: [
    'ALL HABITS DONE!! 🎊',
    "YOU'RE INCREDIBLE!! 🏆",
    'PERFECT DAY!! ⭐',
    "I'm doing a happy dance!! 💃",
  ],
  idle: [
    'Hi there! 👋',
    'How are you doing? 🌸',
    "Let's do a habit together! 💪",
    "I'm always here for you! 💕",
    "You're doing amazing! ✨",
  ],
  hungry: [
    'Feed me a treat? 🍪',
    'Complete a habit for a treat! 🍬',
    'Snack time? 🧁',
  ],
}

function getRandomMessage(mood: PetMood): string {
  const msgs = MESSAGES[mood]
  return msgs[Math.floor(Math.random() * msgs.length)]
}

const ACCESSORIES: { level: number; emoji: string }[] = [
  { level: 1, emoji: '' },
  { level: 2, emoji: '🎀' },
  { level: 3, emoji: '🌸' },
  { level: 5, emoji: '👑' },
  { level: 7, emoji: '🎩' },
  { level: 10, emoji: '🌈' },
]

function getAccessory(level: number): string {
  const unlocked = ACCESSORIES.filter((a) => a.level <= level)
  return unlocked[unlocked.length - 1]?.emoji ?? ''
}

const PET_COLORS = ['#f9b2d7', '#daf9de', '#cfecf3', '#f6ffdc', '#ede9fe']

export default function VirtualPet() {
  const { level, totalXP } = useGamificationStore()

  // All random state starts deterministic — set randomly only after mount
  const [mounted, setMounted] = useState(false)
  const [petColor, setPetColor] = useState(PET_COLORS[0])
  const [mood, setMood] = useState<PetMood>('idle')
  const [message, setMessage] = useState<string | null>(null)
  const [showMessage, setShowMessage] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [blinking, setBlinking] = useState(false)
  const [bouncing, setBouncing] = useState(false)
  const [treats, setTreats] = useState(0)
  const [prevXP, setPrevXP] = useState(0)
  const [prevLevel, setPrevLevel] = useState(1)
  const messageTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Mount — set random color and sync XP/level baseline
  useEffect(() => {
    setPetColor(PET_COLORS[Math.floor(Math.random() * PET_COLORS.length)])
    setPrevXP(totalXP)
    setPrevLevel(level)
    setMounted(true)
  }, [])

  // Detect XP gain
  useEffect(() => {
    if (!mounted) return
    if (totalXP > prevXP) {
      setTreats((t) => t + 1)
      triggerMood('excited')
    }
    setPrevXP(totalXP)
  }, [totalXP, mounted])

  // Detect level up
  useEffect(() => {
    if (!mounted) return
    if (level > prevLevel) triggerMood('celebrating')
    setPrevLevel(level)
  }, [level, mounted])

  // Blink every 3-4 seconds
  useEffect(() => {
    if (!mounted) return
    const interval = setInterval(() => {
      setBlinking(true)
      setTimeout(() => setBlinking(false), 200)
    }, 3500)
    return () => clearInterval(interval)
  }, [mounted])

  // Random bounce
  useEffect(() => {
    if (!mounted) return
    const interval = setInterval(() => {
      setBouncing(true)
      setTimeout(() => setBouncing(false), 600)
    }, 9000)
    return () => clearInterval(interval)
  }, [mounted])

  // Sleepy at night
  useEffect(() => {
    if (!mounted) return
    const h = new Date().getHours()
    if (h >= 22 || h < 6) setMood('sleepy')
  }, [mounted])

  // Auto idle message
  useEffect(() => {
    if (!mounted) return
    const interval = setInterval(() => {
      if (mood === 'idle') showSpeechBubble('idle')
    }, 30000)
    return () => clearInterval(interval)
  }, [mood, mounted])

  function triggerMood(newMood: PetMood) {
    setMood(newMood)
    setIsAnimating(true)
    showSpeechBubble(newMood)
    setTimeout(() => {
      setIsAnimating(false)
      setMood('happy')
      setTimeout(() => setMood('idle'), 5000)
    }, 3000)
  }

  function showSpeechBubble(m: PetMood) {
    if (messageTimer.current) clearTimeout(messageTimer.current)
    setMessage(getRandomMessage(m))
    setShowMessage(true)
    messageTimer.current = setTimeout(() => setShowMessage(false), 4000)
  }

  function handlePetClick() {
    if (treats > 0) {
      setTreats((t) => t - 1)
      triggerMood('happy')
    } else {
      showSpeechBubble('idle')
      setBouncing(true)
      setTimeout(() => setBouncing(false), 600)
    }
  }

  function handleFeed(e: React.MouseEvent) {
    e.stopPropagation()
    if (treats > 0) {
      setTreats((t) => t - 1)
      triggerMood('happy')
    }
  }

  // Don't render anything on server
  if (!mounted) return null

  const accessory = getAccessory(level)

  return (
    <div
      className="fixed right-6 bottom-6 z-30 flex flex-col items-end gap-2"
      style={{ pointerEvents: 'none' }}
    >
      {/* Speech bubble */}
      <AnimatePresence>
        {showMessage && message && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="relative max-w-44 rounded-2xl rounded-br-none border border-stone-100 bg-white px-3 py-2 shadow-lg dark:border-stone-700 dark:bg-(--surface-card)"
            style={{ pointerEvents: 'auto' }}
          >
            <p className="text-xs leading-relaxed text-(--text-primary)">
              {message}
            </p>
            <div
              className="absolute right-3 -bottom-2 h-0 w-0"
              style={{
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderTop: '8px solid white',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Treats counter */}
      <AnimatePresence>
        {treats > 0 && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={handleFeed}
            className="flex cursor-pointer items-center gap-1 rounded-full border border-pink-200 bg-pink-100 px-2 py-1 dark:bg-pink-900/30"
            style={{ pointerEvents: 'auto' }}
          >
            <span className="text-xs">🍬</span>
            <span className="text-[10px] font-bold text-pink-500">
              {treats}
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Pet */}
      <motion.div
        onClick={handlePetClick}
        animate={
          mood === 'celebrating'
            ? {
                rotate: [0, -10, 10, -10, 10, 0],
                scale: [1, 1.15, 1.15, 1.15, 1.15, 1],
              }
            : mood === 'excited'
              ? { y: [0, -10, 0, -10, 0], scale: [1, 1.08, 1, 1.08, 1] }
              : bouncing
                ? { y: [0, -8, 0] }
                : { y: [0, -4, 0] }
        }
        transition={
          mood === 'celebrating' || mood === 'excited'
            ? { duration: 0.5, repeat: 2 }
            : bouncing
              ? { duration: 0.4 }
              : { duration: 3, repeat: Infinity, ease: 'easeInOut' }
        }
        className="relative cursor-pointer select-none"
        style={{
          pointerEvents: 'auto',
          filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.12))',
        }}
      >
        {/* Accessory */}
        {accessory && (
          <div className="absolute -top-6 left-1/2 z-10 -translate-x-1/2 text-xl select-none">
            {accessory}
          </div>
        )}

        {/* Body */}
        <div
          className="relative flex flex-col items-center justify-center rounded-full"
          style={{
            width: 70,
            height: 70,
            backgroundColor: petColor,
            boxShadow: `0 0 0 3px white, 0 4px 20px ${petColor}88`,
          }}
        >
          {/* Ears */}
          <div
            className="absolute -top-3 left-2.5 h-5 w-5 rounded-full"
            style={{ backgroundColor: petColor, boxShadow: '0 0 0 2px white' }}
          />
          <div
            className="absolute -top-3 right-2.5 h-5 w-5 rounded-full"
            style={{ backgroundColor: petColor, boxShadow: '0 0 0 2px white' }}
          />
          <div className="absolute -top-2 left-3.5 h-2.5 w-2.5 rounded-full bg-pink-200" />
          <div className="absolute -top-2 right-3.5 h-2.5 w-2.5 rounded-full bg-pink-200" />

          {/* Eyes */}
          <div className="mb-0.5 flex gap-3">
            <motion.div
              animate={blinking ? { scaleY: 0.1 } : { scaleY: 1 }}
              transition={{ duration: 0.08 }}
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: '#3d2b1f' }}
            />
            <motion.div
              animate={blinking ? { scaleY: 0.1 } : { scaleY: 1 }}
              transition={{ duration: 0.08 }}
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: '#3d2b1f' }}
            />
          </div>

          {/* Nose */}
          <div className="mb-0.5 h-0.5 w-1 rounded-full bg-pink-400" />

          {/* Mouth */}
          <div
            className="text-[8px] leading-none font-bold"
            style={{ color: '#5a3e36' }}
          >
            {mood === 'sleepy'
              ? '~_~'
              : mood === 'hungry'
                ? '>o<'
                : mood === 'excited' || mood === 'celebrating'
                  ? 'owo'
                  : 'uwu'}
          </div>

          {/* Cheeks */}
          <div className="absolute bottom-4 left-1 h-2 w-3.5 rounded-full bg-pink-300 opacity-40" />
          <div className="absolute right-1 bottom-4 h-2 w-3.5 rounded-full bg-pink-300 opacity-40" />

          {/* Sparkles */}
          <AnimatePresence>
            {(mood === 'excited' || mood === 'celebrating') && (
              <>
                {['✨', '💕', '⭐', '🌟'].map((s, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1.2, 0],
                      x: (i % 2 === 0 ? -1 : 1) * (20 + i * 8),
                      y: -25 - i * 8,
                    }}
                    transition={{ duration: 0.8, delay: i * 0.12, repeat: 2 }}
                    className="pointer-events-none absolute text-xs"
                    style={{ left: '50%', top: '40%' }}
                  >
                    {s}
                  </motion.span>
                ))}
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Level badge */}
        <div
          className="absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold text-white"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          {level}
        </div>
      </motion.div>

      {/* Mood pill */}
      <div
        className="flex items-center gap-1 rounded-full border border-stone-100 bg-white/80 px-2 py-0.5 shadow-sm backdrop-blur-sm dark:border-stone-700 dark:bg-(--surface-card)/80"
        style={{ pointerEvents: 'none' }}
      >
        <div
          className="h-1.5 w-1.5 rounded-full"
          style={{
            backgroundColor:
              mood === 'celebrating'
                ? '#f59e0b'
                : mood === 'excited'
                  ? '#ec4899'
                  : mood === 'sleepy'
                    ? '#6366f1'
                    : mood === 'hungry'
                      ? '#f97316'
                      : mood === 'happy'
                        ? '#10b981'
                        : '#a78bfa',
          }}
        />
        <p className="text-[9px] font-medium text-(--text-muted) capitalize">
          {mood}
        </p>
      </div>
    </div>
  )
}
