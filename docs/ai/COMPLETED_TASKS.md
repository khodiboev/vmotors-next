# Completed Tasks

This file records all significant completed work on the Santa frontend, in reverse-chronological order. Each entry describes what changed, why, and what was deliberately left unchanged.

> **For context on naming decisions and legacy code, see DECISIONS.md.**
> **For migration history, see FRONTEND_MIGRATION.md.**

---

## Phase 6: Site-Wide Bug Sweep, Santa Assistant, and Mobile Parity (2026-07-23)

A single long QA-and-fix session covering: a small round of Vehicle Detail bug fixes, a full click-through QA pass of the whole site as USER/AGENT/ADMIN, replacing the legacy broken chat widget with a real search assistant, closing two mobile pages that were rendering literal placeholder text instead of real content, and fixing several card-layout overflow bugs found via user-supplied screenshots (two of which traced back to a real backend bug). Every sub-entry below preserves existing GraphQL/Apollo/routing/business logic unless explicitly stated otherwise.

### 6.1 — Vehicle Detail: Three Small, Scoped Bug Fixes (pre-QA round)

**1. Site-wide horizontal scroll below ~1300px viewport width.**
`#pc-wrap .container` (`scss/app.scss`) and `.footer-container` (`scss/pc/main.scss`) were a hardcoded `width: 1300px` with no responsive fallback — any window narrower than that (a very common real laptop width, e.g. 1280px) got a horizontal scrollbar on every `withLayoutBasic`/`withLayoutHome` page. Changed both to `width: min(1300px, 100% - 48px)`, which is pixel-identical to the old behavior at ≥1300px and only shrinks below that. Confirmed live: at 1265px viewport, `scrollWidth === clientWidth` (previously overflowed).

**2. A dealer could message themselves.**
`pages/vehicle/detail.tsx`'s "Message dealer" button had no self-check, unlike the existing precedent in `pages/agent/detail.tsx:166` (`"Cannot write a review for yourself"`). Added `isOwnVehicle = user._id === (vehicle?.memberData?._id ?? vehicle?.memberId)` and hid the button when true. Guests and other users are unaffected.

**3. Inconsistent "please log in" wording.**
Vehicle actions used `Message.NOT_AUTHENTICATED` = *"You are not authenticated, please login first!"* while community/member/mypage actions used the shorter `Messages.error2` = *"Please login first!"*. Changed the shared `Message.NOT_AUTHENTICATED` enum value (`libs/enums/common.enum.ts`) to match — a single-line fix that propagates to all 6 call sites.

**Files:** `scss/app.scss`, `scss/pc/main.scss`, `pages/vehicle/detail.tsx`, `libs/enums/common.enum.ts`.

---

### 6.2 — Full-Site Click-Through QA Pass (USER / AGENT / ADMIN)

Manually exercised every major interactive surface in the browser, logged in as each of the three roles (seed accounts `User1`/`Justin`/`Admin`): vehicle like/unlike, vehicle comment create/edit/delete, dealer review submit, dealer follow/unfollow, message-a-dealer, community article like/unlike and comment create/delete, My Page (Following list, notifications bell showing a real sent message), agent vehicle status changes (Reserve/Sold, verified against the database and reverted), agent Add Vehicle form, and all 5 Admin panel sections (Members, Vehicles, Community, FAQ, Notices).

**Result:** no functional defects found beyond the wording inconsistency already fixed in 6.1 — everything tested works as intended. This pass is what surfaced the "please log in" wording mismatch, and gave the baseline confidence for the mobile and layout work that followed.

---

### 6.3 — Santa Assistant: Replacing the Legacy Chat Widget

**What it was:** `libs/components/Chat.tsx` was a leftover Nestar-era **global broadcast chatroom** — every visitor site-wide shared one open WebSocket room (`socket.gateway.ts` in the backend), capped at the last 5 messages, with no `_id` on messages (React key warnings), no reconnect handling, and no try/catch around `.send()`. The floating widget was branded "Online Chat" / "Santa client support" in the UI, implying private 1:1 support — but technically put a visitor in a room with random other site visitors.

