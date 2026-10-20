import { SessionService } from '../services/sessionService.js';
import { successResponse, errorResponse } from '../utils/response.js';

export class SearchController {
  static async search(req, res, next) {
    try {
      const { q, workspaceId, limit } = req.query;
      if (!q || !q.trim()) {
        return successResponse(res, [], 'Empty query returned 0 results');
      }

      const results = await SessionService.searchMemory({
        query: q,
        workspaceId,
        limit: limit ? Number(limit) : 20
      });

      return successResponse(res, results, `Found ${results.length} matching memory items`);
    } catch (err) {
      next(err);
    }
  }
}
