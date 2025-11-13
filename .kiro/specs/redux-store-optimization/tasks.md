# Implementation Plan

- [x] 1. Optimize directMemberSlice reducer
  - Refactor the Redux slice to improve performance and maintainability
  - Add helper function `sortByLastMessage` for efficient sorting
  - Optimize `updateMemberConversation` reducer to use direct member reference instead of findIndex
  - Rename `createMemberList` to `setMemberList` for consistent naming convention
  - Add proper TypeScript type annotations for all action payloads
  - _Requirements: 2.1, 2.2, 3.1, 6.1_

- [x] 2. Create memoized selectors for directMembers
  - Add reselect library if not already present in dependencies
  - Create `selectDirectMembers` base selector in directMemberSlice
  - Create `selectSortedDirectMembers` memoized selector using createSelector
  - Export selectors for use in hooks and components
  - _Requirements: 1.3, 3.2_

- [x] 3. Enhance useDirectMember hook with memoization
  - Import and use memoized selectors from directMemberSlice
  - Wrap `setDirectMembers` (formerly createDirectMember) with useCallback
  - Wrap `updateDirectStatus` with useCallback
  - Wrap `updateDirectConversation` with useCallback
  - Wrap `clearDirectMembers` (formerly deleteDirectMember) with useCallback
  - Add explicit TypeScript return type annotation for the hook
  - Update function names to match new slice action names
  - _Requirements: 1.1, 1.2, 3.3, 6.3_

- [ ] 4. Optimize MeLayout component WebSocket handlers
  - Create memoized `handleConversationUpdate` callback using useCallback with proper dependencies
  - Create memoized `handleUserStatusChanged` callback using useCallback with proper dependencies
  - Update useEffect hooks to use the memoized handlers
  - Verify WebSocket cleanup functions remain properly configured
  - _Requirements: 4.1, 4.3_

- [ ] 5. Optimize MeLayout data fetching logic
  - Add conditional check in `fetchUserData` to only call clearDirectMembers when directMembers.length > 0
  - Update fetchUserData useCallback dependencies to include directMembers.length
  - Verify useEffect dependency array for fetchUserData is correct
  - Update function calls to use new hook method names (setDirectMembers, clearDirectMembers)
  - _Requirements: 5.1, 5.2, 5.3_

- [ ] 6. Update all imports and references
  - Update import statements in useDirectMember.ts to use new action names
  - Update import statements in layout.tsx to use new hook method names
  - Update any other components that use useDirectMember hook
  - Verify no breaking changes in dependent components
  - _Requirements: 6.1, 6.2, 6.3_

- [ ]* 7. Add performance monitoring
  - Add React DevTools Profiler wrapper around MeLayout component
  - Log render counts in development mode
  - Add performance marks for state update operations
  - Create benchmark comparison before/after optimization
  - _Requirements: All_
