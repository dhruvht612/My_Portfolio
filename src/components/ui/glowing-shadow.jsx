"use client"

/**
 * Vite React does not support <style jsx>, so this uses a normal <style> tag.
 * Class names are prefixed to keep styles isolated.
 */
const GLOWING_SHADOW_STYLES = `
@property --gs-hue { syntax: "<number>"; inherits: true; initial-value: 0; }
@property --gs-rotate { syntax: "<number>"; inherits: true; initial-value: 0; }
@property --gs-bg-y { syntax: "<number>"; inherits: true; initial-value: 0; }
@property --gs-bg-x { syntax: "<number>"; inherits: true; initial-value: 0; }
@property --gs-glow-translate-y { syntax: "<number>"; inherits: true; initial-value: 0; }
@property --gs-bg-size { syntax: "<number>"; inherits: true; initial-value: 0; }
@property --gs-glow-opacity { syntax: "<number>"; inherits: true; initial-value: 0; }
@property --gs-glow-blur { syntax: "<number>"; inherits: true; initial-value: 0; }
@property --gs-glow-scale { syntax: "<number>"; inherits: true; initial-value: 2; }
@property --gs-glow-radius { syntax: "<number>"; inherits: true; initial-value: 2; }
@property --gs-white-shadow { syntax: "<number>"; inherits: true; initial-value: 0; }

.gs-container {
  --gs-card-color: var(--color-bg, hsl(260deg 100% 3%));
  --gs-card-radius: 1rem;
  --gs-card-width: min(480px, 35vw);
  --gs-border-width: 3px;
  --gs-bg-size: 1;
  --gs-hue: 0;
  --gs-hue-speed: 1;
  --gs-rotate: 0;
  --gs-animation-speed: 4s;
  --gs-interaction-speed: 0.55s;
  --gs-glow-scale: 1.5;
  --gs-scale-factor: 1;
  --gs-glow-blur: 6;
  --gs-glow-opacity: 1;
  --gs-glow-radius: 100;
  --gs-glow-rotate-unit: 1deg;

  width: var(--gs-card-width);
  aspect-ratio: 1.5/1;
  margin: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;
  border-radius: var(--gs-card-radius);
}

.gs-container:before,
.gs-container:after {
  content: "";
  display: block;
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: var(--gs-card-radius);
}

.gs-content {
  position: absolute;
  background: var(--gs-card-color);
  border-radius: calc(var(--gs-card-radius) * 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: calc(var(--gs-card-width) / 8);
}

.gs-content:before {
  content: "";
  display: block;
  position: absolute;
  width: calc(100% + var(--gs-border-width));
  height: calc(100% + var(--gs-border-width));
  border-radius: calc(var(--gs-card-radius) * 0.9);
  box-shadow: 0 0 20px black;
  mix-blend-mode: color-burn;
  z-index: -1;
  background: hsl(0deg 0% 16%) radial-gradient(
    30% 30% at calc(var(--gs-bg-x) * 1%) calc(var(--gs-bg-y) * 1%),
    hsl(calc(var(--gs-hue) * var(--gs-hue-speed) * 1deg) 100% 90%) calc(0% * var(--gs-bg-size)),
    hsl(calc(var(--gs-hue) * var(--gs-hue-speed) * 1deg) 100% 80%) calc(20% * var(--gs-bg-size)),
    hsl(calc(var(--gs-hue) * var(--gs-hue-speed) * 1deg) 100% 60%) calc(40% * var(--gs-bg-size)),
    transparent 100%
  );
  animation: gs-hue-animation var(--gs-animation-speed) linear infinite, gs-rotate-bg var(--gs-animation-speed) linear infinite;
  transition: --gs-bg-size var(--gs-interaction-speed) ease;
}

.gs-glow {
  --gs-glow-translate-y: 0;
  display: block;
  position: absolute;
  width: calc(var(--gs-card-width) / 5);
  height: calc(var(--gs-card-width) / 5);
  animation: gs-rotate var(--gs-animation-speed) linear infinite;
  transform: rotateZ(calc(var(--gs-rotate) * var(--gs-glow-rotate-unit)));
  transform-origin: center;
  border-radius: calc(var(--gs-glow-radius) * 10vw);
}

.gs-glow:after {
  content: "";
  display: block;
  z-index: -2;
  filter: blur(calc(var(--gs-glow-blur) * 10px));
  width: 130%;
  height: 130%;
  left: -15%;
  top: -15%;
  background: hsl(calc(var(--gs-hue) * var(--gs-hue-speed) * 1deg) 100% 60%);
  position: relative;
  border-radius: calc(var(--gs-glow-radius) * 10vw);
  animation: gs-hue-animation var(--gs-animation-speed) linear infinite;
  transform: scaleY(calc(var(--gs-glow-scale) * var(--gs-scale-factor) / 1.1))
    scaleX(calc(var(--gs-glow-scale) * var(--gs-scale-factor) * 1.2))
    translateY(calc(var(--gs-glow-translate-y) * 1%));
  opacity: var(--gs-glow-opacity);
}

.gs-container:hover .gs-content {
  mix-blend-mode: darken;
  box-shadow: 0 0 calc(var(--gs-white-shadow) * 1vw) calc(var(--gs-white-shadow) * 0.15vw) rgb(255 255 255 / 20%);
  animation: gs-shadow-pulse calc(var(--gs-animation-speed) * 2) linear infinite;
}

.gs-container:hover .gs-content:before { --gs-bg-size: 15; animation-play-state: paused; }
.gs-container:hover .gs-glow {
  --gs-glow-blur: 1.5;
  --gs-glow-opacity: 0.6;
  --gs-glow-scale: 2.5;
  --gs-glow-radius: 0;
  --gs-rotate: 900;
  --gs-glow-rotate-unit: 0;
  --gs-scale-factor: 1.25;
  animation-play-state: paused;
}

@keyframes gs-shadow-pulse {
  0%, 24%, 46%, 73%, 96% { --gs-white-shadow: 0.5; }
  12%, 28%, 41%, 63%, 75%, 82%, 98% { --gs-white-shadow: 2.5; }
  6%, 32%, 57% { --gs-white-shadow: 1.3; }
  18%, 52%, 88% { --gs-white-shadow: 3.5; }
}
@keyframes gs-rotate-bg {
  0% { --gs-bg-x: 0; --gs-bg-y: 0; }
  25% { --gs-bg-x: 100; --gs-bg-y: 0; }
  50% { --gs-bg-x: 100; --gs-bg-y: 100; }
  75% { --gs-bg-x: 0; --gs-bg-y: 100; }
  100% { --gs-bg-x: 0; --gs-bg-y: 0; }
}
@keyframes gs-rotate {
  from { --gs-rotate: -70; --gs-glow-translate-y: -65; }
  to { --gs-rotate: 290; --gs-glow-translate-y: -65; }
}
@keyframes gs-hue-animation {
  0% { --gs-hue: 0; }
  100% { --gs-hue: 360; }
}
`

export function GlowingShadow({ children }) {
  return (
    <>
      <style>{GLOWING_SHADOW_STYLES}</style>
      <div className="gs-container" role="button">
        <span className="gs-glow" />
        <div className="gs-content">{children}</div>
      </div>
    </>
  )
}
