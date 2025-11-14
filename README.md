# Dehive - Blockchain-Powered Real-Time Chat Platform

**Final Project - University of Greenwich**
**Student:** Vũ Trần Quang Minh
**Student ID:** GCS220006
**Email:** minhvtqgcs220006@fpt.edu.vn
**Academic Year:** 2024-2025

---

_Built with Next.js 16, React 19, TypeScript 5.0, and cutting-edge Web3 technologies for the Final Project at University of Greenwich_

---

## 📋 About The Project

Dehive is a cutting-edge, blockchain-integrated real-time messaging platform that combines Discord-like functionality with Web3 features including token airdrops, smart contract messaging, and decentralized authentication. Built with Next.js 16 and optimized for maximum performance, it delivers secure, scalable communication through servers, channels, and direct messaging with advanced features like voice channels, file sharing, and blockchain-based rewards.

### Key Features

- 🔐 **Web3 Authentication** - Decentralized SSO integration with blockchain wallets (wagmi/viem)
- 💰 **Token Airdrops** - Smart contract-powered token distribution campaigns with Merkle tree verification
- 💬 **Real-time Messaging** - WebSocket-powered instant communication with message history, edits, deletes, replies, and file attachments
- 🏰 **Server Management** - Create and manage community servers with roles (Owner, Admin, Member) and invite codes
- 📁 **Organized Channels** - Categories and channels (text/voice) for structured conversations, with drag-and-drop reordering
- 👥 **User Management** - Profiles with IPFS-hosted avatars, status tracking, following system, and member controls
- 🎨 **Modern UI** - Responsive three-column layout with dark theme using Tailwind CSS and shadcn/ui components
- 📞 **Voice Channels** - Real-time voice calls powered by Stream.io SDK, with participant management via Socket.IO
- 🎯 **Role-Based Permissions** - Privileged users (Owner/Moderator) can manage servers, channels, and members
- ⚡ **Performance Optimized** - Next.js 16 with Turbopack, React Compiler, and advanced caching strategies
- 📊 **Analytics & Monitoring** - Vercel Analytics and Web Vitals performance tracking
- 🔍 **Advanced Search** - Full-text search across messages and users
- 📱 **Responsive Design** - Mobile-first approach with adaptive layouts

---

## 🛠️ Tech Stack

### Core Framework

- **Next.js 16.0.1** - Latest App Router with Turbopack for ultra-fast builds and React Compiler for automatic optimization
- **React 19.1.0** - Latest React with concurrent features and automatic memoization
- **TypeScript 5.0** - Advanced type safety with latest language features

### Blockchain & Web3

- **wagmi 2.12.4** - React hooks for Ethereum wallet connections
- **viem 2.21.7** - TypeScript interface for Ethereum
- **MerkleTreeJS 1.2.4** - Merkle tree generation for airdrop verification
- **@wagmi/core** - Core Web3 functionality

### Real-time Communication

- **Socket.IO Client 4.8.1** - WebSocket library for real-time messaging and voice channel updates
- **Stream.io SDK** - Enterprise video client for voice calls (@stream-io/video-client, @stream-io/video-react-sdk)

### Styling & UI

- **Tailwind CSS 3.4.17** - Utility-first CSS framework with responsive design
- **shadcn/ui** - Modern component library built on Radix UI primitives
  - Radix UI components (@radix-ui/react-avatar, @radix-ui/react-dialog, @radix-ui/react-dropdown-menu, etc.)
- **@radix-ui/react-slot** - Component composition utilities
- **FontAwesome** - Icon library (@fortawesome/react-fontawesome)
- **Lucide React** - Additional icon set
- **Class Variance Authority (CVA)** - Component variant utilities
- **Tailwind Merge** - Conditional class merging
- **clsx** - Utility for constructing className strings

### State Management & Data Fetching

- **Valtio 1.13.2** - Lightweight proxy-based state management
- **@tanstack/react-query 5.59.0** - Powerful data synchronization for React

### Drag & Drop

- **@dnd-kit/core 6.3.1** - Modern drag-and-drop library for channel reordering
- **@dnd-kit/sortable 8.0.0** - Sortable functionality
- **@dnd-kit/utilities 3.2.2** - Utility functions for dnd-kit

### File Storage & Media

- **IPFS/Pinata** - Decentralized file storage for user avatars and attachments
- **@pinata/sdk** - Pinata SDK for IPFS interactions

### Development & Build Tools

- **Turbopack** - Next.js 16's ultra-fast bundler
- **React Compiler** - Automatic React optimization
- **ESLint** - Code linting with TypeScript support
- **PostCSS** - CSS processing with Autoprefixer
- **TypeScript Compiler** - Advanced type checking

### Performance & Analytics

