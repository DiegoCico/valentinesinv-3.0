import { useMemo, useState } from 'react'
import type { CSSProperties, ReactElement } from 'react'
import {
  AIM_TARGET_HITS,
  AIM_TIME_LIMIT,
  MAZE_TARGET_TIME,
  MEMORY_SEQUENCE_LENGTH,
  REACTION_TARGET_MS,
  TYPING_TARGET_WPM,
} from './games/config'
import { AimGame } from './games/AimGame'
import { MazeGame } from './games/MazeGame'
import { MemoryGame } from './games/MemoryGame'
import { ReactionGame } from './games/ReactionGame'
import { TypingGame } from './games/TypingGame'
import type { GameProps } from './games/types'

type GameId = 'reaction' | 'typing' | 'memory' | 'aim' | 'maze'
type Screen = 'home' | 'game' | 'result' | 'final'
type Outcome = 'win' | 'loss'

type GameDefinition = {
  id: GameId
  name: string
  tagline: string
  goal: string
  component: (props: GameProps) => ReactElement
}

type PendingResult = {
  gameId: GameId
  outcome: Outcome
  details?: string
}

const GAME_DEFS: GameDefinition[] = [
  {
    id: 'reaction',
    name: 'Reaction Rush',
    tagline: 'Click when the heart flashes green.',
    goal: `Goal to beat: ${REACTION_TARGET_MS}ms reaction.`,
    component: ReactionGame,
  },
  {
    id: 'typing',
    name: 'Typing Sprint',
    tagline: 'Type the phrase fast and clean.',
    goal: `Goal to beat: ${TYPING_TARGET_WPM}+ WPM.`,
    component: TypingGame,
  },
  {
    id: 'memory',
    name: 'Memory Glow',
    tagline: 'Repeat the sparkle pattern.',
    goal: `Goal to beat: ${MEMORY_SEQUENCE_LENGTH} sparks.`,
    component: MemoryGame,
  },
  {
    id: 'aim',
    name: 'Heart Whack',
    tagline: 'Hit the hearts before the timer ends.',
    goal: `Goal to beat: ${AIM_TARGET_HITS} hits in ${AIM_TIME_LIMIT}s.`,
    component: AimGame,
  },
  {
    id: 'maze',
    name: 'Love Maze',
    tagline: 'Find the star with arrow keys.',
    goal: 'Goal to beat: escape before time runs out.',
    component: MazeGame,
  },
]

const EMPTY_RESULTS: Record<GameId, Outcome | null> = {
  reaction: null,
  typing: null,
  memory: null,
  aim: null,
  maze: null,
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
                There are 5 challenges if you want to have a boyfriend for valentines this year beat your boyfriend in at least 3 challenges and send him a screenshot of the final message to prove your worth.
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
                    <li>Maze: escape the maze in {MAZE_TARGET_TIME} seconds</li>
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
              goal={currentGameDef.goal}
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
              {wins >= 3 && (
                <div className="final-hearts" aria-hidden="true">
                  {[
                    { x: '8%', delay: '0s', duration: '4.6s', size: '14px' },
                    { x: '22%', delay: '1s', duration: '5.2s', size: '12px' },
                    { x: '38%', delay: '0.4s', duration: '4.1s', size: '16px' },
                    { x: '52%', delay: '1.6s', duration: '5.6s', size: '13px' },
                    { x: '66%', delay: '0.8s', duration: '4.4s', size: '12px' },
                    { x: '78%', delay: '1.2s', duration: '5s', size: '15px' },
                    { x: '90%', delay: '0.2s', duration: '4.8s', size: '13px' },
                  ].map((heart, index) => (
                    <span
                      key={index}
                      className="pixel-heart"
                      style={
                        {
                          ['--x' as string]: heart.x,
                          ['--delay' as string]: heart.delay,
                          ['--duration' as string]: heart.duration,
                          ['--size' as string]: heart.size,
                        } as CSSProperties
                      }
                    >
                      ❤
                    </span>
                  ))}
                </div>
              )}
              <div className="final-content">
                <p className="chip">{wins >= 3 ? 'Unlocked' : 'Locked'}</p>
                <h2>{wins >= 3 ? 'Valentine.exe Unlocked' : 'Need More Wins'}</h2>
                <p className="final-message">
                  {wins >= 3
                    ? 'Roses are red, pixels are sweet. You crushed the trials. Be my player two? <3'
                    : 'YOU FAILED! Try again if you want to be my valentine.'}
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
  goal,
  currentIndex,
}: {
  title: string
  tagline: string
  goal: string
  currentIndex: number
}) {
  return (
    <div className="game-header">
      <div>
        <p className="chip">Game {currentIndex + 1} of 5</p>
        <h2>{title}</h2>
        <p className="muted">{tagline}</p>
        <p className="goal">{goal}</p>
      </div>
      <div className="mini-legend">
        <span>Retry as needed</span>
        <span>Best attempt counts</span>
      </div>
    </div>
  )
}
