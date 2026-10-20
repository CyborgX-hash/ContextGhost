import { prisma } from '../db/prisma.js';
import { WorkspaceService } from './workspaceService.js';
import { GitService } from './gitService.js';
import { LogService } from './logService.js';
import { AIService } from './aiService.js';
import { redactSecrets } from '../utils/redactor.js';

export class SessionService {
  /**
   * Preview context before capture so user sees what will be submitted
   */
  static async previewContext({ workspaceId, rawNotes, rawLogs }) {
    const workspace = await WorkspaceService.getWorkspaceById(workspaceId);
    const gitContext = await GitService.getGitContext(workspace.rootPath);
    const processedLog = LogService.processLog(rawLogs);
    const sanitizedNotes = redactSecrets(rawNotes || '');

    return {
      workspace: {
        id: workspace.id,
        name: workspace.name,
        rootPath: workspace.rootPath
      },
      gitContext,
      notes: sanitizedNotes,
      logs: processedLog.sanitized,
      extractedErrors: processedLog.extractedErrors,
      readyToCapture: true
    };
  }

  /**
   * Full session capture: collect context, run AI analysis, save in Prisma transaction
   */
  static async captureSession({ workspaceId, notes, logs, previousAttempts, forceRawSnapshot = false }) {
    const workspace = await WorkspaceService.getWorkspaceById(workspaceId);
    const gitContext = await GitService.getGitContext(workspace.rootPath);
    const processedLog = LogService.processLog(logs);
    const sanitizedNotes = redactSecrets(notes || '');
    const sanitizedAttempts = redactSecrets(previousAttempts || '');

    // Raw snapshot bundle to save
    const rawSnapshot = {
      capturedAt: new Date().toISOString(),
      workspaceName: workspace.name,
      workspacePath: workspace.rootPath,
      git: {
        branch: gitContext.branch,
        commit: gitContext.commit,
        changedFilesCount: gitContext.changedFilesCount,
        diffSummary: gitContext.diffSummary,
        diffSnippet: gitContext.diffSnippet
      },
      notes: sanitizedNotes,
      logsSnippet: processedLog.sanitized ? processedLog.sanitized.substring(0, 5000) : null,
      previousAttempts: sanitizedAttempts
    };

    let aiResult;
    if (forceRawSnapshot) {
      aiResult = {
        success: true,
        captureStatus: 'RAW_SNAPSHOT',
        modelName: null,
        analysis: AIService.generateRawFallback({
          workspaceName: workspace.name,
          gitContext,
          notes: sanitizedNotes,
          logs: processedLog.sanitized,
          previousAttempts: sanitizedAttempts
        })
      };
    } else {
      aiResult = await AIService.analyzeSessionContext({
        workspaceName: workspace.name,
        gitContext,
        notes: sanitizedNotes,
        logs: processedLog.sanitized,
        previousAttempts: sanitizedAttempts
      });
    }

    const { analysis, captureStatus, modelName, confidenceNotes, error: aiError } = aiResult;

    // Save transactionally in PostgreSQL
    const session = await prisma.$transaction(async (tx) => {
      // 1. Create Session
      const createdSession = await tx.session.create({
        data: {
          workspaceId: workspace.id,
          title: analysis.sessionTitle,
          mainObjective: analysis.mainObjective,
          summary: analysis.summary,
          captureStatus: captureStatus || 'SUCCESS',
          modelName: modelName || null,
          confidenceNotes: confidenceNotes || analysis.confidenceNotes || (aiError ? `Note: ${aiError}` : null),
          rawSnapshot,
          analysis
        }
      });

      // 2. Insert SessionFiles
      if (analysis.modifiedFiles && analysis.modifiedFiles.length > 0) {
        await tx.sessionFile.createMany({
          data: analysis.modifiedFiles.map((f) => ({
            sessionId: createdSession.id,
            path: f.path,
            changeType: f.changeType || 'modified',
            evidenceSummary: f.evidenceSummary || null,
            lineReferences: f.lineReferences || null
          }))
        });
      }

      // 3. Insert Issues
      if (analysis.unresolvedIssues && analysis.unresolvedIssues.length > 0) {
        await tx.issue.createMany({
          data: analysis.unresolvedIssues.map((iss) => ({
            sessionId: createdSession.id,
            title: iss.title,
            description: iss.description || iss.title,
            category: iss.category || 'error',
            severity: iss.severity || 'medium',
            status: iss.status || 'unresolved',
            evidence: iss.evidence || null,
            previousAttempts: iss.previousAttempts || null
          }))
        });
      }

      // 4. Insert NextActions
      if (analysis.nextActions && analysis.nextActions.length > 0) {
        await tx.nextAction.createMany({
          data: analysis.nextActions.map((act, index) => ({
            sessionId: createdSession.id,
            title: act.title,
            description: act.description || null,
            priority: act.priority || index + 1,
            status: 'pending',
            evidence: act.evidence || null,
            filePath: act.filePath || null
          }))
        });
      }

      // 5. Insert initial note if notes were provided
      if (sanitizedNotes) {
        await tx.sessionNote.create({
          data: {
            sessionId: createdSession.id,
            content: sanitizedNotes
          }
        });
      }

      return createdSession;
    });

    // Return the full session with relations
    return this.getSessionById(session.id);
  }

