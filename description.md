# DeHive Frontend — Feature & Technology Overview

This document summarizes the capabilities and technologies implemented in this repository to help you write proposals and reports. It reflects the actual codebase as of the current commit.

## Product Overview

- Real‑time, server/channel based messenger with direct messages and voice channels.
- Deep Web3 integration: wallet auth, on‑chain messaging helpers, airdrops, NFT/role gating, token transfers with IPFS receipts.
- Multi‑platform delivery: modern web (Next.js App Router) and packaged desktop app (Electron) for macOS/Windows/Linux.
- Scalable real‑time architecture powered by Socket.IO and Stream.io (video/voice SDK).

## Core Features

- Servers & Channels
  - Create/update/delete servers, categories, and channels (text/voice).
  - Drag‑and‑drop channel movement between categories (dnd-kit).
  - Server settings (profile, tag, NFT gating, logs).
  - Category & channel panels built as modals via React portal.
- Messaging
  - Channel and direct messaging with Socket.IO transports (separate namespaces for status/direct/channel/chat/call/server-events).
  - Message components include attachments, previews, and link unfurling.
  - Search endpoints for channels and direct messages (`/api/search/*`).
- Calls & Presence
  - Voice/video foundation via Stream.io (`@stream-io/video-client`/`video-react-sdk`).
  - Presence and call events propagated via Socket.IO; dedicated providers for each stream.
  - Server‑side token issuance for Stream (`/api/stream/token`).
- Web3 & On‑Chain
  - Wallet onboarding via RainbowKit + wagmi + WalletConnect; Sepolia configured by default.
  - On‑chain messaging helpers: conversation IDs, function selectors, mock encrypt/decrypt (`src/lib/scMessage.ts`).
  - Token airdrops: Merkle tree generation, proof utilities, IPFS layout helpers (`src/lib/airdropHelpers.ts`, `src/abi/airdropAbi.ts`).
  - PaymentHub transfer flow with IPFS JSON receipts (see `README-PAYMENTS.md`).
- Media & Storage
  - IPFS upload route (`/api/ipfs/add`) and avatar/media use; configurable gateway URLs.
  - Link preview via Cheerio (`/api/link-preview`).
- User & Social
  - Profiles, statuses, following/followers.
  - Invite codes, SSO initiation/validation routes.
- UX & UI
  - Modern, responsive UI with Tailwind + shadcn/ui (Radix primitives).
  - Consistent panel modals rendered via `createPortal` to avoid stacking/SSR issues.
  - Theming via `next-themes` and iconography with FontAwesome/Lucide.
- SEO & Discovery
  - Central SEO config (`src/seo.config.ts`) with `metadataBase` and absolute OG/Twitter images (`/opengraph-image`, `/twitter-image`).
  - Automatic sitemap generation (`next-sitemap`) and PWA manifest.

## Architecture

- Framework
  - Next.js 16 App Router; server routes under `src/app/api/**` (edge/node runtime by route).
  - Middleware‑style proxy (`src/proxy.ts`) for security and routing (enforces `X-Frontend-Internal-Request`, redirects `/` when session exists).
- State Management
  - Redux Toolkit slices for user, servers, members, categories/channels, etc.
  - Lightweight, typed hooks (`useServerRoot`, `useServersList`, `useServerInfomation`, `useDirectMember`, `useServerMember`, `useUser`).
- Real‑time
  - Socket factory/registry (`src/lib/socketFactory.ts`) keyed by logical channel: status, direct call/chat, channel call/chat, server events.
  - Providers wrapping sockets per domain (`src/providers/*Provider.tsx`).
- Desktop Packaging
  - Electron entry points (`electron/main.ts`, `preload.js`) and builder targets (DMG/NSIS/AppImage) with code‑signed icons and after‑pack hook.
  - In prod, Electron spawns the Next server (`next start -p 3000`) and loads it.

## API Routes (Selected)

- Auth & SSO: `/api/auth/{create-sso,get-sso,logout}`
- Users: `/api/user/{user-info,user-status,user-following,user-other,user-chat,profile-change,avartar,chat-with}`
- Servers: `/api/servers/{server,get,post,patch,delete,server-code,server-info,server-log,server-nft,server-tag}`
- Members: `/api/servers/members/{status,role,ban,unban,ban-list,kick,leave-server,transfer-ownership,memberships}`
- Channels: `/api/servers/channel/{get,post,patch,delete,move}` and `/api/servers/category/{post,patch,delete,get}`
- Conversations & Files: `/api/servers/conversation/{conversation-list,file-list,file-upload}` and `/api/me/conversation/*`
- Search: `/api/search/{channel,channel-up,channel-down,direct,direct-up,direct-down}`
- Stream: `/api/stream/token` (server‑generated Stream user token)
- IPFS: `/api/ipfs/add` (server‑side upload to IPFS HTTP API)
- Link Preview: `/api/link-preview`

## Web3 Details

- Wallet & Network
  - Wagmi configured with Sepolia, WalletConnect optional via env (`NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`).
  - RainbowKit modal provider; React Query used for wallet async state.
- ABIs & Contracts
  - `src/abi/*` include airdrop, message, ERC‑20 permit, and payment hub ABIs.
- Airdrops
  - Merkle root/proofs, CSV parsing, address validation, time windows, and IPFS metadata assembly.
- Payments
  - `useTransferMoney` hook calls PaymentHub facet on a proxy and persists a transfer record to IPFS (see `README-PAYMENTS.md`).
- On‑Chain Messaging
  - Compute deterministic conversation IDs and derive selectors, with mock encryption helpers suitable for POC.

## Real‑Time & Calls

- Socket Namespaces (env‑driven URLs):
  - `NEXT_PUBLIC_STATUS_ONLINE_SIO_URL`, `NEXT_PUBLIC_DIRECT_CHAT_SIO_URL`, `NEXT_PUBLIC_CHANNEL_CHAT_SIO_URL`, `NEXT_PUBLIC_DIRECT_CALL_SIO_URL`, `NEXT_PUBLIC_CHANNEL_CALL_SIO_URL`, `NEXT_PUBLIC_DEHIVE_SERVER`.
- Stream.io Integration
  - Server signs user tokens with `@stream-io/node-sdk`; client uses `@stream-io/video-react-sdk` for call UI.

## Security & Compliance

- Internal API Guard
  - All app API calls include `X-Frontend-Internal-Request: true`; server enforces this in middleware (`guardInternal`) and `src/proxy.ts`.
- Session & Redirect
  - Presence of `sessionId` cookie redirects unauthenticated landing `/` to `/app/channels/me` via proxy.
- Fingerprinting
  - `fingerprintService` gathers device/browser/timezone/audio fingerprint, hashes to a stable `fingerprint_hashed`, and uses it for request headers.

## DevOps & Build

- Scripts
  - `dev`, `build`, `start`, `lint`, `type-check`, `postbuild` (sitemap), and Electron packing targets per OS.
- Bundle & Perf
  - Turbopack, React Compiler, bundle analyzer, and Web Vitals.
- Static Assets & SEO
  - Dynamic OG/Twitter image routes, `next-sitemap` config, and `manifest.ts`.

## Configuration

- Important Environment Variables (selection)
  - Frontend: `NEXT_PUBLIC_FRONTEND_URL`, `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`.
  - Sockets: `NEXT_PUBLIC_*_SIO_URL` for each namespace; `NEXT_PUBLIC_DEHIVE_SERVER`.
  - Stream.io: `STREAM_KEY`, `STREAM_SECRET` (server‑side token generation).
  - IPFS: `IPFS_GATEWAY_URL_POST`, `NEXT_PUBLIC_IPFS_GATEWAY_URL_GET`.
  - PaymentHub: `NEXT_PUBLIC_PROXY_ADDRESS`.

## UI/UX Components (Selected)

- ServerBar & GuildBar sidebars; UserBar overlay.
- Panels: `ServerPanel`, `CategoryPanel`, `ChannelPanel` using dialogs/tabs/cards and `createPortal`.
- Messages: attachment list, previews, markdown rendering (`react-markdown` + `remark-gfm`).

## Notable Libraries

- Next.js 16, React 19, TypeScript 5
- Redux Toolkit, React Redux
- Socket.IO Client, Stream.io SDK
- RainbowKit, wagmi, viem
- Tailwind CSS, shadcn/ui (Radix UI), Lucide/FontAwesome
- dnd-kit, TanStack Query, Cheerio, crypto‑js, merkletreejs

## Quality & Patterns

- Strong typing across slices, hooks, and utils.
- Input selectors exported directly (no identity `createSelector` usage) to avoid reselect warnings and re‑renders.
- Providers encapsulate socket setup/teardown and side effects.

---

If you need this broken into proposal sections (problem statement, objectives, scope, architecture diagram, timeline, risks, and KPIs), I can generate a tailored outline from this inventory.
