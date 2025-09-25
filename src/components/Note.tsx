import { useState } from "react"
import type { NoteData } from "../types"

type Props = {
  data: NoteData
  bounds: DOMRect | null
  onPointerDown: (id: string) => void
  onMove: (id: string, dx: number, dy: number) => void
  onResize: (id: string, x: number, y: number, w: number, h: number) => void
  onChangeText: (id: string, text: string) => void
  onChangeColor: (id: string, color: string) => void
  onDragStart: (id: string) => void
  onDragEnd: () => void
  setDraggingMeta: (meta: any) => void
}

export default function Note({
  data,
  onPointerDown,
  onMove,
  onChangeText,
  onChangeColor,
  onDragStart,
  onDragEnd,
}: Props) {
  const [dragging, setDragging] = useState(false)

  function handlePointerDown(e: React.PointerEvent) {
    if (e.button !== 0) return
    onPointerDown(data.id)
    onDragStart(data.id)
    setDragging(true)

    const startX = e.clientX
    const startY = e.clientY

    function move(ev: PointerEvent) {
      const dx = ev.clientX - startX
      const dy = ev.clientY - startY
      onMove(data.id, dx, dy)
    }

    function up() {
      setDragging(false)
      onDragEnd()
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerup", up)
    }

    window.addEventListener("pointermove", move)
    window.addEventListener("pointerup", up)
  }

  return (
    <div
      className="note"
      style={{
        left: data.x,
        top: data.y,
        width: data.w,
        height: data.h,
        background: data.color,
        zIndex: data.z,
        transform: `rotate(${Math.floor(Math.random() * 5 - 2)}deg)`,
      }}
      onPointerDown={handlePointerDown}
    >
      <textarea
        value={data.text}
        placeholder="Write something..."
        onChange={(e) => onChangeText(data.id, e.target.value)}
      />
      <div className="footer">
        <button onClick={() => onChangeColor(data.id, "#fef08a")}>🟨</button>
        <button onClick={() => onChangeColor(data.id, "#a7f3d0")}>🟩</button>
        <button onClick={() => onChangeColor(data.id, "#bfdbfe")}>🟦</button>
        <button onClick={() => onChangeColor(data.id, "#fecaca")}>🟥</button>
      </div>
    </div>
  )
}
