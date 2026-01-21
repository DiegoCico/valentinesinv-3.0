import { useEffect, useRef, useState } from 'react'
import { REACTION_TARGET_MS } from './config'
import type { GameProps } from './types'

export function ReactionGame({ onWin, onLose }: GameProps) {
  const [status, setStatus] = useState<'idle' | 'waiting' | 'ready' | 'tooSoon'>('idle')
  const [reaction, setReaction] = useState<number | null>(null)
  const timeoutRef = useRef<number | null>(null)
  const startRef = useRef<number>(0)

  useEffect(() => {
    setStatus('waiting')
    timeoutRef.current = window.setTimeout(() => {
      startRef.current = performance.now()
      setStatus('ready')
    }, 1200 + Math.random() * 1800)

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const handleClick = () => {
    if (status === 'waiting') {
      setStatus('tooSoon')
      onLose('Too soon! Wait for green.')
      return
    }
    if (status === 'ready') {
      const elapsed = performance.now() - startRef.current
      setReaction(elapsed)
      if (elapsed <= REACTION_TARGET_MS) {
        onWin(`Reaction time: ${Math.round(elapsed)}ms.`)
      } else {
        onLose(`Reaction time: ${Math.round(elapsed)}ms.`)
      }
    }
  }

  return (
    <div className="game-card">
      <div
        className={`reaction-pad ${status}`}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => event.key === 'Enter' && handleClick()}
      >
        {status === 'waiting' && <p>Hold…</p>}
        {status === 'ready' && <p>CLICK!</p>}
        {status === 'tooSoon' && <p>Too soon!</p>}
      </div>
      <div className="game-info">
        <p>Target: {REACTION_TARGET_MS}ms or faster.</p>
        <p>Latest: {reaction ? `${Math.round(reaction)}ms` : '—'}</p>
      </div>
    </div>
  )
}
