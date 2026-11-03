import { useState } from 'react';
import { HashRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import GamePage from './pages/GamePage';
import TutorialPage from './pages/TutorialPage';
import { Difficulty } from './utils/sudoku';

function AppContent() {
  const [gameDifficulty, setGameDifficulty] = useState<Difficulty>('easy');
  const navigate = useNavigate();

  const handleStartGame = (difficulty: Difficulty) => {
    setGameDifficulty(difficulty);
    navigate('/play');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 transition-colors duration-300">
      <Header />
      <Routes>
        <Route path="/" element={<HomePage onStartGame={handleStartGame} />} />
        <Route path="/play" element={<GamePage initialDifficulty={gameDifficulty} />} />
        <Route path="/tutorial" element={<TutorialPage />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </ThemeProvider>
  );
}

export default App;
