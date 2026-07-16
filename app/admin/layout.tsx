import type { Metadata } from 'next'

/**
 * Wraps BOTH the login page and the panel, so the whole /admin tree is
 * noindex/nofollow. robots.ts also disallows /admin, and app/sitemap.ts lists
 * its routes explicitly so nothing here can leak into the sitemap.
 *
 * Deliberately does NOT check auth: /admin/login lives under here too, and a
 * layout that redirected non-admins would bounce the login page in a loop.
 * Layouts also do not re-render on every navigation, so they are the wrong
 * place to enforce access. Each page calls requireAdmin() itself.
 */
export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false, nocache: true },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
