import { Router } from 'express'
import { authenticateToken } from '../middleware/auth'
import { chat } from '../controllers/chatController'

const router = Router()

router.post('/', authenticateToken, chat)

export default router
