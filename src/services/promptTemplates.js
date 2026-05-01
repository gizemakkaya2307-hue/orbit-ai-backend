function compactTaskList(tasks) {
  if (!tasks.length) return "No active tasks were provided.";
  return tasks
    .map(
      (task, index) =>
        `${index + 1}. ${task.title} | category=${task.category} | priority=${task.priority} | focus=${task.focusMinutes}m | completed=${task.completed}`
    )
    .join("\n");
}

function compactSessionList(sessions) {
  if (!sessions.length) return "No recent focus sessions were provided.";
  return sessions
    .map(
      (session, index) =>
        `${index + 1}. ${session.mode} | ${Math.round(session.durationSeconds / 60)}m | completed=${session.completed}`
    )
    .join("\n");
}

function baseContext(payload) {
  return [
    `Language: ${payload.language}`,
    `Persona: ${payload.persona}`,
    `Mood: ${payload.mood}`,
    `Code name: ${payload.profile.codeName}`,
    `Goal types: ${payload.profile.goalTypes.join(", ") || "None"}`,
    `Daily hour goal: ${payload.profile.dailyHourGoal}`,
    `Preferred focus minutes: ${payload.profile.preferredFocusMinutes}`,
    `Level: ${payload.stats.level}`,
    `XP: ${payload.stats.xp}`,
    `Orbit score: ${payload.stats.orbitScore}`,
    `Current streak: ${payload.stats.currentStreak}`,
    `Completed tasks today: ${payload.stats.completedTasksToday}`,
    `Total completed tasks: ${payload.stats.totalCompletedTasks}`,
    `Focus minutes today: ${payload.stats.focusMinutesToday}`,
    `Completed sessions: ${payload.stats.completedSessions}`,
    `Abandoned sessions: ${payload.stats.abandonedSessions}`,
    "",
    "Recent tasks:",
    compactTaskList(payload.tasks),
    "",
    "Recent focus sessions:",
    compactSessionList(payload.sessions)
  ].join("\n");
}

export function buildPromptTemplate(feature, payload) {
  const context = baseContext(payload);

  const templates = {
    assistant_chat: `You are Orbit, a serious but supportive AI productivity coach inside a launch-ready free productivity app.

Rules:
- Be practical, concrete, and psychologically helpful.
- Never mention monetization, paid access, or restricted product tiers.
- Use the user context and recent work patterns.
- Offer realistic next actions, not generic fluff.
- If the user sounds overwhelmed, shrink the first step.
- If the user asks for motivation, make it warm but actionable.
- Keep the response concise when concise=true.

Feature goal:
- Respond as a high quality personal productivity assistant chat.

Context:
${context}

User message:
${payload.prompt}`,

    task_breakdown: `You are Orbit's task breakdown engine.

Rules:
- Break the task into 4 to 7 practical, ordered, executable subtasks.
- Each subtask must be small enough for a single sitting.
- Prefer action verbs at the start of each item.
- Avoid filler, avoid vague planning language.
- Also write a short reply explaining the overall approach.

Context:
${context}

Task to break down:
${payload.prompt}`,

    focus_recommendation: `You are Orbit's adaptive focus engine.

Rules:
- Recommend one focus duration and one mode: SPRINT, FLOW, or DEEP.
- Base the answer on mood, recent session quality, streak, and task load.
- Keep the reasoning simple and useful.

Context:
${context}

Focus question:
${payload.prompt}`,

    productivity_coaching: `You are Orbit's productivity coaching layer.

Rules:
- Diagnose what is blocking progress.
- Give 3 to 5 actions that can be done today.
- Add one sentence of encouragement that feels earned, not fake.

Context:
${context}

Coaching request:
${payload.prompt}`,

    planning_suggestions: `You are Orbit's planning engine.

Rules:
- Build a short day plan with 3 to 6 blocks.
- Each block needs a title, duration, and reason.
- Optimize for realistic energy and focus, not perfect schedules.

Context:
${context}

Planning request:
${payload.prompt}`,

    personalized_insights: `You are Orbit's insights engine.

Rules:
- Summarize recent productivity patterns in plain language.
- Highlight one strength, one risk, and one next improvement.
- Make the summary feel personal and grounded in the data.

Context:
${context}

Insight request:
${payload.prompt}`
  };

  return templates[feature];
}

export const ORBIT_RESPONSE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    reply: { type: "string" },
    actions: {
      type: "array",
      items: { type: "string" },
      maxItems: 6
    },
    breakdown: {
      type: "array",
      items: { type: "string" },
      maxItems: 8
    },
    suggestedFocusMinutes: {
      anyOf: [
        { type: "integer", minimum: 10, maximum: 120 },
        { type: "null" }
      ]
    },
    suggestedFocusMode: {
      anyOf: [
        { type: "string", enum: ["SPRINT", "FLOW", "DEEP"] },
        { type: "null" }
      ]
    },
    planBlocks: {
      type: "array",
      maxItems: 6,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: { type: "string" },
          durationMinutes: { type: "integer", minimum: 5, maximum: 180 },
          reason: { type: "string" }
        },
        required: ["title", "durationMinutes", "reason"]
      }
    },
    insightSummary: { type: "string" },
    encouragement: { type: "string" }
  },
  required: [
    "reply",
    "actions",
    "breakdown",
    "suggestedFocusMinutes",
    "suggestedFocusMode",
    "planBlocks",
    "insightSummary",
    "encouragement"
  ]
};
