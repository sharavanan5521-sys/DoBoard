interface ProgressBarProps {
  /** Completion percentage, 0–100. */
  value: number
  /** Fill color (hex). */
  color: string
}

export default function ProgressBar({ value, color }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value))
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
      <div
        className="h-full rounded-full transition-all duration-300"
        style={{ width: `${clamped}%`, backgroundColor: color }}
      />
    </div>
  )
}
