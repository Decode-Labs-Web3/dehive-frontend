import serverRootReducer, {
  setServerRoot,
  setCategoryCreate,
  setCategoryUpdate,
  setCategoryDelete,
  setChannelCreate,
  setChannelEdit,
  setChannelDelete,
  setChannelMove,
  userJoinChannel,
  userLeftChannel,
} from '../serverRootSlice';
import { CategoryProps, ChannelProps } from '@/interfaces/server.interface';

describe('serverRootSlice', () => {
  const initialState: CategoryProps[] = [];

  const mockChannel: ChannelProps = {
    _id: 'channel-1',
    name: 'General',
    type: 'text',
    category_id: 'cat-1',
    participants: [],
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01',
    __v: 0,
  };

  const mockCategory: CategoryProps = {
    _id: 'cat-1',
    name: 'General Category',
    server_id: 'server-1',
    channels: [mockChannel],
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01',
    __v: 0,
  };

  it('should handle initial state', () => {
    expect(serverRootReducer(undefined, { type: 'unknown' })).toEqual([]);
  });

  it('should handle setServerRoot', () => {
    const categories = [mockCategory];
    const actual = serverRootReducer(initialState, setServerRoot(categories));
    expect(actual).toEqual(categories);
  });

  it('should handle setCategoryCreate', () => {
    const actual = serverRootReducer(initialState, setCategoryCreate(mockCategory));
    expect(actual).toHaveLength(1);
    expect(actual[0]).toEqual(mockCategory);
  });

  it('should handle setCategoryUpdate', () => {
    const stateWithCategory = [mockCategory];
    const actual = serverRootReducer(
      stateWithCategory,
      setCategoryUpdate({ categoryId: 'cat-1', name: 'Updated Category' })
    );
    expect(actual[0].name).toEqual('Updated Category');
  });

  it('should handle setCategoryDelete', () => {
    const stateWithCategory = [mockCategory];
    const actual = serverRootReducer(
      stateWithCategory,
      setCategoryDelete({ categoryId: 'cat-1' })
    );
    expect(actual).toHaveLength(0);
  });

  it('should handle setChannelCreate', () => {
    const categoryWithoutChannel: CategoryProps = { ...mockCategory, channels: [] };
    const state = [categoryWithoutChannel];

    const actual = serverRootReducer(state, setChannelCreate(mockChannel));

    expect(actual[0].channels).toHaveLength(1);
    expect(actual[0].channels[0]).toEqual(mockChannel);
  });

  it('should prevent duplicate channel creation', () => {
    const state = [mockCategory];
    const actual = serverRootReducer(state, setChannelCreate(mockChannel));
    expect(actual[0].channels).toHaveLength(1);
  });

  it('should handle setChannelEdit', () => {
    const state = [mockCategory];
    const actual = serverRootReducer(
      state,
      setChannelEdit({ channelId: 'channel-1', name: 'Edited Channel' })
    );
    expect(actual[0].channels[0].name).toEqual('Edited Channel');
  });

  it('should handle setChannelDelete', () => {
    const state = [mockCategory];
    const actual = serverRootReducer(
      state,
      setChannelDelete({ channelId: 'channel-1' })
    );
    expect(actual[0].channels).toHaveLength(0);
  });

  it('should handle setChannelMove', () => {
    const sourceCat = { ...mockCategory, _id: 'cat-1', channels: [mockChannel] };
    const targetCat = { ...mockCategory, _id: 'cat-2', channels: [] };
    const state = [sourceCat, targetCat];

    const actual = serverRootReducer(
      state,
      setChannelMove({
        sourceCategoryId: 'cat-1',
        targetCategoryId: 'cat-2',
        channelId: 'channel-1'
      })
    );

    expect(actual[0].channels).toHaveLength(0);
    expect(actual[1].channels).toHaveLength(1);
    expect(actual[1].channels[0]._id).toEqual('channel-1');
  });

  it('should handle userJoinChannel', () => {
    const state = [mockCategory];
    const userInfo = {
      _id: 'user-1',
      username: 'newuser',
      display_name: 'New User',
      avatar_ipfs_hash: 'hash',
      isCamera: false,
      isMic: false,
      isHeadphone: false,
      isLive: false
    };

    const actual = serverRootReducer(
      state,
      userJoinChannel({
        channel_id: 'channel-1',
        user_id: 'user-1',
        user_info: userInfo
      })
    );

    expect(actual[0].channels[0].participants).toHaveLength(1);
    expect(actual[0].channels[0].participants?.[0]).toEqual(userInfo);
  });

  it('should handle userLeftChannel', () => {
    const userInfo = {
      _id: 'user-1',
      username: 'user',
      display_name: 'User',
      avatar_ipfs_hash: 'hash',
      isCamera: false,
      isMic: false,
      isHeadphone: false,
      isLive: false
    };
    const channelWithUser = { ...mockChannel, participants: [userInfo] };
    const categoryWithUser = { ...mockCategory, channels: [channelWithUser] };
    const state = [categoryWithUser];

    const actual = serverRootReducer(
      state,
      userLeftChannel({ channel_id: 'channel-1', user_id: 'user-1' })
    );

    expect(actual[0].channels[0].participants).toHaveLength(0);
  });
});
