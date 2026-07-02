# Completed Tasks

This file records all significant completed work on the Santa frontend, in reverse-chronological order. Each entry describes what changed, why, and what was deliberately left unchanged.

> **For context on naming decisions and legacy code, see DECISIONS.md.**
> **For migration history, see FRONTEND_MIGRATION.md.**

---

## Phase 4: Page Polish — Community, MyPage, CS, Homepage (July 2026)

### 4.5 — Homepage: Buyer Favorites Orbital Carousel

**What changed:** The "Buyer Favorites" section (previously `TopProperties`) was given the same experimental 3D Orbital Carousel treatment as New Arrivals. A new `BuyerFavoritesOrbital.tsx` component was created. The original `TopProperties.tsx` was not modified and remains available for rollback.

**Key differences from New Arrivals orbital:**
- Default sort: `vehicleLikes DESC`, limit 8 (most-liked listings)
- Stack class: `buyer-favorites-orbital`
- CTA text: "See premium inventory"
- Mobile fallback uses `top-vehicles` / `top-property-swiper` CSS classes (matching original `TopProperties` mobile)

**SCSS:** The orbital CSS block in `homepage.scss` was updated to a grouped selector (`.new-arrivals-orbital, .buyer-favorites-orbital`) so both sections share all orbital styles without duplication.

**Rollback:** To revert to `TopProperties`, uncomment its import and replace `<BuyerFavoritesOrbital />` in `pages/index.tsx`.

**Files changed:** `libs/components/homepage/BuyerFavoritesOrbital.tsx` (new), `pages/index.tsx`, `scss/pc/homepage/homepage.scss`

---

### 4.4 — Homepage: New Arrivals 3D Orbital Carousel

**What changed:** The New Arrivals section's standard Swiper slider (`TrendProperties`) was experimentally replaced with a 3D orbital carousel. `TrendProperties.tsx` was not modified; the new component is a separate presentation layer using the same GraphQL data and `HomepageVehicleCard`.

**Technical details:**
- Cards are positioned on a cylindrical arc using Framer Motion `rotateY`, `x` (horizontal offset), and `z` (depth) transforms. `perspective: 1400px` is set on `.orbital-stage`.
- Navigation: mouse wheel (via non-passive DOM listener to allow `e.preventDefault()`), touch swipe, keyboard arrows, prev/next buttons, dot indicators, and click-to-focus.
- Stale closure in wheel handler is avoided using a "ref refresh" pattern: `wheelHandlerRef.current` is reassigned each render; the DOM listener calls `wheelHandlerRef.current?.(e)`.
- Horizontal overflow from large `x` values is clipped with `overflow-x: clip` (does not create a scroll container, preserves 3D transforms).
- Cards are wrapped in a `.orbital-showcase-shell` with `overflow: hidden` + `border-radius: 36px` for the premium panel look and edge masking.
- `useReducedMotion` respected: 3D transforms disabled, spring duration set to `0.01`.

**Files changed:** `libs/components/homepage/NewArrivalsOrbital.tsx` (new), `pages/index.tsx`, `scss/pc/homepage/homepage.scss`

---

### 4.3 — Homepage: Header Filter Dropdown Scroll-Lock Fix

**Problem:** Opening any Brand/Fuel/Transmission filter dropdown caused a visible page-width jump. The body has a hidden scrollbar (`overflow-y: scroll; scrollbar-width: none`), but MUI's `Select` was adding `padding-right` to body to compensate for the scrollbar when its menu opened, causing a layout shift.

**Fix:** Added `MenuProps={{ disableScrollLock: true }}` to all three `Select` components in `HeaderFilter.tsx`. This prevents MUI from mutating the body's padding when the dropdown opens.

**Files changed:** `libs/components/homepage/HeaderFilter.tsx`

---

### 4.2 — CS Page Polish

**What changed:** The Customer Support page was polished to better match the Santa premium design language. Areas improved:
- Hero right-side visual: white text was invisible due to inherited white background from a group CSS rule. Fixed by explicitly setting the correct background on the hero side card.
- Support highlight cards: hover animation, icon sizing, card height.
- `cs-main-info` section: flex-row layout, tab styling.
- Notice section: table spacing, badges, hover, typography.
- FAQ section: accordion styling, category sidebar.

This was a CSS-only polish pass; no component logic, routing, or data was changed. The page was not fully redesigned — it retained the existing JSX structure and MUI components.

**Files changed:** `scss/pc/cs/cs.scss`

---

### 4.1 — MyPage Section Improvements

