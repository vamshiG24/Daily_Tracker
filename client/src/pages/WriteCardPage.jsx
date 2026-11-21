import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { 
  Save, 
  Eye, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  BookOpen, 
  Briefcase, 
  Sun, 
  Sparkles, 
  Clock, 
  ChevronRight
} from 'lucide-react';
import { getCardByDate, saveCard } from '../api/client';

export default function WriteCardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialDate = searchParams.get('date') || new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(initialDate);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);

  // Form State
  const [title, setTitle] = useState('');
  const [mood, setMood] = useState('focused');
  const [notes, setNotes] = useState('');

  // 1. Morning Tasks State
  const [morningTasks, setMorningTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('medium');

  // 2. Study Logs State
  const [studyLogs, setStudyLogs] = useState([]);

  // 3. Jobs Applied State
  const [jobsApplied, setJobsApplied] = useState([]);

  useEffect(() => {
    fetchCardData(date);
  }, [date]);

  const fetchCardData = async (targetDate) => {
    try {
      setLoading(true);
      const res = await getCardByDate(targetDate);
      const data = res.data.data;

      setTitle(data.title || '');
      setMood(data.mood || 'focused');
      setNotes(data.notes || '');
      setMorningTasks(data.morningTasks || []);
      setStudyLogs(data.studyLogs || []);
      setJobsApplied(data.jobsApplied || []);
    } catch (err) {
      console.error('Error fetching card:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (newDate) => {
    setDate(newDate);
    setSearchParams({ date: newDate });
  };

  // Add Morning Task
  const handleAddMorningTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const task = {
      id: Date.now().toString(),
      task: newTaskTitle.trim(),
      description: newTaskDesc.trim(),
      isCompleted: false,
      priority: newTaskPriority,
      completedAt: null
    };

    setMorningTasks(prev => [...prev, task]);
    setNewTaskTitle('');
    setNewTaskDesc('');
  };

  // Toggle Task Checkbox & Confetti
  const handleToggleTask = (taskId) => {
    setMorningTasks(prev =>
      prev.map(t => {
        if (t.id === taskId) {
          const nextState = !t.isCompleted;
          if (nextState) {
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.7 },
              colors: ['#2563eb', '#38bdf8', '#10b981', '#6366f1']
            });
          }
          return {
            ...t,
            isCompleted: nextState,
            completedAt: nextState ? new Date() : null
          };
        }
        return t;
      })
    );
  };

  const handleDeleteTask = (taskId) => {
    setMorningTasks(prev => prev.filter(t => t.id !== taskId));
  };

  // Study Logs handlers
  const handleAddStudyLog = (suggestedTopic = '') => {
    setStudyLogs(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        topic: suggestedTopic || '',
        description: '',
        tags: suggestedTopic ? [suggestedTopic.split(' ')[0]] : [],
        hours: 1
      }
    ]);
  };

  const handleUpdateStudyLog = (id, field, value) => {
    setStudyLogs(prev =>
      prev.map(s => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const handleDeleteStudyLog = (id) => {
    setStudyLogs(prev => prev.filter(s => s.id !== id));
  };

  // Jobs Applied handlers
  const handleAddJob = () => {
    setJobsApplied(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        companyName: '',
        role: '',
        jobLink: '',
        notes: '',
        status: 'Applied'
      }
    ]);
  };

  const handleUpdateJob = (id, field, value) => {
    setJobsApplied(prev =>
      prev.map(j => (j.id === id ? { ...j, [field]: value } : j))
    );
  };

  const handleDeleteJob = (id) => {
    setJobsApplied(prev => prev.filter(j => j.id !== id));
  };

  // Save Card
  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveMessage(null);

      const payload = {
        title,
        mood,
        notes,
        morningTasks,
        studyLogs: studyLogs.filter(s => s.topic.trim()),
        jobsApplied: jobsApplied.filter(j => j.companyName.trim())
      };

      await saveCard(date, payload);
      setSaveMessage({ type: 'success', text: 'Daily card saved successfully!' });
      setTimeout(() => setSaveMessage(null), 4000);
    } catch (err) {
      setSaveMessage({ type: 'error', text: 'Failed to save card: ' + err.message });
    } finally {
      setSaving(false);
    }
  };

  const completedCount = morningTasks.filter(t => t.isCompleted).length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8 pb-36 md:pb-16">
      
      {/* Top Header & Mobile Responsive Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-blue-100">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Studio Creator</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Daily Journal & Studio
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Write morning goals, technical notes, and job applications.</p>
        </div>

        {/* Date Selector and Actions */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <input
            type="date"
            value={date}
            onChange={(e) => handleDateChange(e.target.value)}
            className="flex-1 sm:flex-none bg-white border border-slate-200 text-slate-800 text-xs sm:text-sm font-bold font-mono rounded-xl sm:rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5 focus:outline-none focus:border-blue-500 shadow-xs"
          />

          <Link
            to={`/cards/${date}`}
            className="btn-3d-white flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl text-slate-700 text-xs font-bold"
          >
            <Eye className="w-3.5 h-3.5 text-sky-500" />
            <span className="hidden xs:inline">3D</span> Visualizer
          </Link>

          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-3d-blue flex items-center gap-1.5 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl sm:rounded-2xl text-white font-bold text-xs cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* Save Notification alert */}
      {saveMessage && (
        <div
          className={`p-3.5 sm:p-4 rounded-2xl flex items-center justify-between text-xs sm:text-sm shadow-xs ${
            saveMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveMessage.text}</span>
          </div>
          <Link
            to={`/cards/${date}`}
            className="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1 underline ml-2 shrink-0"
          >
            View <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Day Title & Mood Card */}
      <div className="rounded-3xl bg-white border border-blue-100 p-4 sm:p-6 space-y-4 shadow-[0_10px_30px_rgba(37,99,235,0.05)]">
        <div>
          <label className="block text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Main Focus / Day Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Mastered Docker Containers & Applied to Razorpay"
            className="w-full bg-slate-50/70 border border-slate-200 rounded-2xl px-3.5 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 transition"
          />
        </div>

        {/* Mood Selector */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-1">
          <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider w-full sm:w-auto mb-1 sm:mb-0">
            Today's Mood:
          </span>
          {[
            { id: 'focused', label: '🎯 Focused' },
            { id: 'productive', label: '🚀 Productive' },
            { id: 'energized', label: '⚡ Energized' },
            { id: 'challenging', label: '🧗 Challenging' },
            { id: 'relaxed', label: '🌿 Relaxed' }
          ].map(m => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMood(m.id)}
              className={`text-xs px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl font-bold transition-all duration-200 cursor-pointer ${
                mood === m.id
                  ? 'btn-3d-blue text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* SECTION 1: 🌅 Morning To-Do & Intentions */}
      <div className="rounded-3xl bg-white border border-blue-100 p-4 sm:p-7 space-y-4 sm:space-y-6 shadow-[0_15px_35px_rgba(37,99,235,0.06)]">
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shadow-xs shrink-0">
              <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">Morning To-Do</h2>
              <p className="text-[11px] sm:text-xs text-slate-500">Ticked tasks become completed achievements</p>
            </div>
          </div>

          <span className="text-[11px] sm:text-xs px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-blue-50 text-blue-700 font-black border border-blue-200 shrink-0">
            {completedCount} / {morningTasks.length}
          </span>
        </div>

        {/* Form to add morning task */}
        <form onSubmit={handleAddMorningTask} className="space-y-2.5 bg-blue-50/40 p-3 sm:p-4 rounded-2xl border border-blue-100">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="What do you plan to achieve? (e.g. Study Git rebase)"
              className="flex-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
            <div className="flex items-center gap-2">
              <select
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value)}
                className="flex-1 sm:flex-none bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500"
              >
                <option value="low">🌱 Low</option>
                <option value="medium">⚡ Medium</option>
                <option value="high">🔥 High</option>
              </select>
              <button
                type="submit"
                className="btn-3d-blue px-4 py-2 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Goal</span>
              </button>
            </div>
          </div>

          <input
            type="text"
            value={newTaskDesc}
            onChange={(e) => setNewTaskDesc(e.target.value)}
            placeholder="Optional details or steps..."
            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-1.5 text-xs text-slate-600 placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </form>

        {/* Task Checklist Items */}
        <div className="space-y-2">
          {morningTasks.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-2 text-center">
              No morning tasks planned yet. Add goals above!
            </p>
          ) : (
            morningTasks.map((t) => (
              <div
                key={t.id}
                onClick={() => handleToggleTask(t.id)}
                className={`flex items-start justify-between p-3 sm:p-4 rounded-2xl border transition-all duration-200 cursor-pointer group ${
                  t.isCompleted
                    ? 'bg-emerald-50/70 border-emerald-200 text-slate-400'
                    : 'bg-white border-slate-200/90 hover:border-blue-300 text-slate-800'
                }`}
              >
                <div className="flex items-start gap-2.5 sm:gap-3 flex-1 min-w-0 pr-2">
                  <button
                    type="button"
                    className="mt-0.5 text-slate-400 hover:text-emerald-600 transition shrink-0"
                  >
                    {t.isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 fill-emerald-100" />
                    ) : (
                      <Circle className="w-4 h-4 sm:w-5 sm:h-5 text-slate-300 group-hover:text-blue-500" />
                    )}
                  </button>

                  <div className="space-y-0.5 min-w-0">
                    <p className={`text-xs sm:text-sm font-bold truncate ${t.isCompleted ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                      {t.task}
                    </p>
                    {t.description && (
                      <p className={`text-[11px] sm:text-xs line-clamp-1 ${t.isCompleted ? 'line-through text-slate-400' : 'text-slate-500'}`}>
                        {t.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span
                    className={`text-[9px] uppercase font-black px-2 py-0.5 rounded-full ${
                      t.priority === 'high'
                        ? 'bg-rose-100 text-rose-700'
                        : t.priority === 'medium'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {t.priority}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTask(t.id);
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* SECTION 2: 📚 What I Studied Today */}
      <div className="rounded-3xl bg-white border border-blue-100 p-4 sm:p-7 space-y-4 sm:space-y-6 shadow-[0_15px_35px_rgba(37,99,235,0.06)]">
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shadow-xs shrink-0">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">What I Studied</h2>
              <p className="text-[11px] sm:text-xs text-slate-500">Record technical learnings & notes</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleAddStudyLog()}
            className="btn-3d-blue flex items-center gap-1 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-white text-xs font-bold cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>

        {/* Quick topic suggestion chips (scrollable/wrap) */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-50 p-2.5 sm:p-3 rounded-2xl border border-slate-100">
          <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider w-full sm:w-auto">Suggestions:</span>
          {['Git & GitHub', 'Docker', 'React 19', 'Node.js', 'MongoDB', 'System Design'].map(topic => (
            <button
              key={topic}
              type="button"
              onClick={() => handleAddStudyLog(topic)}
              className="text-[11px] px-2 py-0.5 rounded-lg bg-white border border-blue-200/80 text-blue-700 font-semibold hover:bg-blue-600 hover:text-white transition cursor-pointer"
            >
              + {topic}
            </button>
          ))}
        </div>

        {studyLogs.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-3 text-center">
            No study topics added yet. Tap "+ Add" or pick a suggestion!
          </p>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {studyLogs.map((log) => (
              <div
                key={log.id}
                className="bg-slate-50/80 border border-blue-100 rounded-2xl p-3.5 sm:p-5 space-y-3"
              >
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3">
                  <input
                    type="text"
                    value={log.topic}
                    onChange={(e) => handleUpdateStudyLog(log.id, 'topic', e.target.value)}
                    placeholder="Topic name (e.g. Git and GitHub, Docker)"
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-3.5 py-1.5 text-xs sm:text-sm font-bold text-blue-700 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                  
                  <div className="flex items-center justify-between sm:justify-end gap-2">
                    <div className="flex items-center gap-1 text-xs font-bold text-slate-500 bg-white px-2.5 py-1 rounded-xl border border-slate-200">
                      <Clock className="w-3.5 h-3.5 text-blue-500" />
                      <input
                        type="number"
                        min="0.5"
                        step="0.5"
                        value={log.hours || 1}
                        onChange={(e) => handleUpdateStudyLog(log.id, 'hours', Number(e.target.value))}
                        className="w-10 bg-transparent text-xs font-black text-slate-800 focus:outline-none text-center"
                      />
                      <span>hrs</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteStudyLog(log.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <textarea
                  rows="3"
                  value={log.description}
                  onChange={(e) => handleUpdateStudyLog(log.id, 'description', e.target.value)}
                  placeholder="Notes, commands, architectures learned..."
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 resize-none font-mono"
                />

                <input
                  type="text"
                  value={Array.isArray(log.tags) ? log.tags.join(', ') : ''}
                  onChange={(e) =>
                    handleUpdateStudyLog(
                      log.id,
                      'tags',
                      e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                    )
                  }
                  placeholder="Tags (e.g. DevOps, Containers, Git)"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-600 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 3: 💼 Jobs Applied */}
      <div className="rounded-3xl bg-white border border-blue-100 p-4 sm:p-7 space-y-4 sm:space-y-6 shadow-[0_15px_35px_rgba(37,99,235,0.06)]">
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-sky-50 text-sky-600 border border-sky-200 flex items-center justify-center shadow-xs shrink-0">
              <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-sky-600" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">Job Applications</h2>
              <p className="text-[11px] sm:text-xs text-slate-500">Companies & roles targeted today</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddJob}
            className="btn-3d-blue flex items-center gap-1 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-white text-xs font-bold cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>

        {jobsApplied.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-3 text-center">
            No job applications recorded for this date.
          </p>
        ) : (
          <div className="space-y-3">
            {jobsApplied.map((job) => (
              <div
                key={job.id}
                className="bg-slate-50/80 border border-blue-100 rounded-2xl p-3.5 sm:p-5 space-y-2.5"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <input
                    type="text"
                    value={job.companyName}
                    onChange={(e) => handleUpdateJob(job.id, 'companyName', e.target.value)}
                    placeholder="Company Name (e.g. Razorpay)"
                    className="bg-white border border-slate-200 rounded-xl px-3.5 py-1.5 text-xs font-bold text-sky-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="text"
                    value={job.role}
                    onChange={(e) => handleUpdateJob(job.id, 'role', e.target.value)}
                    placeholder="Role (e.g. MERN Engineer)"
                    className="bg-white border border-slate-200 rounded-xl px-3.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                  <div className="flex items-center gap-2">
                    <select
                      value={job.status}
                      onChange={(e) => handleUpdateJob(job.id, 'status', e.target.value)}
                      className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500"
                    >
                      <option value="Applied">Applied</option>
                      <option value="Screening">Screening</option>
                      <option value="Interview">Interview</option>
                      <option value="Offer">Offer 🎉</option>
                      <option value="Rejected">Rejected</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => handleDeleteJob(job.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="url"
                    value={job.jobLink}
                    onChange={(e) => handleUpdateJob(job.id, 'jobLink', e.target.value)}
                    placeholder="Job posting URL"
                    className="bg-white border border-slate-200 rounded-xl px-3.5 py-1.5 text-xs text-blue-600 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="text"
                    value={job.notes}
                    onChange={(e) => handleUpdateJob(job.id, 'notes', e.target.value)}
                    placeholder="Notes, referral info..."
                    className="bg-white border border-slate-200 rounded-xl px-3.5 py-1.5 text-xs text-slate-600 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 4: 📝 Reflection */}
      <div className="rounded-3xl bg-white border border-blue-100 p-4 sm:p-7 space-y-3 shadow-[0_15px_35px_rgba(37,99,235,0.06)]">
        <label className="block text-xs sm:text-sm font-black text-slate-900">
          Personal Reflection / Day Notes
        </label>
        <textarea
          rows="3"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="How did today feel? Any blockers or tomorrow's plans?"
          className="w-full bg-slate-50/70 border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white resize-none"
        />
      </div>

      {/* Sticky Bottom 3D Save Bar (Hovering cleanly above mobile bottom nav) */}
      <div className="fixed bottom-16 md:bottom-4 left-4 right-4 max-w-5xl md:mx-auto z-30 bg-white/95 backdrop-blur-xl border border-blue-200/90 rounded-2xl sm:rounded-3xl p-3 sm:p-4 flex items-center justify-between shadow-[0_10px_35px_rgba(37,99,235,0.18)]">
        <div className="text-[11px] sm:text-xs text-slate-500 truncate mr-2">
          Editing <span className="font-mono text-blue-700 font-bold">{date}</span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link
            to={`/cards/${date}`}
            className="btn-3d-white flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl text-slate-700 text-xs font-bold"
          >
            <Eye className="w-3.5 h-3.5 text-sky-500" />
            <span className="hidden sm:inline">Visualizer</span>
          </Link>

          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-3d-blue flex items-center gap-1.5 px-4 py-2 sm:px-6 sm:py-2.5 rounded-xl sm:rounded-2xl text-white font-black text-xs cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : 'Save Card'}</span>
          </button>
        </div>
      </div>

    </div>
  );
}
