# Key Decisions

This document explains the important architectural, naming, and design decisions made during the Santa frontend work, along with the reasoning behind each. Future AI agents should read this before making changes that touch naming, CSS architecture, or component structure.

---

## D-01: Internal Code Names Were Not Renamed to Match the Santa Brand

**Decision:** Internal names that are coupled to backend schemas, GraphQL field names, or file-based routing were intentionally preserved even when they do not match the "Santa" brand.

**Examples of names kept:**
- `pages/agent/` — route path for the Dealers section. Renaming would break Next.js routing and all internal `<Link>` and `router.push('/agent')` calls.
- `GET_AGENTS`, `GET_AGENT`, `getAgents`, `getAgent` — GraphQL operation names. These must exactly match the backend resolver names.
- `Property` TypeScript type — still referenced by some existing components and matches backend field naming.
- `PropertyBigCard` component name — internal component name only; does not appear in user-facing UI.
- `propertyYears`, `propertySquare`, `topPropertyRank` in `config.ts` — internal constants. Renaming them would require updating every import and there is no user-visible benefit.
- `property.enum.ts` — contains enums still used by filter logic.
- `memberType: 'AGENT'` — this is a backend enum value. It cannot be renamed without a backend migration.

**Rule:** If a name appears in a GraphQL query, mutation, or subscription; in a Next.js route path; or in a TypeScript enum that maps to a database value, do not rename it without explicit instruction and a corresponding backend change.

**Why:** Breaking backend compatibility would cause silent runtime failures. The backend API was not part of this redesign scope. The risk/reward of renaming internal names is very low.

---

## D-02: useDeviceDetect Was Removed From Redesigned Components

**Decision:** The `useDeviceDetect` hook and the mobile/desktop component split pattern were removed from all redesigned components. CSS handles responsive behavior instead.

**Before (Nestar pattern):**
```tsx
const device = useDeviceDetect();
if (device === 'mobile') return <MobilePlaceholder />;
return <DesktopContent />;
```

**After (Santa pattern):**
```tsx
return <Content />; // CSS handles layout at different breakpoints
```

**Why:** The mobile placeholder pattern created duplicated JSX trees and made components harder to reason about. CSS media queries + `#mobile-wrap` / `#pc-wrap` selectors can handle all responsive layout needs. This also removes a React render-blocking path and makes components simpler.

**Scope:** This change only applies to components that were being redesigned. Non-redesigned components (My Page, CS, Admin, etc.) still use the old pattern and this is expected and intentional.

---

## D-03: `.dealer-vehicle-card` CSS Lives at Global #pc-wrap Scope

**Decision:** The `.dealer-vehicle-card` CSS block is placed at the top level of `scss/pc/agent/detail.scss` under `#pc-wrap, #mobile-wrap` — not nested inside `.agent-detail-page`. It uses hardcoded color values instead of CSS custom properties.

**Why:** This card is reused on multiple pages: Dealer Detail, Member Page (vehicles tab), and potentially other pages in the future. If the CSS were scoped under `.agent-detail-page`, it would not apply when the card is rendered inside `#member-page`. CSS custom properties (`var(--dd-*)`) would also be undefined outside the `.agent-detail-page` block, causing all colors to fall back to transparent/inherit.

**Trade-off:** Slight hardcoding of the Santa color palette in the card CSS rather than using CSS variables. Acceptable because the card's visual identity is intentionally consistent across all pages.

**Rule for new shared components:** Any card or component that will be reused across multiple pages should have its CSS at the `#pc-wrap, #mobile-wrap` scope level. CSS custom properties should only be used at this scope if they are also defined at this scope.

---

## D-04: CommunityListingCard CSS Was Not Moved Out of Its Page Scope

**Decision:** `CommunityListingCard`'s CSS remains scoped under `#pc-wrap #community-list-page`. When the card is reused on other pages (like Member page articles), the destination page's SCSS file provides the needed styles separately.

**Why:** Moving the community card CSS to global scope would require either replacing all `var(--community-*)` references with hardcoded values (large change, risky for the community page) or defining the vars at a global scope (pollutes the global CSS namespace). The separate-file approach is lower risk and keeps the community page's design system isolated.

**Implication:** Any future page that renders `CommunityListingCard` must include the card's CSS in its own SCSS file. See `scss/pc/member/memberArticles.scss` for the pattern to follow.

