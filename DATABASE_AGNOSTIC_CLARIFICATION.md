# Database-Agnostic Architecture Clarification

## Overview

Updated documentation to clarify that `settingsService.ts` and `useSettingsRefresh` hook are **DATABASE-AGNOSTIC** and work with any data source.

---

## ✅ What Changed

### Files Updated:
1. `lib/services/settingsService.ts` - Added detailed comments
2. `lib/hooks/useSettingsRefresh.ts` - Clarified database independence
3. `SETTINGS_REFACTORING_SUMMARY.md` - Added architecture diagram

---

## 🎯 Key Clarifications

### 1. **settingsService.ts is DATABASE-AGNOSTIC**

```typescript
/**
 * Settings Service
 * DATABASE-AGNOSTIC service for managing user data refresh operations
 *
 * This service does NOT directly interact with any database (Firestore, Turso, etc).
 * It only manages React Query cache invalidation and session refresh.
 */
```

**What it does:**
- ✅ Invalidates React Query cache
- ✅ Triggers session refresh
- ✅ Manages page reload

**What it does NOT do:**
- ❌ Query Firestore directly
- ❌ Query Turso directly
- ❌ Know which database is being used

---

### 2. **Data Flow Explained**

```
User clicks "Refresh"
    ↓
useSettingsRefresh hook
    ↓
settingsService.refreshUserData()
    ↓
Invalidates React Query cache with key ['user', email]
    ↓
React Query detects invalidation
    ↓
React Query calls queryFn from useCurrentUser hook
    ↓
queryFn calls getUser(email) from userService
    ↓
userService queries database (Firestore or Turso)
    ↓
Fresh data returned and cached
```

---

### 3. **Current Database Setup**

| Component | Database Used | File |
|-----------|--------------|------|
| User Queries | Firestore ✅ | `lib/services/userService.ts` |
| Auth/JWT | Firestore ✅ | `lib/auth.ts` |
| Cache Layer | N/A (database-agnostic) | `lib/services/settingsService.ts` |
| Turso Implementation | Available 💤 | `lib/services/turso/userService.ts` |

---

## 🔄 How to Switch Databases

### Option 1: Direct Import Change

**Current (Firestore):**
```typescript
// lib/hooks/useUserQueries.ts
import { getUser } from '../services/userService';  // ← Firestore
```

**Switch to Turso:**
```typescript
// lib/hooks/useUserQueries.ts
import { getUser } from '../services/turso/userService';  // ← Turso
```

### Option 2: Environment-Based (Recommended)

Create a database selector:

```typescript
// lib/services/index.ts
const USE_TURSO = process.env.NEXT_PUBLIC_USE_TURSO === 'true';

// Export from appropriate implementation
export * from USE_TURSO
  ? './turso/userService'
  : './userService';
```

Then update hooks:
```typescript
// lib/hooks/useUserQueries.ts
import { getUser } from '../services';  // ← Auto-selects based on env
```

**settingsService.ts requires NO changes!** 🎉

---

## 📊 Architecture Diagram

```
┌─────────────────────────────────────┐
│  Settings Page (Component)          │
│  - UI only                          │
└─────────────┬───────────────────────┘
              │ uses
┌─────────────▼───────────────────────┐
│  useSettingsRefresh (Hook)          │
│  - React state management           │
│  - Orchestration                    │
└─────────────┬───────────────────────┘
              │ uses
┌─────────────▼───────────────────────┐
│  settingsService (Service)          │
│  - Cache invalidation ONLY          │
│  - DATABASE-AGNOSTIC ✅             │
└─────────────┬───────────────────────┘
              │ triggers
┌─────────────▼───────────────────────┐
│  React Query                        │
│  - Detects cache invalidation       │
│  - Calls configured queryFn         │
└─────────────┬───────────────────────┘
              │ calls
      ┌───────┴───────┐
      ▼               ▼
┌─────────────┐  ┌─────────────┐
│  Firestore  │  │  Turso      │
│  Service    │  │  Service    │
│  (Active ✅)│  │  (Ready 💤) │
└─────────────┘  └─────────────┘
```

---

## 🔍 Code Examples

### settingsService.ts (Database-Agnostic)

```typescript
export async function refreshUserData(
  email: string,
  queryClient: QueryClient
): Promise<void> {
  // Just invalidates cache - doesn't know about Firestore or Turso
  await queryClient.invalidateQueries({ queryKey: ['user', email] });
  await queryClient.refetchQueries({ queryKey: ['user', email] });
}
```

### userService.ts (Firestore Implementation)

```typescript
// lib/services/userService.ts
import { db } from '../firebase';  // ← Firestore
import { doc, getDoc } from 'firebase/firestore';

export async function getUser(email: string): Promise<User | null> {
  const userRef = doc(db, 'users', email);
  const userDoc = await getDoc(userRef);
  return userDoc.exists() ? userDoc.data() as User : null;
}
```

### turso/userService.ts (Turso Implementation)

```typescript
// lib/services/turso/userService.ts
import { db } from '@/turso/client';  // ← Turso

export async function getUser(email: string): Promise<User | null> {
  const result = await db.execute({
    sql: 'SELECT * FROM users WHERE user_id = ?',
    args: [email],
  });
  return result.rows[0] ? rowToUser(result.rows[0]) : null;
}
```

---

## 💡 Benefits

### 1. **Easy Database Migration**
- Change one import in `useUserQueries.ts`
- `settingsService.ts` requires zero changes
- No need to update components or hooks

### 2. **Testability**
```typescript
// Can test settingsService without mocking databases
describe('settingsService', () => {
  it('should invalidate cache', async () => {
    const mockQueryClient = createMockQueryClient();
    await refreshUserData('test@example.com', mockQueryClient);
    expect(mockQueryClient.invalidateQueries).toHaveBeenCalled();
  });
});
```

### 3. **Flexibility**
- Can use Firestore for reads, Turso for writes
- Can A/B test different databases
- Can gradually migrate by switching collections one at a time

### 4. **Maintainability**
- Clear separation of concerns
- Cache logic separate from database logic
- Easy to understand data flow

---

## 🚀 Future: Hybrid Approach

You could even use BOTH databases simultaneously:

```typescript
// lib/services/hybridService.ts
import * as firestore from './userService';
import * as turso from './turso/userService';

export async function getUser(email: string): Promise<User | null> {
  // Try Turso first (faster)
  const tursoUser = await turso.getUser(email);
  if (tursoUser) return tursoUser;

  // Fallback to Firestore
  const firestoreUser = await firestore.getUser(email);

  // Backfill Turso in background (don't wait)
  if (firestoreUser) {
    turso.upsertUser(firestoreUser).catch(console.error);
  }

  return firestoreUser;
}
```

**settingsService.ts still doesn't care!** It just invalidates the cache. 🎯

---

## ✅ Summary

| Statement | True/False |
|-----------|-----------|
| settingsService.ts queries Firestore directly | ❌ False |
| settingsService.ts queries Turso directly | ❌ False |
| settingsService.ts manages cache only | ✅ True |
| settingsService.ts works with any database | ✅ True |
| To switch databases, update settingsService.ts | ❌ False |
| To switch databases, update import in hooks | ✅ True |

**The architecture is database-agnostic by design!** 🎉
