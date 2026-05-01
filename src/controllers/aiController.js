import { z } from "zod";
import { generateAiResponse } from "../services/openaiService.js";
import { sanitizeAiPayload } from "../utils/sanitize.js";

const profileSchema = z.object({
  codeName: z.string().min(1).max(80),
  goalTypes: z.array(z.string().max(40)).max(8),
  dailyHourGoal: z.number().int().min(1).max(16),
  preferredFocusMinutes: z.number().int().min(10).max(120),
  notificationsEnabled: z.boolean()
});

const statsSchema = z.object({
  level: z.number().int().min(1).max(200),
  xp: z.number().int().min(0),
  currentStreak: z.number().int().min(0).max(1000),
  completedTasksToday: z.number().int().min(0).max(200),
  totalCompletedTasks: z.number().int().min(0).max(50000),
  focusMinutesToday: z.number().int().min(0).max(1440),
  totalSessions: z.number().int().min(0).max(50000),
  completedSessions: z.number().int().min(0).max(50000),
  abandonedSessions: z.number().int().min(0).max(50000),
  orbitScore: z.number().int().min(0).max(100),
  mood: z.string().max(40)
});

const taskSchema = z.object({
  title: z.string().min(1).max(160),
  category: z.string().max(40),
  priority: z.string().max(30),
  focusMinutes: z.number().int().min(0).max(180),
  completed: z.boolean(),
  scheduledAtMillis: z.number().int().min(0),
  notes: z.string().max(300)
});

const sessionSchema = z.object({
  startedAtMillis: z.number().int().min(0),
  durationSeconds: z.number().int().min(0).max(14_400),
  completed: z.boolean(),
  mode: z.string().max(20)
});

const baseSchema = z.object({
  prompt: z.string().trim().min(1).max(1200),
  language: z.enum(["tr", "en"]).default("en"),
  persona: z.enum(["KOC", "STRATEJIST", "MOTIVATOR"]),
  concise: z.boolean().optional().default(false),
  mood: z.string().max(40),
  profile: profileSchema,
  stats: statsSchema,
  tasks: z.array(taskSchema).max(20),
  sessions: z.array(sessionSchema).max(20)
});

function validate(feature) {
  return async (req, res, next) => {
    try {
      const payload = sanitizeAiPayload(baseSchema.parse(req.body));
      const result = await generateAiResponse(feature, payload);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}

export const aiController = {
  chat: validate("assistant_chat"),
  taskBreakdown: validate("task_breakdown"),
  focusRecommendation: validate("focus_recommendation"),
  productivityCoaching: validate("productivity_coaching"),
  planningSuggestions: validate("planning_suggestions"),
  personalizedInsights: validate("personalized_insights")
};
