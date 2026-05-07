import { GripVertical } from 'lucide-react'
import { Reorder, useDragControls } from 'framer-motion'

/**
 * @param {{ id: string, children: import('react').ReactNode }} props
 */
export function DashboardReorderItem({ id, children }) {
  const dragControls = useDragControls()

  return (
    <Reorder.Item value={id} dragListener={false} dragControls={dragControls} className="relative">
      <button
        type="button"
        aria-label="Reorder section"
        title="Drag to reorder"
        onPointerDown={(e) => dragControls.start(e)}
        className="absolute right-3 top-6 z-20 flex h-10 w-10 cursor-grab items-center justify-center rounded-xl border border-white/[0.09] bg-[rgba(5,11,22,0.75)] text-slate-500 shadow-lg backdrop-blur-md transition hover:border-sky-400/30 hover:bg-white/[0.06] hover:text-slate-300 active:cursor-grabbing md:right-6"
      >
        <GripVertical className="h-[18px] w-[18px]" aria-hidden />
      </button>
      {children}
    </Reorder.Item>
  )
}

/** @param {{ order: string[], onReorder: (next: string[]) => void, children: import('react').ReactNode }} props */
export function DashboardReorderGroup({ order, onReorder, children }) {
  return (
    <Reorder.Group axis="y" values={order} onReorder={onReorder} className="flex flex-col gap-10">
      {children}
    </Reorder.Group>
  )
}