- **@vercel/analytics 1.4.1** - Web analytics and performance monitoring
- **web-vitals 4.2.4** - Core Web Vitals measurement
- **@next/bundle-analyzer 15.0.0** - Bundle size analysis

### SEO & Discovery

- **next-sitemap 6.6.0** - Automated sitemap generation
- **@next/env 15.0.1** - Environment variable validation

### Utilities

- **date-fns 4.1.0** - Modern JavaScript date utility library
- **framer-motion 11.11.17** - Animation library for React
- **react-hot-toast 2.4.1** - Toast notifications
- **react-markdown 9.0.1** - Markdown rendering
- **remark-gfm 4.0.0** - GitHub Flavored Markdown support
- **uuid 11.0.3** - UUID generation
- **zod 3.23.8** - TypeScript-first schema validation

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm or yarn package manager
- Backend API server running (ports 3000, 3001, 3002 for API and WebSockets)
- Ethereum wallet (MetaMask, etc.) for Web3 features

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
   # API Configuration
   NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
   NEXT_PUBLIC_DIRECT_CHAT_SIO_URL=http://localhost:3001
   NEXT_PUBLIC_CHANNEL_CHAT_SIO_URL=http://localhost:3002

   # Web3 Configuration
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id

   # External Services
   DECODE_BASE_URL=https://decode.protocol.url
   DEHIVE_APP_ID=dehive
   PUBLIC_FRONTEND_URL=http://localhost:9000

   # Development
   NODE_ENV=development

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
├── abi/                          # Smart contract ABIs
│   ├── airdropAbi.ts            # Airdrop contract interface
│   └── messageAbi.ts            # Message contract interface
├── app/                          # Next.js App Router
│   ├── globals.css              # Global styles and Tailwind imports
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Landing page
│   ├── api/                     # API routes
│   │   ├── airdrop/             # Airdrop campaign endpoints
│   │   ├── auth/                # Authentication endpoints
│   │   ├── invite/              # Server invite endpoints
│   │   ├── me/                  # User profile endpoints
│   │   ├── sc-message/          # Smart contract messaging
│   │   ├── search/              # Search functionality
│   │   ├── servers/             # Server management
│   │   ├── stream/              # Voice stream endpoints
│   │   └── user/                # User management
│   ├── app/                     # Main application pages
│   │   ├── layout.tsx           # App layout with navigation
│   │   ├── page.tsx             # Dashboard/home page
│   │   └── channels/            # Channel pages
│   ├── invite/                  # Server invite pages
│   │   └── page.tsx
│   └── sso/                     # Single sign-on pages
│       └── page.tsx
├── components/                   # React components
│   ├── airdrop/                 # Airdrop-related components
│   │   ├── AirdropCampaignList.tsx
│   │   ├── AirdropDropdown.tsx
│   │   └── CreateAirdropModal.tsx
│   ├── app/                     # Main app components
│   │   ├── GuildBar.tsx         # Server sidebar
│   │   ├── MeBar.tsx            # User profile bar
│   │   ├── ServerBar.tsx        # Channel sidebar
│   │   └── UserBar.tsx          # User list
│   ├── common/                  # Shared components
│   │   ├── AttachmentList.tsx   # File attachments
│   │   ├── AutoLink.tsx         # URL auto-linking
│   │   ├── CallPage.tsx         # Voice call interface
│   │   ├── ChannelCall.tsx      # Channel voice calls
│   │   ├── FilePreview.tsx      # File preview component
│   │   ├── UserInfoModal.tsx    # User profile modal
│   │   └── Wallet.tsx           # Web3 wallet component
│   ├── guildeBaritem/           # Guild bar items
│   ├── message-onchain/         # Blockchain message components
│   ├── messages/                # Message components
│   ├── search/                  # Search components
│   ├── serverBarItem/           # Server bar items
│   ├── ui/                      # shadcn/ui components
│   └── userBarItem/             # User bar items
├── constants/                   # Application constants
│   ├── airdrop.constants.ts     # Airdrop configuration
│   └── index.constants.ts       # General constants
├── contexts/                    # React contexts
│   ├── ConversationRefreshContext.tsx
│   ├── DirectCallConetext.contexts.tsx
│   ├── ServerRefreshContext.contexts.tsx
│   └── SoundContext.tsx
├── hooks/                       # Custom React hooks
│   ├── useChannelCall.ts        # Channel voice call hooks
│   ├── useChannelMessage.ts     # Channel message hooks
│   ├── useDirectCall.ts         # Direct call hooks
│   ├── useDirectMessage.ts      # Direct message hooks
│   ├── useInviteSuggestions.ts  # Invite suggestion hooks
│   └── useTokenInfo.ts          # Token information hooks
├── interfaces/                  # TypeScript interfaces
│   ├── call.interface.ts        # Call-related types
│   ├── services.interface.ts    # Service types
│   ├── user.interface.ts        # User types
│   ├── websocketChannelCall.interface.ts
│   ├── websocketChannelChat.interface.ts
│   ├── websocketDirectCall.interface.ts
│   ├── websocketDirectChat.interface.ts
│   └── websocketStatus.ts       # WebSocket event types
├── lib/                         # Utility libraries
│   ├── airdropHelpers.ts        # Airdrop utility functions
│   ├── scMessage.ts             # Smart contract messaging
│   ├── socketioChannelCallSingleton.ts
│   ├── socketioChannelChatSingleton.ts
│   ├── socketioDirectChatSingleton.ts
│   ├── socketioStatusSingleton.ts
│   ├── sooketioDirectCallSingleton.ts
│   ├── utils.ts                 # General utilities
│   └── socketio*.ts             # WebSocket singletons
├── providers/                   # Context providers
│   ├── socketChannelCallProvider.tsx
│   ├── socketChannelChatProvider.tsx
│   ├── socketDirectCallProvider.tsx
│   ├── socketDirectChatProvider.tsx
│   └── socketStatusProvider.tsx
├── services/                    # External services
│   └── fingerprint.services.ts  # Device fingerprinting
└── utils/                       # Utility functions
    ├── auth.utils.ts            # Authentication utilities
    ├── cookie.utils.ts          # Cookie management
    ├── index.utils.ts           # General utilities
    └── route.utils.ts           # Route utilities
