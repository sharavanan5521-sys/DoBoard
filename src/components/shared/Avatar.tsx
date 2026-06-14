import { getInitials } from '../../lib/utils'

type AvatarSize = 'sm' | 'md' | 'lg'

interface AvatarProps {
  name: string
  size?: AvatarSize
  /** Background color (hex). Defaults to a neutral indigo. */
  color?: string
  /** Show a green online dot. */
  online?: boolean
}

const SIZE_CLASSES: Record<AvatarSize, string> = {
  sm: 'h-6 w-6 text-[10px]',
  md: 'h-9 w-9 text-sm',
  lg: 'h-12 w-12 text-base',
}

const DOT_CLASSES: Record<AvatarSize, string> = {
  sm: 'h-2 w-2',
  md: 'h-2.5 w-2.5',
  lg: 'h-3 w-3',
}

export default function Avatar({
  name,
  size = 'md',
  color = '#6366f1',
  online,
}: AvatarProps) {
  return (
    <div className="relative inline-flex shrink-0">
      <div
        className={`flex items-center justify-center rounded-full font-semibold text-white ring-2 ring-white ${SIZE_CLASSES[size]}`}
        style={{ backgroundColor: color }}
        title={name}
      >
        {getInitials(name)}
      </div>
      {online && (
        <span
          className={`absolute bottom-0 right-0 rounded-full bg-green-500 ring-2 ring-white ${DOT_CLASSES[size]}`}
        />
      )}
    </div>
  )
}
