'use client'

import { useEffect, useState } from 'react'

interface WeatherData {
  temp: number
  description: string
  humidity: number
  wind: number
  icon: string
}

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords
          const res = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`
          )
          const data = await res.json()
          const code = data.current.weather_code

          const getIcon = (c: number) => {
            if (c === 0) return '☀️'
            if (c <= 3) return '⛅'
            if (c <= 49) return '🌫️'
            if (c <= 69) return '🌧️'
            if (c <= 79) return '🌨️'
            if (c <= 99) return '⛈️'
            return '🌤️'
          }

          const getDesc = (c: number) => {
            if (c === 0) return 'Clear sky'
            if (c <= 3) return 'Partly cloudy'
            if (c <= 49) return 'Foggy'
            if (c <= 69) return 'Rainy'
            if (c <= 79) return 'Snowy'
            if (c <= 99) return 'Thunderstorm'
            return 'Mixed'
          }

          setWeather({
            temp: Math.round(data.current.temperature_2m),
            description: getDesc(code),
            humidity: data.current.relative_humidity_2m,
            wind: Math.round(data.current.wind_speed_10m),
            icon: getIcon(code),
          })
        } catch {
          setError(true)
        } finally {
          setLoading(false)
        }
      },
      () => {
        setError(true)
        setLoading(false)
      }
    )
  }, [])

  if (loading) {
    return (
      <div className="h-full animate-pulse rounded-2xl border border-stone-100 bg-white px-3 py-2 dark:border-stone-800 dark:bg-(--surface-card)">
        <div className="mb-2 h-3 w-16 rounded bg-(--surface-hover)" />
        <div className="h-5 w-12 rounded bg-(--surface-hover)" />
      </div>
    )
  }

  if (error || !weather) {
    return (
      <div className="flex h-full items-center rounded-2xl border border-stone-100 bg-white px-3 py-2 dark:border-stone-800 dark:bg-(--surface-card)">
        <p className="text-xs text-(--text-muted)">
          Enable location for weather
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-full items-center gap-3 rounded-2xl border border-stone-100 bg-white px-3 py-2 dark:border-stone-800 dark:bg-(--surface-card)">
      <span className="shrink-0 text-2xl">{weather.icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-lg leading-none font-bold text-(--text-primary)">
          {weather.temp}°C
        </p>
        <p className="text-[10px] text-(--text-muted)">{weather.description}</p>
      </div>
      <div className="shrink-0 text-right text-[10px] text-(--text-muted)">
        <p>💨 {weather.wind}</p>
        <p>💧 {weather.humidity}%</p>
      </div>
    </div>
  )
}
