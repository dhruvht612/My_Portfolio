import { memo } from 'react'
import { DTMark } from './shared'

/* The fixed furniture around the scroll: the WebGL host, Kage's vignette and
   grain passes, the cursor ring, the boot screen and the scene rail. The
   engine writes into these (canvas, progress, rail buttons), so the component
   takes no props and never re-renders. */
function FuturisticHUD() {
  return (
    <>
      <div className="gl-host" aria-hidden="true" />
      <div id="vignette" aria-hidden="true" />
      <div id="grain" aria-hidden="true" />
      <div className="cur-dot" id="cursor" aria-hidden="true" />
      <div id="pre" aria-hidden="true">
        <div className="pre-in">
          <div className="pre-mark"><DTMark size={46} /></div>
          <div className="pre-sys">DHRUV THAKAR // AI SYSTEM</div>
          <div className="pre-bar"><i id="pre-fill" /></div>
          <div className="pre-meta">
            <span id="pre-label">Initializing</span>
            <b><span id="pre-pct">0</span>%</b>
          </div>
        </div>
      </div>
      <nav className="rail" id="rail" aria-label="Scenes" />
    </>
  )
}

export default memo(FuturisticHUD)
