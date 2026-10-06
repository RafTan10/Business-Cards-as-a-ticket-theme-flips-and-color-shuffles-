import { useEffect, useRef, useState } from "react"
import { usePrefersReducedMotion } from "@/components/card/shader"

/**
 * LaserField — beams of light fanning down from a point at the top of the page.
 *
 * Inspired by the 21st.dev "Laser Focus" background (its source is locked, so this is
 * our own small version). Zero dependencies: one WebGL1 full-screen shader.
 *
 * Kept light for phones:
 *  - draws at a fraction of the screen resolution (beams are soft, so nobody notices)
 *  - caps the frame rate (30fps on phones, 60 on desktop)
 *  - stops completely while the tab is hidden
 *  - reduced motion: draws one still frame
 *  - no WebGL: falls back to a static CSS glow
 */

const VERT = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`

const FRAG = `
precision mediump float;
uniform vec2 u_res;
uniform float u_time;
uniform vec3 u_color;
uniform vec2 u_focus; // pixels, origin top-left

void main() {
  vec2 p = vec2(gl_FragCoord.x, u_res.y - gl_FragCoord.y);
  vec2 d = p - u_focus;
  float dist = length(d) / u_res.y;
  float ang = atan(d.x, d.y); // 0 = straight down

  float beams = 0.0;
  for (int i = 0; i < 7; i++) {
    float fi = float(i);
    // spread across the fan, each beam sweeping slowly at its own pace
    float a = (fi - 3.0) * 0.17 + 0.16 * sin(u_time * (0.09 + 0.025 * fi) + fi * 1.7);
    float w = 0.0075 + 0.004 * (0.5 + 0.5 * sin(fi * 3.1));
    float da = abs(ang - a);
    float core = exp(-da / w);
    float halo = 0.32 * exp(-da / (w * 6.0));
    float pulse = 0.55 + 0.45 * sin(u_time * 0.6 + fi * 2.3);
    beams += (core + halo) * pulse;
  }
  // beams fade with distance from the focal point
  beams *= exp(-dist * 1.05) * smoothstep(0.0, 0.05, dist);
  // soft cone of light under the beams, so they read as light, not wires
  float cone = 0.16 * exp(-abs(ang) / 0.55) * exp(-dist * 1.6);

  // bright flare where the beams start
  float flare = exp(-length(d) / (u_res.y * 0.06));
  float star = exp(-abs(d.x) / (u_res.y * 0.006)) * exp(-abs(d.y) / (u_res.y * 0.12))
             + exp(-abs(d.y) / (u_res.y * 0.006)) * exp(-abs(d.x) / (u_res.y * 0.16));

  vec3 col = u_color * (beams + cone);
  col += vec3(1.0) * pow(clamp(beams, 0.0, 1.0), 3.0) * 0.45; // white-hot beam cores
  col += mix(u_color, vec3(1.0), 0.6) * (flare * 0.9 + star * 0.5);
  gl_FragColor = vec4(col, 1.0);
}
`

function hueToRgb(h: number): [number, number, number] {
  // hsl(h, 95%, 60%)
  const s = 0.95
  const l = 0.6
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))
  }
  return [f(0), f(8), f(4)]
}

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type)
  if (!sh) return null
  gl.shaderSource(sh, src)
  gl.compileShader(sh)
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    gl.deleteShader(sh)
    return null
  }
  return sh
}

interface LaserFieldProps {
  /** colour of the beams (follows the card's hue) */
  hue: number
  /** fade the beams in after this many ms (lets the ticket print first) */
  delayMs?: number
  className?: string
}

// automated browsers (screenshots) skip the fade-in delay, like the card skips its intro
const SKIP_DELAY = typeof navigator !== "undefined" && navigator.webdriver

export function LaserField({ hue, delayMs: delayProp = 0, className }: LaserFieldProps) {
  const delayMs = SKIP_DELAY ? 0 : delayProp
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const colorRef = useRef(hueToRgb(hue))
  const reduced = usePrefersReducedMotion()
  const [failed, setFailed] = useState(false)
  const [shown, setShown] = useState(delayMs === 0)

  useEffect(() => {
    colorRef.current = hueToRgb(hue)
  }, [hue])

  useEffect(() => {
    if (shown) return
    const t = window.setTimeout(() => setShown(true), delayMs)
    return () => window.clearTimeout(t)
  }, [delayMs, shown])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "low-power" })
    const vs = gl && compile(gl, gl.VERTEX_SHADER, VERT)
    const fs = gl && compile(gl, gl.FRAGMENT_SHADER, FRAG)
    const prog = gl && vs && fs ? gl.createProgram() : null
    if (!gl || !vs || !fs || !prog) {
      setFailed(true)
      return
    }
    gl.attachShader(prog, vs)
    gl.attachShader(prog, fs)
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      setFailed(true)
      return
    }
    gl.useProgram(prog)
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, "a_pos")
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
    const uRes = gl.getUniformLocation(prog, "u_res")
    const uTime = gl.getUniformLocation(prog, "u_time")
    const uColor = gl.getUniformLocation(prog, "u_color")
    const uFocus = gl.getUniformLocation(prog, "u_focus")

    const phone = window.matchMedia("(max-width: 640px), (hover: none)").matches
    const renderScale = phone ? 0.6 : 0.7 // fraction of CSS pixels we actually draw
    const minFrameMs = phone ? 1000 / 30 : 1000 / 60

    const resize = () => {
      const w = Math.max(1, Math.round(canvas.clientWidth * renderScale))
      const h = Math.max(1, Math.round(canvas.clientHeight * renderScale))
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
        gl.viewport(0, 0, w, h)
      }
    }
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    resize()

    const draw = (seconds: number) => {
      gl.uniform2f(uRes, canvas.width, canvas.height)
      gl.uniform1f(uTime, seconds)
      gl.uniform3f(uColor, ...colorRef.current)
      gl.uniform2f(uFocus, canvas.width * 0.5, canvas.height * 0.01)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
    }

    let raf = 0
    let last = 0
    const start = performance.now()
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop)
      if (now - last < minFrameMs) return
      last = now
      draw((now - start) / 1000 + 8)
    }
    const play = () => {
      cancelAnimationFrame(raf)
      if (reduced) draw(8)
      else if (!document.hidden) raf = requestAnimationFrame(loop)
    }
    const onVisibility = () => (document.hidden ? cancelAnimationFrame(raf) : play())
    const onLost = (e: Event) => {
      e.preventDefault()
      cancelAnimationFrame(raf)
      setFailed(true)
    }
    document.addEventListener("visibilitychange", onVisibility)
    canvas.addEventListener("webglcontextlost", onLost)
    play()

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      document.removeEventListener("visibilitychange", onVisibility)
      canvas.removeEventListener("webglcontextlost", onLost)
      gl.deleteProgram(prog)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
      gl.deleteBuffer(buf)
    }
  }, [reduced])

  const [r, g, b] = hueToRgb(hue).map((v) => Math.round(v * 255))
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 ${className ?? ""}`}
      style={{ opacity: shown ? 1 : 0, transition: "opacity 1400ms ease-out" }}
    >
      {failed ? (
        <div
          className="absolute inset-0"
          style={{ background: `radial-gradient(50% 60% at 50% 0%, rgba(${r},${g},${b},0.28) 0%, transparent 70%)` }}
        />
      ) : (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full"
          style={{ mixBlendMode: "screen", opacity: 0.75 }}
        />
      )}
    </div>
  )
}
