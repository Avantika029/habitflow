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

          const getIcon = (code: number) => {
            if (code === 0) return '☀️'
            if (code <= 3) return '⛅'
            if (code <= 49) return '🌫️'
            if (code <= 69) return '🌧️'
            if (code <= 79) return '🌨️'
            if (code <= 99) return '⛈️'
            return '🌤️'
          }

          const getDesc = (code: number) => {
            if (code === 0) return 'Clear sky'
            if (code <= 3) return 'Partly cloudy'
            if (code <= 49) return 'Foggy'
            if (code <= 69) return 'Rainy'
            if (code <= 79) return 'Snowy'
            if (code <= 99) return 'Thunderstorm'
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
      <div className="animate-pulse rounded-2xl border border-stone-100 bg-white p-4 dark:border-stone-800 dark:bg-(--surface-card)">
        <div className="mb-3 h-4 w-20 rounded bg-(--surface-hover)" />
        <div className="mb-2 h-8 w-24 rounded bg-(--surface-hover)" />
        <div className="h-3 w-32 rounded bg-(--surface-hover)" />
      </div>
    )
  }

  if (error || !weather) {
    return (
      <div className="rounded-2xl border border-stone-100 bg-white p-4 dark:border-stone-800 dark:bg-(--surface-card)">
        <p className="text-xs text-(--text-muted)">Weather</p>
        <p className="mt-1 text-sm text-(--text-secondary)">
          Enable location to see weather
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-stone-100 bg-white p-4 dark:border-stone-800 dark:bg-(--surface-card)">
      <div className="mb-2 flex items-start justify-between">
        <p className="text-xs font-medium text-orange-600 dark:text-orange-400">
          Weather
        </p>
        <span className="text-2xl">{weather.icon}</span>
      </div>
      <p className="mb-1 text-3xl font-bold text-(--text-primary)">
        {weather.temp}°C
      </p>
      <p className="mb-3 text-xs text-(--text-secondary)">
        {weather.description}
      </p>
      <div className="flex gap-3 text-xs text-(--text-muted)">
        <span>💨 {weather.wind} km/h</span>
        <span>💧 {weather.humidity}%</span>
      </div>
    </div>
  )
}
