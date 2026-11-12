import { useEffect, useState } from 'react'
import { useJournal } from './store.jsx'
import Home from './views/Home.jsx'
import Editor from './views/Editor.jsx'
import Insights from './views/Insights.jsx'
import Settings from './views/Settings.jsx'
import LockScreen from './components/LockScreen.jsx'
import TabBar from './components/TabBar.jsx'

export default function App() {
  const { settings } = useJournal()
  const [view, setView] = useState('home') // home | insights | settings
  const [editing, setEditing] = useState(null) // null | 'new' | entry object
  const [locked, setLocked] = useState(settings.pinLock)

  useEffect(() => {
    const root = document.documentElement
    const apply = (dark) => root.classList.toggle('dark', dark)
    if (settings.theme === 'auto') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      apply(mq.matches)
      const fn = (e) => apply(e.matches)
      mq.addEventListener('change', fn)
      return () => mq.removeEventListener('change', fn)
    }
    apply(settings.theme === 'dark')
  }, [settings.theme])

  useEffect(() => {
    if (!settings.pinLock) setLocked(false)
  }, [settings.pinLock])

  if (locked) return <LockScreen onUnlock={() => setLocked(false)} />

  if (editing) {
    return (
      <Editor
        entry={editing === 'new' ? null : editing}
        onClose={() => setEditing(null)}
      />
    )
  }

  return (
    <div className="paper-grain min-h-dvh flex flex-col max-w-xl mx-auto w-full">
      <main className="flex-1 pb-24">
        {view === 'home' && <Home onNew={() => setEditing('new')} onEdit={setEditing} />}
        {view === 'insights' && <Insights />}
        {view === 'settings' && <Settings />}
      </main>
      <TabBar view={view} onNavigate={setView} onNew={() => setEditing('new')} />
    </div>
  )
}
