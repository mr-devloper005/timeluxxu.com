'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { ArrowUpRight, Search, Send } from 'lucide-react'
import { SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import { globalContent } from '@/editable/content/global.content'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'

const displayLabel: Partial<Record<TaskKey, string>> = {
  listing: 'Places',
  pdf: 'Guides',
}

function taskDisplay(task: (typeof SITE_CONFIG.tasks)[number]) {
  return displayLabel[task.key] || task.label
}

export function EditableFooter() {
  const taskLinks = SITE_CONFIG.tasks.filter((task) => task.enabled)
  const year = new Date().getFullYear()
  const { session, logout } = useEditableLocalAuthSession()

  return (
    <footer className="bg-[var(--editable-footer-bg)] text-[var(--editable-footer-text)]">
      <div className="mx-auto max-w-[var(--editable-container)] px-5 py-10 sm:px-8 lg:px-10">
        <div className="grid gap-6 rounded-[28px] border border-white/15 bg-white/[0.04] p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="editable-label text-[11px] text-white/55">Keep the index moving</p>
            <h2 className="editable-display mt-3 max-w-2xl text-4xl font-medium leading-none sm:text-5xl">
              Share a useful place or publish a guide.
            </h2>
          </div>
          <Link href="/create" className="inline-flex w-fit items-center gap-2 rounded-[200px] bg-[var(--slot4-accent)] px-6 py-3 text-sm font-bold text-white transition hover:bg-white hover:text-[var(--slot4-dark-bg)]">
            Submit <Send className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="mx-auto grid max-w-[var(--editable-container)] gap-10 px-5 pb-12 sm:px-8 lg:grid-cols-[1.5fr_.8fr_.8fr_.8fr] lg:px-10">
        <div>
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-white">
              <img src="/favicon.png?v=20260413" alt={SITE_CONFIG.name} className="h-11 w-11 object-contain" />
            </span>
            <span className="editable-display text-2xl font-medium">{SITE_CONFIG.name}</span>
          </Link>
          <p className="mt-5 max-w-md text-base leading-8 text-white/64">{globalContent.footer?.description || SITE_CONFIG.description}</p>
        </div>

        <FooterColumn title="Discovery">
          {taskLinks.map((task) => (
            <Link key={task.key} href={task.route} className="footer-link">
              {taskDisplay(task)} <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          ))}
        </FooterColumn>

        <FooterColumn title="Resources">
          <Link href="/about" className="footer-link">About <ArrowUpRight className="h-3.5 w-3.5" /></Link>
          <Link href="/contact" className="footer-link">Contact <ArrowUpRight className="h-3.5 w-3.5" /></Link>
          <Link href="/search" className="footer-link">Search <Search className="h-3.5 w-3.5" /></Link>
        </FooterColumn>

        <FooterColumn title="Account">
          {session ? (
            <>
              <Link href="/create" className="footer-link">Submit <ArrowUpRight className="h-3.5 w-3.5" /></Link>
              <button type="button" onClick={logout} className="footer-link text-left">Logout</button>
            </>
          ) : (
            <>
              <Link href="/login" className="footer-link">Sign in <ArrowUpRight className="h-3.5 w-3.5" /></Link>
              <Link href="/signup" className="footer-link">Get started <ArrowUpRight className="h-3.5 w-3.5" /></Link>
            </>
          )}
        </FooterColumn>
      </div>

      <div className="border-t border-white/10 px-5 py-7">
        <div className="mx-auto flex max-w-[var(--editable-container)] flex-col gap-4 text-xs text-white/50 sm:flex-row sm:items-end sm:justify-between">
          <p>Copyright {year} {SITE_CONFIG.name}. All rights reserved.</p>
          <p className="editable-display text-4xl leading-none text-white/10 sm:text-6xl">{SITE_CONFIG.name}</p>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="editable-label text-[11px] text-white/45">{title}</h3>
      <div className="mt-5 grid gap-3 text-sm font-semibold text-white/68 [&_.footer-link]:inline-flex [&_.footer-link]:items-center [&_.footer-link]:gap-1.5 [&_.footer-link]:transition [&_.footer-link:hover]:text-white">
        {children}
      </div>
    </div>
  )
}
