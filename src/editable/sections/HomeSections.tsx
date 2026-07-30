import Link from 'next/link'
import { ArrowRight, Bookmark, Building2, CheckCircle2, FileText, Image as ImageIcon, Megaphone, Search, UserRound } from 'lucide-react'
import type { SitePost } from '@/lib/site-connector'
import type { HomeTimeSection } from '@/lib/task-data'
import type { TaskKey } from '@/lib/site-config'
import { SITE_CONFIG } from '@/lib/site-config'
import { pagesContent } from '@/editable/content/pages.content'
import {
  ArticleListCard,
  CompactIndexCard,
  EditorialFeatureCard,
  RailPostCard,
  getEditableCategory,
  getEditableExcerpt,
  getEditablePostImage,
  postHref,
} from '@/editable/cards/PostCards'
import { editableDesignContract as dc } from '@/editable/layouts/design-contract'
import { EditableReveal } from '@/editable/shell/EditableReveal'

type HomeSectionProps = {
  primaryTask: TaskKey
  primaryRoute: string
  posts: SitePost[]
  timeSections: HomeTimeSection[]
}

const taskIcon: Record<TaskKey, typeof FileText> = {
  article: FileText,
  listing: Building2,
  classified: Megaphone,
  image: ImageIcon,
  sbm: Bookmark,
  pdf: FileText,
  profile: UserRound,
}

const displayLabel: Partial<Record<TaskKey, string>> = {
  listing: 'Places',
  pdf: 'Guides',
}

function taskLabel(task: TaskKey) {
  const config = SITE_CONFIG.tasks.find((item) => item.key === task)
  return displayLabel[task] || config?.label || task
}

function taskRoute(task: TaskKey, fallback = `/${task}`) {
  return SITE_CONFIG.tasks.find((item) => item.key === task)?.route || fallback
}

function dedupePosts(posts: SitePost[]) {
  const seen = new Set<string>()
  const out: SitePost[] = []
  for (const post of posts) {
    const key = post.slug || post.id || post.title
    if (!key || seen.has(key)) continue
    seen.add(key)
    out.push(post)
  }
  return out
}

function categoryCounts(posts: SitePost[]) {
  const counts = new Map<string, number>()
  posts.forEach((post) => {
    const category = getEditableCategory(post)
    counts.set(category, (counts.get(category) || 0) + 1)
  })
  return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8)
}

function getAllPosts(posts: SitePost[], timeSections: HomeTimeSection[]) {
  return dedupePosts([...posts, ...timeSections.flatMap((section) => section.posts)])
}

