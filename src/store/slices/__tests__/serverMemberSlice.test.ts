import serverMemberReducer, {
  setMemberList,
  updateMemberStatus,
  updateUserJoin,
  updateUserLeave,
} from '../serverMemberSlice';
import { ServerMemberListProps } from '@/interfaces/user.interface';

describe('serverMemberSlice', () => {
  const initialState: ServerMemberListProps[] = [];

  const mockMember: ServerMemberListProps = {
    user_id: 'user-1',
    username: 'testuser',
    displayname: 'Test User',
    avatar_ipfs_hash: 'hash',
    status: 'offline',
    wallets: [],
    isCall: false,
    conversationid: 'conv-1',
    last_seen: new Date().toISOString(),
  };

  it('should handle initial state', () => {
    expect(serverMemberReducer(undefined, { type: 'unknown' })).toEqual([]);
  });

  it('should handle setMemberList', () => {
    const members = [mockMember];
    const actual = serverMemberReducer(initialState, setMemberList(members));
    expect(actual).toEqual(members);
  });

  it('should handle updateMemberStatus', () => {
    const stateWithMember = [mockMember];
    const actual = serverMemberReducer(
      stateWithMember,
      updateMemberStatus({ userId: 'user-1', status: 'online' })
    );
    expect(actual[0].status).toEqual('online');
  });

  it('should handle updateUserJoin', () => {
    const actual = serverMemberReducer(initialState, updateUserJoin(mockMember));
    expect(actual).toHaveLength(1);
    expect(actual[0]).toEqual(mockMember);
  });

  it('should prevent duplicate member join', () => {
    const stateWithMember = [mockMember];
    const actual = serverMemberReducer(stateWithMember, updateUserJoin(mockMember));
    expect(actual).toHaveLength(1);
  });

  it('should handle updateUserLeave', () => {
    const stateWithMember = [mockMember];
    const actual = serverMemberReducer(
      stateWithMember,
      updateUserLeave({ userId: 'user-1' })
    );
    expect(actual).toHaveLength(0);
  });

  it('should ignore updateMemberStatus for unknown user', () => {
    const stateWithMember = [mockMember];
    const actual = serverMemberReducer(
      stateWithMember,
      updateMemberStatus({ userId: 'unknown', status: 'online' })
    );
    expect(actual[0].status).toEqual('offline');
  });
});
