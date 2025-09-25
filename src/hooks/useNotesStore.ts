import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Note, NoteId } from '../types'

const LS_KEY = 'sticky-notes-v1'

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}

export function useNotesStore() {
  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (raw) return JSON.parse(raw) as Note[]
    } catch {}
    return []
  })

  const nextZ = useRef(1)

  useEffect(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(notes)) } catch {}
  }, [notes])

  const bringToFront = useCallback((id: NoteId) => {
    const z = ++nextZ.current
    setNotes(ns => ns.map(n => (n.id === id ? { ...n, z } : n)))
  }, [])

  const create = useCallback((x: number, y: number, w: number, h: number, color?: string) => {
    const z = ++nextZ.current
    const minW = 120, minH = 100
    const note: Note = {
      id: uid(),
      x, y,
      w: Math.max(minW, w),
      h: Math.max(minH, h),
      z,
      color: color ?? randomColor(),
      text: ''
    }
    setNotes(ns => [...ns, note])
    return note.id
  }, [])

  const update = useCallback((id: NoteId, patch: Partial<Note>) => {
    setNotes(ns => ns.map(n => (n.id === id ? { ...n, ...patch } : n)))
  }, [])

  const moveBy = useCallback((id: NoteId, dx: number, dy: number, bounds?: DOMRect) => {
    setNotes(ns => ns.map(n => {
      if (n.id !== id) return n
      let x = n.x + dx
      let y = n.y + dy
      if (bounds) {
        x = clamp(x, 0, Math.max(0, bounds.width - n.w))
        y = clamp(y, 0, Math.max(0, bounds.height - n.h))
      }
      return { ...n, x, y }
    }))
  }, [])

  const resizeTo = useCallback((id: NoteId, x: number, y: number, w: number, h: number, bounds?: DOMRect) => {
    const minW = 120, minH = 80
    setNotes(ns => ns.map(n => {
      if (n.id !== id) return n
      let nx = x, ny = y, nw = Math.max(minW, w), nh = Math.max(minH, h)
      if (bounds) {
        nx = clamp(nx, 0, bounds.width - minW)
        ny = clamp(ny, 0, bounds.height - minH)
        nw = clamp(nw, minW, bounds.width - nx)
        nh = clamp(nh, minH, bounds.height - ny)
      }
      return { ...n, x: nx, y: ny, w: nw, h: nh }
    }))
  }, [])

  const remove = useCallback((id: NoteId) => {
    setNotes(ns => ns.filter(n => n.id !== id))
  }, [])

  const api = useMemo(() => ({
    notes, create, update, moveBy, resizeTo, remove, bringToFront
  }), [notes, create, update, moveBy, resizeTo, remove, bringToFront])

  return api
}

function randomColor() {
  // pleasant pastel-ish header colors
  const colors = ['#fef08a', '#a7f3d0', '#bfdbfe', '#fecaca', '#fde68a', '#ddd6fe', '#fbcfe8']
  return colors[Math.floor(Math.random() * colors.length)]
}
