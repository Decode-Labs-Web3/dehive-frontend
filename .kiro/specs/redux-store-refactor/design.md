# Redux Store Refactor - Design Document

## Overview

This design document outlines the refactoring approach for the Redux store member management system. The refactor focuses on performance optimization through memoized selectors, improved code organization, enhanced type safety, and better socket event handling patterns. The design maintains backward compatibility while introducing modern Redux best practices.

## Architecture

### Current Archi Issues

1. **Direct state access** without memoization causing unnecessary re-renders
2. **Multiple useEffect hooks** (5+) for socket listeners creating maintenance overhead
3. **Code duplication** between serverMemberSlice and channelMemberSlice
4. **Unsafe mutations** in some reducers (e.g., push to potentially undefined arrays)
5. **Non-memoized callbacks** causing socket listener re-registration

### Proposed Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Layout Component                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Consolidated Socket Listeners (2-3 useEffect hooks)   │ │
│  │  - Status Socket (1 effect)                            │ │
│  │  - Channel Call Socket (1 effect for all events)      │ │
│  └────────────────────────────────────────────────────────┘ │
│                           ↓                                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         Memoized Custom Hooks                          │ │
│  │  - useChannelMember (with memoized callbacks)          │ │
│  │  - useServerMember (with memoized callbacks)           │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                   Memoized Selectors                         │
│  - selectChannelMembers                                      │
│  - selectServerMembers                                       │
│  - selectChannelById(channelId)                             │
│  - selectMemberById(memberId)                               │
│  - selectChannelParticipants(channelId)                     │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                    Redux Slices                              │
│  ┌──────────────────────┐  ┌──────────────────────┐        │
│  │ channelMemberSlice   │  │ serverMemberSlice    │        │
│  │ - Safe reducers      │  │ - Safe reducers      │        │
│  │ - Shared utilities   │  │ - Shared utilities   │        │
│  └──────────────────────┘  └──────────────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Memoized Selectors

Create a new file: `src/store/selectors/memberSelectors.ts`

```typescript
import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store';

// Base selectors
export const selectChannelMembers = (state: RootState) => state.channelMembers;
export const selectServerMembers = (state: RootState) => state.serverMembers;

// Memoized selectors
export const selectChannelById = createSelector(
  [selectChannelMembers, (_state: RootState, channelId: string) => channelId],
  (channels, channelId) => channels.find(channel => channel._id === channelId)
);

export const selectChannelParticipants = createSelector(
  [selectChannelById],
  (channel) => channel?.participants ?? []
);

export const selectServerMemberById = createSelector(
  [selectServerMembers, (_state: RootState, userId: string) => userId],
  (members, userId) => members.find(member => member.user_id === userId)
);

export const selectServerMemberStatus = createSelector(
  [selectServerMemberById],
  (member) => member?.status ?? 'offline'
);
```

### 2. Enhanced Custom Hooks

**useChannelMember Hook Improvements:**

```typescript
import { useCallback, useMemo } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { selectChannelMembers } from "@/store/selectors/memberSelectors";
// ... imports

/**
 * Custom hook for managing channel member state
 * @returns Channel members state and memoized action dispatchers
 */
export const useChannelMember = () => {
  const dispatch = useAppDispatch();
  const channelMembers = useAppSelector(selectChannelMembers);

  const createChannelMember = useCallback(
    (memberList: ChannelMemberListProps[]) => {
      dispatch(createMemberList(memberList));
    },
    [dispatch]
  );

  const serverChannelMember = useCallback(
    (memberList: Channels[]) => {
      dispatch(userJoinServer(memberList));
    },
    [dispatch]
  );

  // ... other memoized callbacks

  return useMemo(
    () => ({
      channelMembers,
      createChannelMember,
      serverChannelMember,
      joinChannelMember,
      statusChannelMember,
      leftChannelMember,
      deleteChannelMember,
    }),
    [
      channelMembers,
      createChannelMember,
      serverChannelMember,
      joinChannelMember,
      statusChannelMember,
      leftChannelMember,
      deleteChannelMember,
    ]
  );
};
```

