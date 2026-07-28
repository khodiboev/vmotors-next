# Santa Frontend

Santa is the Next.js frontend for a Hyundai and Kia vehicle marketplace in South Korea. It uses Apollo Client to communicate with the GraphQL API running on `http://localhost:3007/graphql`.

## Getting Started

Install dependencies and start the development server:

```bash
yarn install
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Core Stack

- Next.js `pages/` router
- Apollo Client for GraphQL queries, mutations, uploads, and websocket chat connectivity
- MUI and Sass for UI styling
- `next-i18next` for localized labels and copy

## Main Areas

- Homepage and brand discovery
- Vehicle browse and vehicle detail
- Dealer directory and dealer detail
- Community articles and discussion
- Account, my page, and admin tools

## Validation

Run these checks after major changes:

```bash
yarn -s tsc --noEmit --incremental false
yarn build
```

## Notes

- Preserve the existing routing and Apollo/GraphQL integration.
- Keep vehicle-marketplace business logic intact while improving branding and UI incrementally.

## AI / Handoff Documentation

Project history, migration guide, and architectural decisions live in [`docs/ai/`](./docs/ai/):

- [`PROJECT_OVERVIEW.md`](./docs/ai/PROJECT_OVERVIEW.md) — Full project context, tech stack, page status
- [`COMPLETED_TASKS.md`](./docs/ai/COMPLETED_TASKS.md) — Chronological record of all completed work
- [`FRONTEND_MIGRATION.md`](./docs/ai/FRONTEND_MIGRATION.md) — Nestar → Santa migration history and legacy code guide
- [`DECISIONS.md`](./docs/ai/DECISIONS.md) — Key architectural and naming decisions with rationale
