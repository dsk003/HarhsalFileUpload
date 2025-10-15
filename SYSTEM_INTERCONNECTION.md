# System Interconnection Map

Complete audit of how Users, Authentication, and File Storage interconnect through Supabase.

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE (Central Hub)                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐                         │
│  │   Auth DB    │  │   Storage    │                         │
│  │  (users)     │  │  (uploads)   │                         │
│  └──────────────┘  └──────────────┘                         │
│         ↓                 ↓                                   │
│    User Data        File Metadata                            │
│    JWT Tokens       File URLs                                │
└─────────────────────────────────────────────────────────────┘
         ↓                 ↓
    ═════════════════════════════════════════════════
         ↓                 ↓
┌─────────────────────────────────────────────────────────────┐
│                      YOUR BACKEND (Node.js)                  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Authentication     File Operations                          │
│  ↓                 ↓                                         │
│  Verify Token      Upload File                              │
│  Get User Info     List Files                               │
│                                                               │
└─────────────────────────────────────────────────────────────┘
         ↓
    ═════════════════════════════════════════════════
         ↓
┌────────────────────────────┐
│   REACT FRONTEND           │
│                            │
│  - Login/Signup Forms      │
│  - File Upload UI          │
│                            │
└────────────────────────────┘
```

## 🔐 Authentication Flow (Supabase-Based)

### User Signup
```
1. User enters username + password
      ↓
2. Frontend → Backend /api/auth/signup
      ↓
3. Backend → Supabase Auth: createUser()
      email: username@fileupload.app
      password: hashed by Supabase
      metadata: { username }
      ↓
4. Supabase creates user in auth.users table
      Returns: { user, session }
      session contains JWT token
      ↓
5. Backend → Frontend: Returns user + token
      ↓
6. Frontend saves token to localStorage
      Sets axios default header: Bearer {token}
      ↓
7. User is logged in
```

### User Login
```
1. User enters credentials
      ↓
2. Frontend → Backend /api/auth/login
      ↓
3. Backend → Supabase Auth: signInWithPassword()
      email: username@fileupload.app
      password: user's password
      ↓
4. Supabase validates credentials
      Returns: { user, session }
      JWT token in session
      ↓
5. Backend → Frontend: Returns user + token
      ↓
6. Frontend saves token to localStorage
      Token includes Supabase user.id (UUID)
      ↓
7. User is logged in with Supabase identity
```

### Token Verification (Every Request)
```
1. Frontend sends request with token in header
      Authorization: Bearer {supabase-jwt-token}
      ↓
2. Backend extracts token
      ↓
3. Backend → Supabase: getUser(token)
      ↓
4. Supabase validates token
      Returns full user object if valid
      Including: id, email, user_metadata
      ↓
5. Backend uses req.user.id (Supabase UUID)
      This is the source of truth
```

**Key Point:** ✅ User ID always comes from Supabase, never generated locally

## 📁 File Upload Flow (Linked to Supabase User)

```
1. User uploads file
      ↓
2. Frontend → Backend /api/upload
      Header: Authorization: Bearer {token}
      Body: FormData with file
      ↓
3. Backend verifies token with Supabase
      Gets: req.user.id (Supabase UUID)
      ↓
4. Backend uploads to Supabase Storage
      Bucket: 'uploads'
      File name includes timestamp
      ↓
5. Supabase Storage returns URL
      ↓
6. Backend → Frontend: Returns file info
```

**Note:** Files not explicitly linked to user in storage, but could be:
- Add user_id to file metadata
- Or create files table in Supabase linking to auth.users

## 🔗 Current Interconnections

### ✅ What's Connected Through Supabase

1. **User Identity**
   - Source: Supabase Auth (auth.users table)
   - Every operation uses Supabase user.id
   - JWT tokens issued by Supabase

2. **File Storage**
   - Stored in: Supabase Storage
   - Accessed by: Logged-in users (Supabase auth)

### ⚠️ What's NOT Connected (Gap)

1. **File Ownership**
   - Problem: Files not explicitly linked to users
   - Impact: Can't list "user's files" easily
   - Solution: Add user_id to file metadata or create files table

## 📊 Data Storage Locations

### Supabase (Persistent, Cross-Device)
- ✅ User accounts (auth.users)
- ✅ User metadata (username, etc.)
- ✅ File blobs (Supabase Storage)

### Browser localStorage (Client-Side Only)
- ⚠️ JWT token (issued by Supabase, stored locally)
- This is normal and standard practice
- Token expires, not permanent

### Backend Memory (Temporary)
- None - stateless server
- Everything verified with Supabase on each request

## 🎯 Verification Checklist

### Authentication
- ✅ Users stored in Supabase Auth
- ✅ JWT tokens from Supabase
- ✅ Token verification via Supabase API
- ✅ User ID from Supabase (UUID)
- ✅ Works across devices

### File Storage
- ✅ Files in Supabase Storage
- ✅ Access requires Supabase auth
- ⚠️ Files not explicitly linked to users

## 🔧 Recommended Improvements

### 1. Add File Ownership Tracking
```sql
CREATE TABLE user_files (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),  ← Links to Supabase user
  file_path TEXT,
  file_name TEXT,
  created_at TIMESTAMP
);
```

**Benefits:**
- List user's uploaded files
- Enforce file ownership
- File management features

## 📝 Summary

### Current State
- ✅ Authentication: 100% Supabase-based
- ✅ User Identity: Always from Supabase
- ✅ File Storage: In Supabase
- ⚠️ File Ownership: Not explicitly tracked

### All Critical Data Flows Through Supabase
Every authenticated operation:
1. Receives JWT token (from Supabase)
2. Verifies with Supabase
3. Gets Supabase user.id
4. Uses that ID for everything

**Nothing is local-only** - All user data comes from and can be traced back to Supabase.