**useServerMember Hook Improvements:**

Similar pattern with memoized callbacks and return object.

### 3. Safe Reducer Implementations

**channelMemberSlice Improvements:**

```typescript
userJoinChannel(state, action: PayloadAction<UserJoinedChannelPayload>) {
  const channel = state.find((ch) => ch._id === action.payload.channel_id);
  if (channel) {
    // Safe initialization if participants is undefined
    if (!channel.participants) {
      channel.participants = [];
    }
    // Check for duplicates before adding
    const exists = channel.participants.some(
      (p) => p._id === action.payload.user_info._id
    );
    if (!exists) {
      channel.participants.push(action.payload.user_info);
    }
  }
}
```

### 4. Consolidated Socket Listeners

**Layout Component Refactor:**

```typescript
// Consolidate status socket listeners
useEffect(() => {
  const socket = getStatusSocketIO();

  const handleUserStatusChanged = (
    p: string | { userId: string; status: string }
  ) => {
    if (typeof p === "string") return;
    updateServerStatus(p.userId, p.status);
  };

  socket.on("userStatusChanged", handleUserStatusChanged);

  return () => {
    socket.off("userStatusChanged", handleUserStatusChanged);
  };
}, [updateServerStatus]);

// Consolidate ALL channel call socket listeners into ONE effect
useEffect(() => {
  const socket = getChannelCallSocketIO();

  const handleServerJoined = (p: JoinedServer) => {
    serverChannelMember(p.channels);
  };

  const handleUserJoinedChannel = (p: UserJoinedChannelPayload) => {
    joinChannelMember(p);
  };

  const handleUserStatusChanged = (p: UserStatusChangedPayload) => {
    statusChannelMember(p);
  };

  const handleUserLeftChannel = (p: UserLeftChannelPayload) => {
    leftChannelMember(p);
  };

  // Register all listeners
  socket.on("serverJoined", handleServerJoined);
  socket.on("userJoinedChannel", handleUserJoinedChannel);
  socket.on("userStatusChanged", handleUserStatusChanged);
  socket.on("userLeftChannel", handleUserLeftChannel);

  // Cleanup all listeners
  return () => {
    socket.off("serverJoined", handleServerJoined);
    socket.off("userJoinedChannel", handleUserJoinedChannel);
    socket.off("userStatusChanged", handleUserStatusChanged);
    socket.off("userLeftChannel", handleUserLeftChannel);
  };
}, [serverChannelMember, joinChannelMember, statusChannelMember, leftChannelMember]);
```

### 5. Shared Utilities

Create: `src/store/utils/sliceHelpers.ts`

```typescript
import { PayloadAction } from '@reduxjs/toolkit';

/**
 * Generic reducer factory for creating member lists
 */
export const createMemberListReducer = <T>() => {
  return (_state: T[], action: PayloadAction<T[]>) => action.payload;
};

/**
 * Generic reducer factory for clearing member lists
 */
export const clearMemberListReducer = <T>(initialState: T[]) => {
  return () => initialState;
};

/**
 * Safe array push that initializes array if undefined
 */
export const safePush = <T>(array: T[] | undefined, item: T): T[] => {
  if (!array) return [item];
  return [...array, item];
};

/**
 * Safe array filter
 */
export const safeFilter = <T>(
  array: T[] | undefined,
  predicate: (item: T) => boolean
): T[] => {
  if (!array) return [];
  return array.filter(predicate);
};
```

## Data Models

### Enhanced Type Definitions

```typescript
// src/store/types/memberTypes.ts

export interface MemberState<T> {
  items: T[];
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

export interface MemberActions<T> {
  create: (items: T[]) => void;
  update: (id: string, updates: Partial<T>) => void;
  remove: (id: string) => void;
  clear: () => void;
}
```

