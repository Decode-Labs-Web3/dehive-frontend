# Dehive Airdrop Subgraph – Example Response Guide

## Example GraphQL Endpoint

```
https://api.studio.thegraph.com/query/1713799/dehive-airdrop/version/latest
```

## Example Query & Response

Below is a sample response you would receive from the Dehive Airdrop Subgraph when requesting all campaign and claim data for a given server (using a keccak256-hashed serverId in the query):

**GraphQL Query**
<details>
<summary>Expand</summary>

```graphql
query GetServerCampaigns($serverId: Bytes!) {
  campaigns(where: { serverId: $serverId }) {
    id
    factory {
      id
      serverId
      owner
      creator
    }
    serverId
    creator
    token
    merkleRoot
    metadataURI
    totalAmount
    claimedAmount
    createdAt
    blockNumber
    claims(orderBy: blockTimestamp, orderDirection: desc) {
      id
      user
      index
      amount
      blockNumber
      blockTimestamp
      transactionHash
    }
  }
}
```
</details>

**Example Request JSON**

```json
{
  "query": "query GetServerCampaigns($serverId: Bytes!) { campaigns(where: { serverId: $serverId }) { id factory { id serverId owner creator } serverId creator token merkleRoot metadataURI totalAmount claimedAmount createdAt blockNumber claims(orderBy: blockTimestamp, orderDirection: desc) { id user index amount blockNumber blockTimestamp transactionHash } } }",
  "variables": {
    "serverId": "0x..." // keccak256 hash (hex)
  }
}
```

**Example Response JSON**

```json
{
	"data": {
		"campaigns": [
			{
				"id": "0x9c800e69fb1dfad968a62318eded7a9ce603eaf2",
				"factory": {
					"id": "0xfe7aac3c7ffafc8b56e4577bac0220eb7460f35a",
					"serverId": "�a��j�^ړ1�2mҀ�k)��j7<1���i",
					"owner": "0x09e23052d4a07d38c85c35af34c9e1d0555243ee",
					"creator": "0x09e23052d4a07d38c85c35af34c9e1d0555243ee"
				},
				"serverId": "�a��j�^ړ1�2mҀ�k)��j7<1���i",
				"creator": "0x09e23052d4a07d38c85c35af34c9e1d0555243ee",
				"token": "0xcc3df6a7a1fae6f1edd72d53a33a1ee215afeb10",
				"merkleRoot": "0xc6249f3baf0a6af3c4acd185a3d2097f5659eed1e8433eecd2aa8d9c49f7231e",
				"metadataURI": "ipfs://test-campaign-sepolia",
				"totalAmount": "350000000000000000000",
				"claimedAmount": "350000000000000000000",
				"createdAt": "1762183584",
				"blockNumber": "9552469",
				"claims": [
					{
						"id": "0x9c800e69fb1dfad968a62318eded7a9ce603eaf2-2",
						"user": "0x09e23052d4a07d38c85c35af34c9e1d0555243ee",
						"index": "2",
						"amount": "50000000000000000000",
						"blockNumber": "9552472",
						"blockTimestamp": "1762183620",
						"transactionHash": "0x2134d6c003ce715262c580fb025b06dea22a0e254cb399bbb1cd7b82bdf7b87a"
					},
					{
						"id": "0x9c800e69fb1dfad968a62318eded7a9ce603eaf2-1",
						"user": "0x39c7043e1aa0ac0809085904b70860ca9bfd3136",
						"index": "1",
						"amount": "200000000000000000000",
						"blockNumber": "9552471",
						"blockTimestamp": "1762183608",
						"transactionHash": "0x9467e3cfacc43a71c359c4eec839087a9d04804f1f72485102cfcd9a81fd5ff6"
					},
					{
						"id": "0x9c800e69fb1dfad968a62318eded7a9ce603eaf2-0",
						"user": "0x72c5af22b30e55b529188c5ce7490f7093fdcce0",
						"index": "0",
						"amount": "100000000000000000000",
						"blockNumber": "9552470",
						"blockTimestamp": "1762183596",
						"transactionHash": "0xc9d42cfb23bd69c79a6c3b10fa0344de047ccf0e629a84b344f956a534874043"
					}
				]
			}
		]
	}
}
```

## How to Use

- Always pass the `serverId` variable as a keccak256 hash (see main guide for hashing instructions).
- Endpoints always return hex values for addresses, and strings for `BigInt`-type fields.
- For full query construction, authentication headers, cURL, or JavaScript usage, refer to the main query documentation.

## See Also

- Refer to the [main subgraph guide](./QUERY_GUIDE.md) for more query patterns, request payloads, and integration examples.
