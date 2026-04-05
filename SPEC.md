# KIDO Content Generator — Product Specification

## 1. Overview

The KIDO Content Generator is a standalone Next.js application that transforms processed intelligence from the KIDO Intelligence Platform into actionable government relations communications content. It serves the communications needs of **KIDO (Kitchenuhmaykoosib Inninuwug Dibenjikewin Onaakonikewin)**, an Indigenous child and family services organization operating under **Bill C-92** (An Act respecting First Nations, Inuit and Métis children, youth and families).

The Intelligence Platform (deployed at `kido-government-relations-intellige.vercel.app`) already handles article ingestion, summarization, categorization, relevance scoring, and entity extraction via its Knowledge Engine. The Content Generator sits downstream — consuming that processed intelligence and turning it into polished, strategically crafted communications.

### 1.1 Problem Statement

KIDO's Government Relations team needs to rapidly produce professional communications in response to legislative developments, media coverage, and policy shifts affecting Indigenous child welfare. Currently, turning intelligence insights into press releases, briefing notes, and political correspondence requires significant manual effort and writing expertise.

### 1.2 Solution

An AI-powered content generation tool that:

- Pulls processed articles and digests from the Intelligence Platform
- Accepts additional source materials (memos, policy positions, community input)
- Generates publication-ready communications content using configurable templates
- Maintains KIDO's organizational voice and Indigenous governance perspective
- Stores generated content with full version history

### 1.3 Relationship to Intelligence Platform

The Intelligence Platform is fully operational (all 4 phases complete) with:
- **17 feed sources**: 9 RSS, 3 JSON API (GC News), 5 additional RSS, 4 scrape feeds
- **AI processing pipeline**: Summarizer → Categorizer → Entity Extractor → Relevance Scorer → Alerter
- **63+ articles** ingested and 53 AI-processed
- **Digest generation**: Daily/weekly AI-synthesized intelligence briefings
- **Feed discovery**: AI-recommended new sources
- **Database**: MongoDB Atlas (`productiondb.unfk6vk.mongodb.net`, database: `kido-knowledge-engine`)
- **Auth**: NextAuth.js credentials provider, JWT sessions, roles: `analyst` / `director` / `admin`

The Content Generator consumes the Intelligence Platform's outputs — it does NOT replicate any ingestion, processing, or analysis functionality.

### 1.4 Domain Context

KIDO serves **Kitchenuhmaykoosib Inninuwug (KI)** First Nation, a remote fly-in community in Northern Ontario within **Treaty 9** territory. KI is a member of **Nishnawbe Aski Nation (NAN)**, which represents 49 First Nation communities across Treaty 9 and Treaty 5 areas.

Key legislation and frameworks:
- **Bill C-92** — Affirms the inherent right of self-government including jurisdiction over child and family services. KIDO operates under this Act.
- **UNDRIP / Bill C-15** — International framework for Indigenous rights; Bill C-92 is a concrete implementation measure.
- **Jordan's Principle** — Child-first principle ensuring First Nations children access services without jurisdictional delays.
- **Section 35, Constitution Act 1982** — Recognizes Aboriginal and treaty rights; SCC confirmed in 2024 this includes self-government in child welfare.

Key organizations referenced in communications:
- **ISC** (Indigenous Services Canada) — Federal service delivery department
- **CIRNAC** (Crown-Indigenous Relations and Northern Affairs) — Federal relationship/governance department
- **AFN** (Assembly of First Nations) — National advocacy organization
- **NAN** (Nishnawbe Aski Nation) — Regional political territorial organization
- **Chiefs of Ontario** — Provincial advocacy organization (133 First Nations)
- **CHRT** (Canadian Human Rights Tribunal) — Issued landmark child welfare rulings
- **First Nations Caring Society** — Led the original CHRT complaint (Dr. Cindy Blackstock)

Full glossary: See Appendix A (Domain Glossary).

---

## 2. Target Users

| User | Role | Primary Use |
|------|------|-------------|
| Government Relations Staff | Day-to-day communications | Draft press releases, social posts, letters |
| Leadership / Chiefs | Strategic oversight | Review briefing notes, approve messaging |
| Spokespeople | Public-facing communications | Access talking points, media strategies |
| Policy Analysts | Research & analysis | Generate briefing notes from intelligence data |

---

## 3. Input Sources

### 3.1 Intelligence Platform API (Primary)

