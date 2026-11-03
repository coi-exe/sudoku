export type Board = (number | null)[][];
export type Notes = Set<number>[][];
export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

// Create an empty 9x9 board
function createEmptyBoard(): Board {
  return Array(9).fill(null).map(() => Array(9).fill(null));
}

// Create empty notes grid
export function createEmptyNotes(): Notes {
  return Array(9).fill(null).map(() => Array(9).fill(null).map(() => new Set<number>()));
}

// Check if a number is valid in a given position
export function isValid(board: Board, row: number, col: number, num: number): boolean {
  // Check row
  for (let c = 0; c < 9; c++) {
    if (board[row][c] === num) return false;
  }

  // Check column
  for (let r = 0; r < 9; r++) {
    if (board[r][col] === num) return false;
  }

  // Check 3x3 box
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if (board[r][c] === num) return false;
    }
  }

  return true;
}

// Shuffle an array using Fisher-Yates
function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Solve the board using backtracking
export function solve(board: Board): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === null) {
        const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        for (const num of nums) {
          if (isValid(board, row, col, num)) {
            board[row][col] = num;
            if (solve(board)) return true;
            board[row][col] = null;
          }
        }
        return false;
      }
    }
  }
  return true;
}

// Count solutions (up to limit) to check uniqueness
function countSolutions(board: Board, limit: number = 2): number {
  let count = 0;

  function solveCount(b: Board): boolean {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (b[row][col] === null) {
          for (let num = 1; num <= 9; num++) {
            if (isValid(b, row, col, num)) {
              b[row][col] = num;
              if (solveCount(b)) return true;
              b[row][col] = null;
            }
          }
          return false;
        }
      }
    }
    count++;
    return count >= limit;
  }

  const boardCopy = board.map(row => [...row]);
  solveCount(boardCopy);
  return count;
}

// Generate a complete solved board
function generateSolvedBoard(): Board {
  const board = createEmptyBoard();
  solve(board);
  return board;
}

// Get number of cells to remove based on difficulty
function getCellsToRemove(difficulty: Difficulty): number {
  switch (difficulty) {
    case 'easy': return 35;
    case 'medium': return 45;
    case 'hard': return 52;
    case 'expert': return 58;
  }
}

// Generate a puzzle by removing cells from a solved board
export function generatePuzzle(difficulty: Difficulty): { puzzle: Board; solution: Board } {
  const solution = generateSolvedBoard();
  const puzzle = solution.map(row => [...row]);
  const cellsToRemove = getCellsToRemove(difficulty);

  // Get all positions and shuffle them
  const positions: [number, number][] = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      positions.push([r, c]);
    }
  }
  const shuffledPositions = shuffle(positions);

  let removed = 0;
  for (const [row, col] of shuffledPositions) {
    if (removed >= cellsToRemove) break;

    const backup = puzzle[row][col];
    puzzle[row][col] = null;

    // Check if puzzle still has unique solution
    if (countSolutions(puzzle) === 1) {
      removed++;
    } else {
      puzzle[row][col] = backup;
    }
  }

  return { puzzle, solution };
}

// Check if the board is complete and correct
export function isBoardComplete(board: Board): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] === null) return false;
    }
  }
  return isBoardValid(board);
}

// Check if the current board state is valid (no conflicts)
export function isBoardValid(board: Board): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const num = board[r][c];
      if (num === null) continue;

      // Temporarily remove the number to check
      board[r][c] = null;
      if (!isValid(board, r, c, num)) {
        board[r][c] = num;
        return false;
      }
      board[r][c] = num;
    }
  }
  return true;
}

// Check if a specific cell has a conflict
export function hasConflict(board: Board, row: number, col: number): boolean {
  const num = board[row][col];
  if (num === null) return false;

  // Check row
  for (let c = 0; c < 9; c++) {
    if (c !== col && board[row][c] === num) return true;
  }

  // Check column
  for (let r = 0; r < 9; r++) {
    if (r !== row && board[r][col] === num) return true;
  }

  // Check box
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if ((r !== row || c !== col) && board[r][c] === num) return true;
    }
  }

  return false;
}

// Deep copy a board
export function copyBoard(board: Board): Board {
  return board.map(row => [...row]);
}

// Deep copy notes
export function copyNotes(notes: Notes): Notes {
  return notes.map(row => row.map(cell => new Set(cell)));
}
