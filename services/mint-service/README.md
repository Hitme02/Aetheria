# Mint Service

NFT minting service for Aetheria.

## Features

- Mint NFTs using ERC-721 contract
- Update artwork records with token ID and transaction hash
- Secure authentication required

## API Endpoints

### GET /health
Health check endpoint.

### POST /mint
Mint an NFT for an artwork.

**Headers:**
- `Authorization: Bearer <MINTER_AUTH_TOKEN>`

**Request:**
```json
{
  "artworkId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "tx_hash": "0x...",
  "token_id": 1,
  "artwork_id": "uuid"
}
```

## Environment Variables

- `PORT`: Service port (default: 4004)
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key
- `RPC_URL`: Polygon testnet RPC endpoint
- `PRIVATE_KEY`: Wallet private key for minting
- `CONTRACT_ADDRESS`: Deployed NFT contract address
- `MINTER_AUTH_TOKEN`: Secret token for API authentication

## Security

⚠️ Never expose `PRIVATE_KEY` or `MINTER_AUTH_TOKEN` in frontend code.

## Development

```bash
npm install
npm run dev
```

## Docker

```bash
docker build -t mint-service .
docker run -p 4004:4004 --env-file .env mint-service
```