---

## D-05: GET_MEMBER Query Was Lifted From MemberMenu to pages/member/index.tsx

**Decision:** The `GET_MEMBER` Apollo query was moved from `MemberMenu.tsx` to the parent page `pages/member/index.tsx`. `MemberMenu` now accepts `member: Member | null` as a prop.

**Why:** The hero section of the redesigned member page needs the full member object to display the avatar, name, stats, and follow button. Previously, `MemberMenu` fetched this data internally and kept it to itself, forcing the hero section to either fetch the data again (duplicate request) or not have access to it. Lifting the query to the parent is the standard React data-flow pattern.

**What was preserved:** The Apollo `useQuery(GET_MEMBER, ...)` call is identical to what was in `MemberMenu`. The `onCompleted` callback sets `member` state, which is passed down to both the hero and `MemberMenu`. No GraphQL behavior changed.

---

## D-06: My Page Stays Outside the Journey Navigation

**Decision:** My Page (`/mypage`) is not included in the Journey Navigation (Home → Vehicles → Dealers → Community → CS). It is accessed via the avatar/auth control in the top-right corner of the navigation bar.

**Why:** My Page is a personal utility — not a discovery or browsing destination. Including it in the journey sequence would imply it is a required step in the car-buying process, which does not match the product intent. The journey represents the public-facing discovery flow; My Page is private and contextual.

**Implementation:** `/mypage` is in the `DETACHED_PATHS` set in `Top.tsx`, which causes the Journey Navigation to render without any step highlighted when the user is on that path.

---

## D-07: MUI Was Kept for Interactive Components, Removed From Layout-Only Usage

**Decision:** MUI components were removed from JSX where they were used only for layout (`Box`, `Stack`, `Typography`). MUI components were kept where they provide meaningful interaction or functionality (`Button`, `Pagination`, `Menu`, `TextField`).

**Why:** MUI's layout components add class names and DOM nodes that complicate CSS specificity and increase bundle size without adding functionality. Plain `<div>` elements styled with SCSS are simpler and more predictable. However, MUI interactive components (especially `Pagination` and `Button`) provide accessibility, keyboard navigation, and visual consistency that would need to be manually recreated.

**Result:** Redesigned components use `<Button>` from MUI for all click actions, `<Pagination>` from MUI for all page controls, and `<Menu>` from MUI for dropdowns. They use plain HTML elements (`div`, `section`, `article`, `nav`, `ul`, `li`, `h1`–`h3`, `p`, `span`) for all layout and structure.

---

## D-08: The Logo Is Text-Only SANTA

**Decision:** The Santa logo is a text-only wordmark (`SANTA`) with no automotive icon or silhouette.

**Why:** A text-only logo at this stage avoids committing to an icon that may need to change as the brand develops. Text wordmarks are also more flexible across sizes and dark/light backgrounds. The SVG files in `public/img/logo/` were updated to reflect this.

---

## D-09: Hero Backgrounds Use Static Image Files

**Decision:** Hero section backgrounds on inner pages (managed by `LayoutBasic`) are defined as static image paths (`/img/banner/...`) set inside a `switch` in `LayoutBasic.tsx`. Some pages currently have no background image set, leaving a solid color.

**Why:** Hero backgrounds are cosmetic and replaceable. Hardcoding the path in `LayoutBasic.tsx` makes it easy for the user to swap the image by simply replacing a file, without touching component logic. The Nestar-era `agents.webp` (a real-estate city photo) was removed from the Dealers page background; a proper automotive SVG replacement is planned.

**How to change a hero background:** Find the relevant `case` block in `LayoutBasic.tsx` and update the `bgImage` string. The image is applied via inline `backgroundImage: url(${bgImage})` with `backgroundSize: 'cover'`.

---

## D-11: Experimental UI Components Are Isolated and Rollback-Ready

**Decision:** When replacing a working section with an experimental alternative, the original component is preserved unchanged and the swap is limited to two lines in `pages/index.tsx` (one import, one JSX element).

**Pattern used for both orbital carousels:**
```tsx
// import TrendProperties from '...';  // preserved — uncomment to revert
import NewArrivalsOrbital from '...';
// ...
<NewArrivalsOrbital />  {/* revert: restore TrendProperties import and this line */}
```