export function EditableHomeHero({ primaryRoute, posts, timeSections }: HomeSectionProps) {
  const pool = getAllPosts(posts, timeSections)
  const featured = pool[0]
  const preview = pool.slice(1, 4)
  const placesRoute = taskRoute('listing', primaryRoute)
  const guidesRoute = taskRoute('pdf', primaryRoute)

  return (
    <section className="relative overflow-hidden pt-8 sm:pt-12 lg:pt-16">
      <div className={`${dc.shell.section} ${dc.grid.hero}`}>
        <EditableReveal>
          <div className="max-w-4xl">
            <p className={dc.type.eyebrow}>{pagesContent.home.hero.badge}</p>
            <h1 className={`${dc.type.heroTitle} mt-5 text-balance`}>
              Find trusted <span className={dc.type.emphasis}>places</span> and useful guides in one calm index.
            </h1>
            <p className={`${dc.type.body} mt-6 max-w-2xl`}>
              Search local records, compare practical details, and open downloadable reference material without bouncing between separate sites.
            </p>
            <form action="/search" className="mt-9 grid max-w-2xl gap-3 rounded-[28px] border border-[var(--editable-border)] bg-white p-3 shadow-[0_20px_70px_rgba(40,47,72,0.08)] sm:grid-cols-[1fr_auto]">
              <label className="flex min-h-12 items-center gap-3 px-3">
                <Search className="h-5 w-5 shrink-0 text-[var(--slot4-accent)]" />
                <input
                  name="q"
                  type="search"
                  placeholder="Search places, categories, guide topics"
                  className="min-w-0 flex-1 bg-transparent text-base text-[var(--slot4-page-text)] outline-none placeholder:text-[var(--slot4-muted-text)]"
                />
              </label>
              <button className={dc.button.primary}>Search</button>
            </form>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={placesRoute} className={dc.button.secondary}>Browse Places <ArrowRight className="h-4 w-4" /></Link>
              <Link href={guidesRoute} className={dc.button.ghost}>Open Guides <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </div>
        </EditableReveal>

        <EditableReveal index={1}>
          <div className="relative">
            <div className="absolute -right-10 -top-8 h-40 w-40 rounded-[28px] bg-[var(--slot4-pastel-green)]" />
            <div className="absolute -bottom-8 -left-7 h-56 w-44 rounded-[28px] bg-[var(--slot4-pastel-peach)]" />
            <div className="relative grid gap-4">
              {featured ? (
                <Link href={postHref('listing', featured, placesRoute)} className={`${dc.surface.card} group block overflow-hidden p-4`}>
                  <div className="relative aspect-[4/3] overflow-hidden rounded-[24px] bg-[var(--slot4-media-bg)]">
                    <img src={getEditablePostImage(featured)} alt={featured.title} className={`${dc.motion.zoom} absolute inset-0 h-full w-full object-cover`} />
                  </div>
                  <div className="p-3">
                    <p className="editable-label text-[10px] text-[var(--slot4-accent)]">Featured record</p>
                    <h2 className="editable-display mt-2 text-3xl font-medium leading-none">{featured.title}</h2>
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--slot4-muted-text)]">{getEditableExcerpt(featured, 110)}</p>
                  </div>
                </Link>
              ) : null}
              <div className="grid gap-3 sm:grid-cols-3 lg:-ml-12">
                {preview.map((post, index) => (
                  <Link key={post.id || post.slug} href={postHref('listing', post, placesRoute)} className="rounded-[24px] border border-[var(--editable-border)] bg-white p-4 shadow-[0_12px_40px_rgba(40,47,72,0.06)]">
                    <span className="editable-display text-3xl text-[var(--slot4-accent)]">{index + 1}</span>
                    <h3 className="mt-2 line-clamp-2 text-sm font-bold leading-5">{post.title}</h3>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </EditableReveal>
      </div>
    </section>
  )
}

export function EditableStoryRail({ posts, timeSections }: HomeSectionProps) {
  const pool = getAllPosts(posts, timeSections)
  const categories = categoryCounts(pool)
  const activeTasks = SITE_CONFIG.tasks.filter((task) => task.enabled)

  return (
    <section className={`${dc.shell.bleed} mt-20 bg-[var(--slot4-dark-bg)] text-white sm:mt-24`}>
      <div className={`${dc.shell.section} py-12 sm:py-16`}>
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr_1fr_2fr] lg:items-end">
          <EditableReveal>
            <p className="editable-label text-[10px] text-white/50">Live index</p>
            <p className="editable-display mt-2 text-6xl leading-none">{pool.length}</p>
            <p className="mt-2 text-sm text-white/60">published records</p>
          </EditableReveal>
          <EditableReveal index={1}>
            <p className="editable-label text-[10px] text-white/50">Browse paths</p>
            <p className="editable-display mt-2 text-6xl leading-none">{activeTasks.length}</p>
            <p className="mt-2 text-sm text-white/60">active sections</p>
          </EditableReveal>
          <EditableReveal index={2}>
            <p className="editable-label text-[10px] text-white/50">Categories</p>
            <p className="editable-display mt-2 text-6xl leading-none">{categories.length}</p>
            <p className="mt-2 text-sm text-white/60">topic clusters</p>
          </EditableReveal>
          <EditableReveal index={3}>
            <div className="rounded-[28px] bg-white p-6 text-[var(--slot4-page-text)]">
              <p className={dc.type.eyebrow}>What this helps with</p>
              <p className="editable-display mt-3 text-4xl font-medium leading-none">A directory desk plus a reference shelf, stitched into one route.</p>
            </div>
          </EditableReveal>
        </div>
      </div>
    </section>
  )
}

