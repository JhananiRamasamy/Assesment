import { useEffect, useMemo, useRef, useState } from 'react'
import Note from './Note'
import type { Pointer } from '../types'

type CreateState =
  | { kind: 'idle' }
  | { kind: 'creating'; start: Pointer; cur: Pointer; color: string }

type Props = {
  notes: ReturnType<typeof import('../hooks/useNotesStore').useNotesStore>['notes']
  store: ReturnType<typeof import('../hooks/useNotesStore').useNotesStore>
  trashRef: React.RefObject<HTMLDivElement | null>
  setTrashHot: (v: boolean) => void
}

export default function Canvas({ notes, store, trashRef, setTrashHot }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [creating, setCreating] = useState<CreateState>({ kind: 'idle' })

  const bounds = ref.current?.getBoundingClientRect() ?? null

  // Create new note by just dragging on empty space
  useEffect(() => {
    const el = ref.current
    if (!el) return

    let creatingLocal = false

    function toLocal(e: PointerEvent): Pointer {
      const r = el!.getBoundingClientRect()
      return { x: e.clientX - r.left, y: e.clientY - r.top }
    }

    function down(e: PointerEvent) {
      if (e.target !== el) return
      creatingLocal = true
      const p = toLocal(e)
      setCreating({ kind: 'creating', start: p, cur: p, color: randomColor() })
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    }

    function move(e: PointerEvent) {
      if (!creatingLocal) return
      setCreating(s => s.kind === 'creating' ? ({ ...s, cur: toLocal(e) }) : s)
    }

    function up() {
      if (creatingLocal) {
        setCreating(s => {
          if (s.kind !== 'creating') return { kind: 'idle' }
          const x = Math.min(s.start.x, s.cur.x)
          const y = Math.min(s.start.y, s.cur.y)
          const w = Math.abs(s.cur.x - s.start.x)
          const h = Math.abs(s.cur.y - s.start.y)
          if (w > 8 && h > 8) {
            // assign random color per note
            store.create(x, y, w, h, s.color)
          }
          return { kind: 'idle' }
        })
      }
      creatingLocal = false
    }

    el.addEventListener('pointerdown', down)
    el.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    return () => {
      el.removeEventListener('pointerdown', down)
      el.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
  }, [store])

  // Handle dragging notes → trash
  const [draggingId, setDraggingId] = useState<string | null>(null)
  useEffect(() => {
    if (!draggingId) return
    const onMove = (e: PointerEvent) => {
      const trash = trashRef.current
      if (!trash) return
      const tr = trash.getBoundingClientRect()
      const inside =
        e.clientX >= tr.left &&
        e.clientX <= tr.right &&
        e.clientY >= tr.top &&
        e.clientY <= tr.bottom
      setTrashHot(inside)
    }
    const onUp = (e: PointerEvent) => {
      const trash = trashRef.current
      if (trash && draggingId) {
        const tr = trash.getBoundingClientRect()
        const inside =
          e.clientX >= tr.left &&
          e.clientX <= tr.right &&
          e.clientY >= tr.top &&
          e.clientY <= tr.bottom
        if (inside) {
          store.remove(draggingId)
        }
      }
      setTrashHot(false)
      setDraggingId(null)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [draggingId, setTrashHot, store, trashRef])

  const rubber = useMemo(() => {
    if (creating.kind !== 'creating') return null
    const x = Math.min(creating.start.x, creating.cur.x)
    const y = Math.min(creating.start.y, creating.cur.y)
    const w = Math.abs(creating.cur.x - creating.start.x)
    const h = Math.abs(creating.cur.y - creating.start.y)
    return { x, y, w, h, color: creating.color }
  }, [creating])

  return (
    <div ref={ref} className="canvas" aria-label="Canvas">
      {rubber && (
        <div
          className="rubberband"
          style={{
            left: rubber.x,
            top: rubber.y,
            width: rubber.w,
            height: rubber.h,
            background: 'rgba(37,99,235,0.08)',
            borderColor: 'var(--accent)'
          }}
        />
      )}

      {notes.map(n => (
        <Note
          key={n.id}
          data={n}
          bounds={bounds}
          onPointerDown={(id) => store.bringToFront(id)}
          onMove={(id, dx, dy) => store.moveBy(id, dx, dy, bounds ?? undefined)}
          onResize={(id, x, y, w, h) => store.resizeTo(id, x, y, w, h, bounds ?? undefined)}
          onChangeText={(id, text) => store.update(id, { text })}
          onChangeColor={(id, color) => store.update(id, { color })} // color change works
          onDragStart={(id) => setDraggingId(id)}
          onDragEnd={() => {}}
          setDraggingMeta={() => {}}
        />
      ))}
    </div>
  )
}

function randomColor(): string {
  const colors = ['#fef08a', '#a7f3d0', '#bfdbfe', '#fecaca', '#fde68a', '#ddd6fe', '#fbcfe8']
  return colors[Math.floor(Math.random() * colors.length)] ?? '#fef08a'
}