├── middleware.ts                # Next.js middleware
├── seo.config.ts                # SEO configuration
└── next-env.d.ts                # Next.js TypeScript declarations
```

---

## 🔐 Security & Authentication

### Web3 Authentication

- Decentralized wallet authentication using wagmi/viem
- Smart contract-based identity verification
- Secure key management and transaction signing

### API Security

- Next.js middleware for route protection
- HTTP-only secure cookies for session management
- WebSocket identity verification and authorization
- Role-based access control (RBAC) for server/channel management

### Smart Contract Security

- Merkle tree verification for airdrop claims
- Gas-optimized contract interactions
- Secure message encryption and signing

---

## 🌟 Core Features

### Blockchain Integration

**Token Airdrops**

- Smart contract-powered token distribution
- Merkle tree verification for claim validation
- Campaign management with customizable rules
- Web3 wallet integration for seamless claiming

**On-Chain Messaging**

- Smart contract-based message storage
- Decentralized message history
- Cryptographic message verification

### Real-Time Communication

**Messaging System**

- Instant message delivery with WebSocket connections
- Message history, editing, deletion, and replies
- File attachments with IPFS storage
- Full-text search across all messages
- Message pagination and lazy loading

**Voice Channels**

- Real-time voice calls powered by Stream.io SDK
- Participant management and audio controls
- WebRTC-based peer-to-peer communication
- Socket.IO integration for call state management

### Server Management

**Server System**

- Create and manage community servers
- Hierarchical role system (Owner → Admin → Member)
- Invite code generation and management
- Server customization and branding

**Channel Organization**

- Categorized channels (text/voice)
- Drag-and-drop channel reordering
- Permission-based channel access
- Channel archiving and management

### User Experience

**Modern UI/UX**

- Responsive three-column layout
- Dark theme optimized for long sessions
- Smooth animations and transitions
- Mobile-first responsive design

**User Management**

- IPFS-hosted user avatars
- Real-time status tracking
- Following/follower system
- Profile customization and privacy controls

---

## 📊 Performance & Monitoring

### Build Optimizations

- **Turbopack**: 10x faster development builds
- **React Compiler**: Automatic component memoization
- **Tree Shaking**: Optimized bundle sizes
- **Code Splitting**: Lazy-loaded routes and components

### Runtime Performance

- **Web Vitals**: Core Web Vitals monitoring
- **Bundle Analysis**: Size optimization and monitoring
- **Caching Strategies**: Aggressive caching with Next.js
- **Image Optimization**: Automatic image optimization and WebP conversion

### Analytics

- **Vercel Analytics**: User behavior and performance tracking
- **Error Monitoring**: Comprehensive error tracking and reporting
- **Performance Metrics**: Real-time performance dashboards

---

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run analyze      # Analyze bundle sizes
npm run type-check   # Run TypeScript type checking
```

### Environment Variables

See `.env.local` template above for all required environment variables.

### API Architecture

The application uses a comprehensive API architecture:

- **RESTful Endpoints**: Server management, user profiles, authentication
- **WebSocket Events**: Real-time messaging and voice channel updates
- **Smart Contract APIs**: Blockchain interactions for airdrops and messaging
- **External Integrations**: IPFS, Stream.io, and analytics services

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
