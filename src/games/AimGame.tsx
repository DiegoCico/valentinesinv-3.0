import { useEffect, useRef, useState } from 'react'
import { AIM_TARGET_HITS, AIM_TIME_LIMIT } from './config'
import type { GameProps } from './types'

export function AimGame({ onWin, onLose }: GameProps) {
  const [hits, setHits] = useState(0)
  const [timeLeft, setTimeLeft] = useState(AIM_TIME_LIMIT)
  const [position, setPosition] = useState({ x: 50, y: 50 })
  const intervalRef = useRef<number | null>(null)

  useEffect(() => {
    intervalRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(intervalRef.current ?? undefined)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (timeLeft === 0) {
      if (hits >= AIM_TARGET_HITS) {
        onWin(`Hits: ${hits}.`)
      } else {
        onLose(`Hits: ${hits}.`)
      }
    }
  }, [hits, onLose, onWin, timeLeft])

  const moveTarget = () => {
    setPosition({
      x: Math.random() * 80 + 10,
      y: Math.random() * 60 + 10,
    })
  }

  const handleHit = () => {
    setHits((prev) => prev + 1)
    moveTarget()
  }

  return (
    <div className="game-card">
      <div className="aim-field">
        <button
          className="aim-target"
          style={{ left: `${position.x}%`, top: `${position.y}%` }}
          onClick={handleHit}
        >
          ❤
        </button>
      </div>
      <div className="game-info">
        <p>Hits: {hits}</p>
        <p>Time left: {timeLeft}s</p>
      </div>
    </div>
  )
}
