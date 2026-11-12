import { BookOpenText, LineChart, Settings2, Plus } from 'lucide-react'

const TABS = [
  { id: 'home', icon: BookOpenText, label: 'Journal' },
  { id: 'insights', icon: LineChart, label: 'Insights' },
  { id: 'settings', icon: Settings2, label: 'Settings' }
]

export default function TabBar({ view, onNavigate, onNew }) {
  return (
    <nav className="safe-bottom fixed bottom-0 inset-x-0 z-40">
      <div className="max-w-xl mx-auto px-6 pb-3 pt-1">
        <div className="relative flex items-center justify-between rounded-3xl bg-paper-50/90 dark:bg-ink-700/90 backdrop-blur border border-paper-200 dark:border-ink-500/30 shadow-lg shadow-ink-900/10 px-6 py-2">
          {TABS.slice(0, 1).map(renderTab)}
          <button
            onClick={onNew}
            aria-label="New entry"
            className="relative -mt-7 h-14 w-14 rounded-full bg-accent text-paper-50 shadow-lg shadow-accent/40 flex items-center justify-center active:scale-90 transition-transform"
          >
            <Plus size={26} strokeWidth={2.5} />
          </button>
          {TABS.slice(1).map(renderTab)}
        </div>
      </div>
    </nav>
  )

  function renderTab({ id, icon: Icon, label }) {
    const active = view === id
    return (
      <button
        key={id}
        onClick={() => onNavigate(id)}
        className={`flex flex-col items-center gap-0.5 px-3 py-1 transition-colors ${
          active ? 'text-accent' : 'text-ink-300 dark:text-paper-200/50'
        }`}
      >
        <Icon size={22} strokeWidth={active ? 2.4 : 1.8} />
        <span className="text-[10px] font-medium">{label}</span>
      </button>
    )
  }
}
