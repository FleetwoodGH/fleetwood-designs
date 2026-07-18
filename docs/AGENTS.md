# Fleetwood Designs Repository Instructions

## Communication and code

- All source code, comments, UI text and documentation must be written in English.
- Do not add version suffixes to filenames.
- Git provides version history.

## Architecture

- `CalculationResult` is the single source of truth for engineering results.
- Engineering formulas belong only in the Engineering Calculation Engine.
- MakerWorld profiles contain parameter names, capabilities, constraints and formatting only.
- MakerWorld generators may map, validate and format values but may not duplicate engineering calculations.
- Presentation components must remain calculation-free.

## Working method

- Read the relevant architecture and project documents before making changes.
- Inspect existing code and call sites before modifying types.
- Prefer the smallest safe implementation.
- Avoid unrelated refactoring.
- Preserve current behaviour unless the task explicitly changes it.
- Run the available tests, typecheck and lint commands after modifications.
- Report changed files, validation performed and unresolved issues.
