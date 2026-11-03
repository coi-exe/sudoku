import { Link } from 'react-router-dom';
import { Difficulty } from '../utils/sudoku';

interface HomePageProps {
  onStartGame: (difficulty: Difficulty) => void;
}

export default function HomePage({ onStartGame }: HomePageProps) {
  const difficulties: { level: Difficulty; emoji: string; color: string; desc: string }[] = [
    { level: 'easy', emoji: '🌱', color: 'from-green-400 to-green-600', desc: 'Great for beginners' },
    { level: 'medium', emoji: '🔥', color: 'from-yellow-400 to-orange-500', desc: 'A moderate challenge' },
    { level: 'hard', emoji: '💎', color: 'from-blue-400 to-blue-600', desc: 'For experienced players' },
    { level: 'expert', emoji: '🏆', color: 'from-purple-500 to-pink-600', desc: 'Only for masters' },
  ];

  return (
    <div className="min-h-[calc(100vh-60px)] flex flex-col items-center justify-center px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-10">
        <div className="text-7xl mb-4 animate-bounce-slow">🧩</div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-3">
          Sudoku
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          Challenge your mind with the world's most popular logic puzzle. Choose your difficulty and start playing!
        </p>
      </div>

      {/* Difficulty Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg mb-8">
        {difficulties.map(({ level, emoji, color, desc }) => (
          <button
            key={level}
            onClick={() => onStartGame(level)}
            className="group relative overflow-hidden rounded-2xl p-5 text-left transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-90`} />
            <div className="relative z-10">
              <div className="text-3xl mb-2">{emoji}</div>
              <h3 className="text-xl font-bold text-white capitalize">{level}</h3>
              <p className="text-white/80 text-sm mt-1">{desc}</p>
            </div>
            <div className="absolute -right-4 -bottom-4 text-8xl opacity-20 group-hover:opacity-30 transition-opacity">
              {emoji}
            </div>
          </button>
        ))}
      </div>

      {/* Quick Links */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-lg">
        <Link
          to="/tutorial"
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border-2 border-indigo-200 dark:border-indigo-800 rounded-xl text-indigo-700 dark:text-indigo-300 font-medium hover:bg-indigo-50 dark:hover:bg-gray-700 transition-all"
        >
          <span>📖</span> Learn How to Play
        </Link>
        <Link
          to="/play"
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-all shadow-lg"
        >
          <span>🎮</span> Quick Play
        </Link>
      </div>

      {/* Features */}
      <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-lg">
        {[
          { icon: '📱', label: 'Mobile Friendly' },
          { icon: '🌙', label: 'Dark Mode' },
          { icon: '💡', label: 'Hints' },
          { icon: '✏️', label: 'Notes Mode' },
        ].map(({ icon, label }) => (
          <div key={label} className="text-center p-3 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
            <div className="text-2xl mb-1">{icon}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
