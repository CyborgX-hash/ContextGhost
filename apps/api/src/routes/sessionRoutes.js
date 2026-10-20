import express from 'express';
import { SessionController } from '../controllers/sessionController.js';

const router = express.Router();

router.get('/', SessionController.list);
router.post('/preview', SessionController.preview);
router.post('/capture', SessionController.capture);
router.get('/:id', SessionController.getById);
router.post('/:id/notes', SessionController.addNote);
router.delete('/:id', SessionController.delete);

export default router;
