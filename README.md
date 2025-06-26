# 📤 ShareApp

**ShareApp** is a hybrid file and text sharing platform that supports both persistent (server-stored) and non-persistent (P2P via WebRTC) rooms. The platform allows both authenticated and unauthenticated users to create, join, and share securely.

---

## 🚀 Features

### 🔐 User Support
- **Authenticated Users** (via Supabase Auth)
- **Unauthenticated Users**:
  - Identified by a unique `cookie_id` stored in a 1-month persistent cookie.
  - Server tracks sessions with `guest_users` table.
  - If a guest later signs up, all their data (messages, rooms, memberships) is migrated to their new user account.

---

### 🏠 Room Types

#### 🗃️ Persistent Rooms (`room-persistent`)
- Stored permanently in Supabase.
- Can be joined by multiple users and guests.
- Allow both text and file sharing.
- Ideal for teams, asynchronous conversations, and multi-user collaboration.

#### 🔗 P2P Rooms (`room-p2p`)
- WebRTC-based direct sender-receiver connection.
- Only 2 participants allowed (limited by TURN/STUN resources).
- Temporarily stored on server for signaling.
- Expire automatically after optional TTL.

---

### 🔒 Room Security
- All rooms can be **password protected**.
- Passwords are **bcrypt hashed** using PostgreSQL `pgcrypto`.
- No plaintext storage of passwords.

---

### ✍️ Messaging
- Rooms support sending both:
  - **Text messages**
  - **Files** (via Supabase Storage)
- Each message includes:
  - `message_type`: `text` or `file`
  - Optional `file_type` and `file_metadata`

---

### 🔁 WebRTC Signaling (P2P)
- Stored in `room_members`:
  - `offer` and `answer`: WebRTC SDP values
  - `ice_candidates`: JSON array of ICE candidates
  - `media_status`: JSON describing video/audio status
- Roles like `initiator` are tracked per member

---

### 🧹 Guest Lifecycle & Cleanup
- Guests tracked via `cookie_id` with 1-month inactivity expiry.
- Upon signup, all guest-related content (rooms, messages) is transferred to the new authenticated account.
- P2P rooms support `expires_at` for auto-cleanup.

---

## 🗄️ Database Design (PostgreSQL/Supabase)

### Tables

#### `guest_users`
- Tracks unauthenticated users via `cookie_id`.

#### `rooms`
- Persistent and P2P room definitions.
- Links to either `user_id` (auth) or `guest_id`.

#### `room_members`
- Tracks who is in each room.
- Stores SDP, ICE, and roles for P2P.

#### `room_messages`
- Stores all messages: text or file.
- Linked to sender (authenticated or guest).

---

## 🧱 Tech Stack

- **Frontend**: Next.js
- **Backend**: Supabase (PostgreSQL + Realtime + Storage + Auth)
- **P2P**: WebRTC
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage (files)

---

## 📦 Planned Improvements

- ✅ Guest → User migration flow
- ✅ Media streaming support (WebRTC metadata)
- ✅ P2P room expiry support
- 🔜 Reactions or threads
- 🔜 Message/file expiration & download stats
- 🔜 User-specific room permissions (RLS-based)
- 🔜 Admin/moderator roles

---

## 📁 Project Structure

