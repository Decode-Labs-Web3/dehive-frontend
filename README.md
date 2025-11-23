# Dehive - Web3-Powered Decentralized Communication Platform

**Final Project - University of Greenwich**
**Student:** Vũ Trần Quang Minh
**Student ID:** GCS220006
**Email:** minhvtqgcs220006@fpt.edu.vn
**Academic Year:** 2024-2025

---

_A production-grade Discord-like platform with blockchain integration, built with Next.js 14 App Router, React 19, TypeScript 5, and enterprise Web3 technologies_

---

## 📋 About The Project

Dehive is an enterprise-grade, blockchain-integrated real-time communication platform that reimagines Discord with Web3 capabilities. It combines traditional chat functionality with cutting-edge blockchain features including **on-chain encrypted messaging**, **token airdrops**, **NFT-gated servers**, and **decentralized authentication**.

Built on Next.js 14 with App Router and powered by 6 separate Socket.IO connections for optimal real-time performance, Dehive delivers a seamless communication experience across servers, channels, and direct messages with advanced features like voice/video calls, IPFS file storage, and smart contract interactions.

### Key Features

#### 🔗 Blockchain Integration
- **On-Chain Encrypted Messaging** - Smart contract-based private messaging with end-to-end encryption and conversation key management
- **Dual Payment Modes** - Pay-as-you-go (direct transactions) or relayer-based (prepaid) message sending
- **Token Airdrops** - Merkle tree-verified token distribution campaigns with smart contract integration
- **NFT-Gated Servers** - Token-based access control for exclusive communities
- **Web3 Wallet Integration** - Wagmi + RainbowKit for seamless wallet connections (MetaMask, WalletConnect, etc.)
- **Crypto Payments** - In-app token transfers between users via Payment Hub smart contracts

#### 💬 Real-Time Communication (6 Socket.IO Connections)
- **Channel Chat** - Server-based text messaging with real-time updates
- **Direct Messages** - Private 1-on-1 conversations with typing indicators
- **Voice/Video Calls** - Stream.io-powered calls in both channels and DMs
- **User Status** - Real-time online/offline/away status tracking
- **Server Events** - Live updates for server/channel CRUD operations
- **Call Management** - Incoming call notifications, accept/decline, call state

#### 🏰 Discord-Like Server System
- **Server Management** - Create, customize, and manage community servers
- **Category Organization** - Hierarchical channel structure with drag-and-drop reordering (@dnd-kit)
- **Role-Based Permissions** - Owner, Admin, Member roles with granular permissions
- **Invite System** - Generate and manage server invite codes
- **Member Management** - Kick, ban, and moderate server members
- **Server Logs** - Audit trail for all server activities

#### 📁 Advanced Features
- **IPFS File Storage** - Decentralized file hosting via Pinata for avatars and attachments
- **Message Search** - Full-text search with pagination and history view
- **File Attachments** - Upload and preview images, videos, documents, and audio
- **Message Reactions** - Reply, edit, delete messages with real-time sync
- **User Profiles** - Follow/unfollow system, mutual followers, bio, wallet connections
- **Device Fingerprinting** - Secure session management with device identification

#### 🎨 Modern UI/UX
- **3-Column Layout** - GuildBar (servers) | ServerBar/DirectBar (channels/DMs) | Main Content
- **Persistent Shell** - Always-visible navigation with conditional sidebars
- **Dark Theme** - Optimized for long sessions with Tailwind CSS + shadcn/ui
- **Responsive Design** - Mobile-first approach with adaptive layouts
- **Smooth Animations** - Framer Motion for polished transitions
- **Accessibility** - Radix UI primitives for WCAG compliance

#### ⚡ Performance & Optimization
- **Next.js 14 App Router** - Server-side rendering, static generation, and API routes
- **React 19** - Concurrent features and automatic memoization
- **Redux Toolkit** - Predictable state management with 6 slices
- **Infinite Scroll** - Paginated message history with scroll position restoration
- **Socket Deduplication** - Prevent duplicate real-time events
- **Bundle Optimization** - Code splitting and tree shaking for minimal bundle size

---

## 🛠️ Tech Stack

### Core Technologies

- **TypeScript 5.0** - Type-safe development with strict mode enabled
- **Next.js 14.0** - React framework with App Router for SSR, SSG, and API routes
- **React 19.0** - UI library with concurrent rendering and automatic batching

### Libraries

#### Blockchain & Web3

- **wagmi 2.12.4** - React hooks for Ethereum wallet connections
- **viem 2.21.7** - TypeScript interface for Ethereum interactions
- **MerkleTreeJS 1.2.4** - Merkle tree generation for airdrop verification
- **@wagmi/core** - Core Web3 functionality
- **@rainbow-me/rainbowkit 2.2.9** - Wallet connection UI components

#### Real-time Communication (6 Socket.IO Connections)

- **Socket.IO Client 4.8.1** - WebSocket library with singleton pattern for connection management
  - **Status Socket** - User online/offline status updates
  - **Server Events Socket** - Server/channel CRUD, member join/leave
  - **Channel Chat Socket** - Server channel messages (send, edit, delete)
  - **Channel Call Socket** - Voice/video call in server channels
  - **Direct Chat Socket** - DM messages (send, edit, delete)
  - **Direct Call Socket** - 1-on-1 voice/video calls
