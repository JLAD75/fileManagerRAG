import { Router } from 'express'
import { chat, getModels } from "../controllers/chatController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

router.post("/", authenticateToken, chat);
router.get("/models", authenticateToken, getModels);

export default router
