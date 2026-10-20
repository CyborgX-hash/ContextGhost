import fs from 'fs';
import path from 'path';
import { prisma } from '../db/prisma.js';

export class WorkspaceService {
  /**
   * Validate that a target path is an existing, safe directory on the filesystem
   */
  static validatePath(targetPath) {
    if (!targetPath || typeof targetPath !== 'string') {
      throw new Error('Workspace path must be a non-empty string');
    }

    // Reject null byte injection or strange control characters
    if (targetPath.includes('\0')) {
      throw new Error('Invalid path format: contains null bytes');
    }

    // Resolve and normalize absolute path
    const resolvedPath = path.resolve(targetPath);

    // Prevent access to root or dangerous system roots
    const dangerousRoots = ['/', 'C:\\', '/etc', '/var', '/bin', '/sbin', '/usr/bin', '/usr/sbin'];
    if (dangerousRoots.includes(resolvedPath)) {
      throw new Error(`Direct system root path is not permitted as a workspace: ${resolvedPath}`);
    }

    // Check directory existence
    let stats;
    try {
      stats = fs.statSync(resolvedPath);
    } catch (err) {
      throw new Error(`Workspace path does not exist: ${resolvedPath}`);
    }

    if (!stats.isDirectory()) {
      throw new Error(`Specified path is not a directory: ${resolvedPath}`);
    }

    // Verify read permission
    try {
      fs.accessSync(resolvedPath, fs.constants.R_OK);
    } catch (err) {
      throw new Error(`Permission denied: cannot read directory at ${resolvedPath}`);
    }

    return resolvedPath;
  }

  /**
   * Register a new workspace
   */
  static async createWorkspace({ name, rootPath, description }) {
    const validatedPath = this.validatePath(rootPath);
    const workspaceName = name?.trim() || path.basename(validatedPath);

    const existing = await prisma.workspace.findUnique({
      where: { rootPath: validatedPath }
    });

    if (existing) {
      throw new Error(`Workspace already registered for path: ${validatedPath}`);
    }

    return prisma.workspace.create({
      data: {
        name: workspaceName,
        rootPath: validatedPath,
        description: description?.trim() || null
      }
    });
  }

  /**
   * List all workspaces with recent session summary
   */
  static async listWorkspaces() {
    return prisma.workspace.findMany({
      include: {
        _count: {
          select: { sessions: true }
        },
        sessions: {
          orderBy: { capturedAt: 'desc' },
          take: 1,
          select: {
            id: true,
            title: true,
            capturedAt: true,
            captureStatus: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
  }

  /**
   * Retrieve workspace by ID
   */
  static async getWorkspaceById(id) {
    const workspace = await prisma.workspace.findUnique({
      where: { id },
      include: {
        _count: {
          select: { sessions: true }
        },
        sessions: {
          orderBy: { capturedAt: 'desc' },
          take: 5
        }
      }
    });

    if (!workspace) {
      throw new Error(`Workspace not found with ID: ${id}`);
    }

    return workspace;
  }

  /**
   * Update workspace details
   */
  static async updateWorkspace(id, { name, description }) {
    await this.getWorkspaceById(id);

    return prisma.workspace.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name: name.trim() } : {}),
        ...(description !== undefined ? { description: description?.trim() || null } : {})
      }
    });
  }

  /**
   * Delete workspace and cascaded sessions
   */
  static async deleteWorkspace(id) {
    await this.getWorkspaceById(id);

    return prisma.workspace.delete({
      where: { id }
    });
  }
}
