import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { 
  Calendar, 
  PenTool, 
  CheckCircle2, 
  Circle, 
  BookOpen, 
  Briefcase, 
  Sparkles, 
  Clock, 
  ExternalLink, 
  ArrowLeft,
  Bot,
  Award,
  Tag
} from 'lucide-react';
import { getCardByDate, toggleTask } from '../api/client';

export default function VisualizerPage({ onOpenAi }) {
  const { date } = useParams();
  const navigate = useNavigate();

  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCard();
  }, [date]);

  const fetchCard = async () => {
    // Check local cache first for instant 0ms visualizer rendering
    try {
      const cached = localStorage.getItem('dt_cards_cache');
      if (cached) {
        const list = JSON.parse(cached);
        const match = list.find(c => c.date === date);
        if (match) {
          setCard(match);
          setLoading(false);
        }
      }
    } catch (_) {}

    try {
      const res = await getCardByDate(date);
      setCard(res.data.data);
    } catch (err) {
      console.error('Failed to load card:', err);
    } finally {
      setLoading(false);
    }
  };

  // Toggle task right inside visualizer
  const handleToggle = async (taskId) => {
    try {
      const res = await toggleTask(date, taskId);
      setCard(res.data.data);
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#2563eb', '#38bdf8', '#10b981', '#6366f1']
      });
    } catch (err) {
      console.error('Error toggling task:', err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-semibold text-slate-500">Generating 3D visualizer for {date}...</p>
      </div>
    );
  }

  const d = new Date(date + 'T00:00:00');
  const monthName = d.toLocaleDateString('en-US', { month: 'short' });
  const dayNum = d.toLocaleDateString('en-US', { day: '2-digit' });
  const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
  const yearNum = d.getFullYear();

  const morningTasks = card?.morningTasks || [];
  const completedTasks = morningTasks.filter(t => t.isCompleted);
  const completionRate = morningTasks.length ? Math.round((completedTasks.length / morningTasks.length) * 100) : 0;
  const studyLogs = card?.studyLogs || [];
  const jobsApplied = card?.jobsApplied || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8 pb-24 md:pb-12">
      
      {/* Navigation Top Bar */}
      <div className="flex items-center justify-between gap-2">
        <Link
          to="/cards"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden xs:inline">Back to</span> All Cards
        </Link>

        <div className="flex items-center gap-2">
          <Link
            to={`/write?date=${date}`}
            className="btn-3d-white flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl text-slate-700 text-xs font-bold"
          >
            <PenTool className="w-3.5 h-3.5 text-emerald-600" />
            <span>Edit</span>
          </Link>

          <button
            onClick={() => onOpenAi(date)}
            className="btn-3d-blue flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl text-white text-xs font-bold cursor-pointer"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Ask AI</span>
          </button>
        </div>
      </div>

      {/* 3D Hero Visualizer Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-white border border-blue-100 p-5 sm:p-8 md:p-10 shadow-[0_20px_50px_rgba(37,99,235,0.08)]">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-sky-300/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-gradient-to-tr from-indigo-400/15 to-purple-300/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-4 sm:gap-6 justify-between">
          
          <div className="flex items-start sm:items-center gap-3.5 sm:gap-5">
            {/* 3D Date Calendar Cube Widget */}
            <div className="card-3d-interactive shrink-0 w-16 h-18 sm:w-20 sm:h-22 rounded-2xl bg-gradient-to-b from-blue-600 to-indigo-700 text-white flex flex-col items-center justify-between p-1.5 sm:p-2 shadow-lg shadow-blue-500/30 border border-blue-400">
              <span className="text-[10px] sm:text-[11px] font-black tracking-widest uppercase text-blue-200">
                {monthName}
              </span>
              <span className="text-2xl sm:text-3xl font-black leading-none text-white my-auto">
                {dayNum}
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold text-blue-200">
                {yearNum}
              </span>
            </div>

            <div className="space-y-1 sm:space-y-1.5">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="text-[11px] sm:text-xs font-black uppercase text-blue-600 tracking-wider">
                  {dayName}
                </span>
                {card?.mood && (
                  <span className="text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 capitalize">
                    Mood: {card.mood}
                  </span>
                )}
                {completionRate === 100 && morningTasks.length > 0 && (
                  <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <Award className="w-3 h-3 text-emerald-600" />
                    100% Done
                  </span>
                )}
              </div>

              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                {card?.title || 'Daily Accomplishments & Progress'}
              </h1>

              {card?.notes && (
                <p className="text-xs text-slate-600 italic pt-1 max-w-2xl line-clamp-2 sm:line-clamp-none">
                  "{card.notes}"
                </p>
              )}
            </div>
          </div>

          {/* Quick Stat Pills */}
          <div className="flex items-center gap-2 sm:gap-3 self-start md:self-auto">
            <div className="bg-slate-50 border border-slate-200 p-2 sm:p-3 px-3 sm:px-4 rounded-xl sm:rounded-2xl text-center shadow-xs">
              <span className="text-[10px] sm:text-xs font-semibold text-slate-500">Tasks</span>
              <p className="text-base sm:text-xl font-black text-slate-900">{completedTasks.length}/{morningTasks.length}</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 p-2 sm:p-3 px-3 sm:px-4 rounded-xl sm:rounded-2xl text-center shadow-xs">
              <span className="text-[10px] sm:text-xs font-semibold text-blue-600">Topics</span>
              <p className="text-base sm:text-xl font-black text-blue-700">{studyLogs.length}</p>
            </div>
          </div>

        </div>
      </div>

      {/* 3D Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">

        {/* BENTO 1: 🌅 Morning Intentions & Checkbox (Span 5) */}
        <div className="lg:col-span-5 rounded-3xl bg-white border border-blue-100 p-5 sm:p-7 space-y-4 sm:space-y-6 shadow-[0_15px_35px_rgba(37,99,235,0.06)] flex flex-col justify-between">
          <div className="space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shadow-xs">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-black text-slate-900">Morning Intentions</h2>
                  <p className="text-[11px] sm:text-xs text-slate-500">Tap task to toggle completion</p>
                </div>
              </div>

              {/* Progress Gauge */}
              <div className="text-right">
                <span className="text-sm sm:text-base font-black text-emerald-600">{completionRate}%</span>
                <p className="text-[9px] sm:text-[10px] font-bold text-slate-400">{completedTasks.length}/{morningTasks.length} Done</p>
              </div>
            </div>

            {/* Task list with interactive live-toggle */}
            <div className="space-y-2">
              {morningTasks.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400 italic space-y-2">
                  <p>No morning tasks were logged for this date.</p>
                  <Link
                    to={`/write?date=${date}`}
                    className="inline-block text-blue-600 font-bold hover:underline"
                  >
                    + Add morning intentions
                  </Link>
                </div>
              ) : (
                morningTasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => handleToggle(t.id)}
                    className={`flex items-start gap-2.5 sm:gap-3 p-3 sm:p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer group ${
                      t.isCompleted
                        ? 'bg-emerald-50/70 border-emerald-200 text-slate-400'
                        : 'bg-slate-50/70 border-slate-200 hover:border-blue-300 hover:bg-white text-slate-800'
                    }`}
                  >
                    <button type="button" className="mt-0.5 text-slate-400 group-hover:text-emerald-600 transition shrink-0">
                      {t.isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 fill-emerald-100" />
                      ) : (
                        <Circle className="w-4 h-4 sm:w-5 sm:h-5 text-slate-300 group-hover:text-blue-500" />
                      )}
                    </button>

                    <div className="space-y-0.5 flex-1 min-w-0">
                      <p className={`text-xs sm:text-sm font-bold truncate ${t.isCompleted ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                        {t.task}
                      </p>
                      {t.description && (
                        <p className={`text-[11px] sm:text-xs line-clamp-1 ${t.isCompleted ? 'line-through text-slate-400' : 'text-slate-500'}`}>
                          {t.description}
                        </p>
                      )}
                    </div>

                    <span
                      className={`text-[9px] uppercase font-black px-2 py-0.5 rounded-full shrink-0 ${
                        t.priority === 'high'
                          ? 'bg-rose-100 text-rose-700'
                          : t.priority === 'medium'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {t.priority}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              <span>Interactive 3D Deck</span>
            </span>
            <Link to={`/write?date=${date}`} className="text-blue-600 hover:underline font-bold">
              Manage Tasks
            </Link>
          </div>
        </div>

        {/* BENTO 2 & 3: What I Studied & Job Applications (Span 7) */}
        <div className="lg:col-span-7 space-y-5 sm:space-y-6">
          
          {/* 📚 What I Studied Section (Mac/Terminal Code Window Style) */}
          <div className="rounded-3xl bg-white border border-blue-100 p-5 sm:p-7 space-y-4 sm:space-y-5 shadow-[0_15px_35px_rgba(37,99,235,0.06)]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shadow-xs shrink-0">
                  <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-black text-slate-900">Study & Technical Mastery</h2>
                  <p className="text-[11px] sm:text-xs text-slate-500">Learnings, concepts, and notes</p>
                </div>
              </div>

              <span className="text-[11px] sm:text-xs px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200 shrink-0">
                {studyLogs.length} Topics
              </span>
            </div>

            {studyLogs.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400 italic space-y-2">
                <p>No study logs were recorded for this day.</p>
                <Link to={`/write?date=${date}`} className="inline-block text-blue-600 font-bold hover:underline">
                  + Log what you studied
                </Link>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {studyLogs.map((log) => (
                  <div
                    key={log.id}
                    className="rounded-2xl bg-slate-50/80 border border-slate-200 overflow-hidden shadow-xs hover:border-blue-300 transition-colors"
                  >
                    {/* Mac Window Style Header */}
                    <div className="px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-100/90 border-b border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="flex items-center gap-1 shrink-0">
                          <div className="w-2 h-2 rounded-full bg-rose-400" />
                          <div className="w-2 h-2 rounded-full bg-amber-400" />
                          <div className="w-2 h-2 rounded-full bg-emerald-400" />
                        </div>
                        <span className="font-bold text-slate-800 text-xs ml-1 sm:ml-2 font-mono truncate">
                          {log.topic}
                        </span>
                      </div>

                      {log.hours && (
                        <span className="text-[10px] sm:text-[11px] font-bold text-slate-600 flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-slate-200 shrink-0">
                          <Clock className="w-3 h-3 text-blue-500" />
                          {log.hours}h spent
                        </span>
                      )}
                    </div>

                    {/* Description Body */}
                    <div className="p-3 sm:p-4 space-y-2.5">
                      <div className="text-xs text-slate-800 whitespace-pre-wrap font-mono leading-relaxed bg-white p-3 rounded-xl border border-slate-200/80 break-words">
                        {log.description}
                      </div>

                      {/* Tags */}
                      {log.tags && log.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {log.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] sm:text-[11px] px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 font-semibold flex items-center gap-1"
                            >
                              <Tag className="w-2.5 h-2.5 text-blue-500" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 💼 Jobs Applied Section */}
          <div className="rounded-3xl bg-white border border-blue-100 p-5 sm:p-7 space-y-4 sm:space-y-5 shadow-[0_15px_35px_rgba(37,99,235,0.06)]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-sky-50 text-sky-600 border border-sky-200 flex items-center justify-center shadow-xs shrink-0">
                  <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-sky-600" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-black text-slate-900">Job Applications</h2>
                  <p className="text-[11px] sm:text-xs text-slate-500">Companies & roles targeted today</p>
                </div>
              </div>

              <span className="text-[11px] sm:text-xs px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-sky-50 text-sky-700 font-bold border border-sky-200 shrink-0">
                {jobsApplied.length} Roles
              </span>
            </div>

            {jobsApplied.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400 italic space-y-2">
                <p>No job applications recorded for this date.</p>
                <Link to={`/write?date=${date}`} className="inline-block text-sky-600 font-bold hover:underline">
                  + Add job application
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                {jobsApplied.map((job) => (
                  <div
                    key={job.id}
                    className="rounded-2xl bg-slate-50/80 border border-slate-200 p-3.5 sm:p-4 space-y-2 hover:border-sky-300 hover:bg-white transition-all shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-900 text-xs sm:text-sm truncate">{job.companyName}</h4>
                        <p className="text-[11px] sm:text-xs text-slate-500 truncate">{job.role || 'Role not specified'}</p>
                      </div>

                      <span
                        className={`text-[9px] sm:text-[10px] uppercase font-black px-2 py-0.5 rounded-full shrink-0 ${
                          job.status === 'Interview'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : job.status === 'Offer'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : job.status === 'Rejected'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-sky-100 text-sky-800 border border-sky-200'
                        }`}
                      >
                        {job.status}
                      </span>
                    </div>

                    {job.notes && (
                      <p className="text-[11px] sm:text-xs text-slate-600 italic bg-white p-2 rounded-xl border border-slate-200/80">
                        {job.notes}
                      </p>
                    )}

                    {job.jobLink && (
                      <a
                        href={job.jobLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] sm:text-xs text-blue-600 font-bold hover:underline"
                      >
                        <span>Job Posting Link</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* AI Assistant Quick Actions Card */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 p-5 sm:p-8 text-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 shadow-[0_20px_50px_rgba(37,99,235,0.25)]">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner shrink-0">
            <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h3 className="font-black text-white text-sm sm:text-base">Want Gemini AI to analyze this day?</h3>
            <p className="text-[11px] sm:text-xs text-blue-100 mt-0.5">Quiz your study topics or get interview prep.</p>
          </div>
        </div>

        <button
          onClick={() => onOpenAi(date)}
          className="btn-3d-white px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl text-blue-700 text-xs font-black cursor-pointer shadow-lg text-center"
        >
          Open Gemini Chat
        </button>
      </div>

    </div>
  );
}