**Why:** Experimental UI (e.g., a 3D carousel replacing a Swiper) may need to be reverted quickly if it causes issues in production or on specific devices. Keeping the original component intact and the swap to exactly two lines means rollback takes under 30 seconds with no risk of breaking data logic.

**Rule:** Any component that replaces an existing working section should follow this pattern. Never delete the original component during the experimental phase. Document the rollback path in a comment next to the swap.

---

## D-10: All Pages Preserve Their Existing Routing Structure

**Decision:** URL routes were not changed. `/agent` still goes to the Dealers list. `/vehicle` still goes to the Vehicle list. `/member` still goes to the Member profile page with `?memberId=` query param.

**Why:** Changing URLs would break bookmarks, internal links, and the backend's understanding of where to redirect after auth. The routing is an invisible contract between the frontend, backend, and any external links. It was out of scope for a UI redesign.

---

## D-12: Board-Article Like Feedback Is Local, Not a Global Alert Override

**Decision:** Board-article like/unlike success feedback now uses a local `ArticleLikeFeedback` component instead of changing the shared SweetAlert utility or overriding global toast styles.

**Why:** `sweetTopSmallSuccessAlert` is used across unrelated flows such as deletes, member follows, vehicle actions, and homepage interactions. Changing the global alert would create broad visual and behavioral risk outside the Community article scope. A local component lets article-like feedback match the Santa Community design while leaving unrelated success alerts unchanged.

**Rule:** When improving feedback for a specific domain action, prefer a scoped component rendered by the owning page/component unless the product explicitly wants a site-wide alert redesign.

**Preserved:** `LIKE_TARGET_BOARD_ARTICLE` variables, mutation calls, Apollo refetch/cache behavior, routing, pagination, article fetching, and backend APIs stayed unchanged.

---

## D-13: Santa Assistant Is a Rule-Based Keyword Search, Not an LLM

**Decision:** The floating chat widget ("Santa Assistant", `libs/components/Chat.tsx`) answers vehicle questions by parsing the typed text for known brand/fuel keywords plus leftover significant words, then running the existing `GET_VEHICLES` query and rendering the results — it does not call any AI/LLM API.

**Why:** The user was asked directly whether to pay for an LLM (Anthropic API is pay-per-token, no meaningful free tier) or use a free rule-based approach. They chose free. The rule-based version fully covers the requested use case ("ask about a model/price/location, get matching listings") with zero ongoing cost and no new backend dependency.

**What this replaced:** a legacy Nestar-era global WebSocket broadcast chatroom (every site visitor in one shared room, backend `socket.gateway.ts`) that was branded as private "Online Chat" / "Santa client support" but was not — see Phase 6.3 in `COMPLETED_TASKS.md` for the full before/after.

**If a real LLM is wanted later:** the natural integration point is a new backend resolver (not the old `socket.gateway.ts` broadcast path) that takes the question, looks up relevant vehicles the same way the current keyword search does, and passes that as context to the model — keeping the "backend does the data lookup, model only phrases the answer" shape rather than trusting the model with raw DB access.

**Not persisted:** conversation history resets on page reload/close. This is a deliberate scope decision (confirmed with the user), not an oversight — persisting it would require a new backend table and would only make sense for logged-in users, while the assistant is also useful to guests.

---

## D-14: Space-Constrained Card Badges Are Icon-Only, Not Text Pills

**Decision:** `DashboardVehicleCard`'s bottom-left context badge (used on My Page's "Recently viewed" and "Saved vehicles" grids) shows only an icon (clock-with-arrow / bookmark) with no visible text label — the text moved to `aria-label`/`title` instead.

**Why:** In the 3-column card variant, the text pill ("Recently viewed") was wide enough to overlap the bottom-right price chip on the same card. A per-column-count padding/font-size override already existed for this on the Saved Vehicles page but was missing on Recently Viewed, and even where present it was a fragile fix (still just a smaller pill, still text-width-dependent). Dropping the text entirely removes the collision class of bug outright: a fixed 36px/32px circle can never grow wide enough to reach the price chip, regardless of card width or locale (text length varies by language; an icon does not).

**Rule:** For a badge whose only job is to convey a short, already-visually-distinct status (an icon most users will recognize in context) inside a space-constrained card, prefer icon-only with `aria-label`/`title` over a text pill, rather than continuously re-tuning padding/font-size per breakpoint.
