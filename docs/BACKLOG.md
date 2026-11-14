# Backlog

## Engineering

- Move the Stackable Small Parts Box constants (clearances 7.08 / 4.46 / 6, 252 mm limit, drawer
  offset 18.64, height offsets 5.1 and 1, unit sizes 42 / 30 / 14) from
  `stackableSmallPartsBox.ts` into `engineeringConstants.ts` (DD022).
- Decide whether the upward rounding of Stackable MakerWorld units belongs in the engineering
  result instead of the mapping layer (DD030).
- Assert the full MakerWorld parameter order for the Tray Storage System (25 parameters,
  position followed by toggle) and the Stackable Small Parts Box (6 parameters).
- Add rejection (invalid input) assertions for the Print-in-Place Storage Box with Compartments.

## Website

- Remove "(working name)" from the Stackable Small Parts Box description on the homepage; the
  name is final.

## Storage Designer UX

- Consider automatically advancing after tray-number changes so the Continue
  button can be removed. Validate the behavior before implementation.
