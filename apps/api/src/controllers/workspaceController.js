import { WorkspaceService } from '../services/workspaceService.js';
import { GitService } from '../services/gitService.js';
import { SessionService } from '../services/sessionService.js';
import { successResponse, errorResponse } from '../utils/response.js';

export class WorkspaceController {
  static async list(req, res, next) {
    try {
      const workspaces = await WorkspaceService.listWorkspaces();
      return successResponse(res, workspaces, 'Workspaces retrieved');
    } catch (err) {
      next(err);
    }
  }

  static async getById(req, res, next) {
    try {
      const workspace = await WorkspaceService.getWorkspaceById(req.params.id);
      return successResponse(res, workspace, 'Workspace retrieved');
    } catch (err) {
      if (err.message.includes('not found')) {
        return errorResponse(res, err.message, 404);
      }
      next(err);
    }
  }

  static async create(req, res, next) {
    try {
      const { name, rootPath, description } = req.body;
      if (!rootPath) {
        return errorResponse(res, 'rootPath is required', 400);
      }

      const workspace = await WorkspaceService.createWorkspace({ name, rootPath, description });
      return successResponse(res, workspace, 'Workspace registered successfully', 201);
    } catch (err) {
      return errorResponse(res, err.message, 400);
    }
  }

  static async update(req, res, next) {
    try {
      const { name, description } = req.body;
      const workspace = await WorkspaceService.updateWorkspace(req.params.id, { name, description });
      return successResponse(res, workspace, 'Workspace updated');
    } catch (err) {
      return errorResponse(res, err.message, 400);
    }
  }

  static async delete(req, res, next) {
    try {
      await WorkspaceService.deleteWorkspace(req.params.id);
      return successResponse(res, null, 'Workspace deleted successfully');
    } catch (err) {
      return errorResponse(res, err.message, 400);
    }
  }

  static async inspect(req, res, next) {
    try {
      const workspace = await WorkspaceService.getWorkspaceById(req.params.id);
      const gitContext = await GitService.getGitContext(workspace.rootPath);
      return successResponse(res, { workspace, gitContext }, 'Workspace inspected');
    } catch (err) {
      next(err);
    }
  }

  static async resume(req, res, next) {
    try {
      const briefing = await SessionService.getResumeBriefing(req.params.id);
      return successResponse(res, briefing, 'Resume briefing generated');
    } catch (err) {
      next(err);
    }
  }
}
