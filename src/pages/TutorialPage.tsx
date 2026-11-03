import { useState } from 'react';
import { Link } from 'react-router-dom';

interface TutorialStep {
  id: number;
  title: string;
  emoji: string;
  content: string;
  interactive?: boolean;
  challenge?: () => JSX.Element;
}

function RowColChallenge() {
  const [selected, setSelected] = useState<number | null>(null);
  const cells = [5, null, 3, null, null, 7, null, null, 2];
  const correctAnswer = 1;
  const [answer, setAnswer] = useState<number | null>(null);
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);

  const checkAnswer = (num: number) => {
    setAnswer(num);
    setResult(num === correctAnswer ? 'correct' : 'wrong');
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mt-3">
      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
        <strong>Challenge:</strong> What number goes in the highlighted cell? (Row has: 5, 3, 7, 2)
      </p>
      <div className="flex gap-1 mb-3">
        {cells.map((cell, i) => (
          <div
            key={i}
            onClick={() => setSelected(i)}
            className={`w-9 h-9 flex items-center justify-center rounded border-2 text-sm font-bold transition-all cursor-pointer ${
              i === 1
                ? 'border-indigo-500 bg-indigo-100 dark:bg-indigo-900/50'
                : selected === i
                ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/30'
                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900'
            }`}
          >
            {cell !== null ? (
              <span className="text-gray-900 dark:text-white">{cell}</span>
            ) : (
              <span className="text-gray-400">?</span>
            )}
          </div>
        ))}
      </div>
      <div className="flex gap-2 flex-wrap">
        {[1, 4, 6, 8, 9].map(num => (
          <button
            key={num}
            onClick={() => checkAnswer(num)}
            className={`w-9 h-9 rounded-lg font-bold text-sm transition-all active:scale-90 ${
              answer === num
                ? num === correctAnswer
                  ? 'bg-green-500 text-white'
                  : 'bg-red-500 text-white'
                : 'bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30'
            }`}
          >
            {num}
          </button>
        ))}
      </div>
      {result && (
        <p className={`mt-2 text-sm font-medium ${result === 'correct' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          {result === 'correct' ? '✅ Correct! The row needs 1, 4, 6, 8, 9 and 1 fits here.' : '❌ Try again! Look at which numbers are missing from the row.'}
        </p>
      )}
    </div>
  );
}

function BoxChallenge() {
  const [answer, setAnswer] = useState<number | null>(null);
  const correctAnswer = 6;

  const box = [
    [null, 5, null],
    [null, null, 8],
    [4, null, null],
  ];

  const checkAnswer = (num: number) => {
    setAnswer(num);
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mt-3">
      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
        <strong>Challenge:</strong> What number goes in the top-left cell of this 3×3 box?
        <br /><span className="text-xs text-gray-500">Box contains: 5, 8, 4. Column 1 has: 4. Row 1 has: 5.</span>
      </p>
      <div className="grid grid-cols-3 gap-0.5 w-fit mb-3 border-2 border-indigo-900 dark:border-indigo-400 rounded">
        {box.flat().map((cell, i) => (
          <div
            key={i}
            className={`w-10 h-10 flex items-center justify-center text-sm font-bold ${
              i === 0
                ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
                : 'bg-white dark:bg-gray-900'
            }`}
          >
            {cell !== null ? (
              <span className="text-gray-900 dark:text-white">{cell}</span>
            ) : i === 0 ? (
              <span>?</span>
            ) : (
              <span className="text-gray-300">·</span>
            )}
          </div>
        ))}
      </div>
      <div className="flex gap-2 flex-wrap">
        {[1, 2, 3, 6, 7, 9].map(num => (
          <button
            key={num}
            onClick={() => checkAnswer(num)}
            className={`w-9 h-9 rounded-lg font-bold text-sm transition-all active:scale-90 ${
              answer === num
                ? num === correctAnswer
                  ? 'bg-green-500 text-white'
                  : 'bg-red-500 text-white'
                : 'bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30'
            }`}
          >
            {num}
          </button>
        ))}
      </div>
      {answer && (
        <p className={`mt-2 text-sm font-medium ${answer === correctAnswer ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          {answer === correctAnswer
            ? '✅ Correct! The box needs 1, 2, 3, 6, 7, 9. Column 1 has 4, Row 1 has 5, so only 6 works here!'
            : '❌ Not quite. Consider which numbers the row, column, and box already have.'}
        </p>
      )}
    </div>
  );
}

function NotesChallenge() {
  const [selectedNotes, setSelectedNotes] = useState<Set<number>>(new Set());
  const correctNotes = new Set([1, 6, 9]);

  const toggleNote = (num: number) => {
    setSelectedNotes(prev => {
      const next = new Set(prev);
      if (next.has(num)) next.delete(num);
      else next.add(num);
      return next;
    });
  };

  const isCorrect = selectedNotes.size === correctNotes.size &&
    [...selectedNotes].every(n => correctNotes.has(n));

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mt-3">
      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
        <strong>Challenge:</strong> Select all possible candidates for this cell using notes mode.
        <br /><span className="text-xs text-gray-500">Row has: 2, 4, 5, 7. Column has: 3, 8. Box has: 2, 3, 5, 7, 8.</span>
      </p>
      <div className="flex gap-2 flex-wrap">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <button
            key={num}
            onClick={() => toggleNote(num)}
            className={`w-9 h-9 rounded-lg font-bold text-sm transition-all active:scale-90 ${
              selectedNotes.has(num)
                ? correctNotes.has(num)
                  ? 'bg-indigo-500 text-white'
                  : 'bg-red-400 text-white'
                : 'bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30'
            }`}
          >
            {num}
          </button>
        ))}
      </div>
      {selectedNotes.size > 0 && (
        <p className={`mt-2 text-sm font-medium ${isCorrect ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
          {isCorrect
            ? '✅ Perfect! 1, 6, and 9 are the only numbers that don\'t conflict with any row, column, or box.'
            : `You've selected ${selectedNotes.size} number(s). ${selectedNotes.size < 3 ? 'Try adding more candidates.' : 'Some of those conflict with existing numbers.'}`}
        </p>
      )}
    </div>
  );
}

