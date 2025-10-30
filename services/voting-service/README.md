# Voting Service

Voting system for Aetheria artworks.

## Features

- Record votes for artworks
- Enforce one vote per user per artwork
- Increment vote count
- Get featured artworks

## API Endpoints

### GET /health
Health check endpoint.

### POST /vote
Record a vote for an artwork.

**Request:**
```json
{
  "artworkId": "uuid",
  "voterWallet": "0x..."
}
```

**Response:**
```json
{
  "success": true,
  "vote": {
    "id": "uuid",
    "artwork_id": "uuid",
    "user_wallet": "0x...",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### GET /featured?n=3
Get top N featured artworks by vote count.

**Response:**
```json
{
  "count": 3,
  "artworks": [
    {
      "id": "uuid",
      "title": "Digital Dreams",
      "vote_count": 20,
      ...
    }
  ]
}
```

### GET /votes/:artworkId
Get vote count for an artwork.

## Environment Variables

- `PORT`: Service port (default: 4005)
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key

## Development

```bash
npm install
npm run dev
```

## Docker

```bash
docker build -t voting-service .
docker run -p 4005:4005 --env-file .env voting-service
```

