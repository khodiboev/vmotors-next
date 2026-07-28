# Frontend Migration Guide: Nestar → Santa

This document explains the full lineage of the codebase, what was migrated, what was preserved, and what legacy code still exists and why. Any AI working on this project should read this file to avoid accidentally removing intentionally-kept code or misinterpreting Nestar-era names.

---

## Where the Project Started: Nestar

The codebase was forked from `SBekzod/nestar-next`, a full-stack real-estate marketplace built in South Korea. The original product was a property/apartment listing platform. Key characteristics of the Nestar codebase:

- Properties were called "apartments" or "properties"
- Agents listed properties (real-estate agents)
- The MUI `Box/Stack/Typography` components were used extensively in JSX
- Device detection (`useDeviceDetect`) was used to swap between mobile and desktop component trees
- Layouts used `#pc-wrap` and `#mobile-wrap` wrappers
- SCSS was heavily nested under these wrappers
- Apollo Client was fully integrated for all data operations
- `next-i18next` was used for Korean/English translation

The `CHANGELOG.md` at the project root contains the full Nestar git history. All entries predate the Santa work.

---

## Stage 1: Initial Automotive Fork

At some point before June 2026, the Nestar frontend was forked into a new automotive marketplace (later rebranded to Santa). The backend was also rewritten to add vehicle-specific models. The key changes during this stage:

### Backend Changes (Done Before This Frontend Work)
- `Property` domain was extended with a parallel `Vehicle` domain
- New GraphQL queries: `GET_VEHICLES`, `GET_VEHICLE`, `GET_AGENTS` (dealers)
- New types: `Vehicle`, `VehicleInput`, `VehiclesInquiry`
- New enums: `VehicleBrand` (HYUNDAI | KIA), `VehicleStatus`, `VehicleFuel`, `VehicleTransmission`
- Members can be of type `AGENT` (dealer) or `USER` (regular buyer)

### Frontend Adaptations
- `libs/types/vehicle/` directory added with `Vehicle`, `VehicleInput`, `VehiclesInquiry` interfaces
- `libs/enums/vehicle.enum.ts` added
- `pages/vehicle/` pages added, replacing the old `pages/property/` pages
- `libs/components/vehicle-list/` and `libs/components/vehicle-detail/` added
- The `pages/property/` directory still exists in the codebase as legacy — it was not deleted because it contains working infrastructure
- Many component names still carry "Property" in their name (see Legacy Names section below)

---

## Stage 2: Santa Rebranding and UI Redesign (June 2026)

This is the main active phase of work. The goal is to modernize the entire frontend visual layer while leaving all business logic, GraphQL, routing, and authentication untouched.

### What Was Changed: Branding

| Item | Before | After |
|---|---|---|
| Product name | Nestar (and its earlier automotive fork) | **Santa** |
| Logo SVGs | Previous automotive wordmark | `SANTA` text-only wordmark |
| Favicon | Car icon (previous brand) | Santa-branded SVG |
| README | Previous brand description | Santa description |
| Page titles | Previous brand | Santa |
| Footer | Previous branding | Santa branding |

### What Was Changed: UI/Design

All redesigned pages moved from the Nestar-era UI (MUI Box/Stack/Typography, mobile placeholder pattern, Nestar-era color palette) to the Santa premium design system:

- **Removed:** `useDeviceDetect` from redesigned components (CSS handles responsive now)
- **Removed:** Mobile placeholder pattern (`device === 'mobile' ? <MobilePlaceholder /> : <Content />`)
- **Removed:** Excessive MUI `Box`/`Stack`/`Typography` wrappers in redesigned JSX
- **Added:** CSS custom properties (`--dd-*`, `--community-*`) scoped to their page
- **Added:** Premium card components with hover animations
- **Added:** Journey Navigation replacing the flat link list

### What Was NOT Changed: Core Logic

The following was intentionally left unchanged across all redesign work:

- All GraphQL query and mutation definitions in `apollo/user/query.ts` and `apollo/user/mutation.ts`
- All Apollo `useQuery`/`useMutation` calls and their `onCompleted` callbacks
- All `useReactiveVar(userVar)` authentication checks
- All routing (Next.js `<Link>` and `router.push`)
- All pagination logic (`page`, `limit`, `sort`, `direction` query params)
- All follow/unfollow mutations (`SUBSCRIBE`, `UNSUBSCRIBE`)
- All like mutations (`LIKE_TARGET_MEMBER`, `LIKE_TARGET_BOARD_ARTICLE`)
- All form submit logic and mutation calls
- All `getStaticProps`/`serverSideTranslations` i18n wiring
- All admin page logic and components

---

## Legacy Code That Still Exists and Why

### `pages/property/` directory

The old real-estate property pages still exist. They have NOT been deleted. This is intentional — they represent working Apollo/routing patterns that could be referenced, and there was no urgent reason to risk breaking anything by removing them during the UI redesign phase. They do not appear in navigation and are not linked.

**Recommendation for a future AI:** These pages can be safely deleted once the team confirms the vehicle pages are stable and the old routes are no longer needed for reference.

### `libs/components/property/` directory

Similarly, the old `PropertyCard` component (used by the original property listing) still exists alongside the new `PropertyBigCard` (which replaced it for the Santa design). `MemberProperties.tsx` was updated to use `PropertyBigCard`, but other references to the old `PropertyCard` may remain elsewhere.

### `property.enum.ts`

Contains `PropertyType`, `PropertyStatus`, `PropertyRent`, `PropertyBarter` and other real-estate enums. Many of these are still referenced in `libs/config.ts` (`availableOptions = ['propertyBarter', 'propertyRent']`). These are schema-coupled names that were not renamed. Do not delete these enums.

### `propertyYears` and `propertySquare` in `config.ts`

