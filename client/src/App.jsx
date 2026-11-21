import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import AiChatDrawer from './components/AiChatDrawer';
import AllCardsPage from './pages/AllCardsPage';
import WriteCardPage from './pages/WriteCardPage';
import VisualizerPage from './pages/VisualizerPage';
import { getStats } from './api/client';

export default function App() {
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiCurrentDate, setAiCurrentDate] = useState(null);
  const [streak, setStreak] = useState(0);

  const location = useLocation();

  useEffect(() => {
    // Load streak stats
    getStats()
      .then(res => {
        if (res.data?.data?.currentStreak !== undefined) {
          setStreak(res.data.data.currentStreak);
        }
      })
      .catch(err => console.log('Stats fetch:', err.message));
  }, [location.pathname]);

  const handleOpenAi = (dateContext) => {
    if (typeof dateContext === 'string') {
      setAiCurrentDate(dateContext);
    } else {
      // Default to today
      setAiCurrentDate(new Date().toISOString().split('T')[0]);
    }
    setIsAiOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-blue-500/20 selection:text-blue-700">
      {/* Top Navigation */}
      <Navbar onOpenAi={() => handleOpenAi(null)} streakCount={streak} />

      {/* Main Pages */}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Navigate to="/cards" replace />} />
          <Route path="/cards" element={<AllCardsPage onOpenAi={handleOpenAi} />} />
          <Route path="/write" element={<WriteCardPage />} />
          <Route path="/cards/:date" element={<VisualizerPage onOpenAi={handleOpenAi} />} />
          <Route path="/cards/:date/edit" element={<WriteCardPage />} />
          <Route path="*" element={<Navigate to="/cards" replace />} />
        </Routes>
      </main>

      {/* Global Gemini AI Assistant Drawer */}
      <AiChatDrawer
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        currentDate={aiCurrentDate}
      />
    </div>
  );
}
