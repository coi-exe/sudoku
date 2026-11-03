import { useState, useEffect, useCallback, useRef } from 'react';
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
} from './utils/sudoku';

type GameState = 'playing' | 'won' | 'paused';

interface HistoryEntry {
  board: Board;
  notes: Notes;
}

function App() {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
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
  const timerRef = useRef<number | null>(null);

  // Start a new game
  const startNewGame = useCallback((diff: Difficulty) => {
    setGenerating(true);
    // Use setTimeout to allow UI to update with loading state
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
      setGenerating(false);
    }, 50);
  }, []);

  // Initialize game on mount
  useEffect(() => {
    startNewGame(difficulty);
  }, []);

  // Timer logic
  useEffect(() => {
    if (isRunning && gameState === 'playing') {
      timerRef.current = window.setInterval(() => {
        setTimer(t => t + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, gameState]);

  // Format timer display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Save current state to history
  const saveToHistory = () => {
    setHistory(prev => [...prev, { board: copyBoard(board), notes: copyNotes(notes) }]);
  };

  // Handle number input
  const handleNumberInput = (num: number) => {
    if (!selectedCell || gameState !== 'playing') return;
    const [row, col] = selectedCell;

    // Can't modify given cells
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

      // Clear notes for this cell
      const newNotes = copyNotes(notes);
      newNotes[row][col].clear();
      setNotes(newNotes);

      // Check if it's a mistake
      if (solution[row][col] !== num) {
        setMistakes(m => m + 1);
      }

      // Check if board is complete
      if (isBoardComplete(newBoard)) {
        setGameState('won');
        setIsRunning(false);
      }
    }
  };

  // Handle erase
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

  // Handle undo
  const handleUndo = () => {
    if (history.length === 0 || gameState !== 'playing') return;
    const lastEntry = history[history.length - 1];
    setBoard(lastEntry.board);
    setNotes(lastEntry.notes);
    setHistory(prev => prev.slice(0, -1));
  };

  // Handle hint
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

    if (isBoardComplete(newBoard)) {
      setGameState('won');
      setIsRunning(false);
    }
  };

  // Keyboard handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;

      if (e.key >= '1' && e.key <= '9') {
        handleNumberInput(parseInt(e.key));
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        handleErase();
      } else if (e.key === 'n' || e.key === 'N') {
        setNotesMode(prev => !prev);
      } else if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
        handleUndo();
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

  // Get cell classes for styling
  const getCellClasses = (row: number, col: number): string => {
    const classes = ['sudoku-cell'];
    const isSelected = selectedCell && selectedCell[0] === row && selectedCell[1] === col;
    const isSameRow = selectedCell && selectedCell[0] === row;
    const isSameCol = selectedCell && selectedCell[1] === col;
    const isSameBox = selectedCell &&
      Math.floor(selectedCell[0] / 3) === Math.floor(row / 3) &&
      Math.floor(selectedCell[1] / 3) === Math.floor(col / 3);
    const isSameNumber = selectedCell && board[selectedCell[0]][selectedCell[1]] !== null &&
      board[row][col] === board[selectedCell[0]][selectedCell[1]];
    const isGiven = puzzle[row]?.[col] !== null && puzzle[row]?.[col] !== undefined;
    const hasError = showErrors && board[row]?.[col] !== null && hasConflict(board, row, col);

    if (isSelected) classes.push('selected');
    else if (isSameRow || isSameCol || isSameBox) classes.push('highlighted');
    if (isSameNumber && !isSelected) classes.push('same-number');
    if (isGiven) classes.push('given');
    if (hasError) classes.push('error');

    // Border classes for 3x3 boxes
    if (col % 3 === 0 && col !== 0) classes.push('border-left-thick');
    if (row % 3 === 0 && row !== 0) classes.push('border-top-thick');

    return classes.join(' ');
  };

  // Count remaining numbers
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold text-indigo-900 mb-1">🧩 Sudoku</h1>
        <p className="text-gray-500 text-sm">Fill the grid so every row, column, and 3×3 box contains 1-9</p>
      </div>

      {/* Game Controls */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
        {/* Difficulty selector */}
        <div className="flex gap-1 bg-white rounded-lg shadow-sm p-1 border border-gray-200">
          {(['easy', 'medium', 'hard', 'expert'] as Difficulty[]).map((diff) => (
            <button
              key={diff}
              onClick={() => {
                setDifficulty(diff);
                startNewGame(diff);
              }}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                difficulty === diff
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {diff.charAt(0).toUpperCase() + diff.slice(1)}
            </button>
          ))}
        </div>

        {/* New Game button */}
        <button
          onClick={() => startNewGame(difficulty)}
          className="px-4 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-all shadow-sm"
        >
          New Game
        </button>
      </div>

      {/* Stats bar */}
      <div className="flex items-center justify-between w-full max-w-md mb-3 px-2">
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-600">
            ⏱️ <span className="font-mono font-medium">{formatTime(timer)}</span>
          </span>
          <span className="text-gray-600">
            ❌ Mistakes: <span className="font-medium text-red-600">{mistakes}</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={showErrors}
              onChange={(e) => setShowErrors(e.target.checked)}
              className="w-3.5 h-3.5 rounded text-indigo-600"
            />
            Errors
          </label>
        </div>
      </div>

      {/* Sudoku Board */}
      <div className={`relative ${generating ? 'opacity-50' : ''}`}>
        {generating && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="bg-white px-4 py-2 rounded-lg shadow-lg text-indigo-700 font-medium">
              Generating puzzle...
            </div>
          </div>
        )}
        <div className="grid grid-cols-9 border-2 border-indigo-900 rounded-lg overflow-hidden shadow-lg bg-white">
          {board.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={getCellClasses(rowIndex, colIndex)}
                onClick={() => {
                  if (gameState === 'playing') {
                    setSelectedCell([rowIndex, colIndex]);
                  }
                }}
              >
                {cell !== null ? (
                  <span className="text-lg font-semibold">{cell}</span>
                ) : notes[rowIndex]?.[colIndex]?.size > 0 ? (
                  <div className="grid grid-cols-3 gap-0 w-full h-full p-0.5">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                      <span
                        key={n}
                        className="text-[8px] leading-[10px] text-indigo-400 flex items-center justify-center"
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

      {/* Action buttons */}
      <div className="flex items-center justify-center gap-2 mt-4">
        <button
          onClick={handleUndo}
          disabled={history.length === 0 || gameState !== 'playing'}
          className="flex flex-col items-center px-3 py-2 rounded-lg bg-white border border-gray-200 shadow-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <span className="text-lg">↩️</span>
          <span className="text-xs text-gray-600 mt-0.5">Undo</span>
        </button>
        <button
          onClick={handleErase}
          disabled={gameState !== 'playing'}
          className="flex flex-col items-center px-3 py-2 rounded-lg bg-white border border-gray-200 shadow-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <span className="text-lg">🧹</span>
          <span className="text-xs text-gray-600 mt-0.5">Erase</span>
        </button>
        <button
          onClick={() => setNotesMode(!notesMode)}
          disabled={gameState !== 'playing'}
          className={`flex flex-col items-center px-3 py-2 rounded-lg border shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
            notesMode
              ? 'bg-indigo-100 border-indigo-300'
              : 'bg-white border-gray-200 hover:bg-gray-50'
          }`}
        >
          <span className="text-lg">✏️</span>
          <span className="text-xs text-gray-600 mt-0.5">Notes {notesMode ? 'ON' : 'OFF'}</span>
        </button>
        <button
          onClick={handleHint}
          disabled={gameState !== 'playing'}
          className="flex flex-col items-center px-3 py-2 rounded-lg bg-white border border-gray-200 shadow-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <span className="text-lg">💡</span>
          <span className="text-xs text-gray-600 mt-0.5">Hint</span>
        </button>
      </div>

      {/* Number pad */}
      <div className="flex items-center justify-center gap-1.5 mt-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => {
          const count = getNumberCount(num);
          const isComplete = count >= 9;
          return (
            <button
              key={num}
              onClick={() => handleNumberInput(num)}
              disabled={isComplete || gameState !== 'playing'}
              className={`relative w-10 h-12 rounded-lg font-bold text-lg transition-all ${
                isComplete
                  ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                  : 'bg-white border border-gray-200 text-indigo-700 shadow-sm hover:bg-indigo-50 hover:border-indigo-300 active:scale-95'
              }`}
            >
              {num}
              <span className="absolute bottom-0.5 right-1 text-[9px] text-gray-400 font-normal">
                {9 - count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Win Modal */}
      {gameState === 'won' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 shadow-2xl text-center max-w-sm w-full animate-bounce-in">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-indigo-900 mb-2">Congratulations!</h2>
            <p className="text-gray-600 mb-1">You solved the puzzle!</p>
            <div className="flex justify-center gap-6 my-4 text-sm">
              <div>
                <div className="text-2xl font-bold text-indigo-700">{formatTime(timer)}</div>
                <div className="text-gray-500">Time</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{mistakes}</div>
                <div className="text-gray-500">Mistakes</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600 capitalize">{difficulty}</div>
                <div className="text-gray-500">Difficulty</div>
              </div>
            </div>
            <button
              onClick={() => startNewGame(difficulty)}
              className="mt-4 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-all shadow-lg"
            >
              Play Again
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-6 text-center text-xs text-gray-400">
        <p>Use keyboard arrows to navigate • Number keys to input • N for notes mode • Ctrl+Z to undo</p>
      </div>
    </div>
  );
}

export default App;