Data pulled from the existing Intelligence Platform via authenticated API calls:

- **Processed articles**: Already summarized, categorized, relevance-scored, with entity extractions (people, organizations, legislation, jurisdictions)
- **AI-generated digests**: Periodic intelligence summaries produced by the Knowledge Engine
- **Article metadata**: Categories, tags, relevance scores, source information, publication dates

### 3.2 Document Upload (Phase 1)

User-uploaded supplementary materials:

- **Internal memos** — organizational positions, strategy documents
- **Policy positions** — KIDO's formal stances on issues
- **Community input** — feedback, concerns, priorities from community members
- **Talking points** — existing messaging to maintain consistency
- **Claude Chat/Cowork outputs** — AI-assisted research and drafts

**Supported formats:** PDF, DOCX, TXT

Documents are parsed, stored, and made available as context for content generation.

### 3.3 MCP Server Integration (Phase 2 — Future)

A Model Context Protocol server that allows Claude Cowork projects to push content directly to the Content Generator, eliminating the copy/paste workflow.

---

## 4. Output Types

Each output type has a dedicated prompt template that can be customized per generation.

### 4.1 Media Strategies

Strategic analysis documents that include:
- Situational analysis of the issue/development
- Recommended messaging framework
- Media approach (proactive vs reactive, channels, timing)
- Key talking points aligned with KIDO's position
- Risk assessment and mitigation messaging

### 4.2 Press Releases

Formal press releases in KIDO's organizational voice:
- Standard press release structure (headline, dateline, lead, body, boilerplate)
- Quotes attributed to appropriate KIDO leadership
- Background context from source intelligence
- Contact information and organizational description

### 4.3 Social Media Content

Platform-specific content optimized for each channel:

| Platform | Format | Constraints |
|----------|--------|-------------|
| X/Twitter | Thread-ready posts | 280 char limit per post, hashtag strategy |
| Facebook | Long-form posts | Engagement-optimized, shareable format |
| Instagram | Caption + hashtags | Visual-first language, hashtag blocks |

### 4.4 Political Letters

Formal correspondence to government officials:
- Letters to Ministers (federal/provincial)
- Letters to Members of Parliament
- Letters to officials and bureaucrats
- Proper salutations, formal tone, specific policy references
- Clear asks and calls to action

### 4.5 Briefing Notes

Internal documents for KIDO leadership:
- Issue/topic summary
- Background and context (sourced from intelligence)
- Analysis of implications for KIDO and Indigenous child welfare
- Options and recommendations
- Suggested next steps

### 4.6 Talking Points

Concise bullet-point messaging:
- Key messages (3–5 core points)
- Supporting data points and references
- Anticipated questions and suggested responses
- Messages to avoid / sensitive areas
- Audience-specific variations

---

## 5. Customizable Generation Parameters

All parameters are toggleable per generation request to optimize output.

### 5.1 Tone

| Option | Use Case |
|--------|----------|
| `formal` | Official correspondence, press releases, briefing notes |
| `conversational` | Social media, community-facing communications |
| `urgent` | Time-sensitive responses, crisis communications |
| `diplomatic` | Government relations, political letters, sensitive topics |

### 5.2 Audience

| Option | Description |
|--------|-------------|
| `public` | General public, media consumers, community members |
| `government` | Ministers, MPs, officials, bureaucrats |
| `media` | Journalists, editors, media outlets |
| `internal` | KIDO staff, leadership, board members |

### 5.3 Additional Parameters

- **Key messages to emphasize** — Free-text input for priority messaging
- **KIDO's position/stance** — Organization's formal position on the issue
- **Length/detail level** — Short (1 page), medium (2–3 pages), detailed (4+ pages)
- **Source selection** — Choose which articles, digests, or uploaded documents to include as generation context

---

## 6. Architecture

### 6.1 System Overview

```
┌─────────────────────────┐     API Calls      ┌──────────────────────────────┐
│                         │ ◄────────────────── │                              │
│   KIDO Intelligence     │                     │   KIDO Content Generator     │
│   Platform              │                     │                              │
│                         │  Articles, Digests  │   - Template Engine          │
│   - Knowledge Engine    │ ──────────────────► │   - Claude API Integration   │
│   - Article Processing  │                     │   - Document Upload          │
│   - Entity Extraction   │                     │   - Version History          │
│   - Digest Generation   │                     │   - Content Management       │
│                         │                     │                              │
└─────────────────────────┘                     └──────────────────────────────┘
        Vercel                                           Vercel
     (existing)                                       (new deploy)
                                                          │
                                                          │ Phase 2
                                                          ▼
                                                  ┌──────────────┐
                                                  │ MCP Server   │
                                                  │ (Claude      │
                                                  │  Cowork)     │
                                                  └──────────────┘
```

