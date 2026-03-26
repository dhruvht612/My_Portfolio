import { GlowingShadow } from "./glowing-shadow"

export default function DemoGlowingShadow() {
  return (
    <div className="flex items-center justify-center p-8">
      <GlowingShadow>
        <span className="pointer-events-none z-10 m-8 text-center text-4xl md:text-6xl leading-none font-semibold tracking-tighter text-white">
          Glowing Shadow
        </span>
      </GlowingShadow>
    </div>
  )
}
