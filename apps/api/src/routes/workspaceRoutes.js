import express from 'express';
import { WorkspaceController } from '../controllers/workspaceController.js';

const router = express.Router();

router.get('/', WorkspaceController.list);
router.post('/', WorkspaceController.create);
router.get('/:id', WorkspaceController.getById);
router.put('/:id', WorkspaceController.update);
router.delete('/:id', WorkspaceController.delete);
router.get('/:id/inspect', WorkspaceController.inspect);
router.get('/:id/resume', WorkspaceController.resume);

export default router;