- **@stream-io/video-react-sdk 1.24.1** - Enterprise video/voice SDK for calls
- **@stream-io/node-sdk 0.7.12** - Backend Stream.io integration

#### State Management & Data Fetching

- **@reduxjs/toolkit 2.10.1** - Global state management with 6 slices:
  - `user` - User profile, bio, avatar, role
  - `serverList` - List of joined servers
  - `serverRoot` - Server categories, channels, voice participants
  - `fingerprint` - Device fingerprint hash
  - `directMembers` - DM conversation list with status
  - `serverMembers` - Server member list with online status
- **react-redux 9.2.0** - React bindings for Redux
- **@tanstack/react-query 5.90.7** - Server state synchronization with caching
- **React Context API** - Feature-specific state (Sound, DirectCall, ConversationRefresh)

#### Drag & Drop

- **@dnd-kit/core 6.3.1** - Modern drag-and-drop library for channel reordering
- **@dnd-kit/sortable 8.0.0** - Sortable functionality
- **@dnd-kit/utilities 3.2.2** - Utility functions for dnd-kit

#### File Storage & Media

- **IPFS/Pinata** - Decentralized file storage for user avatars and attachments
- **@pinata/sdk** - Pinata SDK for IPFS interactions

#### Utilities

- **date-fns 4.1.0** - Modern JavaScript date utility library
- **framer-motion 11.11.17** - Animation library for React
- **react-hot-toast 2.4.1** - Toast notifications
- **react-markdown 10.1.0** - Markdown rendering
- **remark-gfm 4.0.1** - GitHub Flavored Markdown support
- **uuid 11.0.3** - UUID generation
- **zod 3.23.8** - TypeScript-first schema validation
- **crypto-js 4.2.0** - Cryptographic utilities
- **cheerio 1.1.2** - jQuery-like library for server-side HTML parsing
- **class-variance-authority 0.7.1** - Component variant utilities
- **clsx 2.1.1** - Utility for constructing className strings
- **tailwind-merge 3.3.1** - Conditional class merging
- **autoprefixer 10.4.21** - CSS vendor prefixing
- **babel-plugin-react-compiler 1.0.0** - React compiler plugin

#### Icons & Fonts

- **@fortawesome/fontawesome-svg-core 7.0.0** - FontAwesome core
- **@fortawesome/free-solid-svg-icons 7.0.0** - Solid icons
- **@fortawesome/react-fontawesome 3.0.1** - React FontAwesome components
- **lucide-react 0.546.0** - Additional icon set
- **Geist Sans & Geist Mono** - Custom fonts via Next.js

### Tools

#### Development & Build Tools

- **Turbopack** - Next.js 16's ultra-fast bundler
- **React Compiler** - Automatic React optimization
- **ESLint 9.39.1** - Code linting with TypeScript support
- **PostCSS 8.4.49** - CSS processing with Autoprefixer
- **TypeScript Compiler 5.0** - Advanced type checking
- **@next/bundle-analyzer 16.0.1** - Bundle size analysis
- **lightningcss 1.30.2** - Fast CSS processing
- **critters 0.0.23** - CSS inlining for performance
- **ts-node 10.9.2** - TypeScript execution in Node.js

#### Testing & Quality

- **@eslint/eslintrc 3** - ESLint configuration
- **eslint-config-next 16.0.1** - Next.js ESLint config

#### Packaging & Deployment

- **Electron 39.1.1** - Cross-platform desktop app framework
- **electron-builder 26.0.12** - Electron app packaging
- **next-sitemap 4.2.3** - Automated sitemap generation
- **@next/env 15.0.1** - Environment variable validation
- **@vercel/analytics 1.5.0** - Web analytics
- **web-vitals 5.1.0** - Core Web Vitals measurement

#### Version Control & Collaboration

- **Git** - Version control system
- **GitHub** - Repository hosting and collaboration

### Data Storage and Management

- **IPFS (InterPlanetary File System)** - Decentralized storage for user avatars, attachments, and media files
- **Pinata SDK** - IPFS pinning service for reliable file storage
- **Local Storage** - Browser local storage for user preferences (e.g., sound settings)
- **Redux Store** - Centralized state management for user data, server lists, and application state
- **Valtio** - Reactive state management for real-time UI updates
- **TanStack Query** - Server state management with caching, synchronization, and background updates
- **Fingerprinting Service** - Device fingerprinting for user identification and security
- **Backend API** - RESTful API for user, server, message, and authentication data
- **WebSocket Connections** - Real-time data synchronization via Socket.IO

### User Interface Development

- **Tailwind CSS 3.4.17** - Utility-first CSS framework for responsive and customizable styling
- **shadcn/ui** - High-quality, accessible UI components built on Radix UI
- **Radix UI Primitives** - Low-level UI primitives for building custom components:
  - @radix-ui/react-avatar 1.1.10
  - @radix-ui/react-context-menu 2.2.16
  - @radix-ui/react-dialog 1.1.15
  - @radix-ui/react-dropdown-menu 2.1.16
  - @radix-ui/react-hover-card 1.1.15
  - @radix-ui/react-label 2.1.7
  - @radix-ui/react-popover 1.1.15
  - @radix-ui/react-radio-group 1.3.8
  - @radix-ui/react-scroll-area 1.2.10
  - @radix-ui/react-separator 1.1.7
  - @radix-ui/react-switch 1.2.6
  - @radix-ui/react-tabs 1.1.13
  - @radix-ui/react-toggle 1.1.10
  - @radix-ui/react-toggle-group 1.1.11
  - @radix-ui/react-tooltip 1.2.8
