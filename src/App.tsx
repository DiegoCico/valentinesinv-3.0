import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactElement } from 'react'

type GameId = 'reaction' | 'typing' | 'memory' | 'aim' | 'timing'
type Screen = 'home' | 'game' | 'result' | 'final'
type Outcome = 'win' | 'loss'

type GameDefinition = {
  id: GameId
  name: string
  tagline: string
  component: (props: GameProps) => ReactElement
}

type GameProps = {
  onWin: (details?: string) => void
  onLose: (details?: string) => void
}

type PendingResult = {
  gameId: GameId
  outcome: Outcome
  details?: string
}

const REACTION_TARGET_MS = 280
const TYPING_TARGET_WPM = 46
const AIM_TARGET_HITS = 6
const AIM_TIME_LIMIT = 7
const MEMORY_SEQUENCE_LENGTH = 5
const TIMING_WINDOW = 0.16

const PHRASES = [
  'pixel hearts beat fast',
  'love loads at 60 fps',
  'sweet victory unlocked',
  'press start to sparkle',
  'tiny quests big smiles',
]

const GAME_DEFS: GameDefinition[] = [
  {
    id: 'reaction',
    name: 'Reaction Rush',
    tagline: 'Click when the heart flashes green.',
    component: ReactionGame,
  },
  {
    id: 'typing',
    name: 'Typing Sprint',
    tagline: 'Type the phrase fast and clean.',
    component: TypingGame,
  },
  {
    id: 'memory',
    name: 'Memory Glow',
    tagline: 'Repeat the sparkle pattern.',
    component: MemoryGame,
  },
  {
    id: 'aim',
    name: 'Heart Whack',
    tagline: 'Hit the hearts before the timer ends.',
    component: AimGame,
  },
  {
    id: 'timing',
    name: 'Timing Strike',
    tagline: 'Stop the slider in the sweet spot.',
    component: TimingGame,
  },
]