These constants predate the automotive migration and are still used by vehicle filter inputs. The names have not been changed because doing so would require finding and updating every reference and verifying no schema field expects these names.

### `topPropertyRank` in `config.ts`

This constant (`= 2`) is used to determine whether to show a "Top" badge on vehicle cards. The name was not changed because it is referenced in multiple components and the meaning is clear from context.

### MUI Imports in Non-Redesigned Components

Components that have not yet been redesigned (My Page, CS, Admin, Account/Join, About) still use the Nestar-era pattern of MUI `Box`/`Stack`/`Typography` for layout and the `useDeviceDetect` mobile/desktop split. This is expected and intentional — do not remove these until the component is being redesigned.

### `scss/pc/property/` styles

The old property page SCSS files still exist. They are harmless but unused now that the vehicle pages have their own SCSS. They can be removed in a future cleanup pass.

---

## CSS Architecture: Critical Knowledge

### The #pc-wrap / #mobile-wrap Pattern

Every page rendered by `withLayoutBasic` wraps content in `<div id="pc-wrap">` (desktop) or `<div id="mobile-wrap">` (mobile, via `useDeviceDetect`). All SCSS is scoped under one of these two selectors. This means:

- CSS written at the global level without these wrappers will not apply to page content
- CSS written under `#pc-wrap #some-page` will not apply when the same component is rendered inside a different page's wrapper

**This scoping caused the biggest CSS bugs during the redesign:**

1. `.dealer-vehicle-card` was originally scoped under `#pc-wrap #agent-detail-page`. When `PropertyBigCard` was reused on the Member page (inside `#member-page`), the styles did not apply. Fix: moved `.dealer-vehicle-card` to the top-level `#pc-wrap, #mobile-wrap` scope with hardcoded color values.

2. `.community-listing-card` is scoped under `#pc-wrap #community-list-page`. When `CommunityListingCard` is reused on the Member page, the community page styles do not apply. Fix: duplicate the necessary card CSS in `memberArticles.scss` scoped to `#member-articles-page`.

**Rule for future work:** Before reusing a component outside its original page, always check whether the component's CSS is page-scoped. If it is, either move the CSS to a higher scope or provide the needed styles in the destination page's SCSS file.

### CSS Custom Properties Scoping

Pages define their own `--var-*` custom properties on their root selector:

- Dealer Detail uses `--dd-*` vars defined on `.agent-detail-page`
- Community uses `--community-*` vars defined on `#community-list-page`

When card CSS that uses these vars is moved to a global scope (e.g., `.dealer-vehicle-card` at `#pc-wrap` level), the `var(--dd-*)` references become undefined. Solution: replace them with hardcoded values at the global scope, keeping the vars only within the page-specific block.

---

## Component Rename Map

For clarity: here is how the major rebranded components relate to their Nestar-era predecessors.

| Current Name | Nestar-Era Name | Notes |
|---|---|---|
| `PropertyBigCard` | `PropertyBigCard` | Internal name kept; design completely replaced |
| `Vehicle` (type) | `Property` (type) | Type was added alongside; Property type still exists |
| `VehicleListCard` | `PropertyCard` (list page) | New component, old one still exists |
| `dealer-vehicle-card` (CSS class) | `property-big-card-box` (CSS class) | Completely replaced |
| `MemberMenu` | `MemberMenu` | Refactored; lost GET_MEMBER query |
| `pages/agent/` | `pages/agent/` | Internal name kept (see DECISIONS.md) |
| `pages/vehicle/` | `pages/property/` | New route; old property route still exists |
| Journey Navigation | Plain nav links | Conceptually new |

---

## Recommended Next Steps for Redesign

Pages not yet fully redesigned (in suggested priority order):

1. **Vehicle Detail** (`/vehicle/detail`) — High traffic. Needs Santa card treatment for related vehicles, spec display, image gallery, comments. ⚠️ July 2026 redesign experiments were rejected and fully rolled back — the page is at its original stable state. **Recommended before the next attempt: commit the current working tree first** so rollbacks stay clean, then agree on a target layout up front (the rejected attempts churned on scale/alignment). Ideas that were prototyped and worked end-to-end if wanted later: 3-column related grid, merged spec card, per-vehicle highlights (needs a backend field).
2. **Account/Join** (`/account/join`) — Login and signup forms. Still on Nestar layout.
3. **Dealer List** (`/agent`) — Cards and sort/filter partially fixed. Full Santa card treatment still pending.
4. **About** (`/about`) — Static page.

Pages partially polished but not yet fully redesigned (structure still Nestar-era, JSX/MUI unchanged):

- **My Page** (`/mypage`) — Followers, Following, My Articles, and Write Article sections were improved (July 2026). Full redesign (remove MUI layout, useDeviceDetect, full CSS rewrite) still pending.
- **CS** (`/cs`) — Hero, support cards, Notice, and FAQ were polished (July 2026). Full structural redesign still pending.

Additional housekeeping pending:
- Confirm responsive/mobile behavior after orbital carousel additions
- Run a production build (`yarn build`) after final UI polish
- Review remaining "SANTA" branding text for consistency across pages
- Consider whether to clean up `pages/property/` (old real-estate routes, still harmless but unused)

When redesigning any of these, follow the established Santa pattern:
- Define `--page-*` CSS custom properties on the page root selector
- Remove `useDeviceDetect` and mobile placeholder patterns
- Remove MUI `Box`/`Stack`/`Typography` used only for layout
- Keep all Apollo/GraphQL, routing, auth, and data logic completely unchanged
- Use `PropertyBigCard` for vehicle cards
- Use `CommunityListingCard` for article cards
- Confirm with TypeScript check (`yarn -s tsc --noEmit`) before reporting done
