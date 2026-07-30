'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogIn, Menu, PlusCircle, Search, UserPlus, X } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/site-config'
import { globalContent } from '@/editable/content/global.content'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'

const staticLinks = [
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

export function EditableNavbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const { session, logout } = useEditableLocalAuthSession()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className="sticky top-0 z-50 px-3 py-3 sm:px-5">
      <nav
        className={`mx-auto flex min-h-[68px] w-full max-w-[1188px] items-center gap-3 rounded-[200px] border px-4 text-[var(--editable-nav-text)] transition duration-300 sm:px-5 ${
          scrolled
            ? 'border-[var(--editable-border)] bg-[var(--editable-nav-bg)]/92 shadow-[0_18px_55px_rgba(40,47,72,0.10)] backdrop-blur-xl'
            : 'border-transparent bg-[var(--editable-nav-bg)]/72 backdrop-blur-md'
        }`}
      >
        <Link href="/" className="group flex min-w-0 shrink-0 items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-[var(--editable-border)] bg-white transition group-hover:border-[var(--slot4-accent)]">
            <img src="/favicon.png?v=20261013" alt={SITE_CONFIG.name} className="h-12 w-12 object-contain" />
          </span>
          <span className="min-w-0">
            <span className="editable-display block max-w-[170px] truncate text-xl font-medium leading-none">{SITE_CONFIG.name}</span>
            <span className="editable-label mt-1 hidden max-w-[190px] truncate text-[9px] text-[var(--slot4-muted-text)] md:block">
              {globalContent.nav?.tagline || SITE_CONFIG.tagline}
            </span>
          </span>
        </Link>

        <div className="ml-4 hidden items-center gap-1 md:flex">
          {staticLinks.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-[200px] px-4 py-2 text-sm font-bold transition ${
                  active ? 'bg-white text-[var(--slot4-accent)]' : 'text-[var(--slot4-muted-text)] hover:bg-white hover:text-[var(--slot4-page-text)]'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <Link
            href="/search"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--editable-border)] bg-white text-[var(--slot4-page-text)] transition hover:border-[var(--slot4-accent)] hover:text-[var(--slot4-accent)]"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </Link>

          {session ? (
            <>
              <Link href="/create" className="hidden items-center gap-2 rounded-[200px] bg-[var(--slot4-accent)] px-4 py-2 text-sm font-bold text-white transition hover:bg-[var(--slot4-dark-bg)] sm:inline-flex">
                <PlusCircle className="h-4 w-4" /> Submit
              </Link>
              <button type="button" onClick={logout} className="hidden rounded-[200px] px-3 py-2 text-sm font-bold text-[var(--slot4-muted-text)] transition hover:bg-white hover:text-[var(--slot4-page-text)] sm:inline-flex">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hidden items-center gap-2 rounded-[200px] px-3 py-2 text-sm font-bold text-[var(--slot4-muted-text)] transition hover:bg-white hover:text-[var(--slot4-page-text)] sm:inline-flex">
                <LogIn className="h-4 w-4" /> Sign in
              </Link>
              <Link href="/signup" className="hidden items-center gap-2 rounded-[200px] bg-[var(--slot4-accent)] px-4 py-2 text-sm font-bold text-white transition hover:bg-[var(--slot4-dark-bg)] sm:inline-flex">
                <UserPlus className="h-4 w-4" /> Get started
              </Link>
            </>
          )}

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--editable-border)] bg-white md:hidden"
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </nav>

      <div
        className={`mx-auto mt-2 w-full max-w-[1188px] overflow-hidden rounded-[28px] border border-[var(--editable-border)] bg-white/95 transition-all duration-300 md:hidden ${
          open ? 'max-h-[420px] opacity-100 shadow-[0_24px_70px_rgba(40,47,72,0.12)]' : 'max-h-0 border-transparent opacity-0'
        }`}
      >
        <div className="grid gap-1 p-3">
          {[
            { label: 'Home', href: '/' },
            ...staticLinks,
            { label: 'Search', href: '/search' },
            ...(session ? [{ label: 'Submit', href: '/create' }] : [{ label: 'Sign in', href: '/login' }, { label: 'Get started', href: '/signup' }]),
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`rounded-[200px] px-4 py-3 text-sm font-bold ${
                pathname === item.href ? 'bg-[var(--slot4-accent-soft)] text-[var(--slot4-accent)]' : 'text-[var(--slot4-muted-text)] hover:bg-[var(--slot4-pastel-blue)]'
              }`}
            >
              {item.label}
            </Link>
          ))}
          {session ? <button type="button" onClick={logout} className="rounded-[200px] px-4 py-3 text-left text-sm font-bold text-[var(--slot4-muted-text)] hover:bg-[var(--slot4-pastel-blue)]">Logout</button> : null}
        </div>
      </div>
    </header>
  )
}