**What replaced it:** a fully rewritten `Chat.tsx` — a private, per-session, rule-based **inventory search assistant** ("Santa Assistant"), with no backend changes and no paid API:
- Parses the typed question for known brand (`Hyundai`/`Kia`), fuel-type keywords (English + Uzbek stems, e.g. `elektromobil`→`ELECTRIC`), and leftover significant words as free-text candidates.
- Runs the existing `GET_VEHICLES` query (already used by `/vehicle`) with `brandList`/`fuelList`/`text` built from the parsed input; tries up to 2 keyword candidates before falling back to brand/fuel-only or a generic "browse all" empty state.
- Renders results as small linked vehicle cards (image, title, price, location) inside the bot's chat bubble.
- All UI copy is in English (a mid-session request switched this from an initial Uzbek draft).
- Explicitly **not persisted** — resets on page reload. This was a deliberate choice after asking the user, not an oversight.

**Why not a real LLM:** the user was asked directly; Anthropic API is pay-per-token with no free tier beyond initial trial credit, and the free rule-based approach fully covers the requested "ask about a vehicle, get an answer" use case.

**Files:** `libs/components/Chat.tsx` (full rewrite), `scss/pc/main.scss` (`.chatting` bubble/result-card styles).

---

### 6.4 — Mobile Parity: Two Pages Were Rendering Placeholder Text, Not Real Content

Chrome DevTools device emulation on the homepage (a user-supplied screenshot) surfaced a much larger mobile problem than the single visual bug it showed. Investigating it top to bottom found:

**Critical: two pages literally stub out their mobile branch.**
- `pages/account/join.tsx`: `if (device === 'mobile') return <div>LOGIN MOBILE</div>;` — on any real phone, Login/Signup was a single line of placeholder text. No form, no way to log in or sign up from a phone at all.
- `pages/community/detail.tsx`: same pattern, `<div>COMMUNITY DETAIL PAGE MOBILE</div>` — no article content, comments, or like button on mobile.

Both stub branches were removed outright (matching the already-established D-02 "CSS handles responsive layout, not a JS device branch" pattern used by every other redesigned page) so the real JSX renders unconditionally, then given real `#mobile-wrap` CSS: `scss/pc/account/join.scss` (two-column form stacks to one column) and `scss/pc/community/detail.scss` (header/body/comments padding and type scale, edit-modal made viewport-safe).

**Stale mobile CSS for a component that was since redesigned.**
`TopAgentCard.tsx`'s ("Trusted Dealers" homepage section) markup was rebuilt with a premium layout (`agent-avatar`, `agent-copy`, `agent-stats`, `agent-link`) at some point, but its `#mobile-wrap .top-agent-card` rules in `scss/mobile/main.scss` were never updated — they still targeted the old pre-redesign shape (`img`/`strong`/`span` direct children), so on mobile the cards rendered with none of their intended styling. Rewrote the mobile block to match the current component structure.

**Santa Assistant was unreachable on mobile everywhere.**
`<Chat />` was rendered only in the desktop (`else`) branch of all three layout HOCs (`LayoutHome.tsx`, `LayoutBasic.tsx`, `LayoutFull.tsx`) — the mobile branch never mounted it, and even if it had, `.chatting`/`.chat-frame`/etc. had zero mobile CSS anywhere. Added `<Chat />` to all three mobile branches and wrote a matching `#mobile-wrap .chatting` block (viewport-relative width capped at 360px, shorter panel height, full-width message input).

**Confirmed already fine, no changes needed:** `agent-detail-page` (Dealer Detail) and `member-page` both already had adequate dedicated `#mobile-wrap` CSS in their own PC scss files — an earlier pass in this same session had wrongly concluded they had *zero* mobile coverage by only grepping the central `scss/mobile/main.scss`, missing that some pages keep their mobile overrides colocated in their own file instead.

**Files:** `pages/account/join.tsx`, `pages/community/detail.tsx`, `scss/pc/account/join.scss`, `scss/pc/community/detail.scss`, `scss/mobile/main.scss`, `libs/components/layout/LayoutHome.tsx`, `LayoutBasic.tsx`, `LayoutFull.tsx`.

**Verification note:** this session's browser tooling could not reliably spoof a mobile user agent (viewport-only resize does not trigger this codebase's UA-based `useDeviceDetect`), so most of this phase was verified by direct code/CSS-cascade inspection plus `yarn build` succeeding, rather than a live mobile screenshot. Recommend a real-device or DevTools-emulation spot-check.

---

### 6.5 — My Articles: Card Title Touching the Card Edge

`libs/components/common/CommunityCard.tsx` (used only by `MyArticles.tsx`) renders its title/author text inside `.desc-box`, which had **zero horizontal padding** in its shared base definition (`scss/pc/general.scss`) — the title text ran edge-to-edge to the card boundary, ~1–2px from touching it. (The card's photo is intentionally edge-to-edge; the text was not meant to be.) Added `padding: 2px 14px 0` to the page-scoped `.desc-box` override in `scss/pc/mypage/myArticles.scss` — matching the `14px` horizontal padding already used by the sibling Edit/Delete button row. Verified via `getBoundingClientRect()`: title now sits ~15px from each edge instead of ~1–2px.

---

### 6.6 — Recently Viewed / Saved Vehicles: Two Card-Overflow Bugs at 3-Column Width

Both `#recently-visited-page` and `#my-favorites-page` reuse `DashboardVehicleCard` in a denser 3-column grid than the component's default 2-column design. Two overflow bugs, found from user screenshots, both traced to sizing that was tuned only for the wider 2-column card:

**1. Badge overlapping the price.** The bottom-left context pill (originally text: "Recently viewed" / "Favorite") and the bottom-right price chip are both absolutely positioned from opposite edges with no collision handling — at 3-column width the "Recently viewed" pill's text was wide enough to reach and overlap the price. `myFavorites.scss` already had a scaled-down fix for this on the Saved Vehicles page; `recentlyVisited.scss` was missing the equivalent fix. Rather than re-tuning padding on both, the user asked for a simpler, permanent fix: drop the text label entirely and keep only the icon (clock-with-arrow for "Recently viewed", bookmark for "Favorite"). `DashboardVehicleCard.tsx`'s `.media-context-pill` is now icon-only (with `aria-label`/`title` preserving the meaning for screen readers/hover), and the CSS became a small fixed-size circle (36px desktop / 32px mobile) instead of a text pill — structurally too small to ever reach the price chip again, so the previous 3-column-specific shrinking overrides for it were removed as dead code.

**2. Views/likes stats overflowing the card's right edge.** `.engagement-box` (eye icon + views, like button, like count) kept its 2-column sizing (38px like-button, 12px text, 10px gaps) in the 3-column context, where — combined with the dealer name/avatar column — it no longer fit and got clipped by the card's `overflow: hidden`. Added a 3-column-scoped size reduction (30px like-button, 11px text, tighter gaps, smaller dealer name/address text) to both `recentlyVisited.scss` and `myFavorites.scss`.

**Files:** `libs/components/mypage/DashboardVehicleCard.tsx`, `scss/pc/mypage/myFavorites.scss`, `scss/pc/mypage/recentlyVisited.scss`, `scss/mobile/main.scss`.

---

### 6.7 — Backend Fix: Sold Vehicles Leaking Into Recently Viewed / Saved Vehicles

While investigating 6.6, a card in Recently Viewed turned out to be a **sold** vehicle with a broken image, and clicking it landed on "We couldn't find that vehicle." — `pages/vehicle/detail.tsx` calls `getVehicle`, which (correctly) only returns `vehicleStatus: AVAILABLE` vehicles. The list endpoints behind Recently Viewed and Saved Vehicles did not apply the same rule.

**Root cause (backend, `vmotors` repo):** `ViewService.getVisitedVehicles` and `LikeService.getFavoriteVehicles` both filtered their vehicle lookup only by `deletedAt: { $exists: false }`, with no `vehicleStatus` filter — so a vehicle that later became `SOLD` (or `RESERVED`) stayed visible in a user's history/favorites indefinitely, as a dead link. This directly contradicts the migration's own documented intent ("Public listings show available non-deleted vehicles" — `vmotors/docs/ai/COMPLETED_TASKS.md`).

**Fix:** added `vehicleStatus: VehicleStatus.AVAILABLE` to both aggregation `$match` stages, identical to the rule already enforced by `getVehicle`/`getVehicles`. The vehicle document itself is untouched — this only changes which vehicles are eligible to appear in these two list queries. The main public `/vehicle` listing (`getVehicles`) already had this filter and needed no change.

**Verification:** looked up the exact vehicle from the report directly in MongoDB (`db.views.findOne({ viewRefId: ... })`) to find the real affected member (`David`, an `AGENT`), then called `getVisited` with his credentials before/after: his list dropped from 16 to 15 entries and the sold `Sonata` is gone; all 15 remaining entries are `AVAILABLE`. `npx tsc -p apps/vmotors-api/tsconfig.app.json --noEmit` passed; the `nest start --watch` dev process picked up the change without a crash.

**Files:** `vmotors/apps/vmotors-api/src/components/view/view.service.ts`, `vmotors/apps/vmotors-api/src/components/like/like.service.ts`.

---

### 6.8 — Environment Note: `.next` Corruption Between `yarn build` and `yarn dev`

Running a production `yarn build` and then starting `yarn dev` **without** clearing `.next` in between reliably broke the dev server into a `"missing required error components, refreshing..."` loop (matches the already-documented `.next` cache corruption pattern, but this specific trigger — production/dev mode mismatch in the same `.next` folder — is a new, reproducible variant of it). Hit this twice in this session; the fix both times was `rm -rf .next` before restarting `yarn dev`. **Rule of thumb: always `rm -rf .next` when switching between `yarn build` and `yarn dev`, not just when dev misbehaves on its own.**

---

## Phase 5: Footer, Toggles, Hero Backgrounds — and a Vehicle Detail Rollback (July 2026)

### 5.7 — Homepage Like Toast + Related/List Vehicle Like State Fix (2026-07-11)

**What changed:** Two independent UI-only bugs in vehicle like/unlike feedback were fixed. GraphQL, Apollo, routing, and backend like/unlike business logic were intentionally preserved.

**1. Homepage like toast used the generic top-right alert:**
- `NewArrivalsOrbital`, `BuyerFavoritesOrbital`, `TrendProperties`, and `TopProperties` (all homepage vehicle-card sections) called `sweetTopSmallSuccessAlert('success', 800)` on like/unlike — a plain white top-right SweetAlert2 toast literally reading "success".
- Switched all four to the existing `sweetVehicleActionToast` (bottom-center, Santa navy, used on `/vehicle` and `/vehicle/detail`) with proper **"Vehicle liked"** / **"Like removed"** copy, matching the wording already used by `VehicleListCard` and `VehicleDetailRelatedCard`.
- Files: `libs/components/homepage/NewArrivalsOrbital.tsx`, `BuyerFavoritesOrbital.tsx`, `TrendProperties.tsx`, `TopProperties.tsx`.

**2. Related-vehicle and vehicle-list cards silently reverted a like/unlike shortly after showing it correctly:**
- **Symptom:** clicking the heart on a "Related Hyundai and Kia inventory" card (vehicle detail page) or a `/vehicle` list card would flash the correct liked/unliked state, then revert to the pre-click state a moment later — even though the mutation had actually succeeded on the backend (confirmed by querying `getVehicle`/`getVehicles` directly).
- **Root cause:** each card kept its own optimistic like state, reconciled against the `vehicle` prop it received. The `getVehicles` list refetch that runs right after the like mutation can briefly hand back a **stale** `meLiked` for the vehicle just mutated (a backend list-query consistency lag, not a mutation failure). Since related/list cards are keyed by `_id` and get **recreated** whenever that list array reshuffles after a refetch, any optimistic state living only inside the card was lost on that remount, and the fresh (but still-stale) prop won.
- **Fix:** moved the optimistic like/unlike bookkeeping up to the page components (`pages/vehicle/detail.tsx`, `pages/vehicle/index.tsx`) as a `likeOverrides` map keyed by vehicle `_id`, set synchronously the moment a like/unlike is clicked and merged into every vehicle object handed down to cards (`applyLikeOverride`). Because this state lives in the page, it survives child cards remounting when the underlying list reshuffles. `VehicleDetailRelatedCard` and `VehicleListCard` were simplified back to plain prop-driven rendering (no local like state) plus a small `pendingRef` guard against double-firing the same click.
- Files: `pages/vehicle/detail.tsx`, `pages/vehicle/index.tsx`, `libs/components/vehicle-detail/VehicleDetailRelatedCard.tsx`, `libs/components/vehicle-list/VehicleListCard.tsx`.

**Validation:** `yarn tsc --noEmit` passed with zero errors across all eight changed files. Verified live in-browser (after clearing a corrupted `.next` dev cache — see note in `PROJECT_OVERVIEW.md`, not a code issue): liked/unliked three different related-vehicle cards back and forth, cross-checked each result directly against `getVehicle`/`getVehicles` GraphQL responses, and confirmed the UI matched backend truth and stayed stable for 6+ seconds after each click (no reversion).

---

### 5.6 — Community Article Grid + Like Feedback Polish (2026-07-10)

**What changed:** The bottom Community article grid and all board-article like success feedback were polished as UI-only improvements. GraphQL, Apollo, routing, pagination, article fetching, backend APIs, and like/unlike business logic were intentionally preserved.

**Community article grid:**
- Desktop grid changed from 2 columns to 3 columns so the six-article feed presents as a natural 3×2 layout.
- Responsive behavior is now Desktop 3 columns / Tablet 2 columns / Mobile 1 column.
- Article cards were tuned for the narrower layout: proportional media, slightly tighter card spacing/padding, readable typography, equal-height card behavior, and bottom-aligned metadata/footer actions.
- Article titles remain clamped to 2 lines.
- Article descriptions now use a 2-line `-webkit-line-clamp` with ellipsis so excerpts never overflow outside the card.

**Community article feedback:**
- Replaced board-article like/unlike success feedback that used the shared top-right `sweetTopSmallSuccessAlert` with a local Santa-themed floating feedback component.
- Added `ArticleLikeFeedback`, a small bottom-center animated status card with heart icon, Santa blue accent, rounded border, soft shadow, fade/slide/scale animation, and `role="status"`.
- Applied the feedback to Community listing article cards, Community article detail, Member profile articles, and MyPage My Articles — the board-article like surfaces using `LIKE_TARGET_BOARD_ARTICLE`.
- Rapid repeated clicks reuse/update the same local feedback instance instead of stacking multiple SweetAlert toasts.
- Final wording is **"Article liked"** when a heart action likes an article and **"Article unliked"** when it unlikes an article.

**Files changed:** `libs/components/community/ArticleLikeFeedback.tsx`, `pages/community/index.tsx`, `pages/community/detail.tsx`, `libs/components/community/CommunityListingCard.tsx`, `libs/components/common/CommunityCard.tsx`, `libs/components/member/MemberArticles.tsx`, `libs/components/mypage/MyArticles.tsx`, `scss/pc/community/community.scss`, `scss/mobile/main.scss`

**Validation:** `yarn -s tsc --noEmit --incremental false` passed. `/community?articleCategory=FREE` and Community article detail routes compile and return 200 after clearing stale `.next` dev artifacts and restarting the normal `yarn dev` command on the existing port behavior.

---

### 5.5 — Vehicle Detail: Redesign Experiments Rejected and Fully Rolled Back (2026-07-08)

**What happened:** A series of Vehicle Detail (`/vehicle/detail`) redesign experiments were attempted and rejected: desktop scale reduction, gallery/sidebar height alignment, a 3-column related-inventory grid, merging the two specification cards, repositioning the Trusted Dealer card, a bookmark save icon, and a new backend-supported "Vehicle Highlights" feature (schema field + create/edit form UI + detail-page card).

**Outcome:** Everything was reverted via `git checkout` to the last committed state. `pages/vehicle/detail.tsx`, `scss/pc/property/detail.scss`, `apollo/user/query.ts`, all three `libs/types/vehicle/` files, `libs/components/mypage/AddNewProperty.tsx`, and `scss/pc/mypage/addNewProperty.scss` are byte-identical to the pre-experiment state. The backend repo (`vmotors`) had the `vehicleHighlights` field added to its Mongoose schema and GraphQL DTOs during the experiment and was also fully reverted — **the backend ends the day unchanged**. No vehicle data was ever written with highlights, so no data cleanup was needed.

**Why documented:** So future work knows the Vehicle Detail page is still the original Nestar-era-derived design and remains the top redesign priority — and that a highlights-style feature was prototyped end-to-end and works, if it's ever wanted again.

---

### 5.4 — Vehicles Page: Comfort / Compact View Toggle (2026-07-07/08)

**What changed:** A presentation-only view toggle was added beside the "Sort by" control on `/vehicle` (desktop only). **Comfort** (default) keeps the original 2-column card grid at `limit: 8`; **Compact** switches to a 3-column grid of proportionally smaller cards at `limit: 9` (3×3). Switching pushes the standard `/vehicle?input=<JSON>` URL (same contract as sorting/pagination) with `page` reset to 1, and the view mode is re-derived from `limit` on reload so shared URLs stay consistent.

**Implementation notes:**
- `viewMode` local state + `viewModeChangeHandler` in `pages/vehicle/index.tsx`, mirroring the existing `sortingHandler` pattern
- `.view-toggle` glass-pill control styled to match `.sort-box`; `.list-config.compact` modifier scales the cards via parent CSS only — `VehicleListCard.tsx` untouched
- View transition is a CSS-only fade (two identical keyframes with alternating names)
- Mobile unchanged (toggle not rendered, limit stays 8)

**Files changed:** `pages/vehicle/index.tsx`, `scss/pc/property/property.scss`

---

### 5.3 — Footer: Links Made Functional (2026-07-07)

**What changed:** All footer text links and social icons were inert `<span>`s; they now navigate:
- **Popular Search:** Hyundai / Kia → `/vehicle?input=<JSON>` with `brandList` preset (mirrors the vehicles page's default input shape)
- **Discover:** Seoul / Gyeongido / Busan / Jejudo → `/vehicle` with `locationList` preset. Location matching is exact and case-sensitive (`"Seoul"` matches, `"SEOUL"` doesn't); the footer label strings are used verbatim. Only Seoul has data currently — other regions correctly show a filtered empty list.
- **Quick Links:** FAQs → `/cs?tab=faq`; Contact Support, Terms, Privacy, Pricing, Services → `/cs` (no dedicated legal/pricing/services pages exist)
- **Social icons:** wrapped in links to `/` — no real social URLs exist in the project

**CSS-parity shims** (required for link behavior, zero visual change): `.bottom div a { display: contents }` keeps the spans as flex children so `margin-top: 25px` spacing survives; `.media-box a { color: inherit; display: inline-flex }` keeps icon color. Added to both `scss/pc/main.scss` and `scss/mobile/main.scss` footer blocks.

**Files changed:** `libs/components/Footer.tsx`, `scss/pc/main.scss`, `scss/mobile/main.scss`

---

### 5.2 — Inner-Page Hero Backgrounds: Abstract Premium Redesign (2026-07-07)

**What changed:** The shared `withLayoutBasic` hero banner (flat dark rectangle + per-page banner images) was replaced with a CSS-only abstract design — no photography, no SVG artwork. `LayoutBasic.tsx` no longer sets `bgImage`; each route maps to a variant class (`hero-vehicles`, `hero-dealers`, `hero-community`, `hero-cs`, `hero-mypage`) and renders decorative layers (`hero-mesh`, two blurred orbs, two gradient streaks, vignette) inside an `aria-hidden` group.

**SCSS (`.header-basic` in `scss/pc/main.scss`):** layered navy gradient base matching the homepage hero language; per-page palettes via CSS custom-property overrides only (dealers = cyan, community = purple, CS = calm blue, mypage = deep navy + spotlight); improved title/subtitle hierarchy (title 700-weight with gradient accent bar, subtitle 16px muted); subtle CSS-keyframe entrance animations (title/subtitle rise, layers fade) with `prefers-reduced-motion` support. No Framer Motion, no loops, no parallax.

**Files changed:** `libs/components/layout/LayoutBasic.tsx`, `scss/pc/main.scss`

---

### 5.1 — Homepage: Trusted Dealers Premium Frame (2026-07-07)

**What changed:** The Trusted Dealers carousel (`TopAgents.tsx`, desktop branch only) was wrapped in a new `.dealers-showcase-shell` container using the same border-radius/border/gradient/shadow formula as the orbital sections' `.orbital-showcase-shell`, with all-sides 32px padding. The class is defined inside the existing `.top-agents` block — deliberately decoupled from the orbital selector so no 3D rules leak in. Dealer cards, Swiper config, and mobile layout unchanged.

**Files changed:** `libs/components/homepage/TopAgents.tsx`, `scss/pc/homepage/homepage.scss`

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
