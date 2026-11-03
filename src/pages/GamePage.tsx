import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Board,
  Notes,
  Difficulty,
  generatePuzzle,
  hasConflict,
  isBoardComplete,
  copyBoard,
  copyNotes,
  createEmptyNotes,
} from '../utils/sudoku';

type GameState = 'playing' | 'won' | 'paused';

interface HistoryEntry {
  board: Board;
  notes: Notes;
}

interface GamePageProps {
  initialDifficulty?: Difficulty;
}

export default function GamePage({ initialDifficulty }: GamePageProps) {
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState<Difficulty>(initialDifficulty || 'easy');
  const [puzzle, setPuzzle] = useState<Board>([]);
  const [solution, setSolution] = useState<Board>([]);
  const [board, setBoard] = useState<Board>([]);
  const [notes, setNotes] = useState<Notes>([]);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [notesMode, setNotesMode] = useState(false);
  const [gameState, setGameState] = useState<GameState>('playing');
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [showErrors, setShowErrors] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [timerEnabled, setTimerEnabled] = useState(true);
  const [showTimerControls, setShowTimerControls] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const timerRef = useRef<number | null>(null);

  // Start a new game
  const startNewGame = useCallback((diff: Difficulty) => {
    setGenerating(true);
    setTimeout(() => {
      const { puzzle: newPuzzle, solution: newSolution } = generatePuzzle(diff);
      setPuzzle(newPuzzle);
      setSolution(newSolution);
      setBoard(copyBoard(newPuzzle));
      setNotes(createEmptyNotes());
      setSelectedCell(null);
      setNotesMode(false);
      setGameState('playing');
      setTimer(0);
      setIsRunning(true);
      setHistory([]);
      setMistakes(0);
      setHintsUsed(0);
      setGenerating(false);
    }, 50);
  }, []);

  // Initialize game
  useEffect(() => {
    startNewGame(difficulty);
  }, []);

  // Handle initial difficulty prop change
  useEffect(() => {
    if (initialDifficulty && initialDifficulty !== difficulty) {
      setDifficulty(initialDifficulty);
      startNewGame(initialDifficulty);
    }
  }, [initialDifficulty]); // eslint-disable-line react-hooks/exhaustive-deps

  // Timer logic
  useEffect(() => {
    if (isRunning && gameState === 'playing' && timerEnabled) {
      timerRef.current = window.setInterval(() => {
        setTimer(t => t + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, gameState, timerEnabled]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const saveToHistory = () => {
    setHistory(prev => [...prev, { board: copyBoard(board), notes: copyNotes(notes) }]);
  };

  const handleNumberInput = (num: number) => {
    if (!selectedCell || gameState !== 'playing') return;
    const [row, col] = selectedCell;
    if (puzzle[row][col] !== null) return;

    saveToHistory();

    if (notesMode) {
      const newNotes = copyNotes(notes);
      if (newNotes[row][col].has(num)) {
        newNotes[row][col].delete(num);
      } else {
        newNotes[row][col].add(num);
      }
      setNotes(newNotes);
    } else {
      const newBoard = copyBoard(board);
      newBoard[row][col] = num;
      setBoard(newBoard);

      const newNotes = copyNotes(notes);
      newNotes[row][col].clear();
      setNotes(newNotes);

      if (solution[row][col] !== num) {
        setMistakes(m => m + 1);
      }

      if (isBoardComplete(newBoard)) {
        setGameState('won');
        setIsRunning(false);
      }
    }
  };

  const handleErase = () => {
    if (!selectedCell || gameState !== 'playing') return;
    const [row, col] = selectedCell;
    if (puzzle[row][col] !== null) return;
    saveToHistory();
    const newBoard = copyBoard(board);
    newBoard[row][col] = null;
    setBoard(newBoard);
    const newNotes = copyNotes(notes);
    newNotes[row][col].clear();
    setNotes(newNotes);
  };

  const handleUndo = () => {
    if (history.length === 0 || gameState !== 'playing') return;
    const lastEntry = history[history.length - 1];
    setBoard(lastEntry.board);
    setNotes(lastEntry.notes);
    setHistory(prev => prev.slice(0, -1));
  };

  const handleHint = () => {
    if (!selectedCell || gameState !== 'playing') return;
    const [row, col] = selectedCell;
    if (puzzle[row][col] !== null) return;
    if (board[row][col] === solution[row][col]) return;
    saveToHistory();
    const newBoard = copyBoard(board);
    newBoard[row][col] = solution[row][col];
    setBoard(newBoard);
    const newNotes = copyNotes(notes);
    newNotes[row][col].clear();
    setNotes(newNotes);
    setHintsUsed(h => h + 1);
    if (isBoardComplete(newBoard)) {
      setGameState('won');
      setIsRunning(false);
    }
  };

  // Timer controls
  const addTime = (seconds: number) => {
    setTimer(t => Math.max(0, t + seconds));
  };

  // Keyboard handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') {
        if (e.key === 'Escape' && gameState === 'paused') {
          setGameState('playing');
        }
        return;
      }

      if (e.key >= '1' && e.key <= '9') {
        handleNumberInput(parseInt(e.key));
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        handleErase();
      } else if (e.key === 'n' || e.key === 'N') {
        setNotesMode(prev => !prev);
      } else if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
        handleUndo();
      } else if (e.key === 'Escape') {
        setGameState('paused');
      } else if (selectedCell) {
        const [row, col] = selectedCell;
        if (e.key === 'ArrowUp' && row > 0) setSelectedCell([row - 1, col]);
        if (e.key === 'ArrowDown' && row < 8) setSelectedCell([row + 1, col]);
        if (e.key === 'ArrowLeft' && col > 0) setSelectedCell([row, col - 1]);
        if (e.key === 'ArrowRight' && col < 8) setSelectedCell([row, col + 1]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCell, gameState, notesMode, history, board, notes, puzzle, solution]);

  const getCellClasses = (row: number, col: number): string => {
    const classes = ['sudoku-cell'];
    const isSelected = selectedCell && selectedCell[0] === row && selectedCell[1] === col;
    const isSameRow = selectedCell && selectedCell[0] === row;
    const isSameCol = selectedCell && selectedCell[1] === col;
    const isSameBox = selectedCell &&
      Math.floor(selectedCell[0] / 3) === Math.floor(row / 3) &&
      Math.floor(selectedCell[1] / 3) === Math.floor(col / 3);
    const isSameNumber = selectedCell && board[selectedCell[0]]?.[selectedCell[1]] !== null &&
      board[row][col] === board[selectedCell[0]][selectedCell[1]];
    const isGiven = puzzle[row]?.[col] !== null && puzzle[row]?.[col] !== undefined;
    const hasError = showErrors && board[row]?.[col] !== null && hasConflict(board, row, col);

    if (isSelected) classes.push('selected');
    else if (isSameRow || isSameCol || isSameBox) classes.push('highlighted');
    if (isSameNumber && !isSelected) classes.push('same-number');
    if (isGiven) classes.push('given');
    if (hasError) classes.push('error');
    if (col % 3 === 0 && col !== 0) classes.push('border-left-thick');
    if (row % 3 === 0 && row !== 0) classes.push('border-top-thick');

    return classes.join(' ');
  };

  const getNumberCount = (num: number): number => {
    let count = 0;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r]?.[c] === num) count++;
      }
    }
    return count;
  };

  return (
    <div className="min-h-[calc(100vh-60px)] flex flex-col items-center px-3 py-4 sm:py-6">
      {/* Difficulty & New Game */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-3 w-full max-w-md">
        <div className="flex gap-0.5 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-0.5 border border-gray-200 dark:border-gray-700">
          {(['easy', 'medium', 'hard', 'expert'] as Difficulty[]).map((diff) => (
            <button
              key={diff}
              onClick={() => {
                setDifficulty(diff);
                startNewGame(diff);
              }}
              className={`px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all ${
                difficulty === diff
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {diff.charAt(0).toUpperCase() + diff.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex items-center justify-between w-full max-w-md mb-3 px-1">
        <div className="flex items-center gap-3 text-sm">
          {/* Timer with controls */}
          <div className="relative">
            <button
              onClick={() => setShowTimerControls(!showTimerControls)}
              className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              <span>⏱️</span>
              <span className="font-mono font-medium">
                {timerEnabled ? formatTime(timer) : '∞'}
              </span>
              <span className="text-xs">▼</span>
            </button>
            {/* Timer Controls Dropdown */}
            {showTimerControls && (
              <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-3 z-50 min-w-[200px]">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Timer</span>
                    <button
                      onClick={() => setTimerEnabled(!timerEnabled)}
                      className={`relative w-10 h-5 rounded-full transition-colors ${
                        timerEnabled ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                        timerEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                  <div className="border-t border-gray-100 dark:border-gray-700 pt-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Adjust Time</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => addTime(-60)}
                        className="flex-1 px-2 py-1.5 text-xs bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-md hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                      >
                        -1 min
                      </button>
                      <button
                        onClick={() => addTime(-10)}
                        className="flex-1 px-2 py-1.5 text-xs bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-md hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                      >
                        -10s
                      </button>
                      <button
                        onClick={() => addTime(10)}
                        className="flex-1 px-2 py-1.5 text-xs bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-md hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors"
                      >
                        +10s
                      </button>
                      <button
                        onClick={() => addTime(60)}
                        className="flex-1 px-2 py-1.5 text-xs bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-md hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors"
                      >
                        +1 min
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <span className="text-gray-600 dark:text-gray-400">
            ❌ <span className="font-medium text-red-600 dark:text-red-400">{mistakes}</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 cursor-pointer">
            <input
              type="checkbox"
              checked={showErrors}
              onChange={(e) => setShowErrors(e.target.checked)}
              className="w-3.5 h-3.5 rounded"
            />
            Errors
          </label>
          <button
            onClick={() => setGameState('paused')}
            className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title="Pause (Esc)"
          >
            <span className="text-sm">⏸️</span>
          </button>
        </div>
      </div>

      {/* Sudoku Board */}
      <div className={`relative ${generating ? 'opacity-50 pointer-events-none' : ''}`}>
        {generating && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-lg text-indigo-700 dark:text-indigo-300 font-medium">
              Generating...
            </div>
          </div>
        )}
        <div className="grid grid-cols-9 border-2 border-indigo-900 dark:border-indigo-400 rounded-lg overflow-hidden shadow-lg bg-white dark:bg-gray-900">
          {board.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={getCellClasses(rowIndex, colIndex)}
                onClick={() => {
                  if (gameState === 'playing') setSelectedCell([rowIndex, colIndex]);
                }}
              >
                {cell !== null ? (
                  <span className="text-base sm:text-lg font-semibold">{cell}</span>
                ) : notes[rowIndex]?.[colIndex]?.size > 0 ? (
                  <div className="grid grid-cols-3 gap-0 w-full h-full p-0.5">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                      <span
                        key={n}
                        className="text-[7px] sm:text-[8px] leading-[10px] sm:leading-[11px] text-indigo-400 dark:text-indigo-500 flex items-center justify-center"
                      >
                        {notes[rowIndex][colIndex].has(n) ? n : ''}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-2 mt-4">
        <button
          onClick={handleUndo}
          disabled={history.length === 0 || gameState !== 'playing'}
          className="flex flex-col items-center px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
        >
          <span className="text-lg">↩️</span>
          <span className="text-[10px] text-gray-600 dark:text-gray-400 mt-0.5">Undo</span>
        </button>
        <button
          onClick={handleErase}
          disabled={gameState !== 'playing'}
          className="flex flex-col items-center px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
        >
          <span className="text-lg">🧹</span>
          <span className="text-[10px] text-gray-600 dark:text-gray-400 mt-0.5">Erase</span>
        </button>
        <button
          onClick={() => setNotesMode(!notesMode)}
          disabled={gameState !== 'playing'}
          className={`flex flex-col items-center px-3 py-2 rounded-xl border shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 ${
            notesMode
              ? 'bg-indigo-100 dark:bg-indigo-900/50 border-indigo-300 dark:border-indigo-700'
              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          <span className="text-lg">✏️</span>
          <span className="text-[10px] text-gray-600 dark:text-gray-400 mt-0.5">
            Notes {notesMode ? 'ON' : ''}
          </span>
        </button>
        <button
          onClick={handleHint}
          disabled={gameState !== 'playing'}
          className="flex flex-col items-center px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
        >
          <span className="text-lg">💡</span>
          <span className="text-[10px] text-gray-600 dark:text-gray-400 mt-0.5">Hint</span>
        </button>
        <button
          onClick={() => startNewGame(difficulty)}
          disabled={gameState !== 'playing'}
          className="flex flex-col items-center px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
        >
          <span className="text-lg">🔄</span>
          <span className="text-[10px] text-gray-600 dark:text-gray-400 mt-0.5">New</span>
        </button>
      </div>

      {/* Number Pad */}
      <div className="flex items-center justify-center gap-1 sm:gap-1.5 mt-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => {
          const count = getNumberCount(num);
          const isComplete = count >= 9;
          return (
            <button
              key={num}
              onClick={() => handleNumberInput(num)}
              disabled={isComplete || gameState !== 'playing'}
              className={`relative w-9 h-11 sm:w-11 sm:h-13 rounded-lg font-bold text-base sm:text-lg transition-all ${
                isComplete
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed'
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-indigo-700 dark:text-indigo-300 shadow-sm hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:border-indigo-300 dark:hover:border-indigo-600 active:scale-95'
              }`}
            >
              {num}
              <span className="absolute bottom-0.5 right-1 text-[8px] text-gray-400 dark:text-gray-500 font-normal">
                {9 - count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Pause Modal */}
      {gameState === 'paused' && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 sm:p-8 shadow-2xl text-center max-w-sm w-full border border-gray-200 dark:border-gray-700">
            <div className="text-5xl mb-4">⏸️</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Game Paused</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-1">
              Time: <span className="font-mono font-medium">{formatTime(timer)}</span>
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Mistakes: <span className="font-medium text-red-600 dark:text-red-400">{mistakes}</span>
              {' • '}Hints: <span className="font-medium text-amber-600 dark:text-amber-400">{hintsUsed}</span>
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setGameState('playing')}
                className="w-full px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-all shadow-lg active:scale-95"
              >
                ▶️ Resume
              </button>
              <button
                onClick={() => startNewGame(difficulty)}
                className="w-full px-6 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all active:scale-95"
              >
                🔄 Restart
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full px-6 py-3 text-gray-500 dark:text-gray-400 rounded-xl font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-all active:scale-95"
              >
                🏠 Quit to Home
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Win Modal */}
      {gameState === 'won' && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 sm:p-8 shadow-2xl text-center max-w-sm w-full border border-gray-200 dark:border-gray-700 animate-bounce-in">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Congratulations!</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">You solved the puzzle!</p>
            <div className="flex justify-center gap-6 my-4 text-sm">
              <div>
                <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">{formatTime(timer)}</div>
                <div className="text-gray-500 dark:text-gray-400">Time</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">{mistakes}</div>
                <div className="text-gray-500 dark:text-gray-400">Mistakes</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{hintsUsed}</div>
                <div className="text-gray-500 dark:text-gray-400">Hints</div>
              </div>
            </div>
            <div className="flex flex-col gap-3 mt-4">
              <button
                onClick={() => startNewGame(difficulty)}
                className="w-full px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-all shadow-lg active:scale-95"
              >
                🎮 Play Again
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full px-6 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all active:scale-95"
              >
                🏠 Home
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close timer controls */}
      {showTimerControls && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowTimerControls(false)}
        />
      )}
    </div>
  );
}
