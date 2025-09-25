import { forwardRef } from "react";

type Props = {
  hot: boolean
}

const TrashZone = forwardRef<HTMLDivElement, Props>(({ hot }, ref) => {
  return (
    <div ref={ref} className={`trash ${hot ? "hot" : ""}`}>
      {hot ? "Drop to Delete" : "Trash Bin"}
    </div>
  )
})

export default TrashZone