- **@radix-ui/react-slot 1.2.3** - Component composition utilities
- **next-themes 0.4.6** - Theme switching (light/dark mode)
- **Framer Motion 11.11.17** - Animation library for smooth transitions
- **React Webcam 7.2.0** - Webcam integration for user interactions
- **React Markdown 10.1.0** - Markdown rendering in messages
- **Remark GFM 4.0.1** - GitHub Flavored Markdown support

### Technology and Tools Overview

- **Frontend Architecture**: Next.js with App Router for server-side rendering, static generation, and API routes
- **Build System**: Turbopack for fast development builds, with production optimization via React Compiler
- **Styling Approach**: Tailwind CSS with CSS variables for theming, shadcn/ui for component consistency
- **State Management**: Hybrid approach using Redux for global state and Valtio for reactive local state
- **Data Fetching**: TanStack Query for server state, with WebSocket for real-time updates
- **Web3 Integration**: wagmi and viem for Ethereum interactions, RainbowKit for wallet UI
- **Real-time Features**: Socket.IO for messaging, Stream.io for voice/video calls
- **File Handling**: IPFS for decentralized storage, with Pinata for pinning
- **Performance Monitoring**: Web Vitals for metrics, Vercel Analytics for user insights
- **Development Workflow**: ESLint for code quality, TypeScript for type safety, bundle analyzer for optimization
- **Cross-platform**: Electron for desktop app, with web deployment via Vercel/Next.js
- **Security**: Fingerprinting for device identification, Web3 for decentralized auth, secure cookie management

---

## 🚀 Getting Started

### Prerequisites

- **Node.js 20.x or higher** - Required for Next.js 14
- **npm or yarn** - Package manager
- **Backend API Server** - Running on configured ports:
  - Main API (REST endpoints)
  - 6 Socket.IO servers (Status, Server Events, Channel Chat/Call, Direct Chat/Call)
- **Ethereum Wallet** - MetaMask or WalletConnect-compatible wallet for Web3 features
- **IPFS/Pinata Account** - For decentralized file storage (optional for development)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Decode-Labs-Web3/dehive-frontend.git
   cd dehive-frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create `.env.local` file with required environment variables:

   ```env
   # Backend API Configuration
   NEXT_PUBLIC_DEHIVE_SERVER=http://localhost:3000

   # Socket.IO Servers (6 connections)
   NEXT_PUBLIC_STATUS_ONLINE_SIO_URL=http://localhost:3001
   NEXT_PUBLIC_DIRECT_CHAT_SIO_URL=http://localhost:3002
   NEXT_PUBLIC_CHANNEL_CHAT_SIO_URL=http://localhost:3003
   NEXT_PUBLIC_CHANNEL_CALL_SIO_URL=http://localhost:3004
   NEXT_PUBLIC_DIRECT_CALL_SIO_URL=http://localhost:3005

   # Web3 Configuration (Sepolia Testnet)
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
   NEXT_PUBLIC_SEPOLIA_RPC_URL=https://ethereum-sepolia.gateway.tatum.io
   NEXT_PUBLIC_PROXY_ADDRESS=0x_your_smart_contract_proxy_address

   # Smart Contract Addresses (Airdrop System)
   NEXT_PUBLIC_REGISTRY_ADDRESS=0x_registry_contract_address
   NEXT_PUBLIC_FACTORY_ADDRESS=0x_factory_contract_address
   NEXT_PUBLIC_MERKLE_AIRDROP_ADDRESS=0x_merkle_airdrop_contract_address

   # SSO Authentication (Decode Protocol)
   DECODE_BASE_URL=https://decode.protocol.url
   DEHIVE_APP_ID=dehive
   PUBLIC_FRONTEND_URL=http://localhost:9000

   # IPFS Storage (Pinata)
   PINATA_API_KEY=your_pinata_api_key
   PINATA_SECRET_KEY=your_pinata_secret_key

   # Stream.io (Voice/Video Calls)
   STREAM_API_KEY=your_stream_api_key
   STREAM_API_SECRET=your_stream_api_secret

   # Development
   NODE_ENV=development
   PORT=9000

   # Optional: Analytics and Monitoring
   NEXT_PUBLIC_VERCEL_ANALYTICS=true
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:9000](http://localhost:9000) in your browser

### Build for Production

```bash
# Build the application
npm run build

# Analyze bundle size (optional)
npm run analyze

# Start production server
npm run start
```

### Performance Optimization

The application includes several performance optimizations:

- **Turbopack**: Ultra-fast development builds
- **React Compiler**: Automatic component optimization
- **Bundle Analysis**: Monitor and optimize bundle sizes
- **Web Vitals**: Performance monitoring and reporting

---

## 📁 Project Structure

```
src/
├── abi/                                    # Smart Contract ABIs
│   ├── airdropAbi.ts                      # Merkle airdrop contract
│   ├── messageAbi.ts                      # On-chain messaging contract
│   ├── paymentHubAbi.ts                   # Payment hub contract
│   └── erc20Permit.ts                     # ERC20 permit interface
│
├── app/                                    # Next.js 14 App Router
│   ├── layout.tsx                         # Root layout (Redux, fonts, metadata)
│   ├── page.tsx                           # Login page (SSO initiation)
│   ├── globals.css                        # Global styles + Tailwind
│   ├── manifest.ts                        # PWA manifest
│   │
│   ├── api/                               # Backend API Routes
│   │   ├── airdrop/                       # Airdrop campaign management
│   │   ├── auth/                          # SSO authentication
│   │   ├── invite/                        # Server invite handling
│   │   ├── ipfs/                          # IPFS file upload
│   │   ├── link-preview/                  # URL metadata fetching
│   │   ├── me/                            # DM conversation endpoints
│   │   ├── sc-message/                    # Smart contract messaging
│   │   ├── search/                        # Message search
│   │   ├── servers/                       # Server/channel management
│   │   ├── stream/                        # Stream.io token generation
│   │   ├── tokens/                        # Token balance queries
│   │   └── user/                          # User profile management
│   │
│   ├── sso/                               # SSO Callback
│   │   └── page.tsx                       # Token exchange & redirect
│   │
│   ├── invite/                            # Server Invite Handler
│   │   └── page.tsx                       # Join server via code
│   │
│   └── app/                               # Main Application
│       ├── layout.tsx                     # App shell (providers, UI shell)
│       ├── page.tsx                       # Redirect to /app/channels/me
│       │
│       └── channels/                      # Channel Routes
│           ├── layout.tsx                 # Channels wrapper
│           ├── page.tsx                   # Channels home
│           │
│           ├── [serverId]/                # Server Channels
│           │   ├── layout.tsx             # Server layout (ServerBar)
│           │   ├── page.tsx               # Server member list
│           │   │
│           │   └── [channelId]/           # Channel Pages
│           │       ├── layout.tsx         # Channel validation
│           │       ├── page.tsx           # Channel messages
│           │       │
│           │       └── call/              # Voice/Video Call
│           │           └── page.tsx       # Channel call interface
│           │
│           └── me/                        # Direct Messages
│               ├── layout.tsx             # DM layout (DirectBar)
│               ├── page.tsx               # Friends list
│               │
│               └── [channelId]/           # DM Conversation
│                   ├── layout.tsx         # Conversation validation
│                   ├── page.tsx           # DM messages
│                   │
│                   ├── call/              # 1-on-1 Call
│                   │   └── page.tsx       # Direct call interface
│                   │
│                   └── [recipientWallet]/ # 🔐 Blockchain Private Chat
│                       └── page.tsx       # On-chain encrypted messages
│
├── components/                             # React Components
│   ├── app/                               # Persistent UI Shell
│   │   ├── GuildBar.tsx                   # Left sidebar (server list)
│   │   ├── ServerBar.tsx                  # Server channels sidebar
│   │   ├── DirectBar.tsx                  # DM conversations sidebar
│   │   ├── UserBar.tsx                    # Bottom-left user controls
│   │   └── index.ts                       # Shell exports
│   │
│   ├── airdrop/                           # Airdrop Features
│   │   ├── AirdropCampaignList.tsx        # List campaigns
│   │   ├── AirdropDropdown.tsx            # Airdrop menu
│   │   └── CreateAirdropModal.tsx         # Create campaign modal
│   │
│   ├── common/                            # Shared Components
│   │   ├── AttachmentList.tsx             # File attachment display
│   │   ├── CallPage.tsx                   # Voice/video call UI
│   │   ├── ChannelCall.tsx                # Channel call wrapper
│   │   ├── FilePreview.tsx                # File upload preview
│   │   ├── LinkPreview.tsx                # URL preview cards
│   │   ├── Markdown.tsx                   # Markdown renderer
│   │   ├── MoneyTransfer.tsx              # Crypto payment UI
│   │   ├── UserInfoModal.tsx              # User profile modal
│   │   └── Wallet.tsx                     # Web3 wallet button
│   │
│   ├── guilde-bar/                        # Guild Bar Items
│   │   ├── AddServer.tsx                  # Create/join server
│   │   └── index.ts
│   │
│   ├── server-bar/                        # Server Bar Items
│   │   ├── Categories.tsx                 # Category list
│   │   ├── Channels.tsx                   # Channel list
│   │   ├── ChannelDraggable.tsx           # Drag-and-drop channels
│   │   ├── CategoryDroppable.tsx          # Drop zones
│   │   ├── EditModal.tsx                  # Server settings
│   │   ├── ServerPanel.tsx                # Server management panel
│   │   ├── ServerInvite.tsx               # Invite generation
│   │   ├── ServerMembers.tsx              # Member list
│   │   ├── ServerBans.tsx                 # Ban management
│   │   ├── ServerNFT.tsx                  # NFT gating config
│   │   └── ServerLog.tsx                  # Audit logs
│   │
│   ├── messages/                          # Message Components
│   │   ├── ChannelMessageOption.tsx       # Channel message actions
│   │   ├── DirectMessageOption.tsx        # DM message actions
│   │   ├── ChannelFileList.tsx            # Channel file browser
│   │   ├── DirectFileList.tsx             # DM file browser
│   │   ├── ServerMemberList.tsx           # Member sidebar
│   │   └── SmartContractOption.tsx        # Blockchain message options
│   │
│   ├── search/                            # Search Components
│   │   ├── ChannelSearchBar.tsx           # Channel search
│   │   ├── DirectSearchBar.tsx            # DM search
│   │   ├── ChannelHistoryView.tsx         # Channel search results
│   │   └── DirectHistoryView.tsx          # DM search results
│   │
│   ├── message-onchain/                   # Blockchain Components
│   │   └── wallet.tsx                     # Wagmi + RainbowKit provider
│   │
│   ├── user-bar/                          # User Bar Items
│   │   └── UserPanel.tsx                  # User settings panel
│   │
│   └── ui/                                # shadcn/ui Primitives
│       ├── avatar.tsx                     # Avatar component
│       ├── button.tsx                     # Button variants
│       ├── dialog.tsx                     # Modal dialogs
│       ├── dropdown-menu.tsx              # Dropdown menus
│       ├── scroll-area.tsx                # Scrollable areas
│       ├── tooltip.tsx                    # Tooltips
│       └── [20+ more components]          # Full shadcn/ui suite
│
├── store/                                  # Redux State Management
│   ├── store.ts                           # Store configuration
│   ├── hooks.ts                           # Typed Redux hooks
│   ├── ReduxProvider.tsx                  # Redux provider wrapper
│   │
│   └── slices/                            # Redux Slices (6 slices)
│       ├── userSlice.ts                   # User profile state
│       ├── serverListSlice.ts             # Joined servers list
│       ├── serverRootSlice.ts             # Categories, channels, participants
│       ├── fingerprintSlice.ts            # Device fingerprint
│       ├── directMemberSlice.ts           # DM conversation list
│       └── serverMemberSlice.ts           # Server member status
│
├── hooks/                                  # Custom React Hooks (13 hooks)
│   ├── useUser.ts                         # User state management
│   ├── useFingerprint.ts                  # Device fingerprint
│   ├── useServerRoot.ts                   # Server categories/channels
│   ├── useServersList.ts                  # Server list management
│   ├── useServerMember.ts                 # Server member state
│   ├── useDirectMember.ts                 # DM conversation state
│   ├── useChannelMessage.ts               # Channel message CRUD
│   ├── useDirectMessage.ts                # DM message CRUD
│   ├── useChannelCall.ts                  # Channel voice/video
│   ├── useDirectCall.ts                   # DM voice/video
│   ├── useTokenInfo.ts                    # Token balance queries
│   ├── useTransferMoney.ts                # Crypto payments
│   └── useInviteSuggestions.ts            # Invite suggestions
│
├── providers/                              # Socket.IO Providers (6 providers)
│   ├── socketStatusProvider.tsx           # User status socket
│   ├── socketServerEventsProvider.tsx     # Server events socket
│   ├── socketChannelChatProvider.tsx      # Channel chat socket
│   ├── socketChannelCallProvider.tsx      # Channel call socket
│   ├── socketDirectChatProvider.tsx       # Direct chat socket
│   └── socketDirectCallProvider.tsx       # Direct call socket
│
├── lib/                                    # Utility Libraries
│   ├── socketFactory.ts                   # Socket.IO factory pattern
│   ├── socketioStatusSingleton.ts         # Status socket singleton
│   ├── socketioServerEventsSingleton.ts   # Server events singleton
│   ├── socketioChannelChatSingleton.ts    # Channel chat singleton
│   ├── socketioChannelCallSingleton.ts    # Channel call singleton
│   ├── socketioDirectChatSingleton.ts     # Direct chat singleton
│   ├── sooketioDirectCallSingleton.ts     # Direct call singleton
│   ├── scMessage.ts                       # Smart contract messaging utils
│   ├── airdropHelpers.ts                  # Airdrop utility functions
│   └── utils.ts                           # General utilities (cn, etc.)
│
├── contexts/                               # React Contexts (3 contexts)
│   ├── SoundContext.tsx                   # Notification sound preferences
│   ├── DirectCallConetext.contexts.tsx    # Direct call state
│   └── ConversationRefreshContext.tsx     # Conversation refresh trigger
│
├── interfaces/                             # TypeScript Interfaces
│   ├── user.interface.ts                  # User, member types
│   ├── server.interface.ts                # Server, category, channel types
│   ├── message.interface.ts               # Message, file upload types
│   ├── call.interface.ts                  # Call state types
│   ├── payment.interface.ts               # Payment types
│   ├── websocketStatus.interface.ts       # Status socket events
│   ├── websocketServerEvents.interface.ts # Server events socket
│   ├── websocketChannelChat.interface.ts  # Channel chat socket
│   ├── websocketChannelCall.interface.ts  # Channel call socket
│   ├── websocketDirectChat.interface.ts   # Direct chat socket
│   └── websocketDirectCall.interface.ts   # Direct call socket
│
├── services/                               # External Services
│   └── fingerprint.services.ts            # Device fingerprinting
│
├── utils/                                  # Utility Functions
│   ├── api.utils.ts                       # API request helpers
│   ├── auth.utils.ts                      # Authentication utilities
│   ├── cookie.utils.ts                    # Cookie management
│   ├── route.utils.ts                     # Route utilities
│   ├── electron.utils.ts                  # Electron helpers
│   └── index.utils.ts                     # General utilities
│
├── constants/                              # Application Constants
│   ├── airdrop.constants.ts               # Airdrop config (contracts, graph)
│   ├── attachment.constant.ts             # File type constants
│   ├── auth.constants.ts                  # Auth config
│   ├── http.constants.ts                  # HTTP constants
│   ├── tags.constants.ts                  # Server tags
│   └── index.constants.ts                 # General constants
│
├── middleware.ts                           # Next.js middleware (auth guard)
├── seo.config.ts                          # SEO metadata configuration
└── proxy.ts                               # API proxy configuration
```

---

## 🔐 Security & Authentication

### Multi-Layer Authentication

#### SSO Authentication (Decode Protocol)
1. User clicks "Continue with SSO" on login page
2. Frontend calls `/api/auth/create-sso` to generate SSO URL
3. User redirects to Decode Protocol for authentication
4. Decode redirects back to `/sso?sso_token=...&state=...`
5. Frontend calls `/api/auth/get-sso` to exchange token
6. Backend validates token and creates session
7. User redirected to `/app/channels/me`

#### Device Fingerprinting
- **Fingerprint Service**: Generate unique device identifier
- **Session Management**: Associate sessions with device fingerprints
- **API Headers**: Include fingerprint in all API requests
- **Security**: Prevent session hijacking across devices

#### Web3 Wallet Authentication
- **Wagmi + RainbowKit**: Connect MetaMask, WalletConnect, Coinbase Wallet
- **Wallet Linking**: Link multiple wallets to user profile
- **Primary Wallet**: Designate primary wallet for blockchain features
- **Transaction Signing**: Sign messages and transactions securely

### API Security

#### Route Protection
- **Next.js Middleware** (`middleware.ts`): Auth guard for protected routes
- **API Headers**: Custom headers for internal requests
- **Fingerprint Validation**: Verify device fingerprint on API calls
- **Session Cookies**: HTTP-only, secure cookies for session management

#### WebSocket Security
- **Identity Verification**: All sockets require `identity` event with userId
- **Room Authorization**: Verify user access to channels/servers before joining
- **Event Validation**: Validate all incoming socket events
- **Reconnection Handling**: Automatic re-authentication on reconnect

### Blockchain Security

#### Smart Contract Messaging
- **End-to-End Encryption**: Messages encrypted with conversation-specific keys
- **Key Management**: Encrypted conversation keys stored on-chain
- **Access Control**: Only conversation participants can decrypt messages
- **Gas Optimization**: Efficient contract design to minimize gas costs

#### Airdrop Security
- **Merkle Tree Verification**: Cryptographic proof of eligibility
- **Claim Prevention**: Prevent double-claiming via smart contract
- **Signature Verification**: Validate all blockchain transactions

### Data Privacy
- **IPFS Storage**: Decentralized file storage (avatars, attachments)
- **No PII Leakage**: Sensitive data never logged or exposed
- **Secure Cookies**: HTTP-only, SameSite=Strict cookies
- **CORS Protection**: Strict CORS policies for API routes

---

## 🌟 Core Features Deep Dive

### 🔗 Blockchain Integration

#### On-Chain Encrypted Messaging (`/me/[channelId]/[wallet]`)
- **End-to-End Encryption**: Messages encrypted with conversation-specific keys
- **Smart Contract Storage**: Messages stored on Sepolia testnet
- **Conversation Key Management**: Encrypted keys for each participant
- **Dual Payment Modes**:
  - **Pay-as-you-go**: Direct ETH payment per message
  - **Relayer Mode**: Prepaid balance for gasless transactions
- **Real-time Sync**: Watch `MessageSent` events for instant updates
- **Conversation Creation**: Automatic on-chain conversation initialization
- **Key Derivation**: Deterministic conversation IDs from participant addresses

#### Token Airdrop System
- **Merkle Tree Verification**: Gas-efficient claim validation
- **Campaign Management**: Create, list, and manage airdrop campaigns
- **Smart Contract Integration**: Factory pattern for campaign deployment
- **The Graph Integration**: Query campaign data and claim history
- **Multi-token Support**: ERC20 token distribution
- **Claim UI**: User-friendly interface for claiming tokens

#### NFT-Gated Servers
- **Token-Based Access**: Require NFT ownership for server access
- **Configurable Requirements**: Set contract address and minimum balance
- **Real-time Verification**: Check ownership on server join
- **Multi-chain Support**: Support for various EVM chains

### 💬 Real-Time Communication Architecture

#### 6 Separate Socket.IO Connections
Each connection is managed via singleton pattern for optimal performance:

1. **Status Socket** (`socketioStatusSingleton.ts`)
   - User online/offline/away status
   - Real-time presence updates
   - Cross-server status synchronization

2. **Server Events Socket** (`socketioServerEventsSingleton.ts`)
   - Server CRUD operations (create, update, delete)
   - Category and channel management
   - Member join/leave events
   - Server ownership transfers
   - NFT gating updates

3. **Channel Chat Socket** (`socketioChannelChatSingleton.ts`)
   - Server channel messages (send, edit, delete)
   - Message replies and reactions
   - Typing indicators
   - Message history pagination

4. **Channel Call Socket** (`socketioChannelCallSingleton.ts`)
   - Voice/video call participant tracking
   - User status in calls (camera, mic, headphone)
   - Join/leave channel voice events

5. **Direct Chat Socket** (`socketioDirectChatSingleton.ts`)
   - 1-on-1 DM messages (send, edit, delete)
   - Conversation updates
   - Read receipts
   - Message history pagination

6. **Direct Call Socket** (`sooketioDirectCallSingleton.ts`)
   - Incoming call notifications
   - Call accept/decline/end
   - Call state management (idle, ringing, calling, connected)
   - 1-on-1 voice/video calls

#### Message Features
- **Real-time Delivery**: Instant message sync across all clients
- **Message CRUD**: Create, edit, delete with optimistic updates
- **Reply System**: Thread-like message replies
- **File Attachments**: IPFS-hosted images, videos, documents
- **Link Previews**: Automatic URL metadata fetching
- **Markdown Support**: GitHub Flavored Markdown rendering
- **Search**: Full-text search with pagination
- **Infinite Scroll**: Load older messages on scroll with position restoration

#### Voice/Video Calls (Stream.io SDK)
- **Channel Calls**: Multi-participant voice channels
- **Direct Calls**: 1-on-1 voice/video calls
- **Call Controls**: Mute, camera toggle, headphone settings
- **Participant Management**: Real-time participant list
- **Call State**: Idle, ringing, calling, connected, ended, declined
- **Audio Notifications**: Ring tones for incoming calls

### 🏰 Discord-Like Server System

#### Server Management
- **Server Creation**: Create community servers with custom names and descriptions
- **Role System**: Owner → Admin → Member hierarchy
- **Invite System**: Generate and manage invite codes with expiration
- **Server Settings**:
  - Server info (name, description, avatar)
  - Tags for discoverability
  - NFT gating configuration
  - Member management (kick, ban)
  - Audit logs for all actions
- **Server Ownership**: Transfer ownership to other members

#### Category & Channel Organization
- **Categories**: Group channels into collapsible categories
- **Channel Types**: Text channels and voice channels
- **Drag-and-Drop**: Reorder channels within and across categories (@dnd-kit)
- **Channel CRUD**: Create, rename, delete channels
- **Category CRUD**: Create, rename, delete categories
- **Real-time Sync**: All changes broadcast via Server Events Socket

#### Member Management
- **Member List**: View all server members with online status
- **Member Roles**: Assign and manage member roles
- **Kick/Ban**: Remove problematic members
- **Member Search**: Find members by username or display name
- **Join Events**: Welcome messages for new members

### 🎨 User Experience & Interface

#### 3-Column Discord-Like Layout
```
┌─────────────┬──────────────────┬────────────────────────────┐
│  GuildBar   │  ServerBar/      │     Main Content Area      │
│  (Servers)  │  DirectBar       │  (Messages/Calls/Settings) │
│             │  (Channels/DMs)  │                            │
│  - DM Btn   │                  │                            │
│  - Server 1 │  Categories:     │  Channel: #general         │
│  - Server 2 │  ├─ Text         │  ┌──────────────────────┐ │
│  - Server 3 │  │  ├─ #general  │  │ Messages...          │ │
│  - + Add    │  │  └─ #random   │  │                      │ │
│             │  └─ Voice        │  │                      │ │
│  UserBar    │     ├─ 🔊 Lounge │  └──────────────────────┘ │
│  (Profile)  │     └─ 🔊 Gaming │  [Message Input]           │
└─────────────┴──────────────────┴────────────────────────────┘
```

#### Persistent UI Shell
- **GuildBar** (Left): Always visible, shows server list + DM button
- **ServerBar/DirectBar** (Middle): Conditional sidebar based on route
  - ServerBar: Shows categories and channels for servers
  - DirectBar: Shows conversation list for DMs
- **UserBar** (Bottom-Left): User profile, mic/sound controls, settings
- **Main Content** (Right): Dynamic content area for messages, calls, settings

#### User Profiles & Social
- **IPFS Avatars**: Decentralized avatar storage via Pinata
- **User Profiles**: Display name, username, bio, role, followers/following
- **Follow System**: Follow/unfollow users, mutual followers
- **Wallet Connections**: Link multiple Ethereum wallets
- **Status Tracking**: Online, offline, away status with real-time updates
- **Profile Modal**: View user profiles with mutual servers and followers

#### Theme & Styling
- **Dark Theme**: Optimized for long sessions with reduced eye strain
- **Tailwind CSS**: Utility-first styling with CSS variables
- **shadcn/ui**: Accessible, customizable component library
- **Radix UI**: Unstyled, accessible primitives
- **Framer Motion**: Smooth animations and transitions
- **Responsive**: Mobile-first design with adaptive layouts

---

## 📊 Performance & Architecture

### State Management Strategy

#### Redux Store (6 Slices)
```typescript
store/
├── userSlice.ts           // User profile, bio, avatar, role
├── serverListSlice.ts     // List of joined servers
├── serverRootSlice.ts     // Categories, channels, voice participants
├── fingerprintSlice.ts    // Device fingerprint hash
├── directMemberSlice.ts   // DM conversation list with status
└── serverMemberSlice.ts   // Server member list with online status
```

#### Custom Hooks (13 Hooks)
Business logic abstraction layer:
- `useUser`, `useFingerprint`: User state management
- `useServerRoot`, `useServersList`, `useServerMember`: Server state
- `useDirectMember`: DM conversation state
- `useChannelMessage`, `useDirectMessage`: Message CRUD operations
- `useChannelCall`, `useDirectCall`: Voice/video call operations
- `useTokenInfo`, `useTransferMoney`: Crypto payment operations
- `useInviteSuggestions`: Server invite suggestions

### Performance Optimizations

#### Build-Time
- **Next.js 14 App Router**: SSR, SSG, and ISR for optimal performance
- **React 19**: Concurrent rendering and automatic batching
- **Code Splitting**: Route-based and component-based splitting
- **Tree Shaking**: Remove unused code from bundles
- **Bundle Analysis**: Monitor and optimize bundle sizes

#### Runtime
- **Socket Singletons**: Prevent duplicate WebSocket connections
- **Event Deduplication**: Prevent duplicate real-time messages
- **Infinite Scroll**: Paginated message history (20 messages/page)
- **Scroll Position Restoration**: Maintain scroll position on pagination
- **Optimistic Updates**: Instant UI feedback before server confirmation
- **Lazy Loading**: Dynamic imports for heavy components (Popover, etc.)
- **Image Optimization**: Next.js automatic image optimization

#### Caching Strategies
- **Redux Persistence**: Cache user and server state
- **TanStack Query**: Server state caching with background updates
- **Local Storage**: User preferences (sound, theme)
- **API Route Caching**: Next.js route cache with revalidation

### Monitoring & Analytics
- **Web Vitals**: Core Web Vitals measurement (LCP, FID, CLS)
- **Vercel Analytics**: User behavior and performance tracking
- **Error Boundaries**: Graceful error handling and reporting
- **Console Logging**: Structured logging for debugging

---

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server (port 9000)
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking

# Analysis
npm run analyze      # Analyze bundle sizes with @next/bundle-analyzer

# Electron (Desktop App)
npm run electron:dev # Start Electron in development
npm run electron:build # Build Electron app for production
```

### Architecture Patterns

#### Singleton Pattern (Socket.IO)
All 6 Socket.IO connections use singleton pattern to prevent duplicate connections:
```typescript
// lib/socketFactory.ts
export function getSocket(type: SocketType): Socket {
  if (socketRegistry.has(type)) {
    return socketRegistry.get(type)!;
  }
  const socket = io(config.url, { autoConnect: false });
  socketRegistry.set(type, socket);
  return socket;
}
```

#### Provider Pattern (Socket Lifecycle)
Each socket has a dedicated provider for lifecycle management:
```typescript
// providers/socketStatusProvider.tsx
export default function SocketStatusProvider({ userId, children }) {
  const socket = useRef(getStatusSocketIO()).current;

  useEffect(() => {
    socket.on('connect', onConnect);
    socket.on('userStatusChanged', onStatusChanged);
    if (!socket.connected) socket.connect();

    return () => {
      socket.off('connect', onConnect);
      socket.off('userStatusChanged', onStatusChanged);
    };
  }, [socket, userId]);

  return <>{children}</>;
}
```

#### Custom Hook Pattern (Business Logic)
Hooks abstract Redux and socket operations:
```typescript
// hooks/useChannelMessage.ts
export function useChannelMessage(channelId: string) {
  const socket = useRef(getChannelChatSocketIO()).current;
  const [messages, setMessages] = useState<Message[]>([]);

  const send = useCallback((content: string) => {
    socket.emit('sendMessage', { channelId, content });
  }, [socket, channelId]);

  useEffect(() => {
    socket.on('newMessage', (msg) => {
      if (msg.channelId === channelId) {
        setMessages(prev => [...prev, msg]);
      }
    });
  }, [socket, channelId]);

  return { messages, send, edit, remove, loadHistory };
}
```

### API Architecture

#### RESTful API Routes (`/api/*`)
- **Authentication**: `/api/auth/*` - SSO creation, token exchange
- **User Management**: `/api/user/*` - Profile, following, status
- **Server Management**: `/api/servers/*` - CRUD, members, categories, channels
- **Messaging**: `/api/me/*` - DM conversations, message history
- **Blockchain**: `/api/sc-message/*` - Smart contract message queries
- **Airdrop**: `/api/airdrop/*` - Campaign management, claims
- **File Storage**: `/api/ipfs/*` - IPFS upload via Pinata
- **Search**: `/api/search/*` - Message and user search
- **Stream.io**: `/api/stream/*` - Voice/video token generation
- **Tokens**: `/api/tokens/*` - Token balance queries (Covalent API)

#### WebSocket Events
Each socket has its own event schema defined in `interfaces/websocket*.interface.ts`

### Data Flow Example: Sending a Message

1. User types message in `ChannelMessagePage` component
2. Presses Enter → calls `send()` from `useChannelMessage` hook
3. Hook emits `sendMessage` event via `ChannelChatSocket` singleton
4. Backend validates, stores, and broadcasts to all channel members
5. All clients receive `newMessage` event via socket
6. Hook updates local `messages` state via `setMessages`
7. Component re-renders with new message (optimistic update)
8. If send fails, error state triggers and message is removed

---

## 👤 Author

**Vũ Trần Quang Minh**
Student ID: GCS220006
University: University of Greenwich
Email: minhvtqgcs220006@fpt.edu.vn

---

## 🙏 Acknowledgments

Special thanks to:

- **Next.js Team** for the incredible App Router and Turbopack
- **React Team** for React 19 and the React Compiler
- **Socket.IO** for real-time communication infrastructure
- **Stream.io** for enterprise-grade voice and video SDK
- **wagmi/viem** for seamless Web3 integration
- **shadcn/ui** for beautiful, accessible components
- **IPFS/Pinata** for decentralized storage solutions
- **University of Greenwich** for the academic opportunity
- **Decode Protocol** for blockchain authentication infrastructure

---

## 📄 License

This project is developed as part of an academic assignment at the University of Greenwich.

---

_Built with Next.js 16, React 19, TypeScript 5.0, and cutting-edge Web3 technologies for the Final Project at University of Greenwich_
