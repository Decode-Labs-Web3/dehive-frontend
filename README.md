# Dehive - Real-time Chat Application

**Final Project - University of Greenwich**
**Student:** Vũ Trần Quang Minh
**Email:** minhvtqgcs220006@fpt.edu.vn
**Academic Year:** 2024-2025

---

## 📋 About The Project

Dehive is a modern, real-time messaging platform that combines Discord-like community features with blockchain-based authentication. Built with Next.js and Socket.IO, it provides secure, scalable communication through servers, channels, and direct messaging.

### Key Features

- 🔐 **Blockchain Authentication** - SSO integration with Decode Protocol
- 💬 **Real-time Messaging** - WebSocket-powered instant communication
- 🏰 **Server Management** - Create and manage community servers with roles and permissions
- 📁 **Organized Channels** - Categories and channels for structured conversations
- 👥 **User Management** - Profiles, following system, and member controls
- 🎨 **Modern UI** - Responsive dark theme with three-column layout

---

## �️ Tech Stack

- **Frontend:** Next.js 15.5, React 19, TypeScript
- **Styling:** Tailwind CSS 4
- **Real-time:** Socket.IO Client 4.8
- **Icons:** FontAwesome
- **Notifications:** React-Toastify

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20.x or higher
- Backend API server running

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
NEXT_PUBLIC_ME_CHAT_SIO_URL=http://localhost:3001
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
├── app/              # Next.js App Router (pages & API routes)
├── components/       # React components
├── hooks/            # Custom React hooks
├── contexts/         # React contexts
├── providers/        # Context providers
├── library/          # WebSocket connections
├── interfaces/       # TypeScript interfaces
├── utils/            # Utility functions
└── middleware.ts     # API protection
```

---

## 🔐 Security Features

- API route protection via middleware
- SSO authentication with Decode Protocol
- HTTP-only secure cookies
- WebSocket identity verification
- TypeScript type safety

---

## 🌟 Core Features

### Messaging System

Real-time message delivery with edit, delete, reply, and file attachment support. Includes pagination and message history.

### Server System

Create servers with categories and channels. Manage members with role-based permissions (Owner/Admin/Member). Generate invite codes.

### User System

User profiles with avatars, status tracking, following system, and customizable display names.

---

## 👤 Author

**Vũ Trần Quang Minh**
Student ID: GCS220006
University: University of Greenwich
Email: minhvtqgcs220006@fpt.edu.vn

---

## 🙏 Acknowledgments

Thanks to Next.js, Socket.IO, Decode Protocol, and the University of Greenwich for making this project possible.

---

_Built with Next.js, React, TypeScript, and Socket.IO_

---
