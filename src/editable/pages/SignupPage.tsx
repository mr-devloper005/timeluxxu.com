import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, FileText, MapPin, Search } from 'lucide-react'
import { buildPageMetadata } from '@/lib/seo'
import { SITE_CONFIG } from '@/lib/site-config'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableLocalSignupForm } from '@/editable/components/EditableLocalAuthForms'
import { pagesContent } from '@/editable/content/pages.content'
import { editableDesignContract as dc } from '@/editable/layouts/design-contract'
import { EditableReveal } from '@/editable/shell/EditableReveal'

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({ path: '/signup', title: 'Get started', description: pagesContent.auth.signup.metadataDescription })
}

export default function SignupPage() {
  return (
    <EditableSiteShell>
      <main className="bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]">
        <section className={`${dc.shell.section} grid min-h-[calc(100vh-10rem)] gap-8 py-16 sm:py-20 lg:grid-cols-[.78fr_1fr] lg:items-center`}>
          <EditableReveal>
            <div className="rounded-[28px] border border-[var(--editable-border)] bg-white p-7 shadow-[0_24px_70px_rgba(40,47,72,0.10)] sm:p-9">
              <p className={dc.type.eyebrow}>{pagesContent.auth.signup.badge}</p>
              <h1 className="editable-display mt-3 text-5xl font-medium leading-none">{pagesContent.auth.signup.formTitle}</h1>
              <p className="mt-4 text-base leading-7 text-[var(--slot4-muted-text)]">{pagesContent.auth.signup.description}</p>
              <EditableLocalSignupForm />
              <p className="mt-6 text-sm text-[var(--slot4-muted-text)]">
                Already have an account?{' '}
                <Link href="/login" className="inline-flex items-center gap-1 font-extrabold text-[var(--slot4-accent)]">
                  {pagesContent.auth.signup.loginCta} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </p>
            </div>
          </EditableReveal>

          <EditableReveal index={1}>
            <div className="relative overflow-hidden rounded-[28px] bg-[var(--slot4-pastel-blue)] p-8 sm:p-10 lg:min-h-[620px]">
              <div className="absolute -right-8 top-10 h-44 w-44 rounded-[28px] bg-[var(--slot4-pastel-green)]" />
              <div className="absolute -bottom-10 -left-8 h-52 w-52 rounded-[28px] bg-[var(--slot4-pastel-peach)]" />
              <div className="relative z-10 flex min-h-[500px] flex-col justify-between">
                <div>
                  <p className={dc.type.eyebrow}>{SITE_CONFIG.name}</p>
                  <h2 className="editable-display mt-5 max-w-3xl text-6xl font-medium leading-none sm:text-7xl">
                    Create the account that opens the publishing desk.
                  </h2>
                  <p className="mt-6 max-w-xl text-base leading-8 text-[var(--slot4-muted-text)]">
                    Use it to submit places, publish guides, and keep useful finds close while you browse.
                  </p>
                </div>
                <div className="grid gap-3">
                  {[
                    [MapPin, 'Submit records with clear contact and category details.'],
                    [FileText, 'Publish guides with context, format notes, and helpful summaries.'],
                    [Search, 'Save time by returning to one connected discovery surface.'],
                  ].map(([Icon, text]) => (
                    <div key={String(text)} className="grid gap-4 rounded-[24px] border border-[var(--editable-border)] bg-white/78 p-5 sm:grid-cols-[32px_minmax(0,1fr)]">
                      <Icon className="mt-1 h-5 w-5 text-[var(--slot4-accent)]" />
                      <p className="text-sm font-bold leading-6 text-[var(--slot4-page-text)]">{String(text)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </EditableReveal>
        </section>
      </main>
    </EditableSiteShell>
  )
}
