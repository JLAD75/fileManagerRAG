import { Router } from 'express'
import { authenticateToken } from '../middleware/auth'
import { uploadFile, getFiles, deleteFile } from '../controllers/fileController'

const router = Router()

// File upload is handled by express-fileupload middleware in index.ts
// No need to configure it here - just apply authentication
router.post('/upload', authenticateToken, uploadFile)
router.get('/', authenticateToken, getFiles)
router.delete('/:id', authenticateToken, deleteFile)

export default router
