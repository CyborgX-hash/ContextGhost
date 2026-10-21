import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Seeding ContextGhost database with realistic developer work sessions in English...');

  // 1. Clean previous data
  await prisma.sessionNote.deleteMany();
  await prisma.nextAction.deleteMany();
  await prisma.issue.deleteMany();
  await prisma.sessionFile.deleteMany();
  await prisma.session.deleteMany();
  await prisma.workspace.deleteMany();

  // 2. Create realistic developer workspaces
  const workspacesData = [
    {
      name: 'ContextGhost',
      rootPath: 'https://github.com/CyborgX-hash/ContextGhost.git',
      description: 'Local-first and hosted open-weight AI developer work-memory assistant'
    },
    {
      name: 'api-gateway',
      rootPath: 'https://github.com/org/api-gateway.git',
      description: 'Distributed microservices API gateway with JWT authentication & rate limiting'
    },
    {
      name: 'billing-service',
      rootPath: 'https://github.com/org/billing-service.git',
      description: 'Payment processor handling Stripe and Razorpay webhook events'
    },
    {
      name: 'frontend-web',
      rootPath: 'https://github.com/org/frontend-web.git',
      description: 'Modern developer dashboard built with Vite, React, and Tailwind CSS'
    }
  ];

  const createdWorkspaces = {};
  for (const ws of workspacesData) {
    const record = await prisma.workspace.create({ data: ws });
    createdWorkspaces[ws.name] = record;
  }

  // 3. Realistic session data
  const sessions = [
    {
      wsName: 'ContextGhost',
      title: 'Hosted Open-Weight AI Provider Integration',
      mainObjective: 'Connect OpenRouter hosted AI inference with bounded retries and timeout protection',
      summary: 'Added OpenRouterProvider with support for open-weight models (Llama 3.3, Qwen 2.5) on Render. Created context upload validator to enforce 1MB file limits and reject .env files.',
      captureStatus: 'SUCCESS',
      modelName: 'qwen/qwen3.8-27b',
      tag: 'feature',
      displayStatus: 'In Progress',
      hoursAgo: 1,
      files: [
        { path: 'apps/api/src/ai/openrouterProvider.js', changeType: 'added', evidenceSummary: 'OpenRouter client with 401/402/429 error handling' },
        { path: 'apps/api/src/utils/contextUploadValidator.js', changeType: 'added', evidenceSummary: 'Security guardrails for text files & patch uploads' },
        { path: 'apps/web/src/pages/CaptureSessionPage.jsx', changeType: 'modified', evidenceSummary: 'Added pasted diff input and context file attachments' }
      ],
      issues: [
        {
          title: 'Verify OpenRouter production latency on Render container',
          description: 'Measure cold-start response times from Render backend to openrouter.ai/api/v1',
          category: 'unresolved_todo',
          severity: 'medium',
          status: 'unresolved'
        }
      ],
      nextActions: [
        { title: 'Deploy backend web service to Render', description: 'Configure OPENROUTER_API_KEY and DATABASE_URL in Render dashboard', priority: 1 },
        { title: 'Deploy frontend static site to Vercel', description: 'Set VITE_API_BASE_URL to point to deployed Render API endpoint', priority: 2 },
        { title: 'Run end-to-end production verification test', description: 'Perform session capture with pasted diff and verify PostgreSQL persistence', priority: 3 }
      ]
    },
    {
      wsName: 'billing-service',
      title: 'Stripe Webhook Signature Verification & Idempotency',
      mainObjective: 'Fix duplicate payment events and verify webhook signature headers',
      summary: 'Configured HMAC-SHA256 signature verification for incoming Stripe webhook events. Added PostgreSQL transaction with unique event IDs to prevent duplicate balance credits.',
      captureStatus: 'SUCCESS',
      modelName: 'qwen/qwen3.8-27b',
      tag: 'bugfix',
      displayStatus: 'Resolved',
      hoursAgo: 4,
      files: [
        { path: 'src/controllers/webhookController.js', changeType: 'modified', evidenceSummary: 'Signature verification middleware' },
        { path: 'src/services/paymentService.js', changeType: 'modified', evidenceSummary: 'Idempotency key checks in database transaction' }
      ],
      issues: [],
      nextActions: [
        { title: 'Test edge case for expired webhook timestamps', description: 'Verify rejection if timestamp is older than 5 minutes', priority: 1 }
      ]
    },
    {
      wsName: 'api-gateway',
      title: 'OAuth2 Refresh Token Rotation & Session Revocation',
      mainObjective: 'Implement secure refresh token reuse detection and instant session revocation',
      summary: 'Added Redis-backed refresh token family tracking. If an expired or already-used token is presented, all refresh tokens in that family are immediately revoked.',
      captureStatus: 'SUCCESS',
      modelName: 'qwen/qwen3.8-27b',
      tag: 'feature',
      displayStatus: 'Resolved',
      hoursAgo: 24,
      files: [
        { path: 'src/auth/tokenManager.js', changeType: 'modified', evidenceSummary: 'Token family rotation logic' },
        { path: 'tests/tokenRotation.test.js', changeType: 'added', evidenceSummary: 'Unit tests for malicious reuse attempt detection' }
      ],
      issues: [],
      nextActions: [
        { title: 'Add Prometheus metrics for revoked token attempts', description: 'Expose security alert counter for reuse anomalies', priority: 1 }
      ]
    },
    {
      wsName: 'ContextGhost',
      title: 'Database Connection Pool Tuning & Prisma Migration',
      mainObjective: 'Migrate to pooled PostgreSQL instance and verify migration resilience',
      summary: 'Updated Prisma schema with relational indexes across workspaceId, sessionId, and capturedAt. Successfully ran migration against cloud database pool.',
      captureStatus: 'SUCCESS',
      modelName: 'qwen/qwen3.8-27b',
      tag: 'infra',
      displayStatus: 'Resolved',
      hoursAgo: 48,
      files: [
        { path: 'apps/api/prisma/schema.prisma', changeType: 'modified', evidenceSummary: 'Added index directives for faster querying' }
      ],
      issues: [],
      nextActions: [
        { title: 'Monitor database connection counts under load', description: 'Ensure pool size stays within provider limits', priority: 1 }
      ]
    },
    {
      wsName: 'frontend-web',
      title: 'Dark Developer Dashboard Theme & Layout Polish',
      mainObjective: 'Refine charcoal theme aesthetics, status indicators, and responsive sidebar',
      summary: 'Polished dashboard layout with clear typography, Lucide icons, status badges, and mobile-responsive navigation drawer.',
      captureStatus: 'SUCCESS',
      modelName: 'qwen/qwen3.8-27b',
      tag: 'refactor',
      displayStatus: 'In Progress',
      hoursAgo: 72,
      files: [
        { path: 'apps/web/src/layouts/AppLayout.jsx', changeType: 'modified', evidenceSummary: 'Sidebar layout and status indicators' },
        { path: 'apps/web/src/pages/OverviewDashboard.jsx', changeType: 'modified', evidenceSummary: 'Metric KPI cards and session grid' }
      ],
      issues: [
        {
          title: 'Ensure clean contrast ratio on low-brightness screens',
          description: 'Check slate-400 text readability on near-black backgrounds',
          category: 'unresolved_todo',
          severity: 'low',
          status: 'unresolved'
        }
      ],
      nextActions: [
        { title: 'Test responsive drawer on mobile viewports', description: 'Confirm touch gestures and backdrop blur close behavior', priority: 1 }
      ]
    },
    {
      wsName: 'api-gateway',
      title: 'Rate Limiting Redis Fallback on Memory Pressure',
      mainObjective: 'Add graceful in-memory token bucket fallback when Redis cluster is unreachable',
      summary: 'Implemented a circuit breaker around Redis rate limit counters. When Redis latency spikes above 200ms, the gateway falls back to local in-memory token buckets.',
      captureStatus: 'RAW_SNAPSHOT',
      modelName: null,
      tag: 'infra',
      displayStatus: 'Raw Snapshot',
      hoursAgo: 96,
      files: [
        { path: 'src/middleware/rateLimiter.js', changeType: 'modified', evidenceSummary: 'Circuit breaker fallback logic' }
      ],
      issues: [
        {
          title: 'Memory leak risk if in-memory fallback runs indefinitely',
          description: 'Implement LRU eviction for local token buckets',
          category: 'error',
          severity: 'medium',
          status: 'unresolved'
        }
      ],
      nextActions: [
        { title: 'Add LRU cache size limit to local token bucket', description: 'Cap local storage at 50,000 active client IPs', priority: 1 }
      ]
    }
  ];

  for (const s of sessions) {
    const ws = createdWorkspaces[s.wsName];
    if (!ws) continue;

    const capturedDate = new Date(Date.now() - s.hoursAgo * 60 * 60 * 1000);

    const createdSession = await prisma.session.create({
      data: {
        workspaceId: ws.id,
        title: s.title,
        mainObjective: s.mainObjective,
        summary: s.summary,
        captureStatus: s.captureStatus,
        modelName: s.modelName,
        capturedAt: capturedDate,
        createdAt: capturedDate,
        updatedAt: capturedDate,
        rawSnapshot: {
          capturedAt: capturedDate.toISOString(),
          workspaceName: ws.name,
          workspacePath: ws.rootPath,
          notes: s.mainObjective
        },
        analysis: {
          sessionTitle: s.title,
          mainObjective: s.mainObjective,
          summary: s.summary,
          tag: s.tag,
          displayStatus: s.displayStatus,
          accomplishments: [`Completed ${s.files.length} file updates`, 'Verified test suite and safety checks']
        }
      }
    });

    // Files
    for (const file of s.files) {
      await prisma.sessionFile.create({
        data: {
          sessionId: createdSession.id,
          path: file.path,
          changeType: file.changeType,
          evidenceSummary: file.evidenceSummary,
          createdAt: capturedDate
        }
      });
    }

    // Issues
    for (const iss of s.issues) {
      await prisma.issue.create({
        data: {
          sessionId: createdSession.id,
          title: iss.title,
          description: iss.description,
          category: iss.category,
          severity: iss.severity,
          status: iss.status,
          createdAt: capturedDate
        }
      });
    }

    // Next Actions
    for (const act of s.nextActions) {
      await prisma.nextAction.create({
        data: {
          sessionId: createdSession.id,
          title: act.title,
          description: act.description,
          priority: act.priority,
          status: 'pending',
          createdAt: capturedDate
        }
      });
    }

    // Note
    await prisma.sessionNote.create({
      data: {
        sessionId: createdSession.id,
        content: `Work session recorded for ${ws.name} on ${s.title}. Ready for resumption.`,
        createdAt: capturedDate,
        updatedAt: capturedDate
      }
    });
  }

  console.log('🎉 ContextGhost database seeded successfully with realistic English work sessions!');
}

seed()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
