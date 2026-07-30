'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

type EditableRevealProps = {
  children: ReactNode
  className?: string
  index?: number
}

export function EditableReveal({ children, className = '', index = 0 }: EditableRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setMounted(true)
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.12 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`${mounted ? 'editable-reveal' : ''} ${visible ? 'is-visible' : ''} ${className}`}
      style={{ transitionDelay: mounted ? `${Math.min(index, 8) * 70}ms` : undefined }}
    >
      {children}
    </div>
  )
}
