import { Router } from 'express'
import { login, register, updateTheme } from "../controllers/authController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.put("/theme", authenticateToken, updateTheme);

export default router
