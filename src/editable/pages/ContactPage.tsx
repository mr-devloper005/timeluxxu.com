'use client'

import { CheckCircle2, Clock3, FileText, Mail, MapPin, MessageCircle } from 'lucide-react'
import { pagesContent } from '@/editable/content/pages.content'
import { EditableContactLeadForm } from '@/editable/components/EditableContactLeadForm'
import { editableDesignContract as dc } from '@/editable/layouts/design-contract'
import { EditableReveal } from '@/editable/shell/EditableReveal'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'

const lanes = [
  {
    icon: MapPin,
    title: 'Place updates',
    body: 'Send corrections, category changes, location details, or contact updates for a local record.',
  },
  {
    icon: FileText,
    title: 'Guide submissions',
    body: 'Ask about reference material, upload standards, file context, and how guides are presented.',
  },
  {
    icon: MessageCircle,
    title: 'General support',
    body: 'Reach us for account questions, publishing help, corrections, and partnership conversations.',
  },
]

const faqs = [
  ['What should I include?', 'Share the page, record name, category, and the exact detail you want us to review.'],
  ['How fast do you respond?', 'Most clear requests can be reviewed within a normal working window. Complex updates may take longer.'],
  ['Can I send multiple updates?', 'Yes. Group related updates in one message so the team can review them together.'],
]

export default function ContactPage() {
  return (
    <EditableSiteShell>
      <main className="bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]">
        <section className={`${dc.shell.section} py-20 sm:py-24 lg:py-28`}>
          <div className="grid gap-10 lg:grid-cols-[.8fr_1fr] lg:items-start">
            <EditableReveal>
              <div className="lg:sticky lg:top-28">
                <p className={dc.type.eyebrow}>{pagesContent.contact.eyebrow}</p>
                <h1 className={`${dc.type.heroTitle} mt-5 max-w-3xl text-balance`}>{pagesContent.contact.title}</h1>
                <p className={`${dc.type.body} mt-6 max-w-xl`}>{pagesContent.contact.description}</p>

                <div className="mt-8 grid gap-3">
                  <div className="rounded-[28px] border border-[var(--editable-border)] bg-white p-5">
                    <Clock3 className="h-5 w-5 text-[var(--slot4-accent)]" />
                    <h2 className="editable-display mt-4 text-3xl font-medium leading-none">Response rhythm</h2>
                    <p className="mt-3 text-sm leading-6 text-[var(--slot4-muted-text)]">
                      Clear, specific requests move fastest: include the page, the correction, and any source details.
                    </p>
                  </div>
                </div>
              </div>
            </EditableReveal>

            <div className="grid gap-6">
              <EditableReveal index={1}>
                <div className="grid gap-4 sm:grid-cols-3">
                  {lanes.map((lane) => (
                    <article key={lane.title} className="rounded-[28px] border border-[var(--editable-border)] bg-white p-5">
                      <lane.icon className="h-5 w-5 text-[var(--slot4-accent)]" />
                      <h2 className="editable-display mt-5 text-2xl font-medium leading-none">{lane.title}</h2>
                      <p className="mt-3 text-sm leading-6 text-[var(--slot4-muted-text)]">{lane.body}</p>
                    </article>
                  ))}
                </div>
              </EditableReveal>

              <EditableReveal index={2}>
                <div className="rounded-[28px] border border-[var(--editable-border)] bg-white p-6 sm:p-8">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--slot4-accent-soft)] text-[var(--slot4-accent)]">
                      <Mail className="h-5 w-5" />
                    </span>
                    <div>
                      <p className={dc.type.eyebrow}>{pagesContent.contact.formTitle}</p>
                      <h2 className="editable-display mt-1 text-3xl font-medium leading-none">Route your note to the right desk.</h2>
                    </div>
                  </div>
                  <EditableContactLeadForm />
                </div>
              </EditableReveal>

              <EditableReveal index={3}>
                <div className="rounded-[28px] bg-[var(--slot4-pastel-blue)] p-6 sm:p-8">
                  <p className={dc.type.eyebrow}>Before you send</p>
                  <div className="mt-5 grid gap-4">
                    {faqs.map(([question, answer]) => (
                      <div key={question} className="grid gap-3 sm:grid-cols-[28px_minmax(0,1fr)]">
                        <CheckCircle2 className="mt-1 h-5 w-5 text-[var(--slot4-accent)]" />
                        <div>
                          <h3 className="font-extrabold">{question}</h3>
                          <p className="mt-1 text-sm leading-6 text-[var(--slot4-muted-text)]">{answer}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </EditableReveal>
            </div>
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
