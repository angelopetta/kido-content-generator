# Original Spec Prompt

Write a detailed specification for the KIDO Content Generator — a standalone Next.js app that connects to the KIDO Intelligence Platform (existing app at kido-government-relations-intellige.vercel.app).

What it does:
The Content Generator turns processed intelligence from the KIDO Knowledge Engine into actionable communications content for KIDO's Government Relations department.

Input sources:

- Processed articles pulled from the Intelligence Platform via API (already summarized, categorized, scored, with entity extractions)
- AI-generated digests from the Intelligence Platform
- Uploaded documents (internal memos, policy positions, community input, talking points, Claude chat/Cowork outputs) — supports PDF, DOCX, TXT
- Future: MCP server integration so Claude Cowork projects can push content directly

Output types (configurable templates):

- Media strategies (strategic analysis with recommended messaging and media approach)
- Press releases (formal, in KIDO's organizational voice)
- Social media content (platform-specific: X/Twitter, Facebook, Instagram)
- Political letters (correspondence to ministers, MPs, officials)
- Briefing notes (internal documents for leadership with background, analysis, recommendations)
- Talking points (bullet-point messaging for spokespeople or chiefs)

Customizable parameters (toggleable to optimize output):

- Tone: formal / conversational / urgent / diplomatic
- Audience: public / government / media / internal
- Key messages to emphasize
- KIDO's position/stance on the issue
- Length/detail level
- Which source articles/documents to include as context

Architecture:

- Standalone Next.js app (same tech stack as Intelligence Platform: TypeScript, MongoDB, Tailwind, NextAuth, Claude API)
- Own repo, own Vercel deployment, own database
- Connects to Intelligence Platform via API to pull processed articles and digests
- Own document upload capability for additional source material
- Template system with reusable prompt templates per output type
- Generated content stored with version history

Client context:

- Client: KIDO (Kitchenuhmaykoosib Inninuwug Dibenjikewin Onaakonikewin) — an Indigenous child and family services organization operating under Bill C-92
- Read CLAUDE.md in the Intelligence Platform repo for full organizational context, domain glossary, and taxonomy
- The Intelligence Platform repo is at: /home/user/KIDO-Government-Relations-Intelligence-Platform
- Reference docs/DOMAIN-GLOSSARY.md, docs/TAXONOMY.md, and docs/PRD.md for domain knowledge

Phased approach for integration with Claude Cowork:

- Phase 1: Manual upload (copy/paste, file upload) — build first
- Phase 2: MCP server so Claude Cowork can push content directly to the Content Generator
