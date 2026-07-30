import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Bookmark, FileText, MapPin } from 'lucide-react'
import { buildPageMetadata } from '@/lib/seo'
import { SITE_CONFIG } from '@/lib/site-config'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableLocalLoginForm } from '@/editable/components/EditableLocalAuthForms'
import { pagesContent } from '@/editable/content/pages.content'
import { editableDesignContract as dc } from '@/editable/layouts/design-contract'
import { EditableReveal } from '@/editable/shell/EditableReveal'

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({ path: '/login', title: 'Sign in', description: pagesContent.auth.login.metadataDescription })
}

export default function LoginPage() {
  return (
    <EditableSiteShell>
      <main className="bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]">
        <section className={`${dc.shell.section} grid min-h-[calc(100vh-10rem)] gap-8 py-16 sm:py-20 lg:grid-cols-[1fr_.78fr] lg:items-center`}>
          <EditableReveal>
            <div className="relative overflow-hidden rounded-[28px] bg-[var(--slot4-dark-bg)] p-8 text-white sm:p-10 lg:min-h-[620px]">
              <div className="absolute -right-10 -top-10 h-52 w-52 rounded-[28px] bg-[var(--slot4-accent)]/80" />
              <div className="absolute -bottom-16 left-10 h-56 w-44 rounded-[28px] bg-white/10" />
              <div className="relative z-10 flex min-h-[500px] flex-col justify-between">
                <div>
                  <p className="editable-label text-[11px] text-white/58">{SITE_CONFIG.name}</p>
                  <h1 className="editable-display mt-5 max-w-3xl text-6xl font-medium leading-none sm:text-7xl">
                    Return to your saved discovery desk.
                  </h1>
                  <p className="mt-6 max-w-xl text-base leading-8 text-white/70">
                    Sign in to submit records, publish guides, and keep useful local information moving through the index.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    [MapPin, 'Submit places'],
                    [FileText, 'Publish guides'],
                    [Bookmark, 'Save finds'],
                  ].map(([Icon, label]) => (
                    <div key={String(label)} className="rounded-[24px] border border-white/15 bg-white/8 p-4">
                      <Icon className="h-5 w-5 text-[var(--slot4-accent)]" />
                      <p className="mt-4 text-sm font-bold text-white">{String(label)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </EditableReveal>

          <EditableReveal index={1}>
            <div className="rounded-[28px] border border-[var(--editable-border)] bg-white p-7 shadow-[0_24px_70px_rgba(40,47,72,0.10)] sm:p-9">
              <p className={dc.type.eyebrow}>{pagesContent.auth.login.badge}</p>
              <h2 className="editable-display mt-3 text-5xl font-medium leading-none">{pagesContent.auth.login.formTitle}</h2>
              <p className="mt-4 text-base leading-7 text-[var(--slot4-muted-text)]">{pagesContent.auth.login.description}</p>
              <EditableLocalLoginForm />
              
              <p className="mt-6 text-sm text-[var(--slot4-muted-text)]">
                New here?{' '}
                <Link href="/signup" className="inline-flex items-center gap-1 font-extrabold text-[var(--slot4-accent)]">
                  {pagesContent.auth.login.createCta} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </p>
            </div>
          </EditableReveal>
        </section>
      </main>
    </EditableSiteShell>
  )
}
