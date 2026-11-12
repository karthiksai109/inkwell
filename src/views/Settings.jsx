import { useRef, useState } from 'react'
import { Sun, Moon, Smartphone, Lock, Download, Upload, Trash2, Type } from 'lucide-react'
import { useJournal, exportAsJson, exportAsMarkdown } from '../store.jsx'

export default function Settings() {
  const { settings, entries, dispatch } = useJournal()
  const fileRef = useRef(null)
  const [pinDraft, setPinDraft] = useState('')
  const [confirmWipe, setConfirmWipe] = useState(false)
  const [msg, setMsg] = useState('')

  const say = (m) => {
    setMsg(m)
    setTimeout(() => setMsg(''), 2200)
  }

  const download = (content, name, type) => {
    const url = URL.createObjectURL(new Blob([content], { type }))
    const a = document.createElement('a')
    a.href = url
    a.download = name
    a.click()
    URL.revokeObjectURL(url)
  }

  const importFile = (file) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result)
        const list = Array.isArray(data) ? data : data.entries
        if (!Array.isArray(list)) throw new Error()
        dispatch({ type: 'IMPORT_ENTRIES', entries: list })
        say(`Imported ${list.length} entries`)
      } catch {
        say('That file did not look like an Inkwell export')
      }
    }
    reader.readAsText(file)
  }

  const setPin = () => {
    if (/^\d{4}$/.test(pinDraft)) {
      dispatch({ type: 'UPDATE_SETTINGS', patch: { pinLock: true, pin: pinDraft } })
      setPinDraft('')
      say('PIN lock turned on')
    } else say('PIN must be exactly 4 digits')
  }

  return (
    <div className="safe-top px-5 pt-6 pb-4 space-y-6">
      <header className="animate-fade-up">
        <p className="text-xs uppercase tracking-[0.2em] text-ink-300 dark:text-paper-200/40">Yours</p>
        <h1 className="font-serif text-3xl">Make it your own</h1>
      </header>

      {msg && (
        <p className="animate-fade-in fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded-full bg-ink-900 text-paper-100 dark:bg-paper-100 dark:text-ink-900 px-4 py-2 text-sm shadow-lg">
          {msg}
        </p>
      )}

      <Section title="About you">
        <label className="block text-sm text-ink-500 dark:text-paper-200/60 mb-1.5">
          What should Inkwell call you?
        </label>
        <input
          value={settings.name}
          onChange={(e) => dispatch({ type: 'UPDATE_SETTINGS', patch: { name: e.target.value } })}
          placeholder="Your name"
          className="w-full rounded-2xl bg-paper-100 dark:bg-ink-900 border border-paper-200 dark:border-ink-500/30 px-4 py-2.5 text-sm"
        />
      </Section>

      <Section title="Feel">
        <Row label="Theme" icon={Sun}>
          <Segmented
            value={settings.theme}
            onChange={(v) => dispatch({ type: 'UPDATE_SETTINGS', patch: { theme: v } })}
            options={[
              { v: 'light', icon: Sun, label: 'Light' },
              { v: 'auto', icon: Smartphone, label: 'Auto' },
              { v: 'dark', icon: Moon, label: 'Dark' }
            ]}
          />
        </Row>
        <Row label="Writing size" icon={Type}>
          <Segmented
            value={settings.fontSize}
            onChange={(v) => dispatch({ type: 'UPDATE_SETTINGS', patch: { fontSize: v } })}
            options={[
              { v: 'sm', label: 'S' },
              { v: 'md', label: 'M' },
              { v: 'lg', label: 'L' }
            ]}
          />
        </Row>
      </Section>

      <Section title="Privacy">
        <Row label="PIN lock" icon={Lock}>
          {settings.pinLock ? (
            <button
              onClick={() => dispatch({ type: 'UPDATE_SETTINGS', patch: { pinLock: false, pin: '' } })}
              className="text-sm text-accent font-medium"
            >
              Turn off
            </button>
          ) : (
            <div className="flex gap-2">
              <input
                value={pinDraft}
                onChange={(e) => setPinDraft(e.target.value.replace(/\D/g, '').slice(0, 4))}
                inputMode="numeric"
                placeholder="4 digits"
                className="w-24 rounded-xl bg-paper-100 dark:bg-ink-900 border border-paper-200 dark:border-ink-500/30 px-3 py-1.5 text-sm text-center tracking-widest"
              />
              <button onClick={setPin} className="text-sm text-accent font-medium">
                Set
              </button>
            </div>
          )}
        </Row>
        <p className="text-xs text-ink-300 dark:text-paper-200/40">
          Everything stays on this device. No account, no cloud, no tracking.
        </p>
      </Section>

      <Section title="Your words">
        <div className="grid grid-cols-2 gap-2">
          <ActionButton
            icon={Download}
            label="Export JSON"
            onClick={() => download(exportAsJson(entries), 'inkwell-backup.json', 'application/json')}
          />
          <ActionButton
            icon={Download}
            label="Export Markdown"
            onClick={() => download(exportAsMarkdown(entries), 'inkwell-entries.md', 'text/markdown')}
          />
          <ActionButton icon={Upload} label="Import backup" onClick={() => fileRef.current?.click()} />
          <button
            onClick={() => setConfirmWipe(true)}
            className="flex items-center justify-center gap-2 rounded-2xl border border-accent/40 text-accent px-3 py-3 text-sm active:scale-[0.97]"
          >
            <Trash2 size={15} /> Erase all
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => e.target.files[0] && importFile(e.target.files[0])}
        />
      </Section>

      <p className="text-center text-xs text-ink-300 dark:text-paper-200/40 pb-2">
        Inkwell · written by hand, kept by you
      </p>

      {confirmWipe && (
        <div className="fixed inset-0 z-50 bg-ink-900/50 backdrop-blur-sm flex items-end justify-center p-4">
          <div className="animate-fade-up w-full max-w-sm rounded-3xl bg-paper-50 dark:bg-ink-700 p-6 space-y-4 safe-bottom">
            <p className="font-serif text-lg">Burn the whole journal?</p>
            <p className="text-sm text-ink-500 dark:text-paper-200/60">
              Every entry will be erased from this device. Export a backup first if you're unsure.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmWipe(false)}
                className="flex-1 rounded-full py-2.5 text-sm border border-paper-200 dark:border-ink-500/40"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  entries.forEach((e) => dispatch({ type: 'DELETE_ENTRY', id: e.id }))
                  setConfirmWipe(false)
                  say('Journal erased')
                }}
                className="flex-1 rounded-full py-2.5 text-sm bg-accent text-paper-50 font-medium"
              >
                Erase everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Section({ title, children }) {
  return (
    <section className="animate-fade-up rounded-3xl bg-paper-50 dark:bg-ink-700 border border-paper-200 dark:border-ink-500/30 p-5 space-y-4">
      <h2 className="text-sm font-semibold">{title}</h2>
      {children}
    </section>
  )
}

function Row({ label, icon: Icon, children }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-2 text-sm text-ink-500 dark:text-paper-200/70">
        <Icon size={15} /> {label}
      </span>
      {children}
    </div>
  )
}

function Segmented({ value, onChange, options }) {
  return (
    <div className="flex rounded-full bg-paper-200/70 dark:bg-ink-900 p-1">
      {options.map(({ v, icon: Icon, label }) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            value === v
              ? 'bg-paper-50 dark:bg-ink-700 shadow-sm text-ink-900 dark:text-paper-100'
              : 'text-ink-300 dark:text-paper-200/40'
          }`}
        >
          {Icon && <Icon size={13} />} {label}
        </button>
      ))}
    </div>
  )
}

function ActionButton({ icon: Icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center gap-2 rounded-2xl border border-paper-200 dark:border-ink-500/30 bg-paper-100 dark:bg-ink-900 px-3 py-3 text-sm active:scale-[0.97]"
    >
      <Icon size={15} /> {label}
    </button>
  )
}
