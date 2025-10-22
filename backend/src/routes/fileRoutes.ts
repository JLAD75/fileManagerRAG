import { Router } from "express";
import {
  deleteFile,
  downloadFile,
  getFiles,
  getFileStatus,
  uploadFile,
} from "../controllers/fileController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// File upload is handled by express-fileupload middleware in index.ts
// No need to configure it here - just apply authentication
router.post("/upload", authenticateToken, uploadFile);
router.get("/", authenticateToken, getFiles);
router.get("/:id/status", authenticateToken, getFileStatus);
router.get("/:id/download", authenticateToken, downloadFile);
router.delete("/:id", authenticateToken, deleteFile);

export default router;