  /**
   * Retrieve session by ID with all relations
   */
  static async getSessionById(id) {
    const session = await prisma.session.findUnique({
      where: { id },
      include: {
        workspace: {
          select: { id: true, name: true, rootPath: true }
        },
        files: true,
        issues: {
          orderBy: { createdAt: 'asc' }
        },
        nextActions: {
          orderBy: { priority: 'asc' }
        },
        notes: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!session) {
      throw new Error(`Session not found with ID: ${id}`);
    }

    return session;
  }

  /**
   * List sessions with optional filters (workspaceId, search, status)
   */
  static async listSessions({ workspaceId, status, search, limit = 20, offset = 0 }) {
    const where = {};

    if (workspaceId) {
      where.workspaceId = workspaceId;
    }

    if (status) {
      where.captureStatus = status;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { summary: { contains: search, mode: 'insensitive' } },
        { mainObjective: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [total, sessions] = await Promise.all([
      prisma.session.count({ where }),
      prisma.session.findMany({
        where,
        include: {
          workspace: {
            select: { id: true, name: true }
          },
          _count: {
            select: { files: true, issues: true, nextActions: true }
          }
        },
        orderBy: { capturedAt: 'desc' },
        take: Number(limit),
        skip: Number(offset)
      })
    ]);

    return { total, limit: Number(limit), offset: Number(offset), sessions };
  }

  /**
   * Add or update note on existing session
   */
  static async addSessionNote(sessionId, content) {
    await this.getSessionById(sessionId);

    return prisma.sessionNote.create({
      data: {
        sessionId,
        content: redactSecrets(content)
      }
    });
  }

  /**
   * Delete a session
   */
  static async deleteSession(id) {
    await this.getSessionById(id);

    return prisma.session.delete({
      where: { id }
    });
  }

  /**
   * Resume My Work briefing: gets most recent session and calculates staleness & action items
   */
  static async getResumeBriefing(workspaceId) {
    const workspace = await WorkspaceService.getWorkspaceById(workspaceId);

    const latestSession = await prisma.session.findFirst({
      where: { workspaceId: workspace.id },
      orderBy: { capturedAt: 'desc' },
      include: {
        workspace: {
          select: { id: true, name: true, rootPath: true }
        },
        files: true,
        issues: {
          where: { status: { in: ['unresolved', 'attempted'] } },
          orderBy: { severity: 'asc' }
        },
        nextActions: {
          where: { status: 'pending' },
          orderBy: { priority: 'asc' },
          take: 3
        },
        notes: {
          orderBy: { createdAt: 'desc' },
          take: 3
        }
      }
    });

    if (!latestSession) {
      return {
        hasSession: false,
        workspace,
        message: 'No previous sessions captured for this workspace. Click "Capture Session" to start!'
      };
    }

    // Calculate elapsed time and staleness
    const capturedTime = new Date(latestSession.capturedAt).getTime();
    const now = Date.now();
    const elapsedMinutes = Math.round((now - capturedTime) / (1000 * 60));
    const elapsedHours = Math.round(elapsedMinutes / 60);
    const elapsedDays = Math.round(elapsedHours / 24);

    let stalenessLevel = 'fresh';
    let stalenessNotice = 'Recently captured';

    if (elapsedDays > 7) {
      stalenessLevel = 'stale';
      stalenessNotice = `Captured ${elapsedDays} days ago. Working tree may have changed significantly.`;
    } else if (elapsedDays >= 1) {
      stalenessLevel = 'moderate';
      stalenessNotice = `Captured ${elapsedDays} day${elapsedDays > 1 ? 's' : ''} ago.`;
    } else if (elapsedHours >= 2) {
      stalenessLevel = 'hours_old';
      stalenessNotice = `Captured ${elapsedHours} hours ago.`;
    }

    return {
      hasSession: true,
      workspace,
      session: latestSession,
      staleness: {
        level: stalenessLevel,
        notice: stalenessNotice,
        elapsedMinutes,
        elapsedHours,
        elapsedDays,
        capturedAt: latestSession.capturedAt
      }
    };
  }

  /**
   * Search Memory across session titles, summaries, notes, issues, and files
   */
  static async searchMemory({ query, workspaceId, limit = 20 }) {
    if (!query || !query.trim()) {
      return [];
    }

    const searchTerm = query.trim();

    const sessions = await prisma.session.findMany({
      where: {
        ...(workspaceId ? { workspaceId } : {}),
        OR: [
          { title: { contains: searchTerm, mode: 'insensitive' } },
          { summary: { contains: searchTerm, mode: 'insensitive' } },
          { mainObjective: { contains: searchTerm, mode: 'insensitive' } },
          {
            issues: {
              some: {
                OR: [
                  { title: { contains: searchTerm, mode: 'insensitive' } },
                  { description: { contains: searchTerm, mode: 'insensitive' } },
                  { evidence: { contains: searchTerm, mode: 'insensitive' } }
                ]
              }
            }
          },
          {
            nextActions: {
              some: {
                OR: [
                  { title: { contains: searchTerm, mode: 'insensitive' } },
                  { description: { contains: searchTerm, mode: 'insensitive' } }
                ]
              }
            }
          },
          {
            files: {
              some: {
                path: { contains: searchTerm, mode: 'insensitive' }
              }
            }
          },
          {
            notes: {
              some: {
                content: { contains: searchTerm, mode: 'insensitive' }
              }
            }
          }
        ]
      },
      include: {
        workspace: {
          select: { id: true, name: true }
        },
        files: {
          take: 3
        },
        issues: {
          take: 2
        },
        nextActions: {
          take: 2
        }
      },
      orderBy: { capturedAt: 'desc' },
      take: Number(limit)
    });

    // Annotate match reason for user UX
    return sessions.map((sess) => {
      const matchReasons = [];
      if (sess.title.toLowerCase().includes(searchTerm.toLowerCase())) matchReasons.push('Title match');
      if (sess.summary?.toLowerCase().includes(searchTerm.toLowerCase())) matchReasons.push('Summary match');
      if (sess.mainObjective?.toLowerCase().includes(searchTerm.toLowerCase())) matchReasons.push('Objective match');
      if (sess.files.some((f) => f.path.toLowerCase().includes(searchTerm.toLowerCase()))) matchReasons.push('Changed file match');
      if (sess.issues.some((i) => i.title.toLowerCase().includes(searchTerm.toLowerCase()))) matchReasons.push('Issue / error match');

      return {
        ...sess,
        matchReasons: matchReasons.length > 0 ? matchReasons : ['Keyword reference']
      };
    });
  }
}
