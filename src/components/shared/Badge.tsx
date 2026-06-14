import type { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  /** Tailwind background class, e.g. "bg-red-100". */
  bg?: string
  /** Tailwind text-color class, e.g. "text-red-700". */
  text?: string
  className?: string
}

export default function Badge({
  children,
  bg = 'bg-gray-100',
  text = 'text-gray-600',
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${bg} ${text} ${className}`}
    >
      {children}
    </span>
  )
}
