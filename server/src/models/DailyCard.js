import mongoose from 'mongoose';

const MorningTaskSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    task: { type: String, required: true },
    description: { type: String, default: '' },
    isCompleted: { type: Boolean, default: false },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    completedAt: { type: Date }
  },
  { _id: false }
);

const StudyLogSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    topic: { type: String, required: true },
    description: { type: String, required: true },
    tags: [{ type: String }],
    hours: { type: Number, default: 1 }
  },
  { _id: false }
);

const JobAppliedSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    companyName: { type: String, required: true },
    role: { type: String, default: '' },
    jobLink: { type: String, default: '' },
    notes: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Applied', 'Screening', 'Interview', 'Offer', 'Rejected'],
      default: 'Applied'
    }
  },
  { _id: false }
);

const DailyCardSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    title: { type: String, default: '' },
    morningTasks: [MorningTaskSchema],
    studyLogs: [StudyLogSchema],
    jobsApplied: [JobAppliedSchema],
    mood: {
      type: String,
      enum: ['productive', 'focused', 'challenging', 'relaxed', 'energized', 'neutral'],
      default: 'focused'
    },
    notes: { type: String, default: '' }
  },
  {
    timestamps: true
  }
);

export const DailyCard = mongoose.models.DailyCard || mongoose.model('DailyCard', DailyCardSchema);
