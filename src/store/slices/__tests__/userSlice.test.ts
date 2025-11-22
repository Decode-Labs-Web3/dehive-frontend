import userReducer, { createUser, updateUser } from '../userSlice';
import { UserDataProps } from '@/interfaces/user.interface';

describe('userSlice', () => {
  const initialState: UserDataProps = {
    _id: "",
    dehive_role: "",
    status: "",
    server_count: 0,
    username: "",
    display_name: "",
    bio: "",
    avatar_ipfs_hash: "",
    last_login: "",
    following_number: 0,
    followers_number: 0,
    is_active: false,
    last_account_deactivation: "",
  };

  it('should handle initial state', () => {
    expect(userReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle createUser', () => {
    const newUser: UserDataProps = {
      ...initialState,
      _id: '123',
      username: 'testuser',
      display_name: 'Test User',
      is_active: true,
    };

    const actual = userReducer(initialState, createUser(newUser));
    expect(actual).toEqual(newUser);
  });

  it('should handle updateUser', () => {
    const startState: UserDataProps = {
      ...initialState,
      _id: '123',
      username: 'testuser',
      display_name: 'Old Name',
      bio: 'Old Bio',
      avatar_ipfs_hash: 'old_hash',
    };

    const updatePayload = {
      display_name: 'New Name',
      bio: 'New Bio',
      avatar_ipfs_hash: 'new_hash',
    };

    const actual = userReducer(startState, updateUser(updatePayload));

    expect(actual.display_name).toEqual('New Name');
    expect(actual.bio).toEqual('New Bio');
    expect(actual.avatar_ipfs_hash).toEqual('new_hash');
    // Should preserve other fields
    expect(actual.username).toEqual('testuser');
  });

  it('should handle partial updateUser', () => {
    const startState: UserDataProps = {
      ...initialState,
      _id: '123',
      username: 'testuser',
      display_name: 'Old Name',
    };

    // Only update display_name
    const updatePayload = {
      display_name: 'New Name',
      bio: startState.bio, // Keep existing
      avatar_ipfs_hash: startState.avatar_ipfs_hash // Keep existing
    };

    const actual = userReducer(startState, updateUser(updatePayload));
    expect(actual.display_name).toEqual('New Name');
    expect(actual.username).toEqual('testuser');
  });
});
