import { Router } from "express";
import { aiController } from "../controllers/aiController.js";
import { createAiRateLimiter } from "../middleware/rateLimiter.js";

const router = Router();
const rateLimiter = createAiRateLimiter();

router.post("/chat", rateLimiter, aiController.chat);
router.post("/task-breakdown", rateLimiter, aiController.taskBreakdown);
router.post("/focus-recommendation", rateLimiter, aiController.focusRecommendation);
router.post("/productivity-coaching", rateLimiter, aiController.productivityCoaching);
router.post("/planning-suggestions", rateLimiter, aiController.planningSuggestions);
router.post("/personalized-insights", rateLimiter, aiController.personalizedInsights);

export { router as aiRoutes };
