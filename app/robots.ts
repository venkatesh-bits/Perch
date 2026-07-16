import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // The contribute wizard is interactive-only; no value to index.
      // /admin is the owner's panel - keep it out of search entirely. It also
      // sends noindex response headers (app/admin/layout.tsx) and never appears
      // in sitemap.ts, which lists its routes explicitly.
      disallow: ['/contribute', '/admin'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
