import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight, ArrowUpRight, Bookmark, Camera, CheckCircle2, Clock3, Download, ExternalLink, FileText, Globe2, Mail, MapPin, Phone, Star, UserRound } from 'lucide-react'
import { buildPostMetadata, buildTaskMetadata } from '@/lib/seo'
import { fetchArticleComments, fetchTaskPostBySlug, fetchTaskPosts } from '@/lib/task-data'
import { dedupeUrls } from '@/editable/cards/PostCards'
import { getTaskConfig, SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import type { SitePost } from '@/lib/site-connector'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableArticleComments } from '@/editable/components/EditableArticleComments'
import { getTaskTheme, taskThemeStyle } from '@/editable/theme/task-themes'
import { Ads } from '@/lib/ads'
import { getSlotSizes } from '@/lib/ads/ad-slots'

export const revalidate = 3

export async function generateEditableDetailMetadata(task: TaskKey, params: Promise<{ slug?: string; username?: string }>) {
  const resolved = await params
  const slug = resolved.slug || resolved.username || ''
  const post = await fetchTaskPostBySlug(task, slug)
  return post ? await buildPostMetadata(task, post) : await buildTaskMetadata(task)
}

export async function EditableTaskDetailRoute({ task, params }: { task: TaskKey; params: Promise<{ slug?: string; username?: string }> }) {
  const resolved = await params
  const slug = resolved.slug || resolved.username || ''
  const post = await fetchTaskPostBySlug(task, slug)
  if (!post) notFound()
  const related = (await fetchTaskPosts(task, 7)).filter((item) => item.slug !== post.slug).slice(0, 4)
  const comments = task === 'article' ? await fetchArticleComments(post.slug, 50) : []
  return <TaskDetailView task={task} post={post} related={related} comments={comments} />
}

const getContent = (post: SitePost) => post.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
const asText = (value: unknown) => typeof value === 'string' ? value.trim() : ''
const isUrl = (value: string) => value.startsWith('/') || /^https?:\/\//i.test(value)

const getField = (post: SitePost, keys: string[]) => {
  const content = getContent(post)
  for (const key of keys) {
    const value = asText(content[key])
    if (value) return value
  }
  return ''
}

const getImages = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media) ? post.media.map((item) => item?.url).filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const images = Array.isArray(content.images) ? content.images.filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const singleImages = ['image', 'featuredImage', 'thumbnail', 'logo', 'avatar'].map((key) => asText(content[key])).filter((url) => url && isUrl(url))
  // De-duplicate: the API ships the same asset in several of these fields, so a
  // plain concat renders one picture as a gallery of identical copies (and, on
  // profiles, the logo repeated down the page).
  return dedupeUrls([...media, ...images, ...singleImages]).slice(0, 12)
}

const getBody = (post: SitePost) => {
  const content = getContent(post)
  return asText(content.body) || asText(content.description) || asText(content.details) || post.summary || 'Details will appear here once available.'
}

const escapeHtml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;')

const safeUrl = (value: string) => /^https?:\/\//i.test(value) ? value : '#'

const linkifyMarkdown = (value: string) => value
  .replace(/\[([^\]]+)]\((https?:\/\/[^\s)]+)\)/gi, (_match, label, url) => `<a href="${safeUrl(url)}" target="_blank" rel="nofollow noopener noreferrer">${label}</a>`)

const linkifyText = (value: string) => linkifyMarkdown(value)
  .replace(/(^|[\s(>])((https?:\/\/)[^\s<)]+)/gi, (_match, prefix, url) => `${prefix}<a href="${safeUrl(url)}" target="_blank" rel="nofollow noopener noreferrer">${url}</a>`)

