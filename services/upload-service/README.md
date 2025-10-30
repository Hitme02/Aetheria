# Upload Service

Artwork upload service for Aetheria.

## Features

- Accept multipart form uploads
- Compute SHA-256 hash
- Store files in Supabase Storage
- Create artwork records in database

## API Endpoints

### GET /health
Health check endpoint.

### POST /upload
Upload an artwork image.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body:
  - `file`: Image file (required)
  - `title`: Artwork title (required)
  - `description`: Artwork description (required)
  - `creator_wallet`: Creator's wallet address (required)

**Example:**
```bash
curl -X POST http://localhost:4002/upload \
  -F "file=@artwork.jpg" \
  -F "title=My Artwork" \
  -F "description=Beautiful digital art" \
  -F "creator_wallet=0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
```

**Response:**
```json
{
  "artworkId": "uuid",
  "hash": "sha256-hash",
  "image_url": "https://...",
  "title": "My Artwork",
  "description": "Beautiful digital art"
}
```

## Environment Variables

- `PORT`: Service port (default: 4002)
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key

## Development

```bash
npm install
npm run dev
```

## Docker

```bash
docker build -t upload-service .
docker run -p 4002:4002 --env-file .env upload-service
```