**What changed:** Several MyPage sub-sections were audited and polished for VMotors/Santa consistency:
- **Write Article editor:** Investigated and fixed a default text bug in `Teditor.tsx`. Editor default content and styling corrected.
- **Followers empty state:** Redesigned the empty state in `MemberFollowers.tsx` to match Santa premium style.
- **Following section:** UI improved in `MemberFollowings.tsx`.
- **My Articles section:** Title, card layout, and pagination styling improved in `MyArticles.tsx` and `myArticles.scss`.
- **My Properties:** Minor style adjustments in `MyProperties.tsx` and `addNewProperty.scss`.

GraphQL queries, mutations, pagination logic, and authentication checks were not touched.

**Files changed:** `libs/components/community/Teditor.tsx`, `libs/components/member/MemberFollowers.tsx`, `libs/components/member/MemberFollowings.tsx`, `libs/components/mypage/MyArticles.tsx`, `libs/components/mypage/MyProperties.tsx`, `scss/pc/member/memberFollows.scss`, `scss/pc/mypage/myArticles.scss`, `scss/pc/mypage/addNewProperty.scss`, `scss/pc/mypage/writeArticle.scss`

---

### 4.0 — Community Page: Auth Guard and Article Detail Polish

**Auth guard fix:** Previously, clicking "Write Article" as a guest redirected to the homepage. Changed so guests see an inline warning instead of being silently redirected.

**Article Detail page redesign** (`pages/community/detail.tsx`, `libs/components/community/TViewer.tsx`):
- Page redesigned into Santa premium style (was still using Nestar-era layout)
- Duplicate image issue fixed (article thumbnail was appearing twice)
- Article typography, spacing, image rendering, comments section, and like section polished
- `TViewer.tsx` updated for proper content rendering inside the new layout
- All `GET_BOARD_ARTICLE`, `CREATE_COMMENT`, `LIKE_TARGET_BOARD_ARTICLE` logic preserved unchanged

**Featured Discussion card fix** (`scss/pc/community/community.scss`):
- Text overflow fixed: added `min-width: 0; overflow: hidden` to flex children
- Description text now shows 5-line preview with `-webkit-line-clamp: 5` and ellipsis
- Typography: `font-size: 15px`, `line-height: 1.8`, color `#64748b`

**Files changed:** `pages/community/detail.tsx`, `pages/community/index.tsx`, `libs/components/community/TViewer.tsx`, `libs/components/layout/LayoutBasic.tsx`, `scss/pc/community/community.scss`, `scss/pc/community/detail.scss`

---

## Phase 3: Member Page Redesign (June 2026)

### 3.4 — Member Page Articles Section Bug Fix

**Problem:** After the initial member page redesign, the Articles section had critical layout bugs: article card images overflowed their containers, cards grew to extreme heights, grid alignment broke, and pagination appeared detached from the content.

**Root Cause:** `CommunityListingCard` is reused on the member page, but its entire CSS (including `overflow: hidden`, `object-fit: cover`, `aspect-ratio`, and all typographic styles) is scoped under `#pc-wrap #community-list-page` in `community.scss`. When rendered inside `#member-articles-page`, none of those styles applied.

**Fix:** Rewrote `scss/pc/member/memberArticles.scss` to provide full `.community-listing-card` styles scoped under `#member-articles-page`. Used `16/9` aspect ratio on `.article-media`, `object-fit: cover` on `img`, `overflow: hidden` on the card, `-webkit-line-clamp: 3` on summaries, and a proper 2-column grid. `community.scss` was not touched — the community page is unaffected.

**Files changed:** `scss/pc/member/memberArticles.scss`

---

### 3.3 — Member Page Full Redesign

**What changed:** The Member/Profile page (`/member`) was redesigned from the old Nestar layout (small sidebar with avatar + list of nav sections in a single bordered box) to the Santa premium UI with a full-width hero and clean sidebar navigation.

**New layout:**

1. **Profile Hero** (`member-hero`) — Full-width card spanning the content area. Contains large circular avatar (156px), "Santa Verified Dealer" badge for agent-type members, dealer name, phone, location (if available), description (if available), statistics row (vehicles/followers/following/articles), and a Follow/Unfollow button when the viewer is not the profile owner.

2. **Two-column layout** — `240px` sticky sidebar + flexible content area.

3. **Sidebar** (`member-nav-card`) — Navigation-only card with tab items (Vehicles, Followers, Following, Articles) showing live counts from the `GET_MEMBER` query. "Vehicles" tab is only shown for `AGENT`-type members.

4. **Content area** — Renders one of four sub-components depending on the `category` query param.

**State management change:** `GET_MEMBER` query was lifted from `MemberMenu.tsx` to `pages/member/index.tsx` so the parent page can feed member data to both the hero and the sidebar nav. This was a structural change but all Apollo/GraphQL logic was preserved identically.