const hardenLinks = (html: string) => html.replace(/<a\s+([^>]*href=["'][^"']+["'][^>]*)>/gi, (_match, attrs) => {
  let next = String(attrs).replace(/\s+on\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
  if (!/\starget=/i.test(next)) next += ' target="_blank"'
  if (!/\srel=/i.test(next)) next += ' rel="nofollow noopener noreferrer"'
  return `<a ${next}>`
})

const sanitizeHtml = (html: string) => hardenLinks(html
  .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
  .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
  .replace(/<(iframe|object|embed)[^>]*>[\s\S]*?<\/\1>/gi, '')
  .replace(/\s+on\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
  .replace(/(href|src)=(['"])javascript:[\s\S]*?\2/gi, '$1="#"'))

const formatPlainText = (raw: string) => {
  const value = raw.trim()
  if (!value) return ''
  if (/<[a-z][\s\S]*>/i.test(value)) return sanitizeHtml(linkifyMarkdown(value))
  return value
    .split(/\n{2,}/)
    .map((part) => `<p>${linkifyText(escapeHtml(part).replace(/\n/g, '<br />'))}</p>`)
    .join('')
}

const summaryText = (post: SitePost) => post.summary || asText(getContent(post).description) || asText(getContent(post).excerpt) || ''
const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
// Compare on letters/digits only, so punctuation, casing or a stray keyword
// paragraph appended by the generator cannot defeat the duplicate check.
const comparable = (value: string) => stripHtml(value).toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim()
// Plain-text lead intro, but only when it isn't already part of the body. The
// API commonly returns identical text in `description` and `body`; rendering
// both is what showed the summary twice on listing and profile pages.
const leadText = (post: SitePost) => {
  const summary = summaryText(post)
  if (!summary) return ''
  const lead = stripHtml(summary)
  if (!lead) return ''
  const leadKey = comparable(lead)
  return leadKey && comparable(getBody(post)).includes(leadKey) ? '' : lead
}
const categoryOf = (post: SitePost, fallback: string) => asText(getContent(post).category) || post.tags?.[0] || fallback
const mapSrcFor = (post: SitePost) => {
  const address = getField(post, ['address', 'location', 'city'])
  const lat = getField(post, ['lat', 'latitude'])
  const lng = getField(post, ['lng', 'lon', 'longitude'])
  if (lat && lng) return `https://maps.google.com/maps?q=${encodeURIComponent(`${lat},${lng}`)}&z=14&output=embed`
  if (address) return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=13&output=embed`
  return ''
}
const pickRandom = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)] || items[0]
const displayTaskLabel = (task: TaskKey, fallback: string) => task === 'listing' ? 'Places' : task === 'pdf' ? 'Guides' : fallback

export function TaskDetailView({ task, post, related, comments = [] }: { task: TaskKey; post: SitePost; related: SitePost[]; comments?: Array<{ id: string; name: string; comment: string; createdAt: string }> }) {
  return (
    <EditableSiteShell>
      <main style={taskThemeStyle(task)} className="min-h-screen bg-[var(--tk-bg)] text-[var(--tk-text)]">
        {task === 'listing' ? <ListingDetail post={post} related={related} /> : null}
        {task === 'classified' ? <ClassifiedDetail post={post} related={related} /> : null}
        {task === 'image' ? <ImageDetail post={post} related={related} /> : null}
        {task === 'sbm' ? <BookmarkDetail post={post} related={related} /> : null}
        {task === 'pdf' ? <PdfDetail post={post} related={related} /> : null}
        {task === 'profile' ? <ProfileDetail post={post} related={related} /> : null}
        {task === 'article' ? <ArticleDetail post={post} related={related} comments={comments} /> : null}
      </main>
    </EditableSiteShell>
  )
}

// Yelp-style red star rating row. Uses real rating/review fields when present,
// otherwise a stable derived value (wire to real data when available).
const hashStr = (value: string) => {
  let h = 0
  for (let i = 0; i < value.length; i += 1) h = (h * 31 + value.charCodeAt(i)) >>> 0
  return h
}
const ratingOf = (post: SitePost) => {
  const real = Number(getContent(post).rating)
  if (real >= 1 && real <= 5) return Math.round(real * 10) / 10
  return Math.round((3.7 + (hashStr(post.slug || post.id || post.title || 'x') % 13) / 10) * 10) / 10
}
const reviewsOf = (post: SitePost) => {
  const real = Number(getContent(post).reviewCount ?? getContent(post).reviews)
  if (real > 0) return Math.floor(real)
  return 6 + (hashStr((post.slug || post.title || 'x') + 'r') % 480)
}

function DetailMeta({ post, category, center = false }: { post: SitePost; category?: string; center?: boolean }) {
  const rating = ratingOf(post)
  const filled = Math.round(rating)
  return (
    <div className={`mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 ${center ? 'justify-center' : ''}`}>
      <span className="inline-flex items-center gap-[3px]">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} className={`h-[18px] w-[18px] ${i < filled ? 'fill-[var(--tk-accent)] text-[var(--tk-accent)]' : 'fill-[var(--tk-line)] text-[var(--tk-line)]'}`} />
        ))}
      </span>
      <span className="text-sm font-semibold text-[var(--tk-text)]">{rating.toFixed(1)}</span>
      <span className="text-sm text-[var(--tk-muted)]">{reviewsOf(post)} reviews</span>
      {category ? (
        <>
          <span className="h-1 w-1 rounded-full bg-[var(--tk-muted)] opacity-50" />
          <span className="text-sm text-[var(--tk-muted)]">{category}</span>
        </>
      ) : null}
    </div>
  )
}

function Kicker({ task, children }: { task: TaskKey; children: React.ReactNode }) {
  const theme = getTaskTheme(task)
  return (
    <div className="flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.3em] text-[var(--tk-accent)]">
      <span>{theme.kicker}</span>
      <span className="h-1 w-1 rounded-full bg-[var(--tk-accent)] opacity-50" />
      <span className="text-[var(--tk-muted)]">{children}</span>
    </div>
  )
}

function BackLink({ task }: { task: TaskKey }) {
  const taskConfig = getTaskConfig(task)
  return (
    <Link href={taskConfig?.route || '/'} className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--tk-muted)] transition hover:text-[var(--tk-text)]">
      <ArrowLeft className="h-4 w-4" /> Back to {displayTaskLabel(task, taskConfig?.label || 'posts')}
    </Link>
  )
}

// ----- Article: a quiet, centred reading column -----
function ArticleDetail({ post, related, comments }: { post: SitePost; related: SitePost[]; comments: Array<{ id: string; name: string; comment: string; createdAt: string }> }) {
  const images = getImages(post)
  return (
    <>
      <article className="mx-auto max-w-4xl px-6 py-14 sm:py-20">
        <BackLink task="article" />
        <p className="mt-10 text-xs font-medium uppercase tracking-[0.28em] text-[var(--tk-accent)]">{categoryOf(post, 'Article')}</p>
        <h1 className="editable-display mt-5 text-balance text-4xl font-semibold leading-[1.06] tracking-[-0.03em] sm:text-5xl lg:text-[3.4rem]">{post.title}</h1>
        <div className="mt-6 text-sm text-[var(--tk-muted)]">
          <span>{SITE_CONFIG.name}</span>
        </div>
        {images[0] ? <img src={images[0]} alt="" className="mt-10 aspect-[16/9] w-full rounded-[var(--tk-radius)] border border-[var(--tk-line)] object-cover" /> : null}
        <BodyContent post={post} />
        <EditableArticleComments slug={post.slug} comments={comments} />
      </article>
      <RelatedStrip task="article" related={related} />
    </>
  )
}

// ----- Listing: a precise directory record -----
function ListingDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const hero = images[0]
  const address = getField(post, ['address', 'location', 'city'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const email = getField(post, ['email'])
  const website = getField(post, ['website', 'url'])
  const hours = getField(post, ['hours', 'openingHours', 'availability'])
  const category = categoryOf(post, 'Place')
  const mapSrc = mapSrcFor(post)
  return (
    <>
      <section className="mx-auto max-w-[var(--editable-container)] px-6 py-12 sm:py-16 lg:px-8">
        <BackLink task="listing" />
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-start">
          <article className="min-w-0">
            <div className="relative overflow-hidden rounded-[var(--tk-radius)] bg-[var(--tk-text)] text-white">
              <div className="relative aspect-[16/10] min-h-[440px]">
                {hero ? <img src={hero} alt="" className="absolute inset-0 h-full w-full object-cover opacity-72" /> : <div className="absolute inset-0 bg-[var(--tk-raised)]" />}
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(40,47,72,0.08),rgba(40,47,72,0.88))]" />
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-white px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--tk-accent)]">Place record</span>
                    <span className="rounded-full border border-white/30 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-white/76">{category}</span>
                  </div>
                  <h1 className="editable-display mt-5 max-w-4xl text-5xl font-medium leading-none sm:text-7xl">{post.title}</h1>
                  {leadText(post) ? <p className="mt-5 max-w-2xl text-base leading-8 text-white/78">{leadText(post)}</p> : null}
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <FactPill icon={MapPin} label="Location" value={address || 'Listed'} />
              <FactPill icon={Phone} label="Phone" value={phone || 'Check details'} />
              <FactPill icon={CheckCircle2} label="Status" value="Reviewed" />
              <FactPill icon={Globe2} label="Hours" value={hours || 'See contact'} />
            </div>

            <section className="mt-12 grid gap-8 lg:grid-cols-[.42fr_1fr]">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--tk-accent)]">About this place</p>
                <h2 className="editable-display mt-3 text-4xl font-medium leading-none">Useful details before the next step.</h2>
              </div>
              <div>
                <BodyContent post={post} />
                {post.tags?.length ? (
                  <div className="mt-8 flex flex-wrap gap-2">
                    {post.tags.map((tag) => <span key={tag} className="rounded-full bg-[var(--tk-accent-soft)] px-3.5 py-2 text-xs font-bold text-[var(--tk-accent)]">{tag}</span>)}
                  </div>
                ) : null}
              </div>
            </section>

            <ImageStrip images={images.slice(1)} label="Place gallery" />
            {mapSrc ? <div className="mt-10"><MapBox src={mapSrc} label={address || post.title} /></div> : null}
          </article>

          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6 shadow-[0_24px_70px_rgba(40,47,72,0.10)]">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--tk-accent)]">Contact card</p>
              <h2 className="editable-display mt-3 text-3xl font-medium leading-none">{post.title}</h2>
              <div className="mt-6 grid gap-3">
                <ContactRow icon={MapPin} label="Address" value={address} />
                <ContactRow icon={Phone} label="Phone" value={phone} href={phone ? `tel:${phone}` : undefined} />
                <ContactRow icon={Mail} label="Email" value={email} href={email ? `mailto:${email}` : undefined} />
                <ContactRow icon={Globe2} label="Website" value={website ? website.replace(/^https?:\/\//, '').replace(/\/$/, '') : ''} href={website} external />
                <ContactRow icon={Clock3} label="Hours" value={hours} />
              </div>
              {website ? (
                <Link href={website} target="_blank" rel="noreferrer" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--tk-accent)] px-5 py-3 text-sm font-bold text-[var(--tk-on-accent)] transition hover:bg-[var(--tk-text)]">
                  Visit website <ExternalLink className="h-4 w-4" />
                </Link>
              ) : phone ? (
                <a href={`tel:${phone}`} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--tk-accent)] px-5 py-3 text-sm font-bold text-[var(--tk-on-accent)] transition hover:bg-[var(--tk-text)]">
                  Call place <Phone className="h-4 w-4" />
                </a>
              ) : null}
            </div>

            <div className="rounded-[var(--tk-radius)] bg-[var(--tk-raised)] p-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--tk-accent)]">Trust notes</p>
              <div className="mt-4 grid gap-3 text-sm font-semibold text-[var(--tk-muted)]">
                {['Structured for comparison', 'Contact fields kept visible', 'Category and location surfaced'].map((item) => (
                  <span key={item} className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[var(--tk-accent)]" /> {item}</span>
                ))}
              </div>
            </div>

            <Ads slot="sidebar" size={pickRandom(getSlotSizes('sidebar'))} showLabel />
          </aside>
        </div>
      </section>
      <RelatedStrip task="listing" related={related} />
    </>
  )
}

function FactPill({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) {
  return (
    <div className="rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-4">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--tk-muted)]">
        <Icon className="h-4 w-4 text-[var(--tk-accent)]" /> {label}
      </div>
      <p className="mt-2 line-clamp-2 text-sm font-bold leading-6 text-[var(--tk-text)]">{value}</p>
    </div>
  )
}

function ContactRow({ icon: Icon, label, value, href, external = false }: { icon: typeof MapPin; label: string; value?: string; href?: string; external?: boolean }) {
  if (!value) return null
  const body = (
    <>
      <Icon className="mt-1 h-4 w-4 shrink-0 text-[var(--tk-accent)]" />
      <span className="min-w-0">
        <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--tk-muted)]">{label}</span>
        <span className="mt-1 block break-words text-sm font-bold leading-6 text-[var(--tk-text)]">{value}</span>
      </span>
    </>
  )
  if (href) {
    return <Link href={href} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined} className="grid grid-cols-[20px_minmax(0,1fr)] gap-3 rounded-2xl border border-[var(--tk-line)] p-3 transition hover:border-[var(--tk-accent)]">{body}</Link>
  }
  return <div className="grid grid-cols-[20px_minmax(0,1fr)] gap-3 rounded-2xl border border-[var(--tk-line)] p-3">{body}</div>
}

// ----- Classified: price-forward notice with a sticky action rail -----
function ClassifiedDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const price = getField(post, ['price', 'amount', 'budget'])
  const location = getField(post, ['location', 'address', 'city'])
  const condition = getField(post, ['condition', 'availability', 'type'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const email = getField(post, ['email'])
  const website = getField(post, ['website', 'url'])
  return (
    <>
      <section className="mx-auto grid max-w-[var(--editable-container)] gap-10 px-6 py-14 sm:py-20 lg:grid-cols-[360px_minmax(0,1fr)] lg:px-8">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <BackLink task="classified" />
          <div className="mt-7 rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-7 shadow-[0_22px_60px_rgba(15,23,42,0.08)]">
            <Kicker task="classified">Classified</Kicker>
            <h1 className="editable-display mt-4 text-2xl font-semibold leading-tight tracking-[-0.02em]">{post.title}</h1>
            <DetailMeta post={post} category={getField(post, ['category'])} />
            <p className="editable-display mt-6 text-4xl font-semibold tracking-[-0.03em] text-[var(--tk-accent)]">{price || 'Open offer'}</p>
            <div className="mt-6 space-y-2.5">
              {condition ? <BadgeLine label="Condition" value={condition} /> : null}
              {location ? <BadgeLine label="Location" value={location} /> : null}
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              {phone ? <a href={`tel:${phone}`} className="inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-5 py-2.5 text-sm font-semibold text-[var(--tk-on-accent)] transition hover:opacity-90"><Phone className="h-4 w-4" /> Call now</a> : null}
              {email ? <a href={`mailto:${email}`} className="inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] px-5 py-2.5 text-sm font-semibold transition hover:border-[var(--tk-accent)]"><Mail className="h-4 w-4" /> Email</a> : null}
            </div>
          </div>
        </aside>
        <article className="min-w-0">
          <ImageStrip images={images} label="Offer images" large />
          <BodyContent post={post} />
          <ContactAction website={website} phone={phone} email={email} />
        </article>
      </section>
      <RelatedStrip task="classified" related={related} />
    </>
  )
}

// ----- Image: a dark, gallery-led canvas -----
function ImageDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const gallery = images.length ? images : ['/placeholder.svg?height=900&width=1200']
  return (
    <>
      <section className="mx-auto max-w-[var(--editable-container)] px-6 py-14 sm:py-20 lg:px-8">
        <BackLink task="image" />
        <div className="mt-8 grid gap-10 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="columns-1 gap-5 [column-fill:_balance] sm:columns-2">
            {gallery.map((image, index) => (
              <figure key={`${image}-${index}`} className="mb-5 break-inside-avoid overflow-hidden rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)]">
                <img src={image} alt="" className="w-full object-cover" />
              </figure>
            ))}
          </div>
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] px-3.5 py-1.5 text-xs font-medium text-[var(--tk-muted)]"><Camera className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> Image story</div>
            <h1 className="editable-display mt-6 text-4xl font-semibold leading-[1.05] tracking-[-0.03em] sm:text-5xl">{post.title}</h1>
            {leadText(post) ? <p className="mt-6 text-lg leading-8 text-[var(--tk-muted)]">{leadText(post)}</p> : null}
            <BodyContent post={post} compact />
          </aside>
        </div>
      </section>
      <RelatedStrip task="image" related={related} />
    </>
  )
}

// ----- Bookmark: a single curated resource -----
function BookmarkDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const website = getField(post, ['website', 'url', 'link'])
  return (
    <>
      <article className="mx-auto max-w-3xl px-6 py-14 sm:py-20">
        <BackLink task="sbm" />
        <div className="mt-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]"><Bookmark className="h-7 w-7" /></div>
        <div className="mt-6"><Kicker task="sbm">Saved resource</Kicker></div>
        <h1 className="editable-display mt-4 text-4xl font-semibold leading-[1.05] tracking-[-0.03em] sm:text-5xl">{post.title}</h1>
        {leadText(post) ? <p className="mt-6 text-lg leading-8 text-[var(--tk-muted)]">{leadText(post)}</p> : null}
        {website ? (
          <Link href={website} target="_blank" rel="noreferrer" className="mt-8 inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-5 py-3 text-sm font-semibold text-[var(--tk-on-accent)] transition hover:opacity-90">
            Open resource <ExternalLink className="h-4 w-4" />
          </Link>
        ) : null}
        <BodyContent post={post} />
      </article>
      <RelatedStrip task="sbm" related={related} />
    </>
  )
}

// ----- PDF: a document workspace -----
function PdfDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const fileUrl = getField(post, ['fileUrl', 'pdfUrl', 'documentUrl', 'url'])
  const category = categoryOf(post, 'Guide')
  const pages = getField(post, ['pages', 'pageCount'])
  const fileSize = getField(post, ['fileSize', 'size', 'filesize'])
  const format = guideFormat(getField(post, ['format', 'fileType', 'extension']))
  const uploadedBy = getField(post, ['uploadedBy', 'author', 'publisher']) || post.authorName || SITE_CONFIG.name
  const inside = [
    category ? `${category} overview and context` : 'Overview and context',
    pages ? `${pages} pages of reference material` : 'Reference sections for quick review',
    fileSize ? `${fileSize} downloadable file` : 'Download and open options',
  ]
  return (
    <>
      <section className="mx-auto max-w-[var(--editable-container)] px-6 py-12 sm:py-16 lg:px-8">
        <BackLink task="pdf" />
        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          <article className="min-w-0">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-[var(--tk-accent)] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--tk-on-accent)]">Reference guide</span>
              <span className="rounded-full border border-[var(--tk-line)] bg-white px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--tk-muted)]">{format}</span>
              <span className="rounded-full border border-[var(--tk-line)] bg-white px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--tk-muted)]">{category}</span>
            </div>
            <h1 className="editable-display mt-6 max-w-5xl text-6xl font-medium leading-none sm:text-7xl lg:text-8xl">{post.title}</h1>
            <div className="mt-8 flex flex-wrap gap-3">
              {fileUrl ? <Link href={fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-6 py-3 text-sm font-bold text-[var(--tk-on-accent)] transition hover:bg-[var(--tk-text)]">Download <Download className="h-4 w-4" /></Link> : null}
              {fileUrl ? <Link href={fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] bg-white px-6 py-3 text-sm font-bold text-[var(--tk-text)] transition hover:border-[var(--tk-accent)]">Open in new tab <ExternalLink className="h-4 w-4" /></Link> : null}
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-4">
              <GuideFact label="Pages" value={pages || 'Listed'} />
              <GuideFact label="File size" value={fileSize || 'Available'} />
              <GuideFact label="Format" value={format} />
            </div>

            {fileUrl ? (
              <div className="mt-10 overflow-hidden rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] shadow-[0_28px_80px_rgba(40,47,72,0.12)]">
                <div className="flex items-center justify-between gap-3 border-b border-[var(--tk-line)] p-4">
                  <span className="text-sm font-bold">Guide preview</span>
                  <Link href={fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-4 py-2 text-xs font-bold text-[var(--tk-on-accent)] transition hover:bg-[var(--tk-text)]">Download <Download className="h-4 w-4" /></Link>
                </div>
                <iframe src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0`} title={post.title} className="h-[78vh] min-h-[560px] w-full bg-[var(--tk-raised)]" />
              </div>
            ) : null}

            <section className="mt-12 grid gap-8 lg:grid-cols-[.42fr_1fr]">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--tk-accent)]">Guide notes</p>
                <h2 className="editable-display mt-3 text-5xl font-medium leading-none">What this reference is for.</h2>
              </div>
              <div>
                <BodyContent post={post} />
                {post.tags?.length ? (
                  <div className="mt-8 flex flex-wrap gap-2">
                    {post.tags.map((tag) => <span key={tag} className="rounded-full bg-[var(--tk-accent-soft)] px-3.5 py-2 text-xs font-bold text-[var(--tk-accent)]">{tag}</span>)}
                  </div>
                ) : null}
                {fileUrl ? (
                  <div className="mt-10 rounded-[var(--tk-radius)] bg-[var(--tk-accent)] p-6 text-white">
                    <h3 className="editable-display text-4xl font-medium leading-none">Keep the guide handy.</h3>
                    <p className="mt-3 text-sm leading-6 text-white/78">Download it now or open it in a separate tab for a larger reading view.</p>
                    <Link href={fileUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-[var(--tk-accent)] transition hover:bg-[var(--tk-text)] hover:text-white">Download <Download className="h-4 w-4" /></Link>
                  </div>
                ) : null}
              </div>
            </section>

            <div className="mt-12">
              <Ads slot="article-bottom" size={pickRandom(getSlotSizes('article-bottom'))} showLabel />
            </div>
          </article>

          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6 shadow-[0_24px_70px_rgba(40,47,72,0.10)]">
              <div className="flex aspect-[4/3] items-center justify-center rounded-[24px] bg-[var(--tk-raised)]">
                <span className="editable-display text-8xl leading-none text-[var(--tk-accent)]">G</span>
              </div>
              <p className="mt-5 break-words text-sm font-bold text-[var(--tk-text)]">{getFileName(fileUrl) || post.slug}</p>
              <div className="mt-5 grid gap-3">
                <MetaRow label="Category" value={category} />
                <MetaRow label="Pages" value={pages} />
                <MetaRow label="File size" value={fileSize} />
                <MetaRow label="Uploaded by" value={uploadedBy} />
              </div>
              {fileUrl ? <Link href={fileUrl} target="_blank" rel="noreferrer" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--tk-accent)] px-5 py-3 text-sm font-bold text-[var(--tk-on-accent)] transition hover:bg-[var(--tk-text)]">Download <Download className="h-4 w-4" /></Link> : null}
            </div>

            <div className="rounded-[var(--tk-radius)] bg-[var(--tk-raised)] p-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--tk-accent)]">What's inside</p>
              <ul className="mt-4 grid gap-3 text-sm font-semibold leading-6 text-[var(--tk-muted)]">
                {inside.map((item) => <li key={item} className="flex gap-2"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[var(--tk-accent)]" /> {item}</li>)}
              </ul>
            </div>
          </aside>
        </div>
      </section>
      <GuideRelatedStrip related={related} />
    </>
  )
}

function guideFormat(value: string) {
  return !value || /pdf/i.test(value) ? 'Guide file' : value
}

function getFileName(value: string) {
  if (!value) return ''
  const clean = value.split('?')[0]?.split('#')[0] || ''
  const name = clean.split('/').filter(Boolean).pop() || ''
  return name.replace(/\.pdf$/i, '').replace(/[-_]+/g, ' ')
}

function GuideFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--tk-muted)]">{label}</p>
      <p className="mt-2 line-clamp-2 text-sm font-bold leading-6 text-[var(--tk-text)]">{value}</p>
    </div>
  )
}

function MetaRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null
  return (
    <div className="flex items-start justify-between gap-4 border-t border-[var(--tk-line)] pt-3 text-sm">
      <span className="font-bold text-[var(--tk-muted)]">{label}</span>
      <span className="max-w-[55%] break-words text-right font-bold text-[var(--tk-text)]">{value}</span>
    </div>
  )
}

function GuideRelatedStrip({ related }: { related: SitePost[] }) {
  if (!related.length) return null
  return (
    <section className="border-t border-[var(--tk-line)]">
      <div className="mx-auto max-w-[var(--editable-container)] px-6 py-14 sm:py-16 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--tk-accent)]">Related guides</p>
            <h2 className="editable-display mt-2 text-4xl font-medium leading-none">More references from the shelf.</h2>
          </div>
          <Link href={getTaskConfig('pdf')?.route || '/pdf'} className="hidden items-center gap-2 rounded-full border border-[var(--tk-line)] px-5 py-3 text-sm font-bold transition hover:border-[var(--tk-accent)] sm:inline-flex">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((post) => {
            const href = `${getTaskConfig('pdf')?.route || '/pdf'}/${post.slug}`
            const size = getField(post, ['fileSize', 'size', 'filesize'])
            return (
              <Link key={post.id || post.slug} href={href} className="group rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-5 transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(40,47,72,0.12)]">
                <div className="flex h-28 items-center justify-center rounded-[24px] bg-[var(--tk-raised)]">
                  <span className="editable-display text-5xl leading-none text-[var(--tk-accent)]">G</span>
                </div>
                <h3 className="editable-display mt-4 line-clamp-2 text-2xl font-medium leading-none">{post.title}</h3>
                {size ? <span className="mt-4 inline-flex rounded-full bg-[var(--tk-accent-soft)] px-3 py-1 text-xs font-bold text-[var(--tk-accent)]">{size}</span> : null}
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ----- Profile: identity-first with a sticky portrait -----
function ProfileDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const role = getField(post, ['role', 'designation', 'company', 'location'])
  const website = getField(post, ['website', 'url'])
  const email = getField(post, ['email'])
  return (
    <>
      <section className="mx-auto max-w-[var(--editable-container)] px-6 py-14 sm:py-20 lg:px-8">
        <BackLink task="profile" />
        <div className="mt-8 grid gap-10 lg:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-8 text-center shadow-[0_22px_60px_rgba(15,23,42,0.08)]">
              <div className="mx-auto flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border border-[var(--tk-line)] bg-[var(--tk-raised)]">
                {images[0] ? <img src={images[0]} alt="" className="h-full w-full object-cover" /> : <UserRound className="h-14 w-14 text-[var(--tk-muted)]" />}
              </div>
              <h1 className="editable-display mt-6 text-2xl font-semibold tracking-[-0.02em]">{post.title}</h1>
              {role ? <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-[var(--tk-accent)]">{role}</p> : null}
              <DetailMeta post={post} center />
              <ContactAction website={website} email={email} bare />
            </div>
          </aside>
          <article className="min-w-0">
            <Kicker task="profile">Profile</Kicker>
            <BodyContent post={post} />
            <ImageStrip images={images.slice(1)} label="Gallery" />
          </article>
        </div>
      </section>
      <RelatedStrip task="profile" related={related} />
    </>
  )
}

// ----- Shared building blocks -----
function BodyContent({ post, compact = false }: { post: SitePost; compact?: boolean }) {
  return (
    <div
      className={`article-content mt-8 max-w-none text-[var(--tk-text)] ${compact ? 'text-[15px] leading-7' : 'text-[1.0625rem] leading-8'}`}
      dangerouslySetInnerHTML={{ __html: formatPlainText(getBody(post)) }}
    />
  )
}

function ImageStrip({ images, label, large = false }: { images: string[]; label: string; large?: boolean }) {
  if (!images.length) return null
  return (
    <section className="mt-10">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--tk-muted)]">{label}</p>
      <div className={`mt-4 grid gap-3 ${large ? 'sm:grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'}`}>
        {images.slice(0, large ? 4 : 8).map((image, index) => <img key={`${image}-${index}`} src={image} alt="" className="aspect-[4/3] rounded-[var(--tk-radius)] border border-[var(--tk-line)] object-cover" />)}
      </div>
    </section>
  )
}

function MapBox({ src, label }: { src: string; label: string }) {
  return (
    <div className="overflow-hidden rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)]">
      <div className="flex items-center gap-2 p-4 text-sm font-semibold"><MapPin className="h-4 w-4 text-[var(--tk-accent)]" /> {label || 'Map location'}</div>
      <iframe src={src} title="Map" loading="lazy" className="h-72 w-full border-0" />
    </div>
  )
}

function ContactAction({ website, phone, email, bare = false }: { website?: string; phone?: string; email?: string; bare?: boolean }) {
  if (!website && !phone && !email) return null
  const buttons = (
    <div className={`flex flex-wrap gap-2.5 ${bare ? 'justify-center' : ''}`}>
      {website ? <Link href={website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-4 py-2.5 text-sm font-semibold text-[var(--tk-on-accent)] transition hover:opacity-90">Website <ExternalLink className="h-4 w-4" /></Link> : null}
      {phone ? <a href={`tel:${phone}`} className="inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] px-4 py-2.5 text-sm font-semibold transition hover:border-[var(--tk-accent)]"><Phone className="h-4 w-4" /> Call</a> : null}
      {email ? <a href={`mailto:${email}`} className="inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] px-4 py-2.5 text-sm font-semibold transition hover:border-[var(--tk-accent)]"><Mail className="h-4 w-4" /> Email</a> : null}
    </div>
  )
  if (bare) return <div className="mt-6">{buttons}</div>
  return (
    <div className="rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--tk-muted)]">Quick actions</p>
      <div className="mt-4">{buttons}</div>
    </div>
  )
}

function BadgeLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-[var(--tk-line)] bg-[var(--tk-raised)] px-4 py-3 text-sm">
      <span className="font-medium uppercase tracking-[0.12em] text-[var(--tk-muted)]">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  )
}

function RelatedStrip({ task, related }: { task: TaskKey; related: SitePost[] }) {
  if (!related.length) return null
  const taskConfig = getTaskConfig(task)
  return (
    <section className="border-t border-[var(--tk-line)]">
      <div className="mx-auto max-w-[var(--editable-container)] px-6 py-14 sm:py-16 lg:px-8">
        <div className="flex items-center justify-between">
          <h2 className="editable-display text-2xl font-semibold tracking-[-0.02em]">More {displayTaskLabel(task, taskConfig?.label || 'posts').toLowerCase()}</h2>
          <Link href={taskConfig?.route || '/'} className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--tk-accent)]">View all <ArrowUpRight className="h-4 w-4" /></Link>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((item) => <RelatedCard key={item.id || item.slug} task={task} post={item} grid />)}
        </div>
      </div>
    </section>
  )
}

function RelatedCard({ task, post, grid = false }: { task: TaskKey; post: SitePost; grid?: boolean }) {
  const image = getImages(post)[0]
  // Build the detail URL from the task route (e.g. /listing/<slug>) — the same
  // base the archive cards use. buildPostUrl() can fall back to /posts when the
  // task isn't in the enabled taskViews map, which 404s.
  const href = `${getTaskConfig(task)?.route || `/${task}`}/${post.slug}`
  if (grid) {
    return (
      <Link href={href} className="group block overflow-hidden rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] transition duration-300 hover:-translate-y-1">
        <div className="aspect-[16/10] overflow-hidden bg-[var(--tk-raised)]">
          {image ? <img src={image} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" /> : <div className="flex h-full items-center justify-center"><FileText className="h-7 w-7 text-[var(--tk-muted)]" /></div>}
        </div>
        <div className="p-5">
          <h3 className="editable-display line-clamp-2 text-base font-semibold leading-snug tracking-[-0.01em]">{post.title}</h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--tk-muted)]">{stripHtml(summaryText(post))}</p>
        </div>
      </Link>
    )
  }
  return (
    <Link href={href} className="group flex gap-3 rounded-xl border border-[var(--tk-line)] p-3 transition hover:border-[var(--tk-accent)]">
      {image && task !== 'sbm' ? <img src={image} alt="" className="h-16 w-16 shrink-0 rounded-lg object-cover" /> : <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-[var(--tk-raised)]"><FileText className="h-5 w-5 text-[var(--tk-muted)]" /></div>}
      <div className="min-w-0">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug tracking-[-0.01em]">{post.title}</h3>
        <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-[var(--tk-muted)]">{stripHtml(summaryText(post))}</p>
      </div>
    </Link>
  )
}

