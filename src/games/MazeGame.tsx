import { useEffect, useMemo, useRef, useState } from 'react'
import { MAZE_SIZE, MAZE_TARGET_TIME, MAZE_TIME_LIMIT } from './config'
import type { GameProps } from './types'

type Cell = 0 | 1

type Point = {
  row: number
  col: number
}

const DIRS: Point[] = [
  { row: -1, col: 0 },
  { row: 1, col: 0 },
  { row: 0, col: -1 },
  { row: 0, col: 1 },
]

function shuffle<T>(items: T[]) {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function generateMaze(size: number): Cell[][] {
  const grid: Cell[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => 1)
  )

  const carve = (row: number, col: number) => {
    grid[row][col] = 0
    const directions = shuffle(DIRS)
    directions.forEach((dir) => {
      const nextRow = row + dir.row * 2
      const nextCol = col + dir.col * 2
      if (nextRow <= 0 || nextCol <= 0 || nextRow >= size - 1 || nextCol >= size - 1) {
        return
      }
      if (grid[nextRow][nextCol] === 1) {
        grid[row + dir.row][col + dir.col] = 0
        carve(nextRow, nextCol)
      }
    })
  }

  carve(1, 1)
  grid[1][1] = 0
  grid[size - 2][size - 2] = 0
  return grid
}

export function MazeGame({ onWin, onLose }: GameProps) {
  const [maze] = useState(() => generateMaze(MAZE_SIZE))
  const [player, setPlayer] = useState<Point>({ row: 1, col: 1 })
  const [moves, setMoves] = useState(0)
  const [timeLeft, setTimeLeft] = useState(MAZE_TIME_LIMIT)
  const exit = useMemo<Point>(() => ({ row: MAZE_SIZE - 2, col: MAZE_SIZE - 2 }), [])
  const wonRef = useRef(false)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timerRef.current ?? undefined)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()
      let delta: Point | null = null
      if (key === 'arrowup' || key === 'w') delta = { row: -1, col: 0 }
      if (key === 'arrowdown' || key === 's') delta = { row: 1, col: 0 }
      if (key === 'arrowleft' || key === 'a') delta = { row: 0, col: -1 }
      if (key === 'arrowright' || key === 'd') delta = { row: 0, col: 1 }
      if (!delta) return
      event.preventDefault()
      setPlayer((prev) => {
        const next = { row: prev.row + delta.row, col: prev.col + delta.col }
        if (maze[next.row]?.[next.col] === 1) {
          return prev
        }
        setMoves((count) => count + 1)
        return next
      })
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [maze])

  useEffect(() => {
    if (wonRef.current) return

    if (player.row === exit.row && player.col === exit.col) {
      wonRef.current = true
      const elapsed = MAZE_TIME_LIMIT - timeLeft

      if (elapsed <= MAZE_TARGET_TIME) {
        onWin(`Maze cleared in ${moves + 1} moves and ${elapsed}s. Beat the target time!`)
      } else {
        onLose(`Maze cleared in ${moves + 1} moves and ${elapsed}s. Too slow (need ≤ ${MAZE_TARGET_TIME}s).`)
      }
    }
  }, [exit.col, exit.row, moves, onLose, onWin, player.col, player.row, timeLeft])


  useEffect(() => {
    if (wonRef.current) return
    if (timeLeft === 0) {
      onLose('Time ran out.')
    }
  }, [onLose, timeLeft])

  return (
    <div className="game-card">
      <div className="maze-board" style={{ ['--maze-size' as string]: MAZE_SIZE }}>
        {maze.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const isPlayer = player.row === rowIndex && player.col === colIndex
            const isExit = exit.row === rowIndex && exit.col === colIndex
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`maze-cell ${cell === 1 ? 'wall' : 'path'} ${
                  isExit ? 'exit' : ''
                }`}
              >
                {isPlayer ? '❤' : isExit ? '★' : ''}
              </div>
            )
          })
        )}
      </div>
      <div className="game-info">
        <p>Use arrow keys or WASD.</p>
        <p>Moves: {moves}</p>
        <p>Time to beat: {MAZE_TARGET_TIME}s</p>
        <p>Time: {timeLeft}s</p>
      </div>
    </div>
  )
}
