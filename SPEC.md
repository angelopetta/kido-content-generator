# Kido Content Generator — Product Specification

## Overview

Kido Content Generator is a tool that generates age-appropriate educational and entertainment content for children. It leverages AI to create personalized stories, quizzes, and learning activities tailored to a child's age group and interests.

## Goals

- Generate engaging, safe, and age-appropriate content for children (ages 3–12)
- Support multiple content types (stories, quizzes, activities, vocabulary exercises)
- Allow customization by age group, topic, and difficulty level
- Ensure all generated content is reviewed for safety and appropriateness

## Target Users

- **Parents** looking for educational content for their children
- **Teachers** who need customizable classroom materials
- **Content creators** building kids' apps or platforms

## Content Types

| Type | Description | Age Range |
|------|-------------|-----------|
| Stories | Short illustrated narratives with moral lessons | 3–12 |
| Quizzes | Multiple-choice questions on various subjects | 5–12 |
| Vocabulary | Word definitions, synonyms, and usage examples | 4–10 |
| Activities | Step-by-step craft or learning activities | 3–12 |
| Math exercises | Age-appropriate math problems | 5–12 |

## Functional Requirements

### FR-1: Content Generation

- Users can request content by specifying:
  - Content type (story, quiz, vocabulary, activity, math)
  - Age group (3–5, 6–8, 9–12)
  - Topic or subject (animals, space, history, etc.)
  - Language (default: English)
- The system generates content using an LLM (Claude API)
- Generated content is validated against safety filters before delivery

### FR-2: Content Safety

- All output passes through a content moderation layer
- No violent, scary, or inappropriate content is permitted
- Language complexity is adjusted to match the target age group
- Content avoids stereotypes and promotes inclusivity

### FR-3: API Interface

- RESTful API with JSON request/response format
- Endpoints:
  - `POST /api/generate` — Generate new content
  - `GET /api/content/:id` — Retrieve previously generated content
  - `GET /api/content-types` — List available content types
  - `GET /api/health` — Health check

### FR-4: Content Storage

- Generated content is stored for retrieval and caching
- Duplicate requests within a configurable TTL return cached results
- Users can list and manage their previously generated content

## Non-Functional Requirements

### NFR-1: Performance

- Content generation completes within 30 seconds
- API response time for cached content < 200ms
- System supports at least 50 concurrent users

### NFR-2: Security

- API key authentication for all endpoints
- Rate limiting (100 requests/hour per API key)
- Input sanitization on all user-provided fields

### NFR-3: Reliability

- 99.5% uptime target
- Graceful degradation when the LLM provider is unavailable
- Retry logic with exponential backoff for external API calls

## Tech Stack

| Component | Technology |
|-----------|------------|
| Language | Python 3.12+ |
| Framework | FastAPI |
| AI Provider | Anthropic Claude API |
| Database | PostgreSQL |
| Caching | Redis |
| Testing | pytest |
| Containerization | Docker |

## Project Structure

```
kido-content-generator/
├── src/
│   ├── api/            # FastAPI routes and middleware
│   ├── core/           # Business logic and content generation
│   ├── models/         # Database models and schemas
│   ├── services/       # External service integrations (Claude API)
│   └── utils/          # Helpers, validators, safety filters
├── tests/
│   ├── unit/
│   └── integration/
├── migrations/         # Database migrations
├── docker/
├── .env.example
├── pyproject.toml
└── README.md
```

## API Examples

### Generate a Story

**Request:**
```json
POST /api/generate
{
  "content_type": "story",
  "age_group": "6-8",
  "topic": "dinosaurs",
  "language": "en"
}
```

**Response:**
```json
{
  "id": "cnt_abc123",
  "content_type": "story",
  "title": "Dina the Friendly Dinosaur",
  "body": "Once upon a time, in a land covered with tall ferns...",
  "age_group": "6-8",
  "topic": "dinosaurs",
  "created_at": "2026-04-05T12:00:00Z"
}
```

## Milestones

1. **M1 — Foundation**: Project setup, API skeleton, database schema
2. **M2 — Core Generation**: Claude API integration, basic story and quiz generation
3. **M3 — Safety & Quality**: Content moderation, age-appropriate language filtering
4. **M4 — Storage & Caching**: PostgreSQL persistence, Redis caching
5. **M5 — Polish**: Rate limiting, documentation, Docker setup, tests

## Open Questions

- Should the system support image generation alongside text content?
- Is multi-language support needed from day one or can it be added later?
- Should there be a web UI or is API-only sufficient for v1?
