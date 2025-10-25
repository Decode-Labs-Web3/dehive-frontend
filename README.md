# Dehive - Real-time Chat Application

**Final Project - University of Greenwich**
**Student:** Vũ Trần Quang Minh
**Student ID:** GCS220006
**Email:** minhvtqgcs220006@fpt.edu.vn
**Academic Year:** 2024-2025

---

## 📋 About The Project

Dehive is a modern, real-time messaging platform inspired by Discord, integrating blockchain-based authentication via Decode Protocol. Built with Next.js and Socket.IO, it enables secure, scalable communication through servers, channels, and direct messaging. The app features a responsive dark theme, role-based permissions, and real-time updates for voice and text channels.

### Key Features

- 🔐 **Blockchain Authentication** - SSO integration with Decode Protocol for secure login
- 💬 **Real-time Messaging** - WebSocket-powered instant communication with message history, edits, deletes, and replies
- 🏰 **Server Management** - Create and manage community servers with roles (Owner, Admin, Member) and invite codes
- 📁 **Organized Channels** - Categories and channels (text/voice) for structured conversations, with drag-and-drop reordering for privileged users
- 👥 **User Management** - Profiles with avatars (IPFS-hosted), status tracking, following system, and member controls
- 🎨 **Modern UI** - Responsive three-column layout with dark theme using Tailwind CSS and shadcn/ui components
- 📞 **Voice Channels** - Real-time voice calls powered by Stream.io SDK, with participant management via Socket.IO
- 🎯 **Role-Based Permissions** - Privileged users (Owner/Moderator) can manage servers, channels, and members

---

## 🛠️ Tech Stack

### Core Framework

- **Next.js 15.5.4** - React framework with App Router for server-side rendering and API routes
- **React 19.1.0** - UI library with hooks and contexts
- **TypeScript** - Type-safe JavaScript for better development experience

### Styling & UI

- **Tailwind CSS 4** - Utility-first CSS framework with animations
- **shadcn/ui** - Component library built on Radix UI primitives
  - Radix UI components (@radix-ui/react-avatar, @radix-ui/react-dialog, etc.)
- **FontAwesome** - Icon library (@fortawesome/react-fontawesome)
- **Lucide React** - Additional icons
- **Class Variance Authority (CVA)** - Component variant utilities
- **Tailwind Merge** - Conditional class merging

### Real-time Communication

- **Socket.IO Client 4.8.1** - WebSocket library for real-time messaging and voice channel updates
- **Stream.io SDK** - Video client for voice calls (@stream-io/video-client, @stream-io/video-react-sdk)

### Drag & Drop

- **@dnd-kit/core 6.3.1** - Modern drag-and-drop library for channel reordering

### Utilities

- **React-Toastify 11.0.5** - Toast notifications
- **Autoprefixer** - CSS vendor prefixing
- **ESLint** - Code linting with TypeScript support

### Development Tools

- **TypeScript Compiler** - Type checking
- **PostCSS** - CSS processing

### External Integrations

- **Decode Protocol** - Blockchain-based SSO authentication
- **IPFS** - Decentralized file storage for user avatars

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20.x or higher
- Backend API server running (ports 3000, 3001, 3002 for API and WebSockets)

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

3. Create `.env.local` file:

   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
   NEXT_PUBLIC_DIRECT_CHAT_SIO_URL=http://localhost:3001
   NEXT_PUBLIC_CHANNEL_CHAT_SIO_URL=http://localhost:3002
   DECODE_BASE_URL=https://decode.protocol.url
   DEHIVE_APP_ID=dehive
   PUBLIC_FRONTEND_URL=http://localhost:9000
   NODE_ENV=development
   ```

4. Run development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:9000](http://localhost:9000)

### Build for Production

```bash
npm run build
npm run start
```

---

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router (pages & API routes)
│   ├── api/                # API routes for auth, servers, users
│   ├── globals.css         # Global styles
│   └── layout.tsx          # Root layout
├── components/             # React components
│   ├── serverBarItem/      # Server sidebar (Categories, Channels, etc.)
│   ├── common/             # Shared components (CallPage, UserInfoModal)
│   ├── ui/                 # shadcn/ui components (avatar, button, etc.)
│   └── ...
├── hooks/                  # Custom React hooks (useChannelCall, useDirectMessage)
├── contexts/               # React contexts (ConversationRefreshContext)
├── providers/              # Context providers (socket providers)
├── lib/                    # WebSocket connections (socketioChannelCall.ts)
├── interfaces/             # TypeScript interfaces (call.interface.ts, user.interface.ts)
├── utils/                  # Utility functions (auth.utils.ts, cookie.utils.ts)
└── middleware.ts           # API protection middleware
```

---

## 🔐 Security Features

- API route protection via middleware
- SSO authentication with Decode Protocol
- HTTP-only secure cookies
- WebSocket identity verification
- TypeScript type safety
- Role-based access control (privileged users for server/channel management)

---

## 🌟 Core Features

### Messaging System

Real-time message delivery with edit, delete, reply, and file attachment support. Includes pagination and message history.

### Server System

Create servers with categories and channels. Manage members with role-based permissions (Owner/Admin/Member). Generate invite codes. Privileged users can reorder channels via drag-and-drop.

### User System

User profiles with IPFS-hosted avatars, status tracking, following system, and customizable display names. Real-time updates for channel participants in voice calls.

### Voice Channels

Real-time voice calls powered by Stream.io SDK, with participant management and join/leave updates via Socket.IO events (e.g., userJoinedChannel, userLeftChannel, channelJoined).

---

## 👤 Author

**Vũ Trần Quang Minh**
Student ID: GCS220006
University: University of Greenwich
Email: minhvtqgcs220006@fpt.edu.vn

---

## 🙏 Acknowledgments

Thanks to Next.js, Socket.IO, Decode Protocol, shadcn/ui, @dnd-kit, and the University of Greenwich for making this project possible.

---

_Built with Next.js, React, TypeScript, and Socket.IO for the Final Project at University of Greenwich_
