# Metadata Service

Metadata creation and IPFS pinning service for Aetheria.

## Features

- Build artwork metadata JSON
- Pin metadata to IPFS via Web3.Storage
- Update database with metadata URI

## API Endpoints

### GET /health
Health check endpoint.

### POST /metadata
Create metadata for an artwork.

**Request:**
```json
{
  "artworkId": "uuid"
}
```

**Response:**
```json
{
  "metadata_uri": "ipfs://Qm...",
  "metadata": {
    "name": "Artwork Title",
    "description": "Description",
    "image": "https://...",
    "hash": "sha256-hash"
  }
}
```

### GET /metadata/:artworkId
Get metadata for an artwork.

## Environment Variables

- `PORT`: Service port (default: 4003)
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key
- `WEB3_STORAGE_TOKEN`: Web3.Storage API token (optional)

## Development

```bash
npm install
npm run dev
```

## Docker

```bash
docker build -t metadata-service .
docker run -p 4003:4003 --env-file .env metadata-service
```

