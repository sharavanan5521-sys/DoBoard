import { useRef, useState } from 'react'

interface AddTaskInputProps {
  onAdd: (title: string) => Promise<void> | void
  accentColor?: string
}

export default function AddTaskInput({
  onAdd,
  accentColor = '#6366f1',
}: AddTaskInputProps) {
  const [title, setTitle] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleAdd() {
    const trimmed = title.trim()
    if (!trimmed || submitting) return
    setSubmitting(true)
    try {
      await onAdd(trimmed)
      setTitle('')
      inputRef.current?.focus()
    } catch (err) {
      console.error('Failed to add task:', err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white p-2 shadow-sm">
      <input
        ref={inputRef}
        type="text"
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleAdd()
        }}
        placeholder="Add a task…"
        className="flex-1 bg-transparent px-2 py-1.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
      />
      <button
        type="button"
        onClick={handleAdd}
        disabled={!title.trim() || submitting}
        className="rounded-lg px-4 py-1.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        style={{ backgroundColor: accentColor }}
      >
        Add
      </button>
    </div>
  )
}