export default function TutorialPage() {
  const [currentStep, setCurrentStep] = useState(0);

  const steps: TutorialStep[] = [
    {
      id: 1,
      title: 'What is Sudoku?',
      emoji: '🧩',
      content: 'Sudoku is a logic-based number puzzle played on a 9×9 grid. The grid is divided into nine 3×3 boxes. Your goal is to fill every empty cell with a number from 1 to 9.',
    },
    {
      id: 2,
      title: 'The Three Rules',
      emoji: '📏',
      content: 'Each row must contain all digits 1-9 with no repeats. Each column must contain all digits 1-9 with no repeats. Each 3×3 box must contain all digits 1-9 with no repeats. That\'s it — just three simple rules!',
    },
    {
      id: 3,
      title: 'Reading Rows & Columns',
      emoji: '↔️',
      content: 'Start by looking at rows and columns that are almost full. If a row has 8 numbers filled, you can easily figure out the missing one by elimination.',
      interactive: true,
      challenge: RowColChallenge,
    },
    {
      id: 4,
      title: 'Thinking in Boxes',
      emoji: '📦',
      content: 'The 3×3 boxes add another constraint. When you combine row, column, AND box information, you can often determine exactly which number goes in a cell.',
      interactive: true,
      challenge: BoxChallenge,
    },
    {
      id: 5,
      title: 'Using Notes (Pencil Marks)',
      emoji: '✏️',
      content: 'When you\'re not sure which number goes in a cell, use Notes mode to write down all possible candidates. Toggle notes mode with the ✏️ button or press N on your keyboard.',
      interactive: true,
      challenge: NotesChallenge,
    },
    {
      id: 6,
      title: 'Elimination Strategy',
      emoji: '🔍',
      content: 'The key technique in Sudoku is elimination. For each empty cell, ask: "Which numbers CAN\'T go here?" Cross out numbers already in the same row, column, and box. If only one number remains, that\'s your answer!',
    },
    {
      id: 7,
      title: 'Advanced: Hidden Singles',
      emoji: '🎯',
      content: 'Sometimes a number can only go in ONE specific cell within a row, column, or box — even if that cell has multiple candidates. Look for numbers that have limited placement options!',
    },
    {
      id: 8,
      title: 'Tips & Controls',
      emoji: '💡',
      content: '• Use the Hint button (💡) if you\'re stuck\n• Toggle Errors to see conflicts in real-time\n• Pause anytime with ⏸️ or press Escape\n• Adjust the timer in timer settings\n• Keyboard: arrows to navigate, 1-9 to input, N for notes, Ctrl+Z to undo',
    },
  ];

  const currentStepData = steps[currentStep];

  return (
    <div className="min-h-[calc(100vh-60px)] flex flex-col items-center px-4 py-6 sm:py-8">
      <div className="w-full max-w-lg">
        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            📖 How to Play Sudoku
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Learn the rules and strategies step by step
          </p>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-1 mb-6">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentStep(i)}
              className={`flex-1 h-2 rounded-full transition-all ${
                i === currentStep
                  ? 'bg-indigo-600 dark:bg-indigo-400'
                  : i < currentStep
                  ? 'bg-indigo-300 dark:bg-indigo-700'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            />
          ))}
        </div>

        {/* Step Counter */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-4">
          Step {currentStep + 1} of {steps.length}
        </p>

        {/* Content Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg p-6 mb-6">
          <div className="text-center mb-4">
            <span className="text-4xl">{currentStepData.emoji}</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-4">
            {currentStepData.title}
          </h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
            {currentStepData.content}
          </p>

          {/* Interactive Challenge */}
          {currentStepData.interactive && currentStepData.challenge && (
            <currentStepData.challenge />
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            ← Previous
          </button>

          {currentStep < steps.length - 1 ? (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-all active:scale-95"
            >
              Next →
            </button>
          ) : (
            <Link
              to="/play"
              className="px-4 py-2 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 transition-all active:scale-95"
            >
              🎮 Start Playing!
            </Link>
          )}
        </div>

        {/* Quick Tips */}
        <div className="mt-8 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 border border-indigo-100 dark:border-indigo-800">
          <h3 className="font-bold text-indigo-900 dark:text-indigo-300 mb-2">💡 Quick Tips</h3>
          <ul className="text-sm text-indigo-800 dark:text-indigo-400 space-y-1">
            <li>• Always start with the easiest cells — look for rows/columns/boxes nearly complete</li>
            <li>• Use notes mode when uncertain instead of guessing</li>
            <li>• If you make a mistake, use Undo (Ctrl+Z) to go back</li>
            <li>• Take your time — Sudoku is about logic, not speed!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
