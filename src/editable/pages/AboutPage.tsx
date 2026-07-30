import Link from 'next/link'
import { ArrowRight, CheckCircle2, FileText, MapPin, Search } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/site-config'
import { pagesContent } from '@/editable/content/pages.content'
import { editableDesignContract as dc } from '@/editable/layouts/design-contract'
import { EditableReveal } from '@/editable/shell/EditableReveal'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'

const principles = [
  {
    title: 'Useful before promotional',
    body: 'Records are shaped around what visitors need first: location, category, contact paths, summaries, and clear next steps.',
  },
  {
    title: 'Reference material stays findable',
    body: 'Guides are presented as saved resources with context, not as decoration or buried attachments.',
  },
  {
    title: 'One connected index',
    body: 'Articles, places, profiles, bookmarks, visuals, and guides keep the same navigation rhythm so discovery feels continuous.',
  },
]

const standards = [
  ['Plain titles', 'Names and guide topics should be easy to recognize in search.'],
  ['Helpful metadata', 'Category, location, contact, format, and summary fields carry the browsing experience.'],
  ['Quiet review', 'Submissions are organized for usefulness, clarity, and follow-up value.'],
]

export default function AboutPage() {
  return (
    <EditableSiteShell>
      <main className="bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]">
        <section className={`${dc.shell.section} py-20 sm:py-24 lg:py-28`}>
          <EditableReveal>
            <div className="grid gap-10 lg:grid-cols-[1fr_.66fr] lg:items-end">
              <div>
                <p className={dc.type.eyebrow}>{pagesContent.about.badge}</p>
                <h1 className={`${dc.type.heroTitle} mt-5 max-w-5xl text-balance`}>
                  {SITE_CONFIG.name} is a calmer way to find local records and useful guides.
                </h1>
              </div>
              <p className={`${dc.type.body} max-w-xl`}>
                We organize practical information so visitors can search, compare, save, and act without sorting through noisy pages.
              </p>
            </div>
          </EditableReveal>
        </section>

        <section className="bg-[var(--slot4-dark-bg)] text-white">
          <div className={`${dc.shell.section} grid gap-8 py-14 sm:py-16 lg:grid-cols-[.4fr_1fr] lg:items-center`}>
            <EditableReveal>
              <p className="editable-label text-[11px] text-white/50">Platform standard</p>
              <h2 className="editable-display mt-3 text-5xl font-medium leading-none">Built for practical discovery.</h2>
            </EditableReveal>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                [MapPin, 'Places', 'Local records with details people can use.'],
                [FileText, 'Guides', 'Downloadable references with clear context.'],
                [Search, 'Search', 'A shared index across every active section.'],
              ].map(([Icon, title, body], index) => (
                <EditableReveal key={String(title)} index={index}>
                  <div className="rounded-[28px] bg-white p-6 text-[var(--slot4-page-text)]">
                    <Icon className="h-6 w-6 text-[var(--slot4-accent)]" />
                    <h3 className="editable-display mt-6 text-3xl font-medium leading-none">{String(title)}</h3>
                    <p className="mt-3 text-sm leading-6 text-[var(--slot4-muted-text)]">{String(body)}</p>
                  </div>
                </EditableReveal>
              ))}
            </div>
          </div>
        </section>

        <section className={`${dc.shell.section} py-20 sm:py-24`}>
          <div className="grid gap-10 lg:grid-cols-[.66fr_1fr]">
            <EditableReveal>
              <p className={dc.type.eyebrow}>Editorial promise</p>
              <h2 className={`${dc.type.sectionTitle} mt-3`}>The page should answer “is this useful?” quickly.</h2>
            </EditableReveal>
            <div className="grid gap-4">
              {principles.map((item, index) => (
                <EditableReveal key={item.title} index={index}>
                  <article className="rounded-[28px] border border-[var(--editable-border)] bg-white p-6">
                    <h3 className="editable-display text-3xl font-medium leading-none">{item.title}</h3>
                    <p className="mt-3 text-base leading-7 text-[var(--slot4-muted-text)]">{item.body}</p>
                  </article>
                </EditableReveal>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[var(--slot4-pastel-blue)] py-20 sm:py-24">
          <div className={`${dc.shell.section} grid gap-8 lg:grid-cols-[1fr_.9fr] lg:items-start`}>
            <EditableReveal>
              <div className="rounded-[28px] bg-white p-7 sm:p-9">
                <p className={dc.type.eyebrow}>Review standards</p>
                <h2 className={`${dc.type.sectionTitle} mt-3`}>Simple rules keep the index readable.</h2>
                <p className={`${dc.type.body} mt-5`}>
                  We do not need every page to sound the same. We do need every page to help someone decide what to open next.
                </p>
              </div>
            </EditableReveal>
            <div className="grid gap-3">
              {standards.map(([title, body], index) => (
                <EditableReveal key={title} index={index}>
                  <div className="grid gap-4 rounded-[28px] border border-[var(--editable-border)] bg-white/75 p-6 sm:grid-cols-[32px_minmax(0,1fr)]">
                    <CheckCircle2 className="mt-1 h-5 w-5 text-[var(--slot4-accent)]" />
                    <div>
                      <h3 className="text-lg font-extrabold">{title}</h3>
                      <p className="mt-2 text-base leading-7 text-[var(--slot4-muted-text)]">{body}</p>
                    </div>
                  </div>
                </EditableReveal>
              ))}
            </div>
          </div>
        </section>

        <section className={`${dc.shell.section} py-20 sm:py-24`}>
          <EditableReveal>
            <div className="grid gap-8 rounded-[28px] bg-[var(--slot4-accent)] p-8 text-white sm:p-10 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <p className="editable-label text-[11px] text-white/70">Contribute</p>
                <h2 className="editable-display mt-3 max-w-3xl text-5xl font-medium leading-none">Have something useful to add?</h2>
              </div>
              <Link href="/create" className="inline-flex w-fit items-center gap-2 rounded-[200px] bg-white px-6 py-3 text-sm font-bold text-[var(--slot4-accent)] transition hover:bg-[var(--slot4-dark-bg)] hover:text-white">
                Submit <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </EditableReveal>
        </section>
      </main>
    </EditableSiteShell>
  )
}
