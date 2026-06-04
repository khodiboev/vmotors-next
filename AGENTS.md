Go outside of this project and read VMotors/docs/ai first!

# VMotors Frontend Modification Instructions

This client project is being migrated/adapted from nestar-next to VMotors-next.

## Rules

- Preserve current project architecture.
- Keep GraphQL/Apollo integration.
- Do not rewrite the whole app.
- Improve UI incrementally.
- Replace real estate/property logic with vehicle/car sales logic safely.
- Use vehicle-related naming consistently:
  - property → vehicle
  - properties → vehicles
  - estate/real estate → car/vehicle
  - rent/sale property logic → car sale/listing logic

## Backend Context

Before making any changes, read:

- docs/ai/BACKEND_MIGRATION.md
- docs/ai/DECISIONS.md
- docs/ai/FRONTEND_MIGRATION.md
- docs/ai/COMPLETED_TASKS.md
- and other files inside VMotors/docs/ai

## Workflow

1. Analyze before editing.
2. Backend is running on port http://localhost:3007/graphql now.
3. Make small incremental changes.
4. Run typecheck after each phase.
5. Do not remove working logic unless replaced safely.
6. Update VMotors/docs/ai/COMPLETED_TASKS.md after major changes.

## Package Manager

- Use Yarn for all frontend commands.
- Do not use npm or pnpm.
- Install dependencies with:

```bash
yarn install