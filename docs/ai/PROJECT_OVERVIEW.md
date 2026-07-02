# Santa — Project Overview

> **This file is the primary entry point for any AI agent beginning work on this codebase.**
> Read this first, then refer to the other docs in this directory for task history and decisions.

---

## What This Project Is

**Santa** is the Next.js frontend for a Hyundai and Kia vehicle marketplace targeting South Korea. It allows users to browse vehicles, discover dealers, read and post community articles, and manage their profiles.

The project was originally a real-estate marketplace called **Nestar** (built on a starter called `nestar-next`), then forked and converted into an automotive marketplace called **VMotors**, and subsequently rebranded to **Santa**. The rebranding and frontend redesign is an ongoing effort. The backend API was not forked — the existing backend (running at `localhost:3007`) continues to serve data and its schema was intentionally preserved.

---

## Current Brand: Santa

- User-visible name: **Santa**
- Wordmark style: text-only `SANTA` logotype (no automotive icon)
- Color palette: deep navy `#0a1f44`, accent blue `#3755c3`, soft `#edf3ff`, coral `#e92c28`, muted `#5a667d`
- Design language: rounded cards (24–32px radii), subtle borders, soft shadows, premium spacing

All visible branding now says Santa. Internal code names (file paths, TypeScript types, GraphQL field names, enums, SCSS selectors) that are schema-coupled retain their original names to avoid breaking the backend integration. See `DECISIONS.md` for details.

---

## Technology Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (`pages/` router) |
| State / Data | Apollo Client 3 — `useQuery`, `useMutation`, `useReactiveVar` |
| Global state | Apollo reactive variable `userVar` from `apollo/store.ts` |
| Styling | SCSS (Sass) + MUI v5 components |
| Auth | JWT stored in cookie, read via `getJwtToken()` in `libs/auth.ts` |
| Internationalization | `next-i18next` |
| Rich text | TUI Editor (`@toast-ui/react-editor`) |
| Animation | Framer Motion (navbar, homepage sections, orbital carousel) |
| Upload | Apollo `createUploadLink` |
| Chat | Apollo WebSocket subscription |
| Icons | MUI Icons + Phosphor React |

---

## Backend Connection

- GraphQL API: `http://localhost:3007/graphql` (local dev)
- Configured via `NEXT_PUBLIC_API_URL` environment variable
- Image uploads served from the same origin: `${REACT_APP_API_URL}/<path>`
- The backend was **not** modified as part of the Santa frontend work

---

## Codebase Structure

```
pages/                  Next.js pages router
  index.tsx             Homepage (LayoutHome)
  vehicle/              Vehicle list and detail
  agent/                Dealer list and dealer detail
  community/            Community articles list and detail
  member/               Public member/dealer profile page
  mypage/               Authenticated user dashboard
  cs/                   Customer support (FAQ + Notice)
  account/join.tsx      Login / signup
  about/                About page
  _admin/               Admin dashboard (internal tool)

libs/
  components/           All React components
    layout/             LayoutHome, LayoutBasic, LayoutFull, LayoutAdmin
    homepage/           All homepage section components
    vehicle-list/       VehicleListCard (browse page card)
    vehicle-detail/     Vehicle detail page components
    dealer-list/        DealerDirectoryCard
    agent/              AgentCard, ReviewCard
    common/             PropertyBigCard (shared premium vehicle card)
    member/             MemberMenu, MemberProperties, MemberArticles,
                        MemberFollowers, MemberFollowings
    mypage/             MyProfile, MyProperties, MyArticles, MyMenu,
                        DashboardVehicleCard, RecentlyVisited
    community/          CommunityListingCard, Teditor
    cs/                 Faq, Notice
    Top.tsx             Global navigation (Journey Navigation)
    Footer.tsx          Global footer
  types/                TypeScript interfaces (Vehicle, Member, etc.)
  enums/                TypeScript enums (VehicleBrand, VehicleStatus, etc.)
  hooks/                useDeviceDetect, useScroll
  auth.ts               JWT helpers
  config.ts             Constants, Messages, topPropertyRank
  sweetAlert.ts         Alert utilities (SweetAlert2)

apollo/
  user/
    query.ts            All GraphQL queries (GET_VEHICLES, GET_MEMBER, etc.)
    mutation.ts         All GraphQL mutations (SUBSCRIBE, LIKE_TARGET_MEMBER, etc.)
  store.ts              Apollo reactive variables (userVar)
  apolloClient.ts       Apollo client configuration

scss/
  app.scss              Global app styles
  pc/
    main.scss           Imports all SCSS partials
    general.scss        Global utility classes shared across pages
    homepage/           Homepage-specific styles
    agent/              Dealer list and dealer detail styles
    member/             Member page styles (4 files)
    mypage/             My page styles
    community/          Community page styles
    cs/                 CS page styles
    property/           Property/vehicle detail styles
    account/            Login/signup styles
    admin/              Admin styles
  mobile/               Mobile-specific overrides
```

---

## Layout Architecture

Santa uses three layout wrappers applied via Higher Order Components:

- **`withLayoutHome`** — used only by `pages/index.tsx`. Renders without the `#pc-wrap` scroll container, includes a full homepage header.
- **`withLayoutBasic`** — used by all public inner pages: `/vehicle`, `/agent`, `/agent/detail`, `/member`, `/community`, `/cs`, `/mypage`, `/account/join`. Renders the Journey Navigation (`Top.tsx`), a hero banner with title/background, the page content inside `#pc-wrap`, and `Footer.tsx`.
- **`withLayoutFull`** — used by pages that need edge-to-edge content.
- **`withLayoutAdmin`** — admin dashboard wrapper.

The `#pc-wrap` and `#mobile-wrap` CSS wrappers are critical to understand. All SCSS is scoped under one of these two selectors. This means any CSS not under `#pc-wrap` or `#mobile-wrap` won't apply to page content.

---

## Navigation: Journey Navigation

The top navigation (`libs/components/Top.tsx`) uses a "Journey" metaphor. The main five pages are presented as a sequential journey:

1. **Home** → `/`
2. **Vehicles** → `/vehicle`
3. **Dealers** → `/agent`
4. **Community** → `/community?articleCategory=FREE`
5. **CS** → `/cs`

Each stop shows as "completed" (checkmark), "active" (current), or "future" (upcoming) based on `router.pathname`. Routes outside the journey (`/member`, `/mypage`, `/account/join`, `/about`) render in a "detached" state where no journey step is highlighted. My Page is accessible via the avatar/auth control in the top-right, not through the journey sequence.

---

## Design System: Santa Premium UI

All redesigned pages follow a consistent set of visual tokens:

```scss
--primary:    #0a1f44   // deep navy, used for headings and CTAs
--secondary:  #3755c3   // accent blue, used for badges, links, active states
--soft:       #edf3ff   // very light blue, card backgrounds, chips
--border:     rgba(118, 135, 178, 0.16)   // default card border
--muted:      #5a667d   // body copy, labels, secondary text
--coral:      #e92c28   // like button active, alert accents
--bg:         #f5f8ff   // page background
--surface:    #ffffff   // card surface
--shadow:     0 28px 80px rgba(10, 31, 68, 0.1)
--shadow-soft: 0 18px 44px rgba(10, 31, 68, 0.08)
```

Cards use `border-radius: 24px–32px`, `1px solid` borders, and lift on hover with `translateY(-4px–6px)`.

The `.dealer-vehicle-card` component (defined in `scss/pc/agent/detail.scss`) is the shared premium vehicle card used across the Dealers Detail page, Member page (vehicles section), and other contexts. It lives at `#pc-wrap, #mobile-wrap` scope (not page-scoped) so it can be reused without CSS variable resolution issues.

---

## Pages: Redesign Status

| Page | Route | Status |
|---|---|---|
| Homepage | `/` | ✅ Redesigned — New Arrivals + Buyer Favorites now use 3D Orbital Carousel (experimental; rollback-ready) |
| Vehicle list | `/vehicle` | ✅ Cleaned up (Nestar imagery removed) |
| Vehicle detail | `/vehicle/detail` | ⬜ Not yet redesigned |
| Dealer list | `/agent` | ⬜ Partially cleaned (cards/sort fixed) |
| Dealer detail | `/agent/detail` | ✅ Fully redesigned (Santa premium UI) |
| Member/Profile page | `/member` | ✅ Fully redesigned (Santa premium UI) |
| My Page | `/mypage` | 🔧 Partially polished (Followers, Following, My Articles, Write Article improved; not a full redesign) |
| Community list | `/community` | ✅ Redesigned — auth guard fixed, Featured Discussion overflow fixed |
| Community detail | `/community/detail` | ✅ Redesigned and polished (Article Detail redesigned into Santa style, duplicate image fixed) |
| CS (FAQ/Notice) | `/cs` | 🔧 Polished (hero bug fixed, cards/notice/FAQ improved; not a full redesign) |
| Account/Join | `/account/join` | ⬜ Not yet redesigned |
| About | `/about` | ⬜ Not yet redesigned |

---

## Validation Commands

Run after every significant change:

```bash
yarn -s tsc --noEmit --incremental false   # TypeScript check (must be clean)
yarn build                                  # Full Next.js build
```

---

## Related Documentation

- [COMPLETED_TASKS.md](./COMPLETED_TASKS.md) — Chronological history of all completed work
- [FRONTEND_MIGRATION.md](./FRONTEND_MIGRATION.md) — Nestar → VMotors → Santa migration guide
- [DECISIONS.md](./DECISIONS.md) — Key architectural and naming decisions with rationale
