import type { CSSProperties } from 'react'
import type { TaskKey } from '@/lib/site-config'

export type TaskTheme = {
  kicker: string
  note: string
  dark: boolean
  fontDisplay: string
  fontBody: string
  bg: string
  surface: string
  raised: string
  text: string
  muted: string
  line: string
  accent: string
  accentSoft: string
  onAccent: string
  glow: string
  radius: string
}

const DISPLAY_FONT = "'Newsreader', Georgia, 'Times New Roman', serif"
const BODY_FONT = "'Hanken Grotesk', system-ui, -apple-system, 'Segoe UI', Arial, sans-serif"

const base = {
  dark: false,
  fontDisplay: DISPLAY_FONT,
  fontBody: BODY_FONT,
  bg: '#fbfaf7',
  surface: '#ffffff',
  raised: '#f1f7fe',
  text: '#282f48',
  muted: '#626a7f',
  line: '#282f481a',
  accent: '#e94a1f',
  accentSoft: '#fff3f0',
  onAccent: '#ffffff',
  glow: 'rgba(233,74,31,0.08)',
  radius: '28px',
} satisfies Omit<TaskTheme, 'kicker' | 'note'>

export const taskThemes: Record<TaskKey, TaskTheme> = {
  article: { ...base, kicker: 'Articles', note: 'In-depth reads, field notes, and practical context.' },
  listing: { ...base, kicker: 'Places', note: 'Find, compare, and contact useful local records.' },
  classified: { ...base, kicker: 'Marketplace', note: 'Fresh offers and listings, ready to act on.' },
  image: { ...base, kicker: 'Photos', note: 'A visual feed of standout images and galleries.' },
  sbm: { ...base, kicker: 'Bookmarks', note: 'Curated resources and links worth saving.' },
  pdf: { ...base, kicker: 'Guides', note: 'Downloadable references, reports, and useful files.' },
  profile: { ...base, kicker: 'People', note: 'Discover creators, places, and profiles.' },
}

export function getTaskTheme(task: TaskKey): TaskTheme {
  return taskThemes[task] || taskThemes.article
}

export function taskThemeStyle(task: TaskKey): CSSProperties {
  const t = getTaskTheme(task)
  return {
    '--tk-bg': t.bg,
    '--tk-surface': t.surface,
    '--tk-raised': t.raised,
    '--tk-text': t.text,
    '--tk-muted': t.muted,
    '--tk-line': t.line,
    '--tk-accent': t.accent,
    '--tk-accent-soft': t.accentSoft,
    '--tk-on-accent': t.onAccent,
    '--tk-glow': t.glow,
    '--tk-radius': t.radius,
    '--slot4-accent': t.accent,
    '--slot4-accent-fill': t.accent,
    '--editable-font-display': t.fontDisplay,
    '--editable-font-body': t.fontBody,
    fontFamily: t.fontBody,
  } as CSSProperties
}
