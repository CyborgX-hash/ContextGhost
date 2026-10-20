import { PrismaClient } from '@prisma/client';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding ContextGhost development database...');

  // Target current workspace directory as a realistic demo workspace
  const currentRepoPath = path.resolve(__dirname, '../../..');

  // Upsert a demo workspace
  const demoWorkspace = await prisma.workspace.upsert({
    where: { rootPath: currentRepoPath },
    update: {
      name: 'ContextGhost Core',
      description: 'The ContextGhost workspace memory assistant repository.'
    },
    create: {
      name: 'ContextGhost Core',
      rootPath: currentRepoPath,
      description: 'The ContextGhost workspace memory assistant repository.'
    }
  });

  console.log(`✅ Demo Workspace created/updated: ${demoWorkspace.name} (${demoWorkspace.id})`);

  // Check if a demo session already exists
  const existingSession = await prisma.session.findFirst({
    where: {
      workspaceId: demoWorkspace.id,
      title: 'Demo Session: Initial Architecture and Persistence Setup'
    }
  });

  if (!existingSession) {
    const session = await prisma.session.create({
      data: {
        workspaceId: demoWorkspace.id,
        title: 'Demo Session: Initial Architecture and Persistence Setup',
        mainObjective: 'Establish Express backend, Prisma schema, and initial local database migration.',
        summary: 'Configured monorepo structure, verified local PostgreSQL tables, and established Ollama local model connectivity for work memory reconstruction.',
        captureStatus: 'SUCCESS',
        modelName: 'qwen2.5:1.5b',
        confidenceNotes: 'High confidence based on successful Prisma migration logs and local database verification.',
        rawSnapshot: {
          branch: 'main',
          changedFilesCount: 5,
          gitStatus: 'clean',
          importedLogSnippet: 'Prisma migration 20261020091145_init applied successfully'
        },
        analysis: {
          sessionTitle: 'Demo Session: Initial Architecture and Persistence Setup',
          mainObjective: 'Establish Express backend, Prisma schema, and initial local database migration.',
          summary: 'Configured monorepo structure, verified local PostgreSQL tables, and established Ollama local model connectivity for work memory reconstruction.',
          accomplishments: [
            'Initialized PostgreSQL database contextghost',
            'Created normalized Prisma schema with Workspace, Session, SessionFile, Issue, and NextAction tables',
            'Pulled and verified local Ollama model qwen2.5:1.5b'
          ],
          modifiedFiles: [
            { path: 'apps/api/prisma/schema.prisma', changeType: 'modified', evidenceSummary: 'Defined schema entities and relations' },
            { path: 'apps/api/src/config/env.js', changeType: 'added', evidenceSummary: 'Added environment configuration validation' }
          ],
          unresolvedIssues: [
            {
              title: 'Frontend React dashboard pending initialization',
              category: 'unresolved_todo',
              severity: 'medium',
              status: 'unresolved',
              evidence: 'apps/web package not yet scaffolded',
              previousAttempts: 'Focused on backend persistence foundation first'
            }
          ],
          nextActions: [
            {
              title: 'Scaffold React + Vite frontend in apps/web',
              description: 'Set up Tailwind CSS, Lucide icons, and modern dark developer theme',
              priority: 1,
              status: 'pending',
              filePath: 'apps/web/src/App.jsx'
            },
            {
              title: 'Implement Git context collection engine',
              description: 'Build safe subprocess execution to read git status and diffs without shell injection',
              priority: 2,
              status: 'pending',
              filePath: 'apps/api/src/services/gitService.js'
            },
            {
              title: 'Implement REST endpoints for workspaces and sessions',
              description: 'Wire controllers to Express router under /api/v1',
              priority: 3,
              status: 'pending',
              filePath: 'apps/api/src/routes/sessionRoutes.js'
            }
          ]
        },
        files: {
          create: [
            {
              path: 'apps/api/prisma/schema.prisma',
              changeType: 'modified',
              evidenceSummary: 'Normalized Prisma schema defining core entities'
            },
            {
              path: 'apps/api/src/config/env.js',
              changeType: 'added',
              evidenceSummary: 'Environment variables validation module'
            }
          ]
        },
        issues: {
          create: [
            {
              title: 'Frontend React dashboard pending initialization',
              description: 'apps/web workspace requires Vite, React, and Tailwind setup.',
              category: 'unresolved_todo',
              severity: 'medium',
              status: 'unresolved',
              evidence: 'apps/web package not yet scaffolded',
              previousAttempts: 'Focused on database and API persistence foundation first.'
            }
          ]
        },
        nextActions: {
          create: [
            {
              title: 'Scaffold React + Vite frontend in apps/web',
              description: 'Set up Tailwind CSS, Lucide icons, and modern dark developer theme',
              priority: 1,
              status: 'pending',
              filePath: 'apps/web/src/App.jsx',
              evidence: 'Frontend required for dashboard UI'
            },
            {
              title: 'Implement Git context collection engine',
              description: 'Build safe subprocess execution to read git status and diffs without shell injection',
              priority: 2,
              status: 'pending',
              filePath: 'apps/api/src/services/gitService.js',
              evidence: 'Safe context gathering engine'
            },
            {
              title: 'Implement REST endpoints for workspaces and sessions',
              description: 'Wire controllers to Express router under /api/v1',
              priority: 3,
              status: 'pending',
              filePath: 'apps/api/src/routes/sessionRoutes.js',
              evidence: 'REST API contract'
            }
          ]
        },
        notes: {
          create: [
            {
              content: 'Demonstration session illustrating the relational memory schema and AI briefing persistence.'
            }
          ]
        }
      }
    });

    console.log(`✅ Demo Session created: ${session.title} (${session.id})`);
  } else {
    console.log('ℹ️ Demo session already exists.');
  }

  console.log('🎉 Database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
