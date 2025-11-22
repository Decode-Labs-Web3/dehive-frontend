import directMemberReducer, {
  setMemberList,
  updateMemberStatus,
  updateMemberConversation,
} from '../directMemberSlice';
import { DirectMemberListProps } from '@/interfaces/user.interface';

describe('directMemberSlice', () => {
  const initialState: DirectMemberListProps[] = [];

  const mockMember: DirectMemberListProps = {
    user_id: 'user-1',
    username: 'testuser',
    displayname: 'Test User',
    avatar_ipfs_hash: 'hash',
    conversationid: 'conv-1',
    status: 'offline',
    isCall: false,
    lastMessageAt: new Date().toISOString(),
    wallets: [],
    last_seen: new Date().toISOString(),
  };

  it('should handle initial state', () => {
    expect(directMemberReducer(undefined, { type: 'unknown' })).toEqual([]);
  });

  it('should handle setMemberList', () => {
    const members = [mockMember];
    const actual = directMemberReducer(initialState, setMemberList(members));
    expect(actual).toEqual(members);
  });

  it('should handle updateMemberStatus', () => {
    const stateWithMember = [mockMember];
    const actual = directMemberReducer(
      stateWithMember,
      updateMemberStatus({ userId: 'user-1', status: 'online' })
    );
    expect(actual[0].status).toEqual('online');
  });

  it('should ignore updateMemberStatus for unknown user', () => {
    const stateWithMember = [mockMember];
    const actual = directMemberReducer(
      stateWithMember,
      updateMemberStatus({ userId: 'unknown-user', status: 'online' })
    );
    expect(actual[0].status).toEqual('offline');
  });

  it('should handle updateMemberConversation and sort by lastMessageAt', () => {
    const member1 = { ...mockMember, conversationid: 'conv-1', lastMessageAt: '2023-01-01T10:00:00Z' };
    const member2 = { ...mockMember, user_id: 'user-2', conversationid: 'conv-2', lastMessageAt: '2023-01-01T09:00:00Z' };
    const state = [member2, member1]; // Initial order: member2 (older), member1 (newer)

    // Update member2 to be newer
    const actual = directMemberReducer(
      state,
      updateMemberConversation({
        conversationId: 'conv-2',
        status: 'online',
        isCall: true,
        lastMessageAt: '2023-01-01T11:00:00Z'
      })
    );

    expect(actual[0].conversationid).toEqual('conv-2'); // Should be first now
    expect(actual[0].isCall).toBe(true);
    expect(actual[1].conversationid).toEqual('conv-1');
  });


});
