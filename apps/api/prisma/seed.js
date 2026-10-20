import { PrismaClient } from '@prisma/client';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding ContextGhost development database with realistic workspaces & work memory...');

  const currentRepoPath = path.resolve(__dirname, '../../..');

  // Define workspaces
  const workspacesData = [
    { name: 'project_dashboard', rootPath: currentRepoPath, description: 'ContextGhost central dashboard and AI synthesis orchestrator' },
    { name: 'proj_contypio', rootPath: '/Users/sakshamsontakke/Projects/contypio', description: 'Content-Management and Schema Editor platform' },
    { name: 'steuerrecht-api', rootPath: '/Users/sakshamsontakke/Projects/steuerrecht-api', description: 'Tax law microservice and Perplexity API integration' },
    { name: 'devbox-hetzner', rootPath: '/Users/sakshamsontakke/Projects/devbox-hetzner', description: 'Cloud coding server setup for remote agentic workflows' },
    { name: 'vorlagen', rootPath: '/Users/sakshamsontakke/Projects/vorlagen', description: 'Enterprise SaaS design system and templates' },
    { name: 'proj_seo-suite', rootPath: '/Users/sakshamsontakke/Projects/seo-suite', description: 'SEO collector, reporter, and gateway backend' },
    { name: 'proj_irtours', rootPath: '/Users/sakshamsontakke/Projects/irtours', description: 'Travel platform CMS and relation types' }
  ];

  const workspaceMap = {};

  for (const ws of workspacesData) {
    const created = await prisma.workspace.upsert({
      where: { rootPath: ws.rootPath },
      update: { name: ws.name, description: ws.description },
      create: { name: ws.name, rootPath: ws.rootPath, description: ws.description }
    });
    workspaceMap[ws.name] = created.id;
  }

  // Realistic sessions matching the reference design cards
  const sessionsData = [
    {
      wsName: 'project_dashboard',
      title: 'Scheduled Tasks - Dashboard-Seite + RemoteTrigger',
      date: new Date('2026-03-27T10:30:00Z'),
      summary: 'Das Project Dashboard soll eine neue Seite "Scheduled Tasks" bekommen, auf der man Claude Code RemoteTrigger (persistent cron jobs) verwalten kann.',
      objective: 'Implement persistent scheduled triggers and dashboard views for automated work memory capture.',
      status: 'RAW_SNAPSHOT',
      displayStatus: 'Entwurf',
      tag: 'feature',
      titleColor: 'white',
      files: ['src/pages/ScheduledTasks.jsx', 'src/services/cronService.js']
    },
    {
      wsName: 'proj_contypio',
      title: 'Schema Editor Slide-over + Navigation-Vereinfachung',
      date: new Date('2026-03-26T14:15:00Z'),
      summary: 'Contypio hat drei Content-Systeme (Pages, Collections, Singletons) mit unterschiedlichen Editoren und Navigations-Orten. Vereinheitlichung in slide-over.',
      objective: 'Consolidate content schema editors into unified slide-over drawer with instant preview.',
      status: 'SUCCESS',
      displayStatus: 'Aktiv',
      tag: 'plan',
      titleColor: 'blue',
      files: ['components/SchemaDrawer.tsx', 'navigation/Sidebar.tsx']
    },
    {
      wsName: 'project_dashboard',
      title: 'Session-Analyse: Inhalt visuell verbessern',
      date: new Date('2026-03-25T16:45:00Z'),
      summary: 'Die Session-Analyse-Seite (/sessions/analysis) zeigt Daten korrekt an, aber die Darstellung ist monoton und flach. Farbige Status-Pills und Diff-Preview hinzugefuegt.',
      objective: 'Revamp session analysis visuals with interactive charts and token-aware diff viewer.',
      status: 'SUCCESS',
      displayStatus: 'Erledigt',
      tag: 'plan',
      titleColor: 'green',
      files: ['src/pages/SessionDetailPage.jsx', 'src/components/DiffViewer.jsx']
    },
    {
      wsName: 'steuerrecht-api',
      title: 'Perplexity API Integration in Steuerrecht-API + buchh',
      date: new Date('2026-03-24T09:20:00Z'),
      summary: '**Problem:** Steuerrechtliche Zuordnungen (EAR-Kennzahlen) werden manuell gepflegt und sind fehleranfaellig. Perplexity API fuer automatisches Matching anbinden.',
      objective: 'Automate tax code classifications with hybrid keyword and LLM retrieval.',
      status: 'RAW_SNAPSHOT',
      displayStatus: 'Entwurf',
      tag: 'bugfix',
      titleColor: 'white',
      files: ['api/perplexityClient.py', 'routes/classification.py']
    },
    {
      wsName: 'steuerrecht-api',
      title: 'Steuerrecht-API: Bestandsaufnahme & Erweiterungsplan',
      date: new Date('2026-03-23T11:00:00Z'),
      summary: 'Der User will wissen was die Steuerrecht-API bereits hat und was noch fehlt, um die naechste Session (Perplexity-Integration) vorzubereiten.',
      objective: 'Audit existing endpoints and generate roadmap for vector embeddings.',
      status: 'RAW_SNAPSHOT',
      displayStatus: 'Entwurf',
      tag: 'plan',
      titleColor: 'white',
      files: ['docs/AUDIT.md', 'openapi.yaml']
    },
    {
      wsName: 'proj_contypio',
      title: 'Webstudio-Konzept finalisieren & im Projekt ablegen',
      date: new Date('2026-03-21T18:00:00Z'),
      summary: 'Contypio braucht einen Design-Workflow fuer Nicht-Entwickler. Webstudio wird als visuelles Design-Tool integriert - es erzeugt saubere Komponenten.',
      objective: 'Integrate visual drag-and-drop studio with headless CMS export.',
      status: 'SUCCESS',
      displayStatus: 'Erledigt',
      tag: 'plan',
      titleColor: 'green',
      files: ['studio/Editor.jsx', 'studio/exporter.js']
    },
    {
      wsName: 'devbox-hetzner',
      title: 'Claude Code auf Hetzner Coding-Server einrichten',
      date: new Date('2026-03-21T13:10:00Z'),
      summary: 'Neuer Hetzner Cloud Server (46.224.78.95:22222, User: admin) soll als Coding-Box fuer zwei Claude Max Accounts eingerichtet werden.',
      objective: 'Provision isolated remote Docker environment with persistent tmux sessions.',
      status: 'SUCCESS',
      displayStatus: 'Erledigt',
      tag: 'infra',
      titleColor: 'green',
      files: ['ansible/setup.yml', 'docker-compose.server.yml']
    },
    {
      wsName: 'vorlagen',
      title: 'Enterprise SaaS Dashboard Redesign',
      date: new Date('2026-03-20T15:30:00Z'),
      summary: 'Das Dashboard hat 14 Jinja2-Templates, 13 CSS-Dateien (2.469 Zeilen custom CSS), 24 JS-Dateien. Kein CSS-Framework, kein modern bundler.',
      objective: 'Refactor bespoke CSS into streamlined modern Tailwind component library.',
      status: 'RAW_SNAPSHOT',
      displayStatus: 'Entwurf',
      tag: 'refactor',
      titleColor: 'white',
      files: ['templates/dashboard.html', 'static/css/theme.css']
    },
    {
      wsName: 'steuerrecht-api',
      title: 'Steuerrecht-API: Eigenstaendiger Microservice',
      date: new Date('2026-03-19T08:45:00Z'),
      summary: 'Auslagerung der Steuer-Logik aus der Monolith-Datenbank in einen eigenstaendigen FastAPI Microservice mit PostgreSQL und Alembic.',
      objective: 'Decouple tax calculation engine into independent scalable service.',
      status: 'RAW_SNAPSHOT',
      displayStatus: 'Entwurf',
      tag: 'plan',
      titleColor: 'white',
      files: ['services/tax_calc.py', 'Dockerfile']
    },
    {
      wsName: 'proj_seo-suite',
      title: 'S4 Block 1 — API Gateway Backend',
      date: new Date('2026-03-16T17:20:00Z'),
      summary: 'AI SEO Suite hat 4 Services (Collector, Dashboard, Reporter, Writer) aber KEIN Auth-System. Der Gateway wird zentraler Eintrittspunkt.',
      objective: 'Implement reverse proxy gateway with rate limiting and JWT auth verification.',
      status: 'RAW_SNAPSHOT',
      displayStatus: 'Entwurf',
      tag: 'plan',
      titleColor: 'white',
      files: ['gateway/proxy.go', 'gateway/auth.go']
    },
    {
      wsName: 'project_dashboard',
      title: 'Claude Code Sessions im Dashboard',
      date: new Date('2026-03-14T12:00:00Z'),
      summary: 'Automatische Synchronisation aller lokalen Terminal-Sessions in die PostgreSQL-Datenbank mit strukturierter Zusammenfassung.',
      objective: 'Bridge terminal session logs with ContextGhost local work memory persistence.',
      status: 'SUCCESS',
      displayStatus: 'Erledigt',
      tag: 'plan',
      titleColor: 'green',
      files: ['apps/api/src/services/sessionService.js', 'apps/api/src/ai/promptBuilder.js']
    },
    {
      wsName: 'proj_irtours',
      title: 'Sprint-Plan: Relations-Feldtyp + CMS-Qualitaet',
      date: new Date('2026-03-11T16:00:00Z'),
      summary: 'Unterstuetzung von 1-zu-N und N-zu-M Beziehungen im dynamischen Datenmodell sowie Validierungsregeln fuer Redakteure.',
      objective: 'Add polymorphic relation fields and nested validation schemas.',
      status: 'SUCCESS',
      displayStatus: 'Erledigt',
      tag: 'feature',
      titleColor: 'green',
      files: ['models/relations.js', 'validators/schemaValidator.js']
    }
  ];

  for (const s of sessionsData) {
    const wsId = workspaceMap[s.wsName];
    if (!wsId) continue;

    const existing = await prisma.session.findFirst({
      where: { workspaceId: wsId, title: s.title }
    });

    if (!existing) {
      await prisma.session.create({
        data: {
          workspaceId: wsId,
          title: s.title,
          summary: s.summary,
          mainObjective: s.objective,
          capturedAt: s.date,
          captureStatus: s.status,
          modelName: 'qwen2.5:1.5b',
          confidenceNotes: `Tag: ${s.tag} | Display: ${s.displayStatus}`,
          analysis: {
            sessionTitle: s.title,
            mainObjective: s.objective,
            summary: s.summary,
            tag: s.tag,
            displayStatus: s.displayStatus,
            accomplishments: [
              'Captured workspace working tree context',
              'Analyzed diff excerpts and log traces',
              'Recorded prioritized next steps'
            ],
            modifiedFiles: s.files.map((f) => ({
              path: f,
              changeType: 'modified',
              evidenceSummary: 'Identified in session commit history'
            })),
            unresolvedIssues: s.status === 'RAW_SNAPSHOT' ? [
              {
                title: 'Pending implementation review',
                category: 'unresolved_todo',
                severity: 'medium',
                status: 'unresolved',
                evidence: 'Work in progress draft state'
              }
            ] : [],
            nextActions: [
              {
                title: 'Continue implementation on active branch',
                description: 'Review pending changes and execute test suite.',
                priority: 1,
                filePath: s.files[0] || null
              }
            ]
          },
          files: {
            create: s.files.map((f) => ({
              path: f,
              changeType: 'modified',
              evidenceSummary: 'Active workspace change'
            }))
          },
          nextActions: {
            create: [
              {
                title: 'Continue implementation on active branch',
                description: 'Review pending changes and execute test suite.',
                priority: 1,
                filePath: s.files[0] || null
              }
            ]
          }
        }
      });
    }
  }

  console.log('🎉 Database seeding with realistic dashboard cards completed successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
