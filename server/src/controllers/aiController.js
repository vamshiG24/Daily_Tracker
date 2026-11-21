import { GoogleGenerativeAI } from '@google/generative-ai';
import { DailyCard } from '../models/DailyCard.js';

export const handleAiChat = async (req, res) => {
  try {
    const { message, currentDate, history = [] } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    // 1. Fetch available cards and current card context from DB
    const allCards = await DailyCard.find().sort({ date: -1 }).limit(30);
    const availableDates = allCards.map(c => ({
      date: c.date,
      title: c.title,
      studyTopics: c.studyLogs?.map(s => s.topic) || [],
      companies: c.jobsApplied?.map(j => j.companyName) || [],
      completedTasks: c.morningTasks?.filter(t => t.isCompleted).map(t => t.task) || []
    }));

    let currentCardContext = null;
    if (currentDate) {
      currentCardContext = allCards.find(c => c.date === currentDate) || await DailyCard.findOne({ date: currentDate });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // Check for offline/fallback mode if no API key is provided
    if (!apiKey || apiKey.trim() === '' || apiKey === 'your_gemini_api_key_here') {
      const fallbackResponse = generateSmartFallback(message, currentDate, currentCardContext, availableDates);
      return res.json({
        success: true,
        isFallback: true,
        ...fallbackResponse
      });
    }

    // Initialize Gemini AI Client (using latest gemini-3.8-flash)
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-3.8-flash' });

    // Build rich system prompt with context
    const systemPrompt = `You are the DailyTracker AI Assistant. Your job is to help the user manage their daily productivity, study topics (e.g. Git, Docker, System Design), job applications, and morning to-do checklist.

Current Local Date: ${new Date().toISOString().split('T')[0]}
Currently Active Card Date (if any): ${currentDate || 'None'}

User's Recent Daily Cards Summary:
${JSON.stringify(availableDates, null, 2)}

Active Card Full Details (if viewing a specific date):
${currentCardContext ? JSON.stringify(currentCardContext, null, 2) : 'No specific card currently open.'}

CORE CAPABILITIES:
1. NAVIGATION:
If the user asks to open, view, go to, or see a specific date card (e.g. "open card for 2026-11-20", "open today's card", "show me yesterday", "show the card where I learned Docker"), you MUST detect the target date from available dates or calculated relative date (today, yesterday).
You MUST output a JSON response in the following format if navigation is requested:
\`\`\`json
{
  "action": "NAVIGATE",
  "date": "YYYY-MM-DD",
  "reply": "Opening your card for YYYY-MM-DD where you..."
}
\`\`\`

2. CONVERSATION & COACHING:
If the user is asking questions about what they completed, study topics, or job applications:
- Summarize what tasks were completed or remain unfinished.
- Quiz them or explain concepts for topics they studied (e.g. Git rebase vs merge, Docker volumes).
- Provide interview tips or company research for jobs they applied to.
- Be encouraging, technical, concise, and friendly.

When returning a normal chat response (no navigation), you can respond with normal markdown text or return:
\`\`\`json
{
  "action": "CHAT",
  "reply": "Your markdown formatted answer..."
}
\`\`\`
Always ensure you output valid JSON if including action block, or clear markdown.`;

    // Construct conversation contents
    const prompt = `${systemPrompt}\n\nUser Question: ${message}`;
    const result = await model.generateContent(prompt);
    const rawResponse = result.response.text();

    // Parse for JSON block if Gemini replied with one
    const parsed = parseGeminiResponse(rawResponse);
    return res.json({
      success: true,
      isFallback: false,
      ...parsed
    });
  } catch (error) {
    console.error('Gemini AI Error:', error.message);
    // If Gemini API throws an error (e.g. quota, network), fallback gracefully
    const fallbackResponse = generateSmartFallback(req.body.message, req.body.currentDate, null, []);
    return res.json({
      success: true,
      isFallback: true,
      errorNotice: `Gemini API notice: ${error.message}. Running in smart local mode.`,
      ...fallbackResponse
    });
  }
};

// Helper: Parse Gemini JSON block or clean text
function parseGeminiResponse(text) {
  try {
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*"reply"[\s\S]*\}/);
    if (jsonMatch) {
      const jsonStr = jsonMatch[1] || jsonMatch[0];
      const parsed = JSON.parse(jsonStr);
      return {
        reply: parsed.reply || text,
        action: parsed.action || null,
        targetDate: parsed.date || null
      };
    }
  } catch (e) {
    // Ignore JSON parse error and fallback to raw text
  }
  return { reply: text, action: null, targetDate: null };
}

