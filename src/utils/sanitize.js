function sanitizeText(value, maxLength) {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim().slice(0, maxLength);
}

export function sanitizeAiPayload(payload) {
  return {
    ...payload,
    prompt: sanitizeText(payload.prompt, 1200),
    mood: sanitizeText(payload.mood, 40),
    profile: {
      ...payload.profile,
      codeName: sanitizeText(payload.profile.codeName, 80),
      goalTypes: payload.profile.goalTypes.map((goal) => sanitizeText(goal, 40))
    },
    tasks: payload.tasks.map((task) => ({
      ...task,
      title: sanitizeText(task.title, 160),
      category: sanitizeText(task.category, 40),
      priority: sanitizeText(task.priority, 30),
      notes: sanitizeText(task.notes, 300)
    })),
    sessions: payload.sessions.slice(0, 20)
  };
}
