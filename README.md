# Aetheria - Decentralized Art Museum

A microservices-based decentralized art museum platform that enables artists to upload digital art, mint NFTs on Polygon, and showcase their work in a community-driven gallery.

## 🏗️ Architecture

Aetheria is built as a microservices architecture with the following components:

- **Frontend**: Next.js application deployed on Vercel
- **Backend Services**: 5 microservices deployed on Render
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage for images, IPFS for metadata
- **Blockchain**: Polygon Testnet (Amoy)

### Services

| Service | Port | Responsibility |
|---------|------|----------------|
| auth-service | 4001 | Wallet authentication |
| upload-service | 4002 | Artwork upload handling |
| metadata-service | 4003 | Metadata creation and IPFS pinning |
| mint-service | 4004 | NFT minting on Polygon |
| voting-service | 4005 | Artwork voting system |

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- Supabase account
- Polygon testnet wallet with AMOY tokens
- Web3.Storage account (optional, for IPFS)

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/yourusername/aetheria.git
cd aetheria
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Initialize Supabase database:
```bash
# Run the SQL schema
psql -h <your-supabase-host> -U postgres -f scripts/init_supabase.sql
```

4. Start services with Docker Compose:
```bash
cd infra
docker-compose up -d
```

5. Deploy smart contract to Polygon testnet:
```bash
cd services/contract-service
npm install
npm run deploy:testnet
```

6. Start the frontend:
```bash
cd frontend
npm install
npm run dev
```

## 📁 Project Structure

```
aetheria/
├── frontend/              # Next.js frontend application
├── services/              # Microservices
│   ├── auth-service/     # Wallet authentication
│   ├── upload-service/   # Artwork upload handling
│   ├── metadata-service/ # Metadata creation and IPFS
│   ├── mint-service/     # NFT minting
│   ├── voting-service/   # Voting system
│   └── contract-service/ # Smart contracts and deployment
├── infra/                # Infrastructure configuration
├── scripts/              # Database and seed scripts
└── .github/workflows/    # CI/CD pipelines
```

## 🔐 Environment Variables

Each service requires specific environment variables. See individual service READMEs for details.

Key variables:
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `RPC_URL` - Polygon testnet RPC endpoint
- `MINTER_PRIVATE_KEY` - Wallet private key for minting
- `CONTRACT_ADDRESS` - Deployed NFT contract address
- `WEB3_STORAGE_TOKEN` - Web3.Storage API token

## 🧪 Testing

Run tests for each service:
```bash
cd services/auth-service && npm test
```

## 📦 Deployment

See [infra/README-deploy.md](infra/README-deploy.md) for detailed deployment instructions.

### Service Deployment

Each service is independently deployable on Render:
1. Connect your GitHub repository
2. Create a new Web Service
3. Add environment variables
4. Deploy

### Frontend Deployment

Deploy to Vercel:
```bash
pnpm i --frozen-lockfile || npm i
npm run build
# Deploy on Vercel, set Output Directory to `dist` and Build Command `vite build`
```

### Contract Deployment

Deploy to Polygon testnet:
```bash
cd services/contract-service
npm run deploy:testnet
```

## 🤝 Contributing

This is a demo project for educational purposes.

## 📄 License

MIT License

## 🔗 Links

- [Supabase Dashboard](https://supabase.com/dashboard)
- [Polygon Testnet Explorer](https://amoy.polygonscan.com/)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Render Dashboard](https://render.com/dashboard)

## Frontend (Vite) Quickstart

The new Vite + React frontend lives at repo root. Scripts:

- `npm run dev` – start dev server at http://localhost:5173
- `npm run build` – build to `dist/`
- `npm run preview` – preview production build

Environment variables (Vercel and local `.env`):

- `VITE_API_BASE` – base URL for services (e.g., http://localhost:4001 etc. via gateway)
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_ALCHEMY_URL` (optional)
- `VITE_WALLETCONNECT_PROJECT_ID`