// Smart local fallback when no Gemini key is provided
function generateSmartFallback(message, currentDate, currentCard, availableDates = []) {
  const lower = message.toLowerCase().trim();

  // Navigation detection regex
  const dateRegex = /\b(\d{4}-\d{2}-\d{2})\b/;
  const dateMatch = message.match(dateRegex);

  if (lower.includes('open') || lower.includes('show') || lower.includes('go to') || lower.includes('view') || lower.includes('card for')) {
    let targetDate = null;
    const today = new Date().toISOString().split('T')[0];

    if (dateMatch) {
      targetDate = dateMatch[1];
    } else if (lower.includes('today')) {
      targetDate = today;
    } else if (lower.includes('yesterday')) {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      targetDate = d.toISOString().split('T')[0];
    } else {
      // Search matching topics or companies in available dates
      const matchedCard = availableDates.find(c =>
        c.studyTopics.some(t => lower.includes(t.toLowerCase())) ||
        c.companies.some(comp => lower.includes(comp.toLowerCase()))
      );
      if (matchedCard) {
        targetDate = matchedCard.date;
      }
    }

    if (targetDate) {
      return {
        action: 'NAVIGATE',
        targetDate,
        reply: `🚀 Navigating to your Daily Card for **${targetDate}**!`,
      };
    }
  }

  // Question about completed tasks
  if (lower.includes('completed') || lower.includes('finish') || lower.includes('done') || lower.includes('today')) {
    if (currentCard && currentCard.morningTasks?.length > 0) {
      const done = currentCard.morningTasks.filter(t => t.isCompleted);
      const pending = currentCard.morningTasks.filter(t => !t.isCompleted);
      return {
        action: null,
        reply: `### 📊 Task Summary for ${currentCard.date}:\n- **Completed (${done.length})**: ${done.map(d => `\`${d.task}\``).join(', ') || 'None yet'}\n- **Pending (${pending.length})**: ${pending.map(p => `\`${p.task}\``).join(', ') || 'All tasks are completed! 🎉'}\n\n*Keep up the momentum!*`
      };
    }
  }

  // Question about study or learning
  if (lower.includes('study') || lower.includes('docker') || lower.includes('git') || lower.includes('learn')) {
    if (currentCard && currentCard.studyLogs?.length > 0) {
      const topics = currentCard.studyLogs.map(s => `**${s.topic}**: ${s.description}`).join('\n\n');
      return {
        action: null,
        reply: `### 📚 Study Topics for ${currentCard.date}:\n\n${topics}\n\n*Would you like a quick quiz or key interview questions on these topics?*`
      };
    }
  }

  // Question about jobs applied
  if (lower.includes('job') || lower.includes('applied') || lower.includes('company')) {
    if (currentCard && currentCard.jobsApplied?.length > 0) {
      const jobs = currentCard.jobsApplied.map(j => `🏢 **${j.companyName}** (${j.role || 'Role unspecified'}) - Status: *${j.status}*`).join('\n');
      return {
        action: null,
        reply: `### 💼 Jobs Applied on ${currentCard.date}:\n\n${jobs}\n\n*Good luck with your applications! Let me know if you need company-specific interview prep.*`
      };
    }
  }

  return {
    action: null,
    reply: `👋 **DailyTracker AI is ready!**\n\nYou can ask me:\n- *"Open card for [YYYY-MM-DD]"* or *"Open today's card"*\n- *"What tasks did I complete today?"*\n- *"Summarize what I studied"* or *"Quiz me on Docker"*\n- *"Show me jobs I applied to"*\n\n*(💡 Set your \`GEMINI_API_KEY\` in \`server/.env\` for live multi-turn Gemini 1.5 Flash intelligence!)*`
  };
}
