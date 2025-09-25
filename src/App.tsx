import { useMemo, useRef, useState } from 'react'
import './styles.css'
import { useNotesStore } from './hooks/useNotesStore'
import Canvas from './components/Canvas'
import TrashZone from './components/TrashZone'

export default function App() {
  const store = useNotesStore()
  const trashRef = useRef<HTMLDivElement>(null) // fine now
  const [trashHot, setTrashHot] = useState(false)

  const addQuick = () => {
    // center a default note quickly
    const W = 240, H = 180
    const canvas = document.querySelector('.canvas') as HTMLElement | null
    let x = 40, y = 40
    if (canvas) {
      const r = canvas.getBoundingClientRect()
      x = Math.max(0, r.width / 2 - W / 2)
      y = Math.max(0, r.height / 2 - H / 2)
    }
    store.create(x, y, W, H)
  }

  const clearAll = () => {
    if (confirm('Delete all notes?')) {
      store.notes.forEach(n => store.remove(n.id))
    }
  }

  const count = store.notes.length
  const info = useMemo(() => `${count} note${count === 1 ? '' : 's'}`, [count])

  return (
    <div className="app">
      <div className="toolbar" role="toolbar" aria-label="Tools">
        <button onClick={addQuick}>+ New note</button>
        <button onClick={clearAll} disabled={count === 0}>Clear all</button>
        <span className="hint">
          Tip: click-drag on empty canvas to create a note with custom size & position.
        </span>
        <span aria-live="polite" style={{ marginLeft: 8, fontWeight: 600 }}>{info}</span>
      </div>

      <Canvas
        notes={store.notes}
        store={store}
        trashRef={trashRef}    // no type error anymore
        setTrashHot={setTrashHot}
      />

      <TrashZone ref={trashRef} hot={trashHot} />
    </div>
  )
}
