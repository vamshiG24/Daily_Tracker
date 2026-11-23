import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Search, 
  PenTool, 
  Eye, 
  CheckCircle2, 
  BookOpen, 
  Briefcase, 
  Flame, 
  Plus, 
  Trash2, 
  Filter, 
  Sparkles, 
  ArrowRight
} from 'lucide-react';
import { getCards, getStats, deleteCard } from '../api/client';

export default function AllCardsPage({ onOpenAi }) {
  const navigate = useNavigate();
  const [cards, setCards] = useState(() => {
    try {
      const saved = localStorage.getItem('dt_cards_cache');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [stats, setStats] = useState(() => {
    try {
      const saved = localStorage.getItem('dt_stats_cache');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(() => {
    try {
      const saved = localStorage.getItem('dt_cards_cache');
      return !(saved && JSON.parse(saved).length > 0);
    } catch {
      return true;
    }
  });
  const [isWakingUp, setIsWakingUp] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchCardsAndStats(true);

    // Silent background refresh on tab focus without full-screen flicker
    const handleFocus = () => fetchCardsAndStats(false);
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const fetchCardsAndStats = async (isInitial = false) => {
    if (cards.length === 0 && isInitial) {
      setLoading(true);
    }

    // If server takes longer than 2.5 seconds (Render cold start), notify user
    const wakeTimer = setTimeout(() => {
      setIsWakingUp(true);
    }, 2500);

    try {
      const [cardsRes, statsRes] = await Promise.all([
        getCards(),
        getStats()
      ]);
      const newCards = cardsRes.data.data || [];
      const newStats = statsRes.data.data || null;

      setCards(newCards);
      setStats(newStats);

      try {
        localStorage.setItem('dt_cards_cache', JSON.stringify(newCards));
        if (newStats) localStorage.setItem('dt_stats_cache', JSON.stringify(newStats));
      } catch (storageErr) {
        console.warn('Failed to cache data locally:', storageErr);
      }
    } catch (err) {
      console.error('Failed to load cards:', err);
    } finally {
      clearTimeout(wakeTimer);
      setIsWakingUp(false);
      setLoading(false);
    }
  };

  const handleDelete = async (e, date) => {
    e.stopPropagation();
    e.preventDefault();
    if (!window.confirm(`Are you sure you want to delete the card for ${date}?`)) return;

    try {
      await deleteCard(date);
      setCards(prev => {
        const updated = prev.filter(c => c.date !== date);
        try {
          localStorage.setItem('dt_cards_cache', JSON.stringify(updated));
        } catch (_) {}
        return updated;
      });
      fetchCardsAndStats(false);
    } catch (err) {
      alert('Failed to delete card: ' + err.message);
    }
  };

  const filteredCards = cards.filter(card => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      !query ||
      card.date.toLowerCase().includes(query) ||
      (card.title && card.title.toLowerCase().includes(query)) ||
      card.studyLogs?.some(s => s.topic.toLowerCase().includes(query) || s.description.toLowerCase().includes(query)) ||
      card.jobsApplied?.some(j => j.companyName.toLowerCase().includes(query) || j.role?.toLowerCase().includes(query));

    if (!matchesSearch) return false;

    if (activeFilter === 'with-study') return card.studyLogs?.length > 0;
    if (activeFilter === 'with-jobs') return card.jobsApplied?.length > 0;
    if (activeFilter === 'completed-tasks') {
      return card.morningTasks?.length > 0 && card.morningTasks.every(t => t.isCompleted);
    }

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8 pb-24 md:pb-12">
      
      {/* Cloud Server Wake-up Notice */}
      {isWakingUp && (
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-blue-900 text-xs font-semibold shadow-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
            </span>
            <span>Cloud server is waking up (Render free tier)... Syncing latest data in a few seconds.</span>
          </div>
          <span className="text-[10px] text-blue-600 bg-blue-100/70 px-2 py-0.5 rounded-md font-mono hidden sm:inline">Syncing...</span>
        </div>
      )}

      {/* 3D Hero & Quick Stats Section */}
      <div className="relative overflow-hidden rounded-3xl bg-white border border-blue-100 p-5 sm:p-8 md:p-10 shadow-[0_20px_50px_rgba(37,99,235,0.08)]">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-sky-300/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-gradient-to-tr from-indigo-400/15 to-purple-300/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>3D MERN Workspace • Gemini AI</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              Daily Activity & Growth Hub
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl leading-relaxed">
              Plan your morning goals, record technical topics studied, track job applications, and ask Gemini AI to navigate or quiz your knowledge.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
            <Link
              to={`/write?date=${today}`}
              className="btn-3d-blue flex items-center justify-center gap-2 px-5 py-2.5 sm:py-3 rounded-2xl text-white font-bold text-xs sm:text-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Log Today ({today})</span>
            </Link>

            <button
              onClick={() => onOpenAi(today)}
              className="btn-3d-white flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 rounded-2xl text-slate-700 font-bold text-xs sm:text-sm cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Ask AI</span>
            </button>
          </div>
        </div>

        {/* 3D Stats Cards (Responsive 2x2 grid on mobile) */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-slate-100">
            <div className="bg-gradient-to-b from-blue-50/50 to-white rounded-2xl p-3 sm:p-4 border border-blue-100/80 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-[11px] sm:text-xs font-semibold">
                <span>Streak</span>
                <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1 sm:mt-2">
                {stats.currentStreak} <span className="text-[10px] sm:text-xs text-slate-400 font-medium">Days</span>
              </p>
            </div>

            <div className="bg-gradient-to-b from-emerald-50/50 to-white rounded-2xl p-3 sm:p-4 border border-emerald-100/80 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-[11px] sm:text-xs font-semibold">
                <span>Morning Tasks</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1 sm:mt-2">
                {stats.taskCompletionRate}% <span className="text-[10px] sm:text-xs text-slate-400 font-medium">({stats.completedTasks}/{stats.totalTasks})</span>
              </p>
            </div>

            <div className="bg-gradient-to-b from-indigo-50/50 to-white rounded-2xl p-3 sm:p-4 border border-indigo-100/80 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-[11px] sm:text-xs font-semibold">
                <span>Topics Studied</span>
                <BookOpen className="w-4 h-4 text-indigo-600" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1 sm:mt-2">
                {stats.totalStudyTopics} <span className="text-[10px] sm:text-xs text-slate-400 font-medium">Topics</span>
              </p>
            </div>

            <div className="bg-gradient-to-b from-sky-50/50 to-white rounded-2xl p-3 sm:p-4 border border-sky-100/80 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-[11px] sm:text-xs font-semibold">
                <span>Applications</span>
                <Briefcase className="w-4 h-4 text-sky-600" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1 sm:mt-2">
                {stats.totalJobsApplied} <span className="text-[10px] sm:text-xs text-slate-400 font-medium">Roles</span>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search dates, topics, or companies..."
            className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 shadow-xs transition"
          />
        </div>

        {/* Filter Pills (Horizontal swipe on mobile) */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
          <Filter className="w-3.5 h-3.5 text-slate-400 hidden sm:block shrink-0" />
          {[
            { id: 'all', label: 'All Cards' },
            { id: 'with-study', label: 'Studied' },
            { id: 'with-jobs', label: 'Jobs Applied' },
            { id: 'completed-tasks', label: '100% Done' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`text-xs px-3 py-1.5 sm:py-2 rounded-xl font-bold whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 ${
                activeFilter === f.id
                  ? 'btn-3d-blue text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:text-blue-600 border border-slate-200 hover:border-blue-200 shadow-xs'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3D Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-60 rounded-3xl bg-white border border-slate-200 p-6 space-y-4" />
          ))}
        </div>
      ) : filteredCards.length === 0 ? (
        <div className="text-center py-12 sm:py-16 px-4 rounded-3xl bg-white border border-dashed border-blue-200 shadow-xs space-y-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
            <Calendar className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900">No Daily Cards Found</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
            {searchQuery 
              ? `No cards matching "${searchQuery}". Try a different keyword.` 
              : "You haven't logged any daily cards yet. Start tracking today's goals, studies, and jobs!"}
          </p>
          <Link
            to={`/write?date=${today}`}
            className="btn-3d-blue inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-white text-xs font-bold cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Card</span>
          </Link>
        </div>
      ) : (
        <div className="perspective-1000 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredCards.map((card) => {
            const completedMorningTasks = card.morningTasks?.filter(t => t.isCompleted).length || 0;
            const totalMorningTasks = card.morningTasks?.length || 0;
            const isToday = card.date === today;

            return (
              <div
                key={card.date}
                className={`card-3d group relative rounded-3xl bg-white border transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-[0_8px_25px_rgba(0,0,0,0.04)] ${
                  isToday 
                    ? 'border-blue-400 ring-4 ring-blue-50' 
                    : 'border-slate-200/80 hover:border-blue-300'
                }`}
              >
                {/* 3D Top Header Accent */}
                <div className={`h-1.5 w-full ${isToday ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-400' : 'bg-slate-100 group-hover:bg-blue-400 transition-colors'}`} />

                {/* Card Title & Date */}
                <div className="p-4 sm:p-6 pb-2 sm:pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                        {card.date}
                      </span>
                      {isToday && (
                        <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs">
                          Today
                        </span>
                      )}
                    </div>
                    
                    <button
                      onClick={(e) => handleDelete(e, card.date)}
                      className="opacity-70 sm:opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      title="Delete card"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm sm:text-base line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {card.title || 'Daily Accomplishments & Planning'}
                  </h3>
                </div>

                {/* Body Content */}
                <div className="px-4 sm:px-6 py-2 space-y-3 flex-1">
                  
                  {/* Morning Tasks Progress */}
                  {totalMorningTasks > 0 ? (
                    <div className="space-y-1 bg-slate-50/70 p-2.5 sm:p-3 rounded-2xl border border-slate-100">
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Morning Tasks</span>
                        </span>
                        <span className="font-bold text-slate-900">
                          {completedMorningTasks}/{totalMorningTasks} Done
                        </span>
                      </div>
                      <div className="w-full bg-slate-200/80 h-1.5 sm:h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                          style={{ width: `${(completedMorningTasks / totalMorningTasks) * 100}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No morning tasks planned</p>
                  )}

                  {/* Study Topics */}
                  {card.studyLogs && card.studyLogs.length > 0 && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                        <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                        <span>Studied:</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {card.studyLogs.map((log, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200/70 font-semibold"
                          >
                            {log.topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Jobs Applied */}
                  {card.jobsApplied && card.jobsApplied.length > 0 && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                        <Briefcase className="w-3.5 h-3.5 text-sky-600" />
                        <span>Jobs:</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {card.jobsApplied.map((job, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] px-2 py-0.5 rounded-lg bg-sky-50 text-sky-700 border border-sky-200/70 font-medium"
                          >
                            {job.companyName}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="p-3 sm:p-4 sm:px-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-2 sm:gap-3">
                  <Link
                    to={`/write?date=${card.date}`}
                    className="btn-3d-white flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-slate-700 text-xs font-bold"
                  >
                    <PenTool className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Edit</span>
                  </Link>

                  <Link
                    to={`/cards/${card.date}`}
                    className="btn-3d-blue flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-white text-xs font-bold"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Visualize</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
