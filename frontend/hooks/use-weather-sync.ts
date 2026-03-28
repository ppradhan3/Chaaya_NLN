import { useState, useEffect } from 'react'

export interface WeatherData {
  temperature: number
  description: string
  uvIndex: number
  sunlightHours: number
  barometricPressure: number
  isLowSunlight: boolean
  city: string
}

export function useWeatherSync() {
  const [weather, setWeather]       = useState<WeatherData | undefined>()
  const [isSolarMode, setIsSolarMode] = useState(false)

  useEffect(() => {
    const hour = new Date().getHours()
    setIsSolarMode(hour >= 6 && hour <= 18)

    const key = process.env.NEXT_PUBLIC_OPENWEATHER_KEY || ''
    if (!key) {
      setWeather({
        temperature:       68,
        description:       'Clear skies',
        uvIndex:           4,
        sunlightHours:     8,
        barometricPressure:1013,
        isLowSunlight:     false,
        city:              'Your location'
      })
      return
    }

    fetch(`https://api.openweathermap.org/data/2.5/weather?q=New York&appid=${key}&units=imperial`)
      .then(r => r.json())
      .then(d => {
        setWeather({
          temperature:       Math.round(d.main?.temp || 68),
          description:       d.weather?.[0]?.description || 'Clear',
          uvIndex:           4,
          sunlightHours:     8,
          barometricPressure:d.main?.pressure || 1013,
          isLowSunlight:     (d.main?.temp || 68) < 45,
          city:              d.name || 'Your location'
        })
      })
      .catch(() => {
        setWeather({
          temperature:       68,
          description:       'Clear skies',
          uvIndex:           4,
          sunlightHours:     8,
          barometricPressure:1013,
          isLowSunlight:     false,
          city:              'Your location'
        })
      })
  }, [])

  return { weather, isSolarMode }
}
