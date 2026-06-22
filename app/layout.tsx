import type { Metadata } from 'next'
import { Geist, Instrument_Serif } from 'next/font/google'
import Link from 'next/link'
import { PerchMark } from '@/components/brand/logo'
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from '@/lib/site'
import './globals.css'

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
})

const instrument = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-display',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Perch - Work from anywhere. Worry about nothing.',
    template: '%s | Perch',
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    'remote work South India', 'hill stations', 'workation', 'digital nomad India',
    'WiFi hill stations', 'EV charging South India', 'Ooty', 'Munnar', 'Coorg', 'road trip',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: 'Perch - Work from anywhere. Worry about nothing.',
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Perch - Work from anywhere. Worry about nothing.',
    description: SITE_DESCRIPTION,
  },
  robots: { index: true, follow: true },
}

const NAV = [
  { href: '/destinations', label: 'Destinations' },
  { href: '/stays',        label: 'Stays' },
  { href: '/journeys',     label: 'Journeys' },
  { href: '/charging',     label: 'EV Charging' },
]

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${instrument.variable}`}>
      <body className="min-h-screen antialiased">
          <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--paper)]/85 backdrop-blur-md">
            <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
              <Link href="/" className="flex items-center gap-2 group">
                <PerchMark className="h-7 w-7 transition-transform group-hover:-translate-y-0.5" />
                <span className="font-display text-2xl font-semibold tracking-tight text-[var(--brand)]">
                  perch
                </span>
              </Link>

              <div className="flex items-center gap-1 sm:gap-2">
                {NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="hidden rounded-lg px-3 py-2 text-sm font-medium text-[var(--ink-soft)] transition-colors hover:bg-[var(--paper-deep)] hover:text-[var(--ink)] sm:block"
                  >
                    {item.label}
                  </Link>
                ))}
                <Link href="/contribute" className="btn-primary ml-1 text-sm">
                  Add trip report
                </Link>
              </div>
            </nav>
          </header>

          <main>{children}</main>

          <footer className="mt-20 border-t border-[var(--line)] bg-[var(--surface)]">
            <div className="mx-auto max-w-6xl px-5 py-14">
              <div className="grid gap-10 sm:grid-cols-[1.4fr_1fr_1fr]">
                <div>
                  <Link href="/" className="flex items-center gap-2">
                    <PerchMark className="h-7 w-7" />
                    <span className="font-display text-2xl font-semibold text-[var(--brand)]">perch</span>
                  </Link>
                  <p className="mt-3 max-w-xs text-sm leading-relaxed text-[var(--ink-soft)]">
                    Work from anywhere. Worry about nothing. Community-verified data for remote
                    workers and road trippers across South India.
                  </p>
                </div>
                <div className="space-y-2.5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">Explore</p>
                  <div className="space-y-1.5 text-sm text-[var(--ink-soft)]">
                    <Link href="/destinations" className="block transition-colors hover:text-[var(--ink)]">Destinations</Link>
                    <Link href="/stays"        className="block transition-colors hover:text-[var(--ink)]">Stays</Link>
                    <Link href="/journeys"     className="block transition-colors hover:text-[var(--ink)]">Journey guides</Link>
                    <Link href="/charging"     className="block transition-colors hover:text-[var(--ink)]">EV charging map</Link>
                    <Link href="/contribute"   className="block transition-colors hover:text-[var(--ink)]">Contribute data</Link>
                  </div>
                </div>
                <div className="space-y-2.5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">About</p>
                  <p className="text-sm leading-relaxed text-[var(--ink-soft)]">
                    Community-built and independent. Not affiliated with any accommodation or
                    transport provider. Data contributed by real travellers.
                  </p>
                </div>
              </div>
              <div className="mt-12 border-t border-[var(--line)] pt-6 text-xs text-[var(--ink-soft)]">
                © {new Date().getFullYear()} Perch · Made for the South Indian hills
              </div>
            </div>
          </footer>
      </body>
    </html>
  )
}