## Error Handling

### Socket Event Validation

```typescript
// src/store/utils/socketValidation.ts

export const validateUserStatusPayload = (
  payload: unknown
): payload is { userId: string; status: string } => {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'userId' in payload &&
    'status' in payload &&
    typeof (payload as any).userId === 'string' &&
    typeof (payload as any).status === 'string'
  );
};

export const validateUserJoinedChannelPayload = (
  payload: unknown
): payload is UserJoinedChannelPayload => {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'channel_id' in payload &&
    'user_id' in payload &&
    'user_info' in payload
  );
};
```

### Reducer Error Boundaries

```typescript
// Wrap critical reducers with try-catch for development debugging
userJoinChannel(state, action: PayloadAction<UserJoinedChannelPayload>) {
  try {
    const channel = state.find((ch) => ch._id === action.payload.channel_id);
    if (!channel) {
      console.warn(`Channel ${action.payload.channel_id} not found`);
      return;
    }
    // ... safe implementation
  } catch (error) {
    console.error('Error in userJoinChannel reducer:', error);
  }
}
```

## Testing Strategy

### Unit Tests

1. **Selector Tests** (`memberSelectors.test.ts`)
   - Test memoization behavior
   - Test selector output with various state shapes
   - Test edge cases (empty arrays, undefined values)

2. **Reducer Tests** (`channelMemberSlice.test.ts`, `serverMemberSlice.test.ts`)
   - Test each reducer with valid payloads
   - Test edge cases (undefined arrays, duplicate entries)
   - Test immutability

3. **Hook Tests** (`useChannelMember.test.tsx`, `useServerMember.test.tsx`)
   - Test callback memoization
   - Test return value stability
   - Test dispatch calls

### Integration Tests

1. **Socket Integration** (`layout.integration.test.tsx`)
   - Test socket event handling
   - Test state updates from socket events
   - Test cleanup on unmount

2. **Component Integration**
   - Test Layout component with mocked socket
   - Test re-render behavior with memoized selectors

### Performance Tests

1. **Re-render Counting**
   - Measure re-renders before and after refactor
   - Verify memoization prevents unnecessary renders

2. **Selector Performance**
   - Benchmark selector execution time
   - Verify createSelector caching works

## Migration Strategy

### Phase 1: Add New Code (Non-Breaking)
1. Create selector files
2. Create utility files
3. Add new memoized hooks alongside existing ones

### Phase 2: Update Reducers (Low Risk)
1. Update channelMemberSlice with safe mutations
2. Update serverMemberSlice with safe mutations
3. Test thoroughly

### Phase 3: Update Components (Breaking Changes)
1. Update Layout component to use consolidated socket listeners
2. Remove console.log statements
3. Update to use memoized callbacks

### Phase 4: Cleanup
1. Remove old hook implementations if new ones created
2. Remove unused imports
3. Update documentation

## Performance Considerations

### Before Refactor
- 5+ useEffect hooks re-running on dependency changes
- Non-memoized selectors causing re-renders
- Socket listeners re-registering unnecessarily
- Potential state mutation bugs

### After Refactor
- 2-3 consolidated useEffect hooks
- Memoized selectors preventing unnecessary re-renders
- Stable callback references preventing listener churn
- Safe, immutable state updates

### Expected Improvements
- 30-50% reduction in unnecessary re-renders
- Improved socket connection stability
- Better developer experience with type safety
- Reduced bundle size from removed unused code

## Security Considerations

1. **Payload Validation**: All socket payloads validated before state updates
2. **Type Safety**: Strong typing prevents runtime errors
3. **Immutability**: Prevents accidental state corruption
4. **Error Boundaries**: Graceful handling of malformed data

## Accessibility

This refactor is backend/state management focused and does not directly impact accessibility. However, improved performance may indirectly benefit users with:
- Lower-end devices (fewer re-renders = better performance)
- Screen readers (more stable DOM = better experience)
