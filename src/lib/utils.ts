import { formatDistanceToNow } from 'date-fns'

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
