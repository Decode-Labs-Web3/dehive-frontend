import serverListReducer, {
  setServersList,
  createServer,
  editServerInfo,
  deleteServer,
  editSereverTags,
  editServerAvatar,
  editOwnership,
  editServerNFTGating,
} from '../serverListSlice';
import { ServerProps } from '@/interfaces/server.interface';

describe('serverListSlice', () => {
  const initialState: ServerProps[] = [];

  const mockServer: ServerProps = {
    _id: 'server-1',
    name: 'Test Server',
    description: 'A test server',
    owner_id: 'user-1',
    member_count: 1,
    is_private: false,
    tags: ['gaming'],
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01',
    __v: 0,
  };

  it('should handle initial state', () => {
    expect(serverListReducer(undefined, { type: 'unknown' })).toEqual([]);
  });

  it('should handle setServersList', () => {
    const servers = [mockServer];
    const actual = serverListReducer(initialState, setServersList(servers));
    expect(actual).toEqual(servers);
  });

  it('should handle createServer', () => {
    const actual = serverListReducer(initialState, createServer(mockServer));
    expect(actual).toHaveLength(1);
    expect(actual[0]).toEqual(mockServer);
  });

  it('should not create duplicate server', () => {
    const stateWithServer = [mockServer];
    const actual = serverListReducer(stateWithServer, createServer(mockServer));
    expect(actual).toHaveLength(1);
  });

  it('should handle editServerInfo', () => {
    const stateWithServer = [mockServer];
    const updatePayload = {
      serverId: 'server-1',
      name: 'Updated Name',
      description: 'Updated Description',
    };

    const actual = serverListReducer(stateWithServer, editServerInfo(updatePayload));

    expect(actual[0].name).toEqual('Updated Name');
    expect(actual[0].description).toEqual('Updated Description');
  });

  it('should handle deleteServer', () => {
    const stateWithServer = [mockServer];
    const actual = serverListReducer(stateWithServer, deleteServer({ serverId: 'server-1' }));
    expect(actual).toHaveLength(0);
  });

  it('should handle editSereverTags', () => {
    const stateWithServer = [mockServer];
    const actual = serverListReducer(
      stateWithServer,
      editSereverTags({ serverId: 'server-1', tags: 'new-tag' })
    );
    expect(actual[0].tags).toEqual(['new-tag']);
  });

  it('should handle editServerAvatar', () => {
    const stateWithServer = [mockServer];
    const actual = serverListReducer(
      stateWithServer,
      editServerAvatar({ serverId: 'server-1', avatar_hash: 'new-hash' })
    );
    expect(actual[0].avatar_hash).toEqual('new-hash');
  });

  it('should handle editOwnership', () => {
    const stateWithServer = [mockServer];
    const actual = serverListReducer(
      stateWithServer,
      editOwnership({ serverId: 'server-1', newOwnerId: 'user-2' })
    );
    expect(actual[0].owner_id).toEqual('user-2');
  });

  it('should handle editServerNFTGating', () => {
    const stateWithServer = [mockServer];
    const updatedServer = {
      ...mockServer,
      nft_gated: {
        enabled: true,
        network: 'eth',
        chain_id: '1',
        contract_address: '0x123',
        required_balance: 100
      }
    };

    const actual = serverListReducer(
      stateWithServer,
      editServerNFTGating({ serverId: 'server-1', server: updatedServer })
    );
    expect(actual[0].nft_gated?.enabled).toBe(true);
    expect(actual[0].nft_gated?.contract_address).toBe('0x123');
  });

  it('should ignore edits for unknown server', () => {
    const stateWithServer = [mockServer];

    let actual = serverListReducer(stateWithServer, editServerInfo({ serverId: 'unknown', name: 'New', description: 'Desc' }));
    expect(actual[0].name).toEqual('Test Server');

    actual = serverListReducer(stateWithServer, editSereverTags({ serverId: 'unknown', tags: 'tag' }));
    expect(actual[0].tags).toEqual(['gaming']);
  });
});
