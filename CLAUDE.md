@AGENTS.md

# Fleetwood Designs — website and configurators

Next.js website with dedicated configurators for Fleetwood Designs products. Each configurator generates the parameters for one MakerWorld model.

## The documentation is the specification

The docs live in the sibling repo `../FleetwoodDesigns`. **The code follows the docs.** Before changing behaviour, read:

- `../FleetwoodDesigns/CLAUDE.md`: documentation rules and the working order (docs → code → validation);
- `docs/Project/ENGINEERING.md`: formulas, constants, limits and the exact MakerWorld parameter order per product;
- `docs/Project/PRODUCTS.md`: product boundaries and rules for adding a product;
- `docs/Project/UX.md`: interaction rules;
- `docs/Design Decisions/README.md`: why things are built this way.

If the code and the docs disagree, don't silently pick one. Point out the mismatch and ask which is right. After a change, update the docs (or say which docs need updating).

## Architecture

- **One dedicated configurator per product**, with its own route under `/configure/…`, workflow state, engineering entry point and MakerWorld mapping (DD024, DD031). No generic configurator framework.
- **Engineering formulas live only in `lib/engineering/calculations/`.** Constants live in `lib/engineering/engineeringConstants.ts` (DD022).
- **The engineering result is authoritative.** Components and workflow state never calculate geometry (DD029).
- **MakerWorld mappings** (`lib/engineering/makerworld/`) may only rename, select, order, format and range-check values. They must not calculate geometry. The parameter order must match the published model exactly (DD030).
- Engineering errors and MakerWorld compatibility errors stay separate.
- Product names, routes and MakerWorld URLs are in `lib/products.ts`.

## Working method

- All source code, comments, UI text and documentation in English.
- No version suffixes in file names; git keeps history.
- Inspect existing code and call sites before changing types. Prefer the smallest safe change; avoid unrelated refactoring.
- Keep the application working after every step.
- After changes, run `npm run lint` and `npm run validate:engineering` (which also runs before every build).
- Report changed files, the checks run and any unresolved issues.

## Git and deployment

Every push to `main` deploys to production on Vercel. Work on a branch, and never push `main` unless explicitly asked.