**Components updated:**
- `pages/member/index.tsx` — Added `GET_MEMBER` query, hero section, layout restructure
- `libs/components/member/MemberMenu.tsx` — Removed `GET_MEMBER` query, now accepts `member: Member | null` prop, renders navigation only
- `libs/components/member/MemberProperties.tsx` — Switched from old `PropertyCard` to `PropertyBigCard` (3-column vehicle grid)
- `libs/components/member/MemberArticles.tsx` — Kept `CommunityListingCard`, added section header and empty state
- `libs/components/member/MemberFollowers.tsx` — Redesigned to `person-card` layout (avatar, name, follower meta, like + follow buttons)
- `libs/components/member/MemberFollowings.tsx` — Same redesign as Followers
- `scss/pc/member/memberPage.scss` — Full rewrite: hero, layout grid, sidebar nav, shared content styles, mobile
- `scss/pc/member/memberProperties.scss` — Rewrite: 3-col vehicle grid
- `scss/pc/member/memberArticles.scss` — Rewrite: 2-col article grid + full card styles
- `scss/pc/member/memberFollows.scss` — Rewrite: person-card list

**Preserved unchanged:** All follow/unfollow mutations (`SUBSCRIBE`, `UNSUBSCRIBE`), `LIKE_TARGET_MEMBER` mutation, article like mutation, all routing, pagination logic, `GET_MEMBER_FOLLOWERS`, `GET_MEMBER_FOLLOWINGS`, `GET_BOARD_ARTICLES`, `GET_VEHICLES` queries, authentication checks.

---

### 3.2 — `PropertyBigCard` Made Reusable (likePropertyHandler optional)

**Problem:** `PropertyBigCard` was initially written for the Dealer Detail page where a like handler is always passed. On the Member page, vehicles are shown in read-only mode with no like interaction.

**Fix:** Changed `likePropertyHandler: any` to `likePropertyHandler?: any` in the props interface, and wrapped the like button in `{likePropertyHandler && (...)}`. The card now renders without a like button when no handler is provided.

**Files changed:** `libs/components/common/PropertyBigCard.tsx`

---

### 3.1 — Dealer Detail Page Redesign

**What changed:** The Dealer Detail page (`/agent/detail`) was fully redesigned from the old Nestar/VMotors layout to the Santa premium UI.

**New three-section layout:**

1. **Dealer Hero** — Wide card with large circular avatar, "Santa Verified" badge, dealer name (clickable → member page), phone, address (if available), description (if available), and a stats row: Vehicles / Views / Likes / Rank.

2. **Vehicle Inventory** — Section header with vehicle count, `PropertyBigCard` cards in a 3-column grid, MUI Pagination, and a modern empty state.

3. **Reviews** — Review count badge, list of `ReviewCard` components with pagination, divider, and a write-review form (textarea + submit button).

**New shared component:** `libs/components/common/PropertyBigCard.tsx` — fully rewritten with the `dealer-vehicle-card` CSS class. This is now the standard vehicle card used across Dealer Detail, Member page, and any future pages.

**CSS architecture decision:** `.dealer-vehicle-card` CSS was intentionally placed at the top of `scss/pc/agent/detail.scss` under `#pc-wrap, #mobile-wrap` (not nested inside `.agent-detail-page`) so it is globally available to any page that uses `PropertyBigCard`. CSS custom properties (`var(--dd-*)`) are replaced with hardcoded values at this global scope, while the `.agent-detail-page` block retains the `--dd-*` variable definitions for page-specific elements.

**Components updated:**
- `pages/agent/detail.tsx` — Full JSX rewrite, all Apollo/GraphQL logic preserved
- `libs/components/agent/ReviewCard.tsx` — Simplified to `review-card` design, removed `useDeviceDetect` and MUI imports
- `libs/components/common/PropertyBigCard.tsx` — Complete rewrite with `dealer-vehicle-card` design
- `scss/pc/agent/detail.scss` — Complete rewrite with global card + scoped page styles

**Removed from detail.tsx:** `useDeviceDetect`, mobile placeholder `<div>`, `Box/Stack/Typography` MUI imports, `StarIcon`.

**Preserved unchanged:** All `GET_AGENT`, `GET_AGENT_PROPERTIES`, `GET_COMMENTS` queries, `CREATE_COMMENT` mutation, `likePropertyHandler`, `redirectToMemberPageHandler`, pagination, authentication gate on review form.

---

## Phase 2: Journey Navigation and Navbar (June 2026)

### 2.1 — Journey Navigation Redesign

**What changed:** The top navigation was redesigned from a standard link list into a "Journey Navigation" pattern. The five main destinations of the site — Home, Vehicles, Dealers, Community, CS — are presented as a sequential user journey. Each step shows visual states:

- **Completed** — the user has passed through this stage (filled checkmark circle)
- **Active** — the current page (highlighted label)
- **Future** — not yet reached (unfilled circle)

Route-to-journey-index mapping is handled by `getJourneyIndex()` in `Top.tsx`. Pages outside the journey (`/member`, `/mypage`, `/account/join`, `/about`) use a "detached" render state where no step is marked active.

The progress line between steps fills from left to right based on the active step index.

Auth controls (avatar, notifications, language selector, login button) were preserved. MUI `<Menu>` uses `disableScrollLock` to prevent page-jump when the dropdown opens.

**Files changed:** `libs/components/Top.tsx`, `scss/pc/main.scss` (nav styles)

---

## Phase 1: Initial Santa Rebranding (June 2026)

### 1.3 — Community Page Redesign

**What changed:** The Community page (`/community`) was redesigned to the Santa premium UI. Includes a hero section, category tabs, featured article card, and a 3-column article grid using `CommunityListingCard`. The community page uses CSS custom properties prefixed `--community-*` scoped to `#community-list-page`.

**Preserved:** All `GET_BOARD_ARTICLES`, `LIKE_TARGET_BOARD_ARTICLE` logic, article category routing, TUI Editor on the detail page.

---

### 1.2 — Homepage Redesign

**What changed:** The homepage was redesigned to the Santa brand. Sections: New Arrivals, Buyer Favorites, Trusted Dealers, Community Highlights. Section wrapper/background inconsistencies were investigated and resolved. Unused imports, duplicated branches, stale comments, and dead `PopularProperties`-related CSS and code were removed. The `withLayoutHome` HOC was preserved; all GraphQL queries on the homepage were preserved.

**Files changed:** All `libs/components/homepage/` components, `pages/index.tsx`, `scss/pc/homepage/homepage.scss`

---

### 1.1 — Vehicle and Dealer Page Cleanup

**Vehicles page (`/vehicle`):** Old Nestar/real-estate background imagery was removed from the hero. A temporary over-designed hero was simplified. Vehicle listing, filters, sorting, cards, GraphQL, and Apollo logic were fully preserved.

**Dealers page (`/agent`):** Hero background complexity was cleaned up. Sort dropdown scrollbar/layout-shift bug was fixed. Dealer cards and filtering logic preserved.

**Files changed:** `libs/components/layout/LayoutBasic.tsx` (hero bg paths), `scss/pc/agent/agents.scss`, `pages/vehicle/index.tsx`, `pages/agent/index.tsx`

---

### 1.0 — Branding: Nestar/VMotors → Santa

**What changed (user-visible):**
- Project name in README, titles, and meta tags updated to "Santa"
- Logo SVGs in `public/img/logo/` (favicon.svg, logoText.svg, logoWhite.svg) replaced with Santa wordmark
- Footer and header references updated to Santa
- Color palette shifted to navy/blue/coral Santa tokens
- Old VMotors and Nestar visible UI copy removed

**What was NOT changed (intentionally):**
- Internal TypeScript type names (`Property`, `PropertyBigCard`, `propertyRank`, etc.) — these are schema-coupled
- GraphQL query/mutation names — these match the backend exactly
- `apollo/user/query.ts` and `mutation.ts` — not renamed
- File/folder paths (`pages/agent/`, `libs/components/agent/`, etc.) — renaming would break routing
- Database-facing enums and DTOs
- The backend API itself — not part of this repo

See `DECISIONS.md` for the full rationale on what was and was not renamed.

---

## Pre-Santa: Nestar → VMotors Migration (Pre-June 2026)

The original codebase was `nestar-next` — a real-estate marketplace. Before the Santa work began, the initial VMotors migration:

- Renamed `Property` GraphQL type to `Vehicle` in the backend
- Added `Vehicle` TypeScript types in `libs/types/vehicle/`
- Added `VehicleBrand`, `VehicleFuel`, `VehicleStatus`, `VehicleTransmission` enums
- Added `GET_VEHICLES`, `GET_VEHICLE` GraphQL queries
- Converted the property listing/detail pages to vehicle listing/detail pages
- Kept many Nestar-era component names internally (`PropertyBigCard`, `property.enum.ts`, `propertyYears`, etc.) because renaming was deferred

The `CHANGELOG.md` at the root records the full Nestar-era git history (up to v2.2.0 in May 2024). All entries in that changelog predate the Santa/VMotors work.
