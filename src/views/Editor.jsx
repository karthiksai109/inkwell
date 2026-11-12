import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, Star, Trash2, Tag, CalendarDays } from 'lucide-react'
import { useJournal, MOODS } from '../store.jsx'

export default function Editor({ entry, onClose }) {
  const { dispatch, settings, entries } = useJournal()
  const liveEntry = entries.find((e) => e.id === entry?.id) || entry
  const [date, setDate] = useState(entry?.date || new Date().toISOString().slice(0, 10))
  const [title, setTitle] = useState(entry?.title || '')
  const [body, setBody] = useState(entry?.body || '')
  const [mood, setMood] = useState(entry?.mood || null)
  const [tags, setTags] = useState(entry?.tags || [])
  const [tagInput, setTagInput] = useState('')
  const [showTags, setShowTags] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [saved, setSaved] = useState(false)
  const idRef = useRef(entry?.id || null)
  const bodyRef = useRef(null)

  useEffect(() => {
    bodyRef.current?.focus()
  }, [])

  // autosave (debounced) — writing is never lost
  useEffect(() => {
    if (!title.trim() && !body.trim()) return
    const t = setTimeout(() => {
      if (idRef.current) {
        dispatch({ type: 'UPDATE_ENTRY', id: idRef.current, patch: { date, title, body, mood, tags } })
      } else {
        const id = crypto.randomUUID()
        idRef.current = id
        dispatch({ type: 'ADD_ENTRY', id, date, title, body, mood, tags })
      }
      setSaved(true)
      const s = setTimeout(() => setSaved(false), 1200)
      return () => clearTimeout(s)
    }, 600)
    return () => clearTimeout(t)
  }, [date, title, body, mood, tags, dispatch])

  const addTag = () => {
    const t = tagInput.trim().replace(/^#/, '').toLowerCase()
    if (t && !tags.includes(t)) setTags([...tags, t])
    setTagInput('')
  }

  const words = body.trim() ? body.trim().split(/\s+/).length : 0
  const sizeCls = { sm: 'text-base', md: 'text-lg', lg: 'text-xl' }[settings.fontSize]

  return (
    <div className="paper-grain min-h-dvh flex flex-col max-w-xl mx-auto w-full bg-paper-100 dark:bg-ink-900">
      <header className="safe-top sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-paper-100/90 dark:bg-ink-900/90 backdrop-blur border-b border-paper-200 dark:border-ink-500/20">
        <button
          onClick={onClose}
          className="flex items-center gap-1 text-sm text-ink-500 dark:text-paper-200/70 active:scale-95"
        >
          <ChevronLeft size={18} /> Done
        </button>
        <span className={`text-xs text-ink-300 transition-opacity ${saved ? 'opacity-100' : 'opacity-0'}`}>
          saved
        </span>
        <div className="flex items-center gap-1">
          {idRef.current && (
            <>
              <button
                onClick={() => dispatch({ type: 'TOGGLE_FAVORITE', id: idRef.current })}
                className="p-2 text-ink-300 active:scale-90"
                aria-label="Favorite"
              >
                <Star
                  size={19}
                  className={liveEntry?.favorite ? 'text-accent fill-accent' : 'dark:text-paper-200/50'}
                />
              </button>
              <button
                onClick={() => setConfirmDelete(true)}
                className="p-2 text-ink-300 dark:text-paper-200/50 active:scale-90"
                aria-label="Delete"
              >
                <Trash2 size={19} />
              </button>
            </>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 pt-5 pb-40 space-y-5">
        <div className="flex items-center gap-2 text-ink-300 dark:text-paper-200/40">
          <CalendarDays size={15} />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-transparent text-sm font-medium"
          />
        </div>

        <div className="flex gap-2.5">
          {MOODS.map((m) => (
            <button
              key={m.id}
              onClick={() => setMood(mood === m.id ? null : m.id)}
              className={`h-11 w-11 rounded-2xl text-xl flex items-center justify-center border transition-all active:scale-90 ${
                mood === m.id
                  ? 'bg-paper-50 dark:bg-ink-700 border-accent shadow-sm scale-110'
                  : 'border-transparent opacity-60'
              }`}
              aria-label={m.label}
            >
              {m.emoji}
            </button>
          ))}
        </div>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Give today a title…"
          className="w-full bg-transparent font-serif text-3xl leading-tight placeholder:text-ink-300/50 dark:placeholder:text-paper-200/25"
        />

        <textarea
          ref={bodyRef}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Start writing. Nobody is watching."
          rows={14}
          className={`w-full bg-transparent font-serif ${sizeCls} leading-relaxed placeholder:text-ink-300/40 dark:placeholder:text-paper-200/20 resize-none [field-sizing:content]`}
        />
      </div>

      <footer className="safe-bottom fixed bottom-0 inset-x-0 z-10">
        <div className="max-w-xl mx-auto px-4 pb-3">
          <div className="rounded-2xl bg-paper-50/95 dark:bg-ink-700/95 backdrop-blur border border-paper-200 dark:border-ink-500/30 shadow-lg px-4 py-2.5 flex items-center justify-between">
            <span className="text-xs text-ink-300 dark:text-paper-200/50">{words} words</span>
            <button
              onClick={() => setShowTags(!showTags)}
              className={`flex items-center gap-1.5 text-xs font-medium ${
                tags.length ? 'text-accent' : 'text-ink-500 dark:text-paper-200/60'
              }`}
            >
              <Tag size={14} /> {tags.length ? tags.map((t) => '#' + t).join(' ') : 'Add tags'}
            </button>
          </div>
          {showTags && (
            <div className="mt-2 rounded-2xl bg-paper-50 dark:bg-ink-700 border border-paper-200 dark:border-ink-500/30 shadow-lg p-3 space-y-2 animate-fade-up">
              <div className="flex gap-2 flex-wrap">
                {tags.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTags(tags.filter((x) => x !== t))}
                    className="text-xs rounded-full bg-paper-200 dark:bg-ink-500/40 px-2.5 py-1"
                  >
                    #{t} ✕
                  </button>
                ))}
              </div>
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTag()}
                onBlur={addTag}
                placeholder="Type a tag and press enter"
                className="w-full bg-paper-100 dark:bg-ink-900 rounded-xl px-3 py-2 text-sm border border-paper-200 dark:border-ink-500/30"
              />
            </div>
          )}
        </div>
      </footer>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-ink-900/50 backdrop-blur-sm flex items-end justify-center p-4">
          <div className="animate-fade-up w-full max-w-sm rounded-3xl bg-paper-50 dark:bg-ink-700 p-6 space-y-4 safe-bottom">
            <p className="font-serif text-lg">Tear out this page?</p>
            <p className="text-sm text-ink-500 dark:text-paper-200/60">
              This entry will be gone for good.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 rounded-full py-2.5 text-sm border border-paper-200 dark:border-ink-500/40"
              >
                Keep it
              </button>
              <button
                onClick={() => {
                  dispatch({ type: 'DELETE_ENTRY', id: idRef.current })
                  onClose()
                }}
                className="flex-1 rounded-full py-2.5 text-sm bg-accent text-paper-50 font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
