import { useState } from 'react'
import { PHRASES, TYPING_TARGET_WPM } from './config'
import type { GameProps } from './types'

export function TypingGame({ onWin, onLose }: GameProps) {
  const [phrase] = useState(() => PHRASES[Math.floor(Math.random() * PHRASES.length)])
  const [value, setValue] = useState('')
  const [startTime, setStartTime] = useState<number | null>(null)

  const handleChange = (nextValue: string) => {
    if (!startTime) {
      setStartTime(performance.now())
    }
    setValue(nextValue)
    if (nextValue === phrase) {
      const now = performance.now()
      const start = startTime ?? now
      const elapsedMinutes = Math.max(0.5, (now - start) / 1000) / 60
      const wpm = Math.round(((phrase.length / 5) / elapsedMinutes) * 10) / 10
      if (wpm >= TYPING_TARGET_WPM) {
        onWin(`Speed: ${wpm} WPM.`)
      } else {
        onLose(`Speed: ${wpm} WPM.`)
      }
    }
  }

  return (
    <div className="game-card">
      <div className="typing-box">
        <p className="typing-phrase">{phrase}</p>
        <input
          className="typing-input"
          value={value}
          onChange={(event) => handleChange(event.target.value)}
          placeholder="Type here"
        />
      </div>
      <div className="game-info">
        <p>Target: {TYPING_TARGET_WPM}+ WPM, exact phrase.</p>
        <p>Progress: {Math.min(100, Math.round((value.length / phrase.length) * 100))}%</p>
      </div>
    </div>
  )
}
