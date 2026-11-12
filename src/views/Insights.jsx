import { useMemo } from 'react'
import { format, subDays, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, getDay } from 'date-fns'
import { Flame, PenLine, BookOpen, Heart } from 'lucide-react'
import { useJournal, MOODS, getStreak } from '../store.jsx'

export default function Insights() {
  const { entries } = useJournal()

  const streak = useMemo(() => getStreak(entries), [entries])
  const words = useMemo(
    () => entries.reduce((n, e) => n + (e.body.trim() ? e.body.trim().split(/\s+/).length : 0), 0),
    [entries]
  )
  const moodCounts = useMemo(() => {
    const c = {}
    for (const e of entries) if (e.mood) c[e.mood] = (c[e.mood] || 0) + 1
    return c
  }, [entries])
  const last14 = useMemo(() => {
    const byDate = new Map(entries.map((e) => [e.date, e]))
    return Array.from({ length: 14 }, (_, i) => {
      const d = subDays(new Date(), 13 - i)
      const key = d.toISOString().slice(0, 10)
      return byDate.get(key) || null
    })
  }, [entries])
  const longest = useMemo(() => {
    const days = [...new Set(entries.map((e) => e.date))].sort()
    let best = 0, cur = 0, prev = null
    for (const d of days) {
      cur = prev && (parseISO(d) - parseISO(prev)) / 86400000 === 1 ? cur + 1 : 1
      best = Math.max(best, cur)
      prev = d
    }
    return best
  }, [entries])

  const topMood = MOODS.map((m) => ({ ...m, n: moodCounts[m.id] || 0 })).sort((a, b) => b.n - a.n)[0]

  return (
    <div className="safe-top px-5 pt-6 pb-4 space-y-6">
      <header className="animate-fade-up">
        <p className="text-xs uppercase tracking-[0.2em] text-ink-300 dark:text-paper-200/40">
          Looking back
        </p>
        <h1 className="font-serif text-3xl">Your story so far</h1>
      </header>

      <div className="grid grid-cols-2 gap-3 animate-fade-up">
        <StatCard icon={Flame} label="Day streak" value={streak} sub={`best ${longest}`} />
        <StatCard icon={BookOpen} label="Entries" value={entries.length} />
        <StatCard icon={PenLine} label="Words written" value={words.toLocaleString()} />
        <StatCard
          icon={Heart}
          label="Most felt"
          value={topMood?.n ? `${topMood.emoji}` : '—'}
          sub={topMood?.n ? topMood.label : 'no moods yet'}
        />
      </div>

      <section className="animate-fade-up rounded-3xl bg-paper-50 dark:bg-ink-700 border border-paper-200 dark:border-ink-500/30 p-5">
        <h2 className="text-sm font-semibold mb-3">Last two weeks</h2>
        <div className="flex items-end gap-1.5 h-24">
          {last14.map((e, i) => {
            const mood = MOODS.find((m) => m.id === e?.mood)
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <div
                  title={e ? format(parseISO(e.date), 'MMM d') : ''}
                  className="w-full rounded-full transition-all"
                  style={{
                    height: e ? `${28 + ((e.body.length % 60) / 60) * 44}px` : '6px',
                    backgroundColor: mood ? mood.color : e ? '#b3543f' : 'currentColor',
                    opacity: e ? 1 : 0.12
                  }}
                />
                {i % 2 === 0 && (
                  <span className="text-[9px] text-ink-300 dark:text-paper-200/40">
                    {format(subDays(new Date(), 13 - i), 'd')}
                  </span>
                )}
              </div>
            )
          })}
        </div>
        <p className="mt-3 text-xs text-ink-300 dark:text-paper-200/50">
          Bar color shows your mood; taller bars mean longer entries.
        </p>
      </section>

      <MonthMap entries={entries} />
    </div>
  )
}

function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <div className="rounded-3xl bg-paper-50 dark:bg-ink-700 border border-paper-200 dark:border-ink-500/30 p-4 space-y-1.5">
      <Icon size={16} className="text-accent" />
      <p className="font-serif text-2xl leading-none">{value}</p>
      <p className="text-xs text-ink-500 dark:text-paper-200/60">
        {label}
        {sub && <span className="text-ink-300 dark:text-paper-200/40"> · {sub}</span>}
      </p>
    </div>
  )
}

function MonthMap({ entries }) {
  const today = new Date()
  const days = eachDayOfInterval({ start: startOfMonth(today), end: endOfMonth(today) })
  const byDate = new Map(entries.map((e) => [e.date, e]))
  const lead = (getDay(startOfMonth(today)) + 6) % 7 // Monday-first

  return (
    <section className="animate-fade-up rounded-3xl bg-paper-50 dark:bg-ink-700 border border-paper-200 dark:border-ink-500/30 p-5">
      <h2 className="text-sm font-semibold mb-3">{format(today, 'MMMM yyyy')}</h2>
      <div className="grid grid-cols-7 gap-1.5">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <span key={i} className="text-center text-[10px] text-ink-300 dark:text-paper-200/40">
            {d}
          </span>
        ))}
        {Array.from({ length: lead }).map((_, i) => (
          <span key={'x' + i} />
        ))}
        {days.map((d) => {
          const key = format(d, 'yyyy-MM-dd')
          const e = byDate.get(key)
          const mood = MOODS.find((m) => m.id === e?.mood)
          const isToday = isSameMonth(d, today) && format(d, 'd') === format(today, 'd')
          return (
            <div
              key={key}
              title={key}
              className={`aspect-square rounded-lg flex items-center justify-center text-[10px] ${
                isToday ? 'ring-2 ring-accent' : ''
              } ${e ? 'text-paper-50 font-semibold' : 'text-ink-300/60 dark:text-paper-200/25 bg-paper-200/40 dark:bg-ink-500/20'}`}
              style={e ? { backgroundColor: mood ? mood.color : '#b3543f' } : undefined}
            >
              {format(d, 'd')}
            </div>
          )
        })}
      </div>
    </section>
  )
}