export function EditableMagazineSplit({ primaryRoute, posts, timeSections }: HomeSectionProps) {
  const pool = getAllPosts(posts, timeSections)
  const feature = pool[0]
  const supporting = pool.slice(1, 5)
  if (!pool.length) return null

  return (
    <section className={dc.shell.sectionY}>
      <div className={`${dc.shell.section} ${dc.grid.feature}`}>
        <EditableReveal>
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className={dc.type.eyebrow}>Places desk</p>
              <h2 className={`${dc.type.sectionTitle} mt-3 max-w-2xl`}>Records worth comparing before you call, visit, or bookmark.</h2>
            </div>
          </div>
          <div className="mt-10">
            {feature ? <EditorialFeatureCard post={feature} href={postHref('listing', feature, taskRoute('listing', primaryRoute))} label="Featured place" /> : null}
          </div>
        </EditableReveal>
        <div>
          <EditableReveal index={1}>
            <p className={`${dc.type.body} lg:mt-20`}>Compact rows keep the comparison work close: category, title, a short description, and a clear path into each record.</p>
          </EditableReveal>
          <div className="mt-8">
            {supporting.map((post, index) => (
              <EditableReveal key={post.id || post.slug} index={index + 2}>
                <CompactIndexCard post={post} href={postHref('listing', post, taskRoute('listing', primaryRoute))} index={index} />
              </EditableReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export function EditableTimeCollections({ primaryRoute, posts, timeSections }: HomeSectionProps) {
  const pool = getAllPosts(posts, timeSections)
  const categories = categoryCounts(pool)
  const guides = pool.slice(4, 12)
  const latest = pool.slice(0, 4)
  const activeTasks = SITE_CONFIG.tasks.filter((task) => task.enabled)

  return (
    <>
      <section className="bg-[var(--slot4-pastel-blue)] py-20 sm:py-24">
        <div className={dc.shell.section}>
          <EditableReveal>
            <div className="grid gap-6 lg:grid-cols-[.66fr_1fr] lg:items-end">
              <h2 className={dc.type.sectionTitle}>Browse by category, section, and intent.</h2>
              <p className={dc.type.body}>Heyday uses compact utility grids between bigger editorial moments; this index does the same so visitors can change direction quickly.</p>
            </div>
          </EditableReveal>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_2fr]">
            {activeTasks.map((task, index) => {
              const Icon = taskIcon[task.key] || FileText
              return (
                <EditableReveal key={task.key} index={index}>
                  <Link href={task.route} className="flex min-h-32 items-start justify-between gap-4 rounded-[28px] border border-[var(--editable-border)] bg-white p-5 transition hover:border-[var(--slot4-accent)]">
                    <span>
                      <Icon className="h-5 w-5 text-[var(--slot4-accent)]" />
                      <span className="editable-display mt-5 block text-3xl leading-none">{taskLabel(task.key)}</span>
                    </span>
                    <ArrowRight className="h-4 w-4 text-[var(--slot4-muted-text)]" />
                  </Link>
                </EditableReveal>
              )
            })}
            {categories.map(([category, count], index) => (
              <EditableReveal key={category} index={index + activeTasks.length}>
                <div className="flex min-h-24 items-center justify-between rounded-[28px] border border-[var(--editable-border)] bg-white/70 p-5">
                  <span className="font-bold">{category}</span>
                  <span className={dc.badge.accentPill}>{count}</span>
                </div>
              </EditableReveal>
            ))}
          </div>
        </div>
      </section>

      {guides.length ? (
        <section className={`${dc.shell.sectionY} overflow-hidden`}>
          <div className={dc.shell.section}>
            <EditableReveal>
              <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className={dc.type.eyebrow}>Guides rail</p>
                  <h2 className={`${dc.type.sectionTitle} mt-3`}>Reference material without the photo-heavy treatment.</h2>
                </div>
                <Link href={taskRoute('pdf', primaryRoute)} className={dc.button.secondary}>All Guides <ArrowRight className="h-4 w-4" /></Link>
              </div>
            </EditableReveal>
            <div className={`${dc.grid.rail} mt-10`}>
              {guides.map((post, index) => (
                <EditableReveal key={post.id || post.slug} index={index}>
                  <RailPostCard post={post} href={postHref('pdf', post, taskRoute('pdf', primaryRoute))} index={index} />
                </EditableReveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="bg-[var(--slot4-pastel-peach)] py-20 sm:py-24">
        <div className={`${dc.shell.section} grid gap-10 lg:grid-cols-[.4fr_1fr]`}>
          <EditableReveal>
            <p className={dc.type.eyebrow}>How it works</p>
            <h2 className={`${dc.type.sectionTitle} mt-3`}>Simple standards before anything goes live.</h2>
          </EditableReveal>
          <div className="grid gap-4">
            {[
              ['01', 'Submit a record', 'Add a place with location, contact details, category, and a short plain-English description.'],
              ['02', 'Share a guide', 'Upload reference material with format, category, summary, and useful context for readers.'],
              ['03', 'Keep it useful', 'Records and guides are arranged for scanning, comparison, and quick follow-up.'],
            ].map(([num, title, text], index) => (
              <EditableReveal key={num} index={index}>
                <div className="grid gap-4 rounded-[28px] border border-[var(--editable-border)] bg-white p-6 sm:grid-cols-[110px_minmax(0,1fr)]">
                  <span className="editable-display text-6xl leading-none text-[var(--slot4-accent)]">{num}</span>
                  <span>
                    <span className="editable-display block text-3xl leading-none">{title}</span>
                    <span className="mt-3 block text-base leading-7 text-[var(--slot4-muted-text)]">{text}</span>
                  </span>
                </div>
              </EditableReveal>
            ))}
          </div>
        </div>
      </section>

      {latest.length ? (
        <section className={dc.shell.sectionY}>
          <div className={`${dc.shell.section} grid gap-10 lg:grid-cols-[.5fr_1fr]`}>
            <EditableReveal>
              <p className={dc.type.eyebrow}>Latest desk</p>
              <h2 className={`${dc.type.sectionTitle} mt-3`}>Fresh additions in a reading-list shape.</h2>
              <p className={`${dc.type.body} mt-5`}>A list treatment gives the last section a calmer cadence after the larger feature surfaces.</p>
            </EditableReveal>
            <div>
              {latest.map((post, index) => (
                <EditableReveal key={post.id || post.slug} index={index}>
                  <ArticleListCard post={post} href={postHref('article', post, primaryRoute)} index={index} />
                </EditableReveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="border-y border-[var(--editable-border)] bg-white py-20 sm:py-24">
        <div className={`${dc.shell.section} grid gap-10 lg:grid-cols-[.66fr_1fr]`}>
          <EditableReveal>
            <p className={dc.type.eyebrow}>FAQ</p>
            <h2 className={`${dc.type.sectionTitle} mt-3`}>What visitors usually need to know first.</h2>
          </EditableReveal>
          <div className="grid gap-3">
            {[
              ['Can I submit a place?', 'Yes. Create an account, add the core details, and include enough context for visitors to compare it with similar records.'],
              ['What belongs in Guides?', 'Guides are downloadable references, reports, forms, menus, checklists, or other useful material people may want to save.'],
              ['How are records kept useful?', 'Clear titles, categories, contact details, summaries, and follow-up links are prioritized over promotional filler.'],
            ].map(([question, answer], index) => (
              <EditableReveal key={question} index={index}>
                <div className="grid gap-4 rounded-[28px] border border-[var(--editable-border)] bg-[var(--slot4-pastel-green)] p-6 sm:grid-cols-[32px_minmax(0,1fr)]">
                  <CheckCircle2 className="mt-1 h-5 w-5 text-[var(--slot4-accent)]" />
                  <div>
                    <h3 className="text-lg font-extrabold">{question}</h3>
                    <p className="mt-2 text-base leading-7 text-[var(--slot4-muted-text)]">{answer}</p>
                  </div>
                </div>
              </EditableReveal>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

export function EditableHomeCta() {
  return (
    <section className="pb-20 sm:pb-24">
      <div className={`${dc.shell.section}`}>
        <EditableReveal>
          <div className="grid gap-8 rounded-[28px] bg-[var(--slot4-accent)] p-8 text-white sm:p-10 lg:grid-cols-[1fr_.66fr] lg:items-end">
            <div>
              <p className="editable-label text-[11px] text-white/70">Questions before you submit?</p>
              <h2 className="editable-display mt-3 max-w-3xl text-5xl font-medium leading-none sm:text-6xl">
                Help people find the practical details they came for.
              </h2>
            </div>
            <div>
              <p className="text-base leading-8 text-white/82">
                Add a place, publish a guide, or contact the team about corrections and review standards.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/create" className="inline-flex items-center gap-2 rounded-[200px] bg-white px-6 py-3 text-sm font-bold text-[var(--slot4-accent)] transition hover:bg-[var(--slot4-dark-bg)] hover:text-white">
                  Submit <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/contact" className="inline-flex items-center gap-2 rounded-[200px] border border-white/40 px-6 py-3 text-sm font-bold text-white transition hover:bg-white hover:text-[var(--slot4-page-text)]">
                  Contact <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </EditableReveal>
      </div>
    </section>
  )
}