### 6.2 Tech Stack

Mirrors the Intelligence Platform for consistency and shared developer knowledge.

| Component | Technology |
|-----------|------------|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS |
| Database | MongoDB Atlas (Mongoose ODM) |
| Authentication | NextAuth.js (credentials provider, JWT sessions) |
| AI Provider | Anthropic Claude API (`claude-sonnet-4-20250514`) |
| File Parsing | pdf-parse, mammoth (DOCX), plain text |
| Deployment | Vercel (serverless functions, maxDuration=60s) |
| File Storage | Vercel Blob or MongoDB GridFS |
| CI/CD | GitHub Actions (lint, type-check, build on push to main) |
| Testing | Jest + React Testing Library |

### 6.3 Project Structure

```
kido-content-generator/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Auth pages (login, register)
│   │   ├── (dashboard)/              # Main app layout
│   │   │   ├── generate/             # Content generation interface
│   │   │   ├── content/              # Generated content library
│   │   │   ├── documents/            # Uploaded document management
│   │   │   ├── templates/            # Template management
│   │   │   └── settings/             # App settings
│   │   ├── api/
│   │   │   ├── auth/                 # NextAuth routes
│   │   │   ├── generate/             # Content generation endpoint
│   │   │   ├── content/              # CRUD for generated content
│   │   │   ├── documents/            # Document upload & management
│   │   │   ├── intelligence/         # Proxy to Intelligence Platform API
│   │   │   └── templates/            # Template CRUD
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── generation/               # Generation form, parameter controls
│   │   ├── content/                  # Content display, editor, history
│   │   ├── documents/                # Upload UI, document list
│   │   ├── intelligence/             # Article browser, digest viewer
│   │   ├── templates/                # Template editor
│   │   └── ui/                       # Shared UI components
│   ├── lib/
│   │   ├── ai/                       # Claude API client, prompt builder
│   │   ├── db/                       # MongoDB connection, models
│   │   ├── intelligence-api/         # Intelligence Platform API client
│   │   ├── parsers/                  # PDF, DOCX, TXT parsing
│   │   ├── templates/                # Default prompt templates
│   │   └── auth/                     # Auth config
│   └── types/                        # TypeScript type definitions
├── public/
├── tests/
├── .env.example
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 7. Data Models

### 7.1 GeneratedContent

```typescript
interface GeneratedContent {
  _id: ObjectId;
  title: string;
  contentType: 'media-strategy' | 'press-release' | 'social-media' | 'political-letter' | 'briefing-note' | 'talking-points';
  content: string;                    // Generated content (Markdown)
  parameters: {
    tone: 'formal' | 'conversational' | 'urgent' | 'diplomatic';
    audience: 'public' | 'government' | 'media' | 'internal';
    lengthLevel: 'short' | 'medium' | 'detailed';
    keyMessages: string[];
    position: string;                 // KIDO's stance
  };
  sources: {
    articleIds: string[];             // Intelligence Platform article IDs
    digestIds: string[];              // Intelligence Platform digest IDs
    documentIds: ObjectId[];          // Uploaded document references
  };
  templateId: ObjectId;              // Template used for generation
  versions: ContentVersion[];        // Version history
  status: 'draft' | 'review' | 'approved' | 'published';
  createdBy: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

interface ContentVersion {
  version: number;
  content: string;
  parameters: GeneratedContent['parameters'];
  createdAt: Date;
  createdBy: ObjectId;
  changeNote?: string;
}
```

### 7.2 Document

```typescript
interface Document {
  _id: ObjectId;
  name: string;
  originalFilename: string;
  fileType: 'pdf' | 'docx' | 'txt';
  fileSize: number;
  storageKey: string;                 // Vercel Blob key or GridFS ID
  extractedText: string;             // Parsed text content
  category: 'memo' | 'policy-position' | 'community-input' | 'talking-points' | 'cowork-output' | 'other';
  tags: string[];
  uploadedBy: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
```

### 7.3 PromptTemplate

```typescript
interface PromptTemplate {
  _id: ObjectId;
  name: string;
  contentType: GeneratedContent['contentType'];
  systemPrompt: string;              // System-level instructions
  userPromptTemplate: string;        // Template with {{variable}} placeholders
  variables: string[];               // Expected variables
  isDefault: boolean;                // Ships with app vs user-created
  createdBy: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
```

### 7.4 User

```typescript
interface User {
  _id: ObjectId;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 8. API Routes

### 8.1 Content Generation

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/generate` | Generate content from sources + parameters |
| `POST` | `/api/generate/refine` | Refine/regenerate with adjusted parameters |

### 8.2 Generated Content Management

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/content` | List generated content (paginated, filterable) |
| `GET` | `/api/content/:id` | Get single content item with version history |
| `PUT` | `/api/content/:id` | Update content (manual edits, creates new version) |
| `DELETE` | `/api/content/:id` | Delete content |
| `PATCH` | `/api/content/:id/status` | Update content status (draft → review → approved) |

### 8.3 Document Upload

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/documents/upload` | Upload and parse document |
| `GET` | `/api/documents` | List uploaded documents |
| `GET` | `/api/documents/:id` | Get document details + extracted text |
| `DELETE` | `/api/documents/:id` | Delete document |

### 8.4 Intelligence Platform Proxy

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/intelligence/articles` | Fetch processed articles from Intelligence Platform |
| `GET` | `/api/intelligence/articles/:id` | Get single article with full details |
| `GET` | `/api/intelligence/digests` | Fetch AI-generated digests |
| `GET` | `/api/intelligence/digests/:id` | Get single digest |

### 8.5 Templates

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/templates` | List prompt templates |
| `GET` | `/api/templates/:id` | Get template details |
| `POST` | `/api/templates` | Create custom template |
| `PUT` | `/api/templates/:id` | Update template |
| `DELETE` | `/api/templates/:id` | Delete custom template |

---

## 9. UI Pages

### 9.1 Dashboard (`/`)

- Quick-action cards for each content type
- Recent generations list
- Intelligence Platform activity summary (latest articles/digests)

### 9.2 Generate Content (`/generate`)

Multi-step generation interface:

1. **Select content type** — Choose output type (press release, briefing note, etc.)
2. **Select sources** — Browse/search Intelligence Platform articles and digests; select uploaded documents
3. **Configure parameters** — Set tone, audience, key messages, position, length
4. **Review & generate** — Preview selected context, confirm, trigger generation
5. **Review output** — View generated content with inline editing, regeneration, and refinement options

### 9.3 Content Library (`/content`)

- Filterable/searchable list of all generated content
- Status badges (draft, review, approved, published)
- Version history viewer with diff comparison
- Export options (copy to clipboard, download as DOCX/PDF)

### 9.4 Documents (`/documents`)

- Drag-and-drop file upload zone
- Document list with category filters
- Document detail view showing extracted text
- Category and tag management

### 9.5 Templates (`/templates`)

- List of prompt templates per content type
- Template editor with variable preview
- Default templates (ship with app) vs custom templates

### 9.6 Settings (`/settings`)

- Intelligence Platform API connection configuration
- User management (admin only)
- Default generation parameters

---

## 10. Content Generation Flow

```
User selects content type
        │
        ▼
User selects sources
├── Browse Intelligence Platform articles/digests
├── Select uploaded documents
└── Optionally paste additional context
        │
        ▼
User configures parameters
├── Tone (formal/conversational/urgent/diplomatic)
├── Audience (public/government/media/internal)
├── Key messages
├── KIDO position
└── Length/detail level
        │
        ▼
System assembles prompt
├── Load prompt template for content type
├── Inject selected source content (articles, digests, documents)
├── Apply parameter instructions (tone, audience, length)
├── Include KIDO organizational context
└── Include key messages and position
        │
        ▼
Claude API call (streaming)
        │
        ▼
Display generated content
├── Streaming output in real-time
├── Inline editing capability
├── Regenerate / refine options
└── Save to content library with version tracking
```

---

## 11. Intelligence Platform Integration

### 11.1 API Contract

The Content Generator connects to the Intelligence Platform's existing API. Required endpoints on the Intelligence Platform side:

```
GET /api/articles?page=1&limit=20&category=...&sort=relevanceScore
GET /api/articles/:id
GET /api/digests?page=1&limit=10
GET /api/digests/:id
```

Each article object is expected to include:
- `title`, `source`, `url`, `publishedAt`
- `summary` (AI-generated)
- `categories` (from KIDO taxonomy — see 11.4 below)
- `relevanceScore` (0–100)
- `entities` (people, organizations, legislation, jurisdictions)
- `tags`

### 11.4 Intelligence Platform Taxonomy Categories

The article browser in the Content Generator should support filtering by the Intelligence Platform's taxonomy. These are the categories used by the categorizer:

| Slug | Display Name |
|------|-------------|
| `bill-c92-jurisdiction` | Bill C-92 & Jurisdiction |
| `chrt-rulings` | CHRT Rulings & Compliance |
| `jordans-principle` | Jordan's Principle |
| `fncfs-funding` | FNCFS Funding & Reform |
| `undrip-implementation` | UNDRIP Implementation |
| `nan-treaty9` | NAN & Treaty 9 |
| `provincial-child-welfare` | Provincial Child Welfare |
| `federal-policy` | Federal Policy & Legislation |
| `supreme-court` | Supreme Court Decisions |
| `data-sovereignty` | Indigenous Data Sovereignty |
| `reconciliation-trc` | Reconciliation & TRC |
| `fiscal-relations` | Fiscal Relations |
| `health-services` | Health Services |
| `education` | Education |
| `housing-infrastructure` | Housing & Infrastructure |

Articles typically have 2–4 categories. The `nan-treaty9` tag appears on any content mentioning NAN, Treaty 9, or KI directly.

### 11.2 Authentication

API-key-based authentication between the two applications. The Content Generator stores the Intelligence Platform API key in environment variables.

### 11.3 Data Freshness

- Articles and digests are fetched on-demand (not synced/cached long-term)
- A short TTL cache (5 minutes) prevents redundant API calls during a generation session
- Users can manually refresh the article/digest list

---

## 12. Prompt Template System

### 12.1 Template Structure

Each template consists of:
- **System prompt**: Sets the AI's role, KIDO context, output format rules
- **User prompt template**: Contains `{{variable}}` placeholders filled at generation time

### 12.2 Available Variables

| Variable | Description |
|----------|-------------|
| `{{contentType}}` | The selected output type |
| `{{tone}}` | Selected tone parameter |
| `{{audience}}` | Selected audience parameter |
| `{{lengthLevel}}` | Selected length/detail level |
| `{{keyMessages}}` | User-provided key messages |
| `{{position}}` | KIDO's position on the issue |
| `{{sourceArticles}}` | Concatenated article summaries and metadata |
| `{{sourceDigests}}` | Concatenated digest content |
| `{{sourceDocuments}}` | Concatenated uploaded document text |
| `{{additionalContext}}` | Free-text user input |

### 12.3 Default Templates

The app ships with one default template per content type. These are seeded into the database on first run and can be cloned/customized by admins.

### 12.4 Example: Press Release Template

**System prompt:**
```
You are a senior communications specialist for KIDO (Kitchenuhmaykoosib
Inninuwug Dibenjikewin Onaakonikewin), an Indigenous child and family
services organization operating under Bill C-92. You write professional
press releases that reflect KIDO's commitment to Indigenous self-governance
in child welfare, community-based approaches, and the inherent rights of
First Nations children and families.

Always use respectful, culturally informed language. Reference relevant
legislation (Bill C-92, UNDRIP, etc.) where appropriate. Maintain a
{{tone}} tone appropriate for {{audience}} audiences.
```

**User prompt template:**
```
Write a press release based on the following intelligence and context.

## Source Intelligence
{{sourceArticles}}
{{sourceDigests}}

## Additional Context
{{sourceDocuments}}
{{additionalContext}}

## Parameters
- Key messages to emphasize: {{keyMessages}}
- KIDO's position: {{position}}
- Detail level: {{lengthLevel}}

Generate a complete press release with headline, dateline, lead paragraph,
body, quote from KIDO leadership, background section, and boilerplate.
```

---

## 13. Environment Variables

```bash
# App
NEXTAUTH_URL=https://kido-content-generator.vercel.app
NEXTAUTH_SECRET=

# Database
MONGODB_URI=

# AI
ANTHROPIC_API_KEY=

# Intelligence Platform
INTELLIGENCE_PLATFORM_URL=https://kido-government-relations-intellige.vercel.app
INTELLIGENCE_PLATFORM_API_KEY=

# File Storage (Vercel Blob)
BLOB_READ_WRITE_TOKEN=
```

---

## 14. Authentication & Authorization

### 14.1 Authentication

- NextAuth.js with credentials provider (email/password) — matches Intelligence Platform
- Session-based authentication with JWT tokens
- Shared user accounts with the Intelligence Platform is a future consideration

### 14.2 Roles & Permissions

| Role | Generate | Edit | Delete | Manage Templates | Manage Users |
|------|----------|------|--------|------------------|--------------|
| Admin | ✓ | ✓ | ✓ | ✓ | ✓ |
| Editor | ✓ | ✓ | Own only | ✗ | ✗ |
| Viewer | ✗ | ✗ | ✗ | ✗ | ✗ |

---

## 15. Implementation Phases

### Phase 1: Foundation (MVP)

**Goal:** Working content generation from uploaded documents

- [ ] Project scaffolding (Next.js, TypeScript, Tailwind, MongoDB, NextAuth)
- [ ] Authentication (login, registration, role-based access)
- [ ] Document upload and parsing (PDF, DOCX, TXT)
- [ ] Prompt template system with default templates for all 6 content types
- [ ] Content generation UI (multi-step form → Claude API → streamed output)
- [ ] Generated content storage with version history
- [ ] Content library with search, filter, and status management
- [ ] Basic content export (copy to clipboard, download as TXT)

### Phase 2: Intelligence Platform Integration

**Goal:** Pull processed intelligence as generation context

- [ ] Intelligence Platform API client
- [ ] Article and digest browser UI
- [ ] Source selection in generation flow
- [ ] Caching layer for Intelligence Platform data

### Phase 3: Polish & Templates

**Goal:** Refined UX and customizable templates

- [ ] Template editor UI for custom prompt templates
- [ ] Content diff viewer (version comparison)
- [ ] DOCX/PDF export for generated content
- [ ] Refinement/regeneration flow (tweak parameters and re-generate)
- [ ] Dashboard with activity summary

### Phase 4: MCP Server Integration

**Goal:** Claude Cowork can push content directly

- [ ] MCP server implementation
- [ ] Cowork-to-Content-Generator push protocol
- [ ] Automatic source material ingestion from Cowork sessions

---

## 16. Coding Conventions

Matches the Intelligence Platform for consistency:

- **TypeScript strict mode** — no `any` types, all functions typed
- **Async/await** — never raw promises or callbacks
- **Error handling** — every async function wrapped in try/catch with structured error logging
- **Naming**: camelCase for variables/functions, PascalCase for components/types, SCREAMING_SNAKE for env vars
- **Imports**: absolute imports via `@/` alias mapped to `src/`
- **Components**: functional components only, props typed via interfaces
- **API routes**: consistent response shape `{ success: boolean, data?: T, error?: string }`
- **Database queries**: always use Mongoose models, never raw MongoDB driver calls
- **AI calls**: always go through a centralized AI client (`src/lib/ai/`), never call Claude API directly from routes or components
- **Mobile-first**: UI must work on mobile (responsive sidebar with hamburger menu)
- **No PII**: This system must never store personally identifiable information about children, families, or service recipients

---

## 17. Non-Functional Requirements

### 17.1 Performance

- Content generation streaming begins within 2 seconds of request
- Full generation completes within 60 seconds for detailed output
- Page loads < 1 second on Vercel edge network
- Document parsing < 10 seconds for files up to 10MB

### 17.2 Security

- All API routes require authentication
- File upload validation (type, size limits: 10MB max)
- Input sanitization on all user-provided fields
- API keys stored as environment variables, never exposed to client
- CORS restricted to app domain

### 17.3 Reliability

- Graceful handling of Claude API failures (retry with backoff, user notification)
- Graceful handling of Intelligence Platform API unavailability
- MongoDB connection pooling for Vercel serverless functions
- Autosave drafts during generation to prevent data loss

### 17.4 Scalability

- Vercel serverless deployment scales automatically
- MongoDB Atlas handles database scaling
- No persistent server state — stateless API design

---

## 18. Open Questions

1. **Shared authentication** — Should the Content Generator share user accounts with the Intelligence Platform, or maintain separate user management?
2. **Content approval workflow** — Does the draft → review → approved flow need email/notification triggers?
3. **Export formats** — Are DOCX and PDF sufficient, or are other formats needed (HTML email, etc.)?
4. **Bilingual support** — Should generated content support French output for federal government communications?
5. **Usage analytics** — Should the system track generation metrics (content types used, generation frequency, etc.)?
6. **Intelligence Platform API** — What authentication mechanism does the Intelligence Platform currently use for API access? Does an external API exist or does one need to be built?

---

## Appendix A: Domain Glossary

Key terms, organizations, and legislation referenced throughout the Content Generator's templates and outputs. This glossary ensures accurate terminology in all generated communications.

### Organizations

| Abbreviation | Full Name | Description |
|-------------|-----------|-------------|
| **KIDO** | Kitchenuhmaykoosib Inninuwug Dibenjikewin Onaakonikewin | The client organization. Child and family services body operating under Bill C-92 for KI First Nation. |
| **KI** | Kitchenuhmaykoosib Inninuwug | First Nation community in Northern Ontario (Big Trout Lake). Remote fly-in community in Treaty 9 territory. |
| **NAN** | Nishnawbe Aski Nation | Political territorial organization representing 49 First Nations across Treaty 9 and Treaty 5 (Northern Ontario). |
| **ISC** | Indigenous Services Canada | Federal department delivering services to First Nations, Inuit, and Métis peoples. Administers FNCFS and Jordan's Principle. |
| **CIRNAC** | Crown-Indigenous Relations and Northern Affairs Canada | Federal department for Crown-Indigenous relationships, treaty implementation, self-government agreements. |
| **AFN** | Assembly of First Nations | National advocacy organization representing First Nations in Canada. |
| **CHRT** | Canadian Human Rights Tribunal | Issued landmark 2016 ruling on First Nations child welfare discrimination. |
| **FNCCS** | First Nations Caring Society | Led by Dr. Cindy Blackstock. Filed the original CHRT complaint. |
| **FNIHB** | First Nations and Inuit Health Branch | Branch within ISC responsible for health services. |
| **IFNA** | Independent First Nations Alliance | Tribal Council within NAN territory; KI is a member. |

### Legislation

| Reference | Description |
|-----------|-------------|
| **Bill C-92** | An Act respecting First Nations, Inuit and Métis children, youth and families. In force Jan 1, 2020. Affirms inherent right of self-government including jurisdiction over child and family services. |
| **UNDRIP** | United Nations Declaration on the Rights of Indigenous Peoples. |
| **Bill C-15** (UNDRIP Act) | Federal legislation requiring Canadian laws to be consistent with UNDRIP. |
| **Jordan's Principle** | Child-first principle ensuring First Nations children access services without jurisdictional delays. Named after Jordan River Anderson. |
| **FNCFS Program** | First Nations Child and Family Services Program. ISC-administered, funds ~140 delegated agencies. |
| **Section 35** | Constitution Act, 1982. Recognizes Aboriginal and treaty rights. SCC confirmed in 2024 it includes self-government in child welfare. |
| **Treaty 9** | James Bay Treaty (1905-06). Covers most of Northern Ontario including KI territory. |
| **TRC** | Truth and Reconciliation Commission. 94 Calls to Action; Call #4 addresses child welfare. |

### Key Concepts

| Term | Definition |
|------|-----------|
| **Substantive equality** | Distinct treatment may be needed to achieve equal outcomes. Core principle in Bill C-92. |
| **Cultural continuity** | Services must preserve a child's connection to culture, language, community, and family. |
| **Best interests of the child** | Primary consideration under Bill C-92 with specific Indigenous-context factors. |
| **Coordination agreement** | Agreement between Indigenous governing body, federal, and provincial governments under Bill C-92. |
| **Delegated agency** | CFS agency delegated authority by a province. Bill C-92 enables moving beyond this model to full jurisdiction. |
| **Notice of intent** | Formal notice to ISC and province that an Indigenous governing body intends to exercise CFS jurisdiction. |
| **Inherent right of self-government** | Right of Indigenous peoples to govern themselves, recognized under s.35 and affirmed by SCC in 2024. |

### Language Notes

- Always use full name on first reference, abbreviation thereafter
- KI = the First Nation community; KIDO = the child and family services organization
- ISC and CIRNAC are separate departments — never conflate them
- Jordan's Principle always has the apostrophe
- Treaty 9 is the common name; "James Bay Treaty" is the formal name
- **Anishininimowin** = Oji-Cree language spoken in KI and western NAN territory
- **Anishinaabemowin** = broader Ojibway language family (Southern Ontario)
