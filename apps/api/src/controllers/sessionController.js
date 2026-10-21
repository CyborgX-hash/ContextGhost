import { SessionService } from '../services/sessionService.js';
import { successResponse, errorResponse } from '../utils/response.js';

export class SessionController {
  static async list(req, res, next) {
    try {
      const { workspaceId, status, search, limit, offset } = req.query;
      const result = await SessionService.listSessions({ workspaceId, status, search, limit, offset });
      return successResponse(res, result, 'Sessions retrieved');
    } catch (err) {
      next(err);
    }
  }

  static async getById(req, res, next) {
    try {
      const session = await SessionService.getSessionById(req.params.id);
      return successResponse(res, session, 'Session retrieved');
    } catch (err) {
      if (err.message.includes('not found')) {
        return errorResponse(res, err.message, 404);
      }
      next(err);
    }
  }

  static async preview(req, res, next) {
    try {
      const { workspaceId, notes, logs, gitDiff, branch, commitMessage, contextFiles } = req.body;
      if (!workspaceId) {
        return errorResponse(res, 'workspaceId is required for preview', 400);
      }

      const preview = await SessionService.previewContext({
        workspaceId,
        rawNotes: notes,
        rawLogs: logs,
        gitDiff,
        branch,
        commitMessage,
        contextFiles
      });
      return successResponse(res, preview, 'Capture preview generated');
    } catch (err) {
      return errorResponse(res, err.message, 400);
    }
  }

  static async capture(req, res, next) {
    try {
      const {
        workspaceId,
        notes,
        logs,
        previousAttempts,
        gitDiff,
        branch,
        commitMessage,
        contextFiles,
        forceRawSnapshot
      } = req.body;

      if (!workspaceId) {
        return errorResponse(res, 'workspaceId is required to capture session', 400);
      }

      const session = await SessionService.captureSession({
        workspaceId,
        notes,
        logs,
        previousAttempts,
        gitDiff,
        branch,
        commitMessage,
        contextFiles,
        forceRawSnapshot: Boolean(forceRawSnapshot)
      });

      return successResponse(res, session, 'Session captured successfully', 201);
    } catch (err) {
      return errorResponse(res, err.message, 400);
    }
  }

  static async addNote(req, res, next) {
    try {
      const { content } = req.body;
      if (!content || !content.trim()) {
        return errorResponse(res, 'Note content cannot be empty', 400);
      }

      const note = await SessionService.addSessionNote(req.params.id, content);
      return successResponse(res, note, 'Note added to session', 201);
    } catch (err) {
      return errorResponse(res, err.message, 400);
    }
  }

  static async delete(req, res, next) {
    try {
      await SessionService.deleteSession(req.params.id);
      return successResponse(res, null, 'Session deleted successfully');
    } catch (err) {
      return errorResponse(res, err.message, 400);
    }
  }
}
