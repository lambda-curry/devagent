# Tech Stack Template

Use this template to document the technology stack for any project. Replace bracketed guidance with concrete details and remove sections that don't apply.

## Context

Brief project description and purpose: <what this project does>

## Core Stack

### Application Framework & Runtime
- App framework: <framework name and version>
- Language: <primary language(s) with versions>
- Runtime: <Node.js, Deno, Bun, Python, etc. with versions>
- Package manager: <npm, yarn, pnpm, bun, pip, etc.>

### Build & Development Tools
- Monorepo tooling: <Turborepo, Nx, Lerna, or N/A>
- Build tool: <Vite, Webpack, esbuild, etc.>
- Module system: <ESM, CommonJS, etc.>

### Frontend (if applicable)
- UI framework: <React, Vue, Svelte, etc. with version>
- CSS framework: <Tailwind, Bootstrap, styled-components, etc.>
- UI component library: <Radix, MUI, Chakra, custom, etc.>
- Icons: <lucide-react, heroicons, font-awesome, etc.>
- Fonts: <Google Fonts, custom, system>

### Backend (if applicable)
- Server framework: <Express, Fastify, NestJS, Django, FastAPI, etc.>
- API style: <REST, GraphQL, tRPC, gRPC>
- Authentication: <Auth0, Clerk, Better Auth, custom JWT, etc.>

### Data & State Management
- Forms & validation: <library and schema validator>
- State management: <Redux, Zustand, Jotai, Context, etc.>
- Data fetching: <React Query, SWR, Apollo, native fetch>
- Database: <PostgreSQL, MySQL, MongoDB, etc.>
- ORM/Query builder: <Prisma, Drizzle, TypeORM, Sequelize, SQLAlchemy, etc.>

### Testing & Quality
- Testing framework: <Vitest, Jest, Playwright, Cypress, pytest, etc.>
- Linting: <ESLint, Biome, Ruff, etc.>
- Formatting: <Prettier, Biome, Black, etc.>
- Type checking: <TypeScript, mypy, etc.>

### Hosting & Infrastructure
- Application hosting: <Vercel, Netlify, AWS, GCP, Heroku, etc.>
- Database hosting: <Neon, Supabase, PlanetScale, RDS, etc.>
- CDN: <Cloudflare, Vercel Edge, CloudFront, etc.>
- Asset storage: <S3, Cloudinary, built-in>

### CI/CD & DevOps
- CI/CD platform: <GitHub Actions, GitLab CI, CircleCI, etc.>
- Deployment trigger: <PR previews, branch deployments, manual>
- Environments: <production, staging, preview, development>

### AI & External Services (if applicable)
- AI/LLM: <OpenAI, Anthropic, AI SDK, LangChain, etc.>
- Analytics: <Google Analytics, Plausible, Mixpanel, etc.>
- Monitoring: <Sentry, DataDog, LogRocket, etc.>
- Email: <SendGrid, Resend, Postmark, etc.>

## Product Capabilities

Key features or workflows this stack enables:
- <Capability 1>
- <Capability 2>
- <Capability 3>

## Constraints & Requirements

Technical or business constraints that shaped these choices:
- <Constraint 1: e.g., must be serverless>
- <Constraint 2: e.g., GDPR compliance required>
- <Constraint 3: e.g., budget limitations>

## Future Integrations (Roadmap)

Planned additions or changes:
- <Future tech 1>
- <Future tech 2>

## Decision Rationale (Optional)

Why key technologies were chosen:
- **<Technology>**: <reasoning for selection>
- **<Technology>**: <reasoning for selection>

---

**Template Version**: 1.0  
**Last Updated**: <date>

