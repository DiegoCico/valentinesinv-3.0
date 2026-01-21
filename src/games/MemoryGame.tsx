import { useEffect, useState } from 'react'
import { MEMORY_SEQUENCE_LENGTH } from './config'
import type { GameProps } from './types'

export function MemoryGame({ onWin, onLose }: GameProps) {
  const [sequence] = useState(() =>
    Array.from({ length: MEMORY_SEQUENCE_LENGTH }, () => Math.floor(Math.random() * 9))
  )
  const [step, setStep] = useState(0)
  const [activeTile, setActiveTile] = useState<number | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let mounted = true
    let delay = 400
    sequence.forEach((tile, index) => {
      window.setTimeout(() => {
        if (!mounted) return
        setActiveTile(tile)
        window.setTimeout(() => {
          if (!mounted) return
          setActiveTile(null)
          if (index === sequence.length - 1) {
            setReady(true)
          }
        }, 360)
      }, delay)
      delay += 520
    })

    return () => {
      mounted = false
    }
  }, [sequence])

  const handlePick = (tile: number) => {
    if (!ready) return
    if (tile !== sequence[step]) {
      onLose('Pattern break. Try again!')
      return
    }
    if (step + 1 === sequence.length) {
      onWin('Memory streak complete.')
    } else {
      setStep((prev) => prev + 1)
    }
  }

  return (
    <div className="game-card">
      <div className="memory-grid">
        {Array.from({ length: 9 }).map((_, index) => (
          <button
            key={index}
            className={`memory-tile ${activeTile === index ? 'active' : ''}`}
            onClick={() => handlePick(index)}
            disabled={!ready}
          >
            ✦
          </button>
        ))}
      </div>
      <div className="game-info">
        <p>Sequence length: {MEMORY_SEQUENCE_LENGTH}.</p>
        <p>Progress: {ready ? `${step}/${sequence.length}` : 'Watching...'}</p>
      </div>
    </div>
  )
}
