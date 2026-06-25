import { weatherInfo, type CurrentWeather } from '@/lib/queries/weather'

/**
 * Compact live-weather pill for destination cards/previews. Pure presentational
 * (data passed in), so it renders in both server and client card grids. Renders
 * nothing when weather is unavailable, so cards never show an empty slot.
 */
export function WeatherChip({
  weather,
  className = '',
}: {
  weather?: CurrentWeather
  className?: string
}) {
  if (!weather) return null
  const info = weatherInfo(weather.code)
  return (
    <span
      title={`${info.label} · ${weather.tempC}°C now`}
      className={`inline-flex items-center gap-1 rounded-full bg-black/35 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm ${className}`}
    >
      <span aria-hidden>{info.icon}</span>
      {weather.tempC}°
    </span>
  )
}
