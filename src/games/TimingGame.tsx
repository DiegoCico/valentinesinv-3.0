import { useEffect, useRef, useState } from 'react'
import { TIMING_WINDOW } from './config'
import type { GameProps } from './types'

export function TimingGame({ onWin, onLose }: GameProps) {
  const [position, setPosition] = useState(0)
  const [direction, setDirection] = useState(1)
  const [target] = useState(() => Math.random() * 0.5 + 0.25)
  const animationRef = useRef<number | null>(null)
  const [stopped, setStopped] = useState(false)

  useEffect(() => {
    let last = performance.now()
    const tick = (now: number) => {
      const delta = now - last
      last = now
      setPosition((prev) => {
        let next = prev + (delta / 1200) * direction
        if (next >= 1) {
          next = 1
          setDirection(-1)
        }
        if (next <= 0) {
          next = 0
          setDirection(1)
        }
        return next
      })
      animationRef.current = requestAnimationFrame(tick)
    }
    animationRef.current = requestAnimationFrame(tick)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [direction])

  const handleStop = () => {
    if (stopped) return
    setStopped(true)
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    const distance = Math.abs(position - target)
    if (distance <= TIMING_WINDOW) {
      onWin('Perfect timing!')
    } else {
      onLose('Missed the sweet spot.')
    }
  }

  return (
    <div className="game-card">
      <div className="timing-track">
        <div className="timing-target" style={{ left: `${target * 100}%` }} />
        <div className="timing-slider" style={{ left: `${position * 100}%` }} />
      </div>
      <button className="btn primary" onClick={handleStop} disabled={stopped}>
        {stopped ? 'Locked' : 'Stop!'}
      </button>
    </div>
  )
}