const EMPTY_RESULTS: Record<GameId, Outcome | null> = {
  reaction: null,
  typing: null,
  memory: null,
  aim: null,
  timing: null,
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [order, setOrder] = useState<GameId[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [results, setResults] = useState<Record<GameId, Outcome | null>>(EMPTY_RESULTS)
  const [pending, setPending] = useState<PendingResult | null>(null)

  const currentGameId = order[currentIndex]
  const currentGameDef = GAME_DEFS.find((game) => game.id === currentGameId)

  const wins = useMemo(
    () => Object.values(results).filter((value) => value === 'win').length,
    [results]
  )
  const losses = useMemo(
    () => Object.values(results).filter((value) => value === 'loss').length,
    [results]
  )

  const startRun = () => {
    const shuffled = shuffle(GAME_DEFS.map((game) => game.id))
    setOrder(shuffled)
    setResults(EMPTY_RESULTS)
    setPending(null)
    setCurrentIndex(0)
    setScreen('game')
  }

  const handleWin = (details?: string) => {
    if (!currentGameId) return
    setPending({ gameId: currentGameId, outcome: 'win', details })
    setScreen('result')
  }

  const handleLose = (details?: string) => {
    if (!currentGameId) return
    setPending({ gameId: currentGameId, outcome: 'loss', details })
    setScreen('result')
  }

  const advanceGame = (lockedOutcome: Outcome) => {
    if (!pending) return
    setResults((prev) => ({ ...prev, [pending.gameId]: lockedOutcome }))
    setPending(null)
    if (currentIndex + 1 >= order.length) {
      setScreen('final')
    } else {
      setCurrentIndex((prev) => prev + 1)
      setScreen('game')
    }
  }

  const retryGame = () => {
    setPending(null)
    setScreen('game')
  }

  const resetRun = () => {
    setOrder([])
    setPending(null)
    setCurrentIndex(0)
    setResults(EMPTY_RESULTS)
    setScreen('home')
  }

  return (
    <div className="game-shell">
      <header className="top-bar">
        <div className="logo-card">
          <span className="logo-icon">❤</span>
          <div>
            <p className="logo-title">Love.exe</p>
            <p className="logo-sub">Valentine Skill Trials</p>
          </div>
        </div>
        <div className="score-card">
          <span>Wins: {wins}</span>
          <span>Losses: {losses}</span>
          <span>Round: {order.length ? currentIndex + 1 : 0}/5</span>
        </div>
      </header>

      <main className="screen-frame">
        {screen === 'home' && (
          <section className="screen screen-home">
            <div className="hero">
              <p className="chip">Two-player bragging rights</p>
              <h1>Beat the benchmarks. Unlock the Valentine.</h1>
              <p className="hero-copy">
                Five pixel challenges. Win 3 to reveal the final message. Retry any round as much as
                you want before locking in a result.
              </p>
              <div className="hero-actions">
                <button className="btn primary" onClick={startRun}>
                  Start the Trials
                </button>
                <div className="rules">
                  <p>Benchmarks</p>
                  <ul>
                    <li>Reaction: {REACTION_TARGET_MS}ms or faster</li>
                    <li>Typing: {TYPING_TARGET_WPM}+ WPM</li>
                    <li>Memory: {MEMORY_SEQUENCE_LENGTH} sparks</li>
                    <li>Aim: {AIM_TARGET_HITS} hits in {AIM_TIME_LIMIT}s</li>
                    <li>Timing: land in the heart zone</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        )}

        {screen === 'game' && currentGameDef && (
          <section className="screen screen-game">
            <GameHeader
              title={currentGameDef.name}
              tagline={currentGameDef.tagline}
              currentIndex={currentIndex}
            />
            <currentGameDef.component onWin={handleWin} onLose={handleLose} />
          </section>
        )}

        {screen === 'result' && pending && (
          <section className="screen screen-result">
            <div className="result-card">
              <p className="chip">{pending.outcome === 'win' ? 'Victory' : 'Missed It'}</p>
              <h2>{pending.outcome === 'win' ? 'Benchmark cleared!' : 'Benchmark missed.'}</h2>
              <p className="result-detail">{pending.details ?? 'Lock it in or try again.'}</p>
              <div className="result-actions">
                {pending.outcome === 'loss' && (
                  <button className="btn ghost" onClick={retryGame}>
                    Retry Round
                  </button>
                )}
                <button
                  className={`btn ${pending.outcome === 'win' ? 'primary' : 'danger'}`}
                  onClick={() => advanceGame(pending.outcome)}
                >
                  {pending.outcome === 'win' ? 'Lock Win + Continue' : 'Count Loss + Continue'}
                </button>
              </div>
            </div>
          </section>
        )}

        {screen === 'final' && (
          <section className="screen screen-final">
            <div className="final-card">
              <p className="chip">{wins >= 3 ? 'Unlocked' : 'Locked'}</p>
              <h2>{wins >= 3 ? 'Valentine.exe Unlocked' : 'Need More Wins'}</h2>
              <p className="final-message">
                {wins >= 3
                  ? 'Roses are red, pixels are sweet. You crushed the trials. Be my player two?'
                  : 'You are close! Sharpen those skills and rerun the trials.'}
              </p>
              <div className="final-actions">
                <button className="btn primary" onClick={startRun}>
                  Run It Back
                </button>
                <button className="btn ghost" onClick={resetRun}>
                  Return Home
                </button>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

function GameHeader({
  title,
  tagline,
  currentIndex,
}: {
  title: string
  tagline: string
  currentIndex: number
}) {
  return (
    <div className="game-header">
      <div>
        <p className="chip">Game {currentIndex + 1} of 5</p>
        <h2>{title}</h2>
        <p className="muted">{tagline}</p>
      </div>
      <div className="mini-legend">
        <span>Retry as needed</span>
        <span>Best attempt counts</span>
      </div>
    </div>
  )
}

function ReactionGame({ onWin, onLose }: GameProps) {
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

function TypingGame({ onWin, onLose }: GameProps) {
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

function MemoryGame({ onWin, onLose }: GameProps) {
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

function AimGame({ onWin, onLose }: GameProps) {
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

function TimingGame({ onWin, onLose }: GameProps) {
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
