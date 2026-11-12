import { useMemo, useState } from 'react'
import { format, parseISO } from 'date-fns'
import { Search, Star, Feather, Flame } from 'lucide-react'
import { useJournal, MOODS, getStreak } from '../store.jsx'

const PROMPTS = [
  'What made today feel like yours?',
  'Something small worth remembering…',
  'What are you carrying right now?',
  'A moment you wish you could replay.',
  'What did you learn about yourself today?',
  'What would tomorrow-you like to hear?',
  'Describe today as a weather report.'
]

export default function Home({ onNew, onEdit }) {
  const { entries, settings } = useJournal()
  const [query, setQuery] = useState('')
  const [moodFilter, setMoodFilter] = useState(null)
  const [favOnly, setFavOnly] = useState(false)

  const streak = useMemo(() => getStreak(entries), [entries])
  const prompt = PROMPTS[new Date().getDate() % PROMPTS.length]

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return entries.filter((e) => {
      if (favOnly && !e.favorite) return false
      if (moodFilter && e.mood !== moodFilter) return false
      if (q && !(e.title + ' ' + e.body + ' ' + e.tags.join(' ')).toLowerCase().includes(q))
        return false
      return true
    })
  }, [entries, query, moodFilter, favOnly])

  const greeting = () => {
    const h = new Date().getHours()
    const name = settings.name ? `, ${settings.name}` : ''
    if (h < 5) return `Up late${name}?`
    if (h < 12) return `Good morning${name}`
    if (h < 17) return `Good afternoon${name}`
    return `Good evening${name}`
  }

  return (
    <div className="safe-top px-5 pt-6 space-y-6">
      <header className="animate-fade-up space-y-1">
        <p className="text-xs uppercase tracking-[0.2em] text-ink-300 dark:text-paper-200/40">
          {format(new Date(), 'EEEE, MMMM d')}
        </p>
        <h1 className="font-serif text-3xl leading-tight">{greeting()}</h1>
        {streak > 0 && (
          <p className="inline-flex items-center gap-1.5 text-sm text-accent font-medium">
            <Flame size={15} /> {streak} day{streak === 1 ? '' : 's'} of writing
          </p>
        )}
      </header>

      <button
        onClick={onNew}
        className="animate-fade-up w-full text-left rounded-3xl border border-dashed border-ink-300/50 dark:border-paper-200/20 bg-paper-50/60 dark:bg-ink-700/40 p-5 active:scale-[0.98] transition-transform"
      >
        <p className="font-hand text-2xl text-accent">{prompt}</p>
        <p className="mt-2 flex items-center gap-2 text-sm text-ink-300 dark:text-paper-200/50">
          <Feather size={14} /> Tap to start writing
        </p>
      </button>

      <div className="animate-fade-up space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-300" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your memories…"
            className="w-full rounded-full bg-paper-50 dark:bg-ink-700 border border-paper-200 dark:border-ink-500/30 py-2.5 pl-10 pr-4 text-sm placeholder:text-ink-300/70"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5">
          <FilterChip active={favOnly} onClick={() => setFavOnly(!favOnly)}>
            <Star size={13} className={favOnly ? 'fill-current' : ''} /> Favorites
          </FilterChip>
          {MOODS.map((m) => (
            <FilterChip
              key={m.id}
              active={moodFilter === m.id}
              onClick={() => setMoodFilter(moodFilter === m.id ? null : m.id)}
            >
              {m.emoji} {m.label}
            </FilterChip>
          ))}
        </div>
      </div>

      <section className="space-y-3 pb-4">
        {filtered.length === 0 && (
          <div className="py-14 text-center text-ink-300 dark:text-paper-200/40">
            <p className="font-hand text-3xl">A blank page, full of promise.</p>
            <p className="mt-2 text-sm">
              {entries.length === 0
                ? 'Write your first entry — it only takes a minute.'
                : 'Nothing matches that search.'}
            </p>
          </div>
        )}
        {filtered.map((e, i) => (
          <EntryCard key={e.id} entry={e} onClick={() => onEdit(e)} delay={Math.min(i, 8)} />
        ))}
      </section>
    </div>
  )
}

function FilterChip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium border transition-colors ${
        active
          ? 'bg-ink-900 text-paper-100 border-ink-900 dark:bg-paper-100 dark:text-ink-900 dark:border-paper-100'
          : 'bg-paper-50 dark:bg-ink-700 text-ink-500 dark:text-paper-200/60 border-paper-200 dark:border-ink-500/30'
      }`}
    >
      {children}
    </button>
  )
}

function EntryCard({ entry, onClick, delay }) {
  const mood = MOODS.find((m) => m.id === entry.mood)
  const snippet = entry.body.replace(/\s+/g, ' ').trim().slice(0, 120)
  return (
    <button
      onClick={onClick}
      style={{ animationDelay: `${delay * 45}ms` }}
      className="animate-fade-up w-full text-left rounded-3xl bg-paper-50 dark:bg-ink-700 border border-paper-200 dark:border-ink-500/30 p-5 shadow-sm shadow-ink-900/5 active:scale-[0.98] transition-transform"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-wider text-ink-300 dark:text-paper-200/40">
            {format(parseISO(entry.date), 'MMM d, yyyy')}
          </p>
          <h3 className="font-serif text-lg leading-snug truncate mt-0.5">
            {entry.title || 'Untitled'}
          </h3>
        </div>
        <span className="text-xl shrink-0">{mood?.emoji}</span>
      </div>
      {snippet && (
        <p className="mt-2 text-sm text-ink-500 dark:text-paper-200/60 line-clamp-2">{snippet}…</p>
      )}
      <div className="mt-3 flex items-center gap-2 flex-wrap">
        {entry.favorite && <Star size={13} className="text-accent fill-accent" />}
        {entry.tags.map((t) => (
          <span
            key={t}
            className="text-[11px] rounded-full bg-paper-200/70 dark:bg-ink-500/30 px-2 py-0.5 text-ink-500 dark:text-paper-200/60"
          >
            #{t}
          </span>
        ))}
      </div>
    </button>
  )
}
