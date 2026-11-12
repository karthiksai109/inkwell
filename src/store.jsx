import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'

const STORAGE_KEY = 'inkwell.v1'

const DEFAULT_SETTINGS = {
  name: '',
  theme: 'auto', // auto | light | dark
  pinLock: false,
  pin: '',
  reminderTime: '',
  fontSize: 'md' // sm | md | lg
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const data = JSON.parse(raw)
      return {
        entries: Array.isArray(data.entries) ? data.entries : [],
        settings: { ...DEFAULT_SETTINGS, ...(data.settings || {}) }
      }
    }
  } catch {
    /* corrupted storage -> start fresh */
  }
  return { entries: [], settings: { ...DEFAULT_SETTINGS } }
}

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_ENTRY': {
      const entry = {
        id: action.id || crypto.randomUUID(),
        date: action.date || new Date().toISOString().slice(0, 10),
        title: action.title || '',
        body: action.body || '',
        mood: action.mood || null,
        tags: action.tags || [],
        favorite: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
      return { ...state, entries: [entry, ...state.entries] }
    }
    case 'UPDATE_ENTRY': {
      return {
        ...state,
        entries: state.entries.map((e) =>
          e.id === action.id ? { ...e, ...action.patch, updatedAt: Date.now() } : e
        )
      }
    }
    case 'DELETE_ENTRY':
      return { ...state, entries: state.entries.filter((e) => e.id !== action.id) }
    case 'TOGGLE_FAVORITE':
      return {
        ...state,
        entries: state.entries.map((e) =>
          e.id === action.id ? { ...e, favorite: !e.favorite } : e
        )
      }
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.patch } }
    case 'IMPORT_ENTRIES': {
      const existing = new Set(state.entries.map((e) => e.id))
      const merged = [...state.entries]
      for (const e of action.entries) {
        if (e && e.id && !existing.has(e.id)) merged.push(e)
      }
      merged.sort((a, b) => b.createdAt - a.createdAt)
      return { ...state, entries: merged }
    }
    default:
      return state
  }
}

const JournalContext = createContext(null)

export function JournalProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, load)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const value = useMemo(() => ({ ...state, dispatch }), [state])
  return <JournalContext.Provider value={value}>{children}</JournalContext.Provider>
}

export function useJournal() {
  return useContext(JournalContext)
}

export const MOODS = [
  { id: 'radiant', emoji: '😁', label: 'Radiant', color: '#e9a319' },
  { id: 'good', emoji: '🙂', label: 'Good', color: '#7ca268' },
  { id: 'okay', emoji: '😐', label: 'Okay', color: '#8b93a1' },
  { id: 'low', emoji: '😔', label: 'Low', color: '#6f7fb5' },
  { id: 'heavy', emoji: '💧', label: 'Heavy', color: '#9b6b9e' }
]

export function getStreak(entries) {
  const days = new Set(entries.map((e) => e.date))
  let streak = 0
  const d = new Date()
  // today counts if written; otherwise start from yesterday so the streak isn't lost mid-day
  if (!days.has(d.toISOString().slice(0, 10))) d.setDate(d.getDate() - 1)
  while (days.has(d.toISOString().slice(0, 10))) {
    streak++
    d.setDate(d.getDate() - 1)
  }
  return streak
}

export function exportAsJson(entries) {
  return JSON.stringify({ exportedAt: new Date().toISOString(), entries }, null, 2)
}

export function exportAsMarkdown(entries) {
  return [...entries]
    .sort((a, b) => a.createdAt - b.createdAt)
    .map((e) => {
      const mood = MOODS.find((m) => m.id === e.mood)
      const tags = e.tags.length ? `\nTags: ${e.tags.map((t) => '#' + t).join(' ')}` : ''
      return `# ${e.title || 'Untitled'}\n\n_${e.date}${mood ? ` — ${mood.label}` : ''}_${tags}\n\n${e.body}\n\n---`
    })
    .join('\n\n')
}
