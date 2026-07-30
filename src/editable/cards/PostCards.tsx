import Link from 'next/link'
import { ArrowRight, Clock3, FileText } from 'lucide-react'
import type { SitePost } from '@/lib/site-connector'
import type { TaskKey } from '@/lib/site-config'
import { editableDesignContract as dc } from '@/editable/layouts/design-contract'

export function dedupeUrls(urls: Array<string | null | undefined>): string[] {
  return Array.from(
    new Set(
      urls
        .map((url) => (typeof url === 'string' ? url.trim() : ''))
        .filter((url) => url.length > 0),
    ),
  )
}

export function getEditablePostImage(post?: SitePost | null) {
  const media = Array.isArray(post?.media) ? post?.media : []
  const mediaUrl = media.find((item) => typeof item?.url === 'string' && item.url)?.url
  const content = post?.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
  const images = Array.isArray(content.images) ? content.images : []
  const contentImage = images.find((url): url is string => typeof url === 'string' && Boolean(url))
  const logo = typeof content.logo === 'string' ? content.logo : ''
  return mediaUrl || contentImage || logo || '/placeholder.svg?height=900&width=1400'
}

export function toPlainText(value: unknown): string {
  if (typeof value !== 'string') return ''
  return value
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;|&apos;/gi, "'")
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function getEditableExcerpt(post?: SitePost | null, limit = 150) {
  const content = post?.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
  const raw =
    (typeof content.description === 'string' && content.description) ||
    (typeof content.summary === 'string' && content.summary) ||
    (typeof post?.summary === 'string' && post.summary) ||
    (typeof content.body === 'string' && content.body) ||
    (typeof content.excerpt === 'string' && content.excerpt) ||
    ''
  const clean = toPlainText(raw)
  return clean.length > limit ? `${clean.slice(0, limit).trim()}...` : clean
}

export function getEditableCategory(post?: SitePost | null) {
  const content = post?.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
  return (typeof content.category === 'string' && content.category) || post?.tags?.[0] || 'Featured'
}

export function postHref(task: TaskKey, post: SitePost, route = `/${task}`) {
  return `${route}/${post.slug}`
}

export function EditorialFeatureCard({ post, href, label = 'Featured place' }: { post: SitePost; href: string; label?: string }) {
  return (
    <Link href={href} className={`group block min-w-0 overflow-hidden ${dc.surface.dark}`}>
      <div className="relative min-h-[520px] p-5 sm:p-7 lg:min-h-[610px]">
        <img src={getEditablePostImage(post)} alt={post.title} className={`absolute inset-0 h-full w-full object-cover opacity-70 ${dc.motion.zoom}`} />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(40,47,72,0.05),rgba(40,47,72,0.86))]" />
        <div className="relative z-10 flex min-h-[470px] flex-col justify-between lg:min-h-[560px]">
          <span className="editable-label w-fit rounded-[200px] bg-white px-4 py-2 text-[10px] text-[var(--slot4-accent)]">{label}</span>
          <div>
            <h3 className="editable-display max-w-3xl text-5xl font-medium leading-none text-white sm:text-6xl">{post.title}</h3>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/76">{getEditableExcerpt(post, 185)}</p>
            <span className="mt-7 inline-flex items-center gap-2 rounded-[200px] bg-white px-5 py-3 text-sm font-bold text-[var(--slot4-page-text)]">
              Open record <ArrowRight className={dc.motion.arrow} />
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export function RailPostCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  return (
    <Link href={href} className={`group block ${dc.layout.minRailCard} ${dc.surface.card} p-5`}>
      <div className="flex items-start justify-between gap-4">
        <span className="editable-display text-6xl leading-none text-[var(--slot4-accent)]">{String(index + 1).padStart(2, '0')}</span>
        <span className={dc.badge.metaChip}>Guide</span>
      </div>
      <div className="mt-8 flex h-36 items-center justify-center rounded-[28px] bg-[var(--slot4-pastel-blue)] text-[var(--slot4-page-text)]">
        <FileText className="h-12 w-12 opacity-70" />
      </div>
      <p className="editable-label mt-5 text-[10px] text-[var(--slot4-accent)]">{getEditableCategory(post)}</p>
      <h3 className="editable-display mt-2 line-clamp-3 text-3xl font-medium leading-none text-[var(--slot4-page-text)]">{post.title}</h3>
      <p className="mt-4 line-clamp-3 text-sm leading-6 text-[var(--slot4-muted-text)]">{getEditableExcerpt(post, 125)}</p>
      <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[var(--slot4-page-text)]">
        Open guide <ArrowRight className={dc.motion.arrow} />
      </span>
    </Link>
  )
}

export function CompactIndexCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  return (
    <Link href={href} className="group grid grid-cols-[54px_minmax(0,1fr)_auto] items-start gap-4 border-t border-[var(--editable-border)] py-5">
      <span className="editable-display text-3xl leading-none text-[var(--slot4-accent)]">{String(index + 1).padStart(2, '0')}</span>
      <span className="min-w-0">
        <span className="editable-label text-[10px] text-[var(--slot4-muted-text)]">{getEditableCategory(post)}</span>
        <span className="editable-display mt-1 block line-clamp-2 text-2xl font-medium leading-[1.05] text-[var(--slot4-page-text)]">{post.title}</span>
        <span className="mt-2 block line-clamp-2 text-sm leading-6 text-[var(--slot4-muted-text)]">{getEditableExcerpt(post, 110)}</span>
      </span>
      <ArrowRight className={`mt-2 h-4 w-4 text-[var(--slot4-accent)] ${dc.motion.arrow}`} />
    </Link>
  )
}

export function ArticleListCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  return (
    <Link href={href} className={`group grid min-w-0 gap-5 border-t border-[var(--editable-border)] py-6 sm:grid-cols-[220px_minmax(0,1fr)]`}>
      <div className={`${dc.media.frame} aspect-[4/3] sm:aspect-auto sm:min-h-[170px]`}>
        <img src={getEditablePostImage(post)} alt={post.title} className={`absolute inset-0 h-full w-full object-cover ${dc.motion.zoom}`} />
      </div>
      <div className="min-w-0">
        <p className="editable-label text-[10px] text-[var(--slot4-accent)]"><Clock3 className="mr-2 inline h-3.5 w-3.5" /> Latest {String(index + 1).padStart(2, '0')}</p>
        <h2 className="editable-display mt-2 line-clamp-2 text-4xl font-medium leading-none text-[var(--slot4-page-text)]">{post.title}</h2>
        <p className="mt-4 line-clamp-3 text-base leading-7 text-[var(--slot4-muted-text)]">{getEditableExcerpt(post, 180)}</p>
        <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[var(--slot4-page-text)]">
          Read more <ArrowRight className={dc.motion.arrow} />
        </span>
      </div>
    </Link>
  )
}
