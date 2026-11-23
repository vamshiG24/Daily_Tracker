import { DailyCard } from '../models/DailyCard.js';

// Get all daily cards with optional search and sorting
export const getAllCards = async (req, res) => {
  try {
    const { search, tag, sort = 'desc' } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { date: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { 'studyLogs.topic': { $regex: search, $options: 'i' } },
        { 'studyLogs.description': { $regex: search, $options: 'i' } },
        { 'jobsApplied.companyName': { $regex: search, $options: 'i' } },
        { 'jobsApplied.role': { $regex: search, $options: 'i' } },
      ];
    }

    if (tag) {
      query['studyLogs.tags'] = { $in: [new RegExp(tag, 'i')] };
    }

    const cards = await DailyCard.find(query).sort({ date: sort === 'asc' ? 1 : -1 }).lean();
    res.json({ success: true, count: cards.length, data: cards });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get a single card by date (YYYY-MM-DD)
export const getCardByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const card = await DailyCard.findOne({ date }).lean();

    if (!card) {
      return res.status(200).json({
        success: true,
        exists: false,
        data: {
          date,
          title: '',
          morningTasks: [],
          studyLogs: [],
          jobsApplied: [],
          mood: 'focused',
          notes: ''
        }
      });
    }

    res.json({ success: true, exists: true, data: card });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create or update a daily card (Upsert)
export const createOrUpdateCard = async (req, res) => {
  try {
    const { date } = req.params;
    const payload = req.body;

    const card = await DailyCard.findOneAndUpdate(
      { date },
      { ...payload, date },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({ success: true, message: 'Card saved successfully', data: card });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Quick toggle morning task completion status
export const toggleMorningTask = async (req, res) => {
  try {
    const { date, taskId } = req.params;
    const card = await DailyCard.findOne({ date });

    if (!card) {
      return res.status(404).json({ success: false, message: 'Card not found for this date' });
    }

    const task = card.morningTasks.find(t => t.id === taskId);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found in card' });
    }

    task.isCompleted = !task.isCompleted;
    task.completedAt = task.isCompleted ? new Date() : null;

    await card.save();
    res.json({ success: true, data: card });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a daily card
export const deleteCard = async (req, res) => {
  try {
    const { date } = req.params;
    const deleted = await DailyCard.findOneAndDelete({ date });

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Card not found' });
    }

    res.json({ success: true, message: 'Card deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get stats: streaks, study hours, tasks completed, job counts
export const getStats = async (req, res) => {
  try {
    const cards = await DailyCard.find().select('date morningTasks studyLogs jobsApplied').sort({ date: 1 }).lean();

    let totalTasks = 0;
    let completedTasks = 0;
    let totalStudyTopics = 0;
    let totalStudyHours = 0;
    let totalJobsApplied = 0;
    const topicsMap = {};

    cards.forEach(card => {
      card.morningTasks?.forEach(t => {
        totalTasks++;
        if (t.isCompleted) completedTasks++;
      });
      card.studyLogs?.forEach(s => {
        totalStudyTopics++;
        totalStudyHours += Number(s.hours || 1);
        if (s.topic) {
          topicsMap[s.topic] = (topicsMap[s.topic] || 0) + 1;
        }
      });
      card.jobsApplied?.forEach(() => {
        totalJobsApplied++;
      });
    });

    // Calculate current streak
    let currentStreak = 0;
    const today = new Date().toISOString().split('T')[0];
    const datesSet = new Set(cards.map(c => c.date));

    let checkDate = new Date();
    // If today is logged or not, check backward
    let dateStr = checkDate.toISOString().split('T')[0];
    if (!datesSet.has(dateStr)) {
      // Check if yesterday is logged
      checkDate.setDate(checkDate.getDate() - 1);
      dateStr = checkDate.toISOString().split('T')[0];
    }

    while (datesSet.has(dateStr)) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
      dateStr = checkDate.toISOString().split('T')[0];
    }

    res.json({
      success: true,
      data: {
        totalCards: cards.length,
        currentStreak,
        totalTasks,
        completedTasks,
        taskCompletionRate: totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0,
        totalStudyTopics,
        totalStudyHours,
        totalJobsApplied,
        topTopics: Object.entries(topicsMap)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([topic, count]) => ({ topic, count }))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
