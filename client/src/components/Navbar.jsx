import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Sparkles, 
  CalendarDays, 
  PenTool, 
  Eye, 
  Bot, 
  Flame, 
  Layers 
} from 'lucide-react';

export default function Navbar({ onOpenAi, streakCount = 0 }) {
  const location = useLocation();
  const today = new Date().toISOString().split('T')[0];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Top Navbar Header */}
      <header className="sticky top-0 z-40 w-full border-b border-blue-100/80 bg-white/90 backdrop-blur-xl shadow-[0_4px_20px_-4px_rgba(37,99,235,0.06)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Brand / Logo */}
          <Link to="/cards" className="flex items-center gap-2.5 sm:gap-3 group">
            <div className="relative">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-105 group-hover:rotate-3 transition-all duration-300">
                <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-base sm:text-lg text-slate-900 tracking-tight">DailyTracker</span>
                <span className="text-[9px] sm:text-[10px] font-bold uppercase px-1.5 py-0.2 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
                  AI
                </span>
              </div>
              <p className="text-[10px] font-medium text-slate-400 hidden sm:block">Plan • Learn • Apply • Visualize</p>
            </div>
          </Link>

          {/* Desktop Navigation Tabs (Hidden on Mobile) */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/80 shadow-inner">
            <Link
              to="/cards"
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                isActive('/cards') 
                  ? 'bg-white text-blue-600 shadow-[0_2px_8px_rgba(0,0,0,0.08)] scale-[1.02]' 
                  : 'text-slate-600 hover:text-blue-600 hover:bg-white/60'
              }`}
            >
              <CalendarDays className="w-4 h-4 text-blue-500" />
              <span>All Cards</span>
            </Link>

            <Link
              to={`/write?date=${today}`}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                location.pathname.startsWith('/write') 
                  ? 'bg-white text-blue-600 shadow-[0_2px_8px_rgba(0,0,0,0.08)] scale-[1.02]' 
                  : 'text-slate-600 hover:text-blue-600 hover:bg-white/60'
              }`}
            >
              <PenTool className="w-4 h-4 text-emerald-500" />
              <span>Write Card</span>
            </Link>

            <Link
              to={`/cards/${today}`}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                location.pathname === `/cards/${today}` 
                  ? 'bg-white text-blue-600 shadow-[0_2px_8px_rgba(0,0,0,0.08)] scale-[1.02]' 
                  : 'text-slate-600 hover:text-blue-600 hover:bg-white/60'
              }`}
            >
              <Eye className="w-4 h-4 text-sky-500" />
              <span>Visualizer</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-700 font-bold">
                Today
              </span>
            </Link>
          </nav>

          {/* Right Action: Streak & Gemini AI Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            {streakCount > 0 && (
              <div className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 text-amber-700 text-[11px] sm:text-xs font-bold shadow-xs">
                <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-500 fill-orange-500 animate-bounce" />
                <span>{streakCount}d</span>
                <span className="hidden sm:inline">Streak</span>
              </div>
            )}

            <button
              onClick={onOpenAi}
              className="btn-3d-blue flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-white text-xs sm:text-sm font-bold cursor-pointer"
              title="Chat with Gemini AI to ask questions or open cards"
            >
              <Bot className="w-4 h-4" />
              <span>Ask AI</span>
            </button>
          </div>

        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (iOS / Android Style) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-2xl border-t border-blue-100 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] px-4 py-2 flex items-center justify-around">
        <Link
          to="/cards"
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            isActive('/cards') ? 'text-blue-600 font-black scale-105' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <CalendarDays className="w-5 h-5" />
          <span className="text-[10px]">Cards</span>
        </Link>

        <Link
          to={`/write?date=${today}`}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            location.pathname.startsWith('/write') ? 'text-blue-600 font-black scale-105' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <div className="relative">
            <PenTool className="w-5 h-5" />
            <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <span className="text-[10px]">Write</span>
        </Link>

        <Link
          to={`/cards/${today}`}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            location.pathname === `/cards/${today}` ? 'text-blue-600 font-black scale-105' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Eye className="w-5 h-5" />
          <span className="text-[10px]">Visualize</span>
        </Link>

        <button
          onClick={onOpenAi}
          className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-blue-600 hover:text-blue-700 active:scale-95 transition-all cursor-pointer"
        >
          <div className="w-6 h-6 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center">
            <Bot className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-[10px] font-bold">Gemini</span>
        </button>
      </div>
    </>
  );
}
