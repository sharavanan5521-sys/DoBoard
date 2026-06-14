import { differenceInCalendarDays, formatDistanceToNow } from 'date-fns'
import type { Priority } from '../types'

/**
 * Returns up to two uppercase initials from a name.
 * e.g. "Ada Lovelace" -> "AL", "madonna" -> "M"
 */
export function getInitials(name: string): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

/**
 * Human-friendly relative date, e.g. "3 hours ago", "in 2 days".
 */
export function formatRelativeDate(date: Date): string {
  return formatDistanceToNow(date, { addSuffix: true })
}

/**
 * Describes a due date relative to today, e.g. "Due today",
 * "2 days left", "Overdue — 3 days ago". `overdue` is true when the
 * date is in the past (used to style the chip red).
 */
export function formatDueDate(date: Date): { text: string; overdue: boolean } {
  const days = differenceInCalendarDays(date, new Date())
  if (days < 0) {
    const ago = Math.abs(days)
    return {
      text: `Overdue — ${ago} ${ago === 1 ? 'day' : 'days'} ago`,
      overdue: true,
    }
  }
  if (days === 0) return { text: 'Due today', overdue: false }
  if (days === 1) return { text: '1 day left', overdue: false }
  return { text: `${days} days left`, overdue: false }
}

export const PRIORITY_META: Record<
  Priority,
  { label: string; color: string; bg: string; text: string; swatch: string }
> = {
  low: {
    label: 'Low',
    color: '#6b7280',
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    swatch: '#9ca3af',
  },
  medium: {
    label: 'Medium',
    color: '#f59e0b',
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    swatch: '#f59e0b',
  },
  high: {
    label: 'High',
    color: '#ef4444',
    bg: 'bg-red-100',
    text: 'text-red-700',
    swatch: '#ef4444',
  },
}
