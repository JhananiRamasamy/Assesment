// A simple pointer (mouse/touch position) used for dragging/resizing
export type Pointer = {
  x: number
  y: number
}

// A sticky note's data structure
export type NoteData = {
  id: string        // unique identifier
  x: number         // top-left corner X position
  y: number         // top-left corner Y position
  w: number         // width
  h: number         // height
  z: number         // z-index (for layering)
  text: string      // note content
  color: string     // background color
}
