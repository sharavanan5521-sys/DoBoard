import { useMemo } from 'react'
import { format, isSameDay, startOfDay, subDays } from 'date-fns'
import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { Task } from '../../types'
import { PRIORITY_META } from '../../lib/utils'

interface InsightsPanelProps {
  tasks: Task[]
  members: string[]
  memberName: (uid: string) => string
  accentColor?: string
}

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string
  value: string | number
  sub?: string
  accent?: string
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
        {label}
      </p>
      <p
        className="mt-1 text-2xl font-bold"
        style={{ color: accent ?? '#111827' }}
      >
        {value}
      </p>
      {sub && <p className="mt-0.5 text-xs text-gray-500">{sub}</p>}
    </div>
  )
}

function ChartCard({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
      <div className="mt-3">{children}</div>
    </div>
  )
}

export default function InsightsPanel({
  tasks,
  members,
  memberName,
  accentColor = '#6366f1',
}: InsightsPanelProps) {
  const stats = useMemo(() => {
    const now = new Date()
    const total = tasks.length
    const done = tasks.filter((t) => t.done).length
    const active = tasks.filter((t) => !t.done).length
    const overdue = tasks.filter(
      (t) => !t.done && t.dueDate && t.dueDate.toDate() < now,
    ).length
    const completion = total > 0 ? Math.round((done / total) * 100) : 0
    return { total, done, active, overdue, completion }
  }, [tasks])

  const donutData = useMemo(
    () => [
      { name: 'Done', value: stats.done, color: accentColor },
      { name: 'Remaining', value: stats.active, color: '#e5e7eb' },
    ],
    [stats.done, stats.active, accentColor],
  )

  const weekData = useMemo(() => {
    const today = startOfDay(new Date())
    const days = Array.from({ length: 7 }, (_, i) => subDays(today, 6 - i))
    return days.map((day) => ({
      label: format(day, 'EEE'),
      count: tasks.filter(
        (t) => t.done && t.doneAt && isSameDay(t.doneAt.toDate(), day),
      ).length,
    }))
  }, [tasks])

  const priorityData = useMemo(
    () =>
      (['high', 'medium', 'low'] as const).map((p) => ({
        name: PRIORITY_META[p].label,
        count: tasks.filter((t) => t.priority === p).length,
        color: PRIORITY_META[p].swatch,
      })),
    [tasks],
  )

  const memberData = useMemo(() => {
    const counts: Record<string, number> = {}
    members.forEach((uid) => (counts[uid] = 0))
    tasks
      .filter((t) => t.done)
      .forEach((t) => {
        const uid = t.assignee ?? t.createdBy
        if (uid in counts) counts[uid] += 1
        else counts[uid] = 1
      })
    return Object.entries(counts).map(([uid, count]) => ({
      name: memberName(uid).split(/\s+/)[0],
      count,
    }))
  }, [tasks, members, memberName])

  const health = useMemo(() => {
    if (stats.total > 0 && stats.done === stats.total)
      return { text: 'Board complete! 🎉', tone: 'good' as const }
    if (stats.overdue > 0)
      return {
        text: `${stats.overdue} ${stats.overdue === 1 ? 'task is' : 'tasks are'} overdue`,
        tone: 'warn' as const,
      }
    if (stats.completion > 80)
      return { text: 'Great progress on this board!', tone: 'good' as const }
    return { text: 'All on track', tone: 'neutral' as const }
  }, [stats])

  if (stats.total === 0) {
    return (
      <p className="py-16 text-center text-sm text-gray-400">
        Add some tasks to see insights
      </p>
    )
  }

  const healthClasses =
    health.tone === 'good'
      ? 'bg-green-50 text-green-700'
      : health.tone === 'warn'
        ? 'bg-red-50 text-red-700'
        : 'bg-gray-50 text-gray-600'

  return (
    <div className="space-y-5">
      {/* Health summary */}
      <div className={`rounded-xl px-4 py-3 text-sm font-medium ${healthClasses}`}>
        {health.text}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Total" value={stats.total} />
        <StatCard
          label="Done"
          value={stats.done}
          sub={`${stats.completion}% complete`}
          accent={accentColor}
        />
        <StatCard label="Active" value={stats.active} />
        <StatCard
          label="Overdue"
          value={stats.overdue}
          accent={stats.overdue > 0 ? '#ef4444' : undefined}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Completion donut */}
        <ChartCard title="Completion rate">
          <div className="relative h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={2}
                  startAngle={90}
                  endAngle={-270}
                >
                  {donutData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-gray-900">
                {stats.completion}%
              </span>
              <span className="text-xs text-gray-500">done</span>
            </div>
          </div>
        </ChartCard>

        {/* 7-day completion */}
        <ChartCard title="Completed in last 7 days">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekData}>
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={false}
                  tickLine={false}
                  width={24}
                />
                <Tooltip cursor={{ fill: '#f3f4f6' }} />
                <Bar dataKey="count" fill={accentColor} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Priority breakdown */}
        <ChartCard title="Priority breakdown">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={priorityData}
                layout="vertical"
                margin={{ left: 8, right: 24 }}
              >
                <XAxis type="number" hide allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={false}
                  tickLine={false}
                  width={64}
                />
                <Tooltip cursor={{ fill: '#f3f4f6' }} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {priorityData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                  <LabelList
                    dataKey="count"
                    position="right"
                    style={{ fontSize: 12, fill: '#374151' }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Member contribution */}
        <ChartCard title="Tasks completed by member">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={memberData}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={false}
                  tickLine={false}
                  width={24}
                />
                <Tooltip cursor={{ fill: '#f3f4f6' }} />
                <Bar dataKey="count" fill={accentColor} radius={[4, 4, 0, 0]}>
                  <LabelList
                    dataKey="count"
                    position="top"
                    style={{ fontSize: 12, fill: '#374151' }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>
    </div>
  )
}
