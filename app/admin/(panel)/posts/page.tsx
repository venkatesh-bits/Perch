import { requireAdmin } from '@/lib/supabase/admin-guard'
import { getAllPosts } from '@/lib/queries/admin'
import { PostsManager } from '@/components/admin/posts-manager'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Posts' }

export default async function AdminPostsPage() {
  await requireAdmin()

  const posts = await getAllPosts()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl tracking-tight text-[var(--ink)]">Posts</h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[var(--ink-soft)]">
          Drafts are enforced in the database, not just hidden in the UI: the read policy on{' '}
          <code>posts</code> only exposes published rows to the public, so an unpublished post is
          invisible to anyone but you.
        </p>
      </div>

      <PostsManager posts={posts} />
    </div>
  )
}
