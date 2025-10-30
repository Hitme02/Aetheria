# Auth Service

Wallet authentication service for Aetheria.

## Features

- Generate nonces for wallet authentication
- Verify cryptographic signatures
- Upsert user records in Supabase

## API Endpoints

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "service": "auth-service",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### GET /nonce
Generate a nonce for wallet authentication.

**Query Parameters:**
- `wallet` (required): Ethereum wallet address

**Example:**
```bash
curl http://localhost:4001/nonce?wallet=0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
```

**Response:**
```json
{
  "nonce": "random-hex-string"
}
```

### POST /verify
Verify wallet signature and authenticate user.

**Request Body:**
```json
{
  "wallet": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "signature": "0x..."
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "wallet_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "username": null,
    "joined_at": "2024-01-01T00:00:00.000Z"
  }
}
```

## Environment Variables

- `PORT`: Service port (default: 4001)
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build
npm run build

# Run tests
npm test

# Start production server
npm start
```

## Docker

```bash
# Build
docker build -t auth-service .

# Run
docker run -p 4001:4001 --env-file .env auth-service
```

