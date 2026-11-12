import { useState } from 'react'
import { useJournal } from '../store.jsx'
import { Feather } from 'lucide-react'

export default function LockScreen({ onUnlock }) {
  const { settings } = useJournal()
  const [pin, setPin] = useState('')
  const [shake, setShake] = useState(false)

  const press = (d) => {
    const next = pin + d
    setPin(next)
    if (next.length === 4) {
      if (next === settings.pin) onUnlock()
      else {
        setShake(true)
        setTimeout(() => {
          setPin('')
          setShake(false)
        }, 400)
      }
    }
  }

  return (
    <div className="paper-grain min-h-dvh flex flex-col items-center justify-center gap-8 bg-paper-100 dark:bg-ink-900">
      <div className="flex flex-col items-center gap-3">
        <div className="h-14 w-14 rounded-2xl bg-ink-900 dark:bg-paper-100 text-paper-100 dark:text-ink-900 flex items-center justify-center">
          <Feather size={26} />
        </div>
        <h1 className="font-serif text-2xl">Inkwell is closed</h1>
        <p className="text-sm text-ink-300">Enter your PIN to open your journal</p>
      </div>
      <div className={`flex gap-3 ${shake ? 'animate-pulse' : ''}`}>
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`h-3.5 w-3.5 rounded-full border-2 border-ink-500 transition-colors ${
              pin.length > i ? 'bg-accent border-accent' : 'bg-transparent'
            }`}
          />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, '⌫'].map((k, i) =>
          k === '' ? (
            <span key={i} />
          ) : (
            <button
              key={i}
              onClick={() => (k === '⌫' ? setPin(pin.slice(0, -1)) : press(String(k)))}
              className="h-16 w-16 rounded-full bg-paper-50 dark:bg-ink-700 text-xl font-medium shadow-sm border border-paper-200 dark:border-ink-500/30 active:scale-90 transition-transform"
            >
              {k}
            </button>
          )
        )}
      </div>
    </div>
  )
}
