# Aetheria Deployment Guide

This guide explains how to deploy Aetheria to production.

## 🏗️ Architecture

- **Frontend**: Vercel (Next.js)
- **Backend Services**: Render (5 microservices)
- **Database**: Supabase (PostgreSQL + Auth + Storage)
- **Blockchain**: Polygon Testnet (Amoy)
- **Storage**: Supabase Storage + IPFS (Web3.Storage)

## 📋 Prerequisites

1. **GitHub Account**: For repository and CI/CD
2. **Vercel Account**: For frontend deployment
3. **Render Account**: For backend services
4. **Supabase Project**: For database and storage
5. **Web3.Storage Account**: For IPFS pinning (optional)
6. **Polygon Wallet**: With AMOY testnet tokens

## 🚀 Deployment Steps

### 1. Setup Supabase

1. Create a new Supabase project at https://supabase.com
2. Run the SQL schema:
   ```bash
   psql -h <host> -U postgres -f scripts/init_supabase.sql
   ```
3. Create a storage bucket named `artworks` (Public)
4. Get your project URL and service role key from Settings > API

### 2. Deploy Smart Contract

1. Go to `services/contract-service`
2. Configure `.env`:
   ```bash
   RPC_URL=https://rpc-amoy.polygon.technology
   PRIVATE_KEY=your-private-key
   POLYGONSCAN_API_KEY=your-api-key
   ```
3. Deploy:
   ```bash
   npm install
   npm run deploy:testnet
   ```
4. Copy the contract address to your `.env` files

### 3. Deploy Backend Services to Render

For each service (auth, upload, metadata, mint, voting):

1. Go to Render Dashboard
2. Click "New" > "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `aetheria-auth-service`
   - **Root Directory**: `services/auth-service`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/health`
   - **Environment**: Node
5. Add environment variables:
   ```
   PORT=4001
   SUPABASE_URL=https://...
   SUPABASE_SERVICE_ROLE_KEY=...
   ```
6. Deploy

Repeat for upload, metadata, mint, and voting services with their respective ports and configurations.

### 4. Deploy Frontend to Vercel

1. Go to Vercel Dashboard
2. Import your GitHub repository
3. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
4. Add environment variables:
   ```
   NEXT_PUBLIC_API_BASE=https://your-auth-service-url.onrender.com
   NEXT_PUBLIC_SUPABASE_URL=https://...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```
5. Deploy

### 5. Configure CI/CD

1. Add GitHub secrets:
   - `RENDER_API_KEY`: From Render Dashboard
   - `VERCEL_TOKEN`: From Vercel Dashboard
   - `MINTER_PRIVATE_KEY`: Your wallet private key

2. Push to `main` branch to trigger deployment

## 🔧 Local Development

### Start Services Locally

```bash
# Copy .env.example to .env and fill in values
cp .env.example .env

# Start all services
cd infra
docker-compose up -d

# Check logs
docker-compose logs -f
```

### Run Frontend Locally

```bash
cd frontend
npm install
npm run dev
```

## 🧪 Testing

### Test Each Service

```bash
# Auth service
curl http://localhost:4001/health

# Upload service
curl http://localhost:4002/health

# Metadata service
curl http://localhost:4003/health

# Mint service
curl http://localhost:4004/health

# Voting service
curl http://localhost:4005/health
```

### Test Full Flow

1. Authenticate: `POST /auth/nonce` → sign → `POST /auth/verify`
2. Upload artwork: `POST /upload`
3. Create metadata: `POST /metadata` with artworkId
4. Mint NFT: `POST /mint` with artworkId (requires auth token)
5. Vote: `POST /vote`
6. View featured: `GET /featured?n=3`

## 📝 Environment Variables Checklist

### Supabase
- [ ] SUPABASE_URL
- [ ] SUPABASE_SERVICE_ROLE_KEY
- [ ] SUPABASE_ANON_KEY

### Blockchain
- [ ] RPC_URL (Polygon Amoy)
- [ ] PRIVATE_KEY (minter wallet)
- [ ] CONTRACT_ADDRESS
- [ ] POLYGONSCAN_API_KEY (optional)

### Services
- [ ] MINTER_AUTH_TOKEN (secure random string)
- [ ] WEB3_STORAGE_TOKEN (optional)

## 🔒 Security Notes

1. **Never expose private keys** in client-side code
2. **Use environment variables** for all secrets
3. **Enable HTTPS** for all services
4. **Set up rate limiting** on public endpoints
5. **Use Supabase RLS** for database access control

## 🐛 Troubleshooting

### Services not starting
- Check environment variables
- Check health endpoints
- Review logs: `docker-compose logs <service>`

### Minting failing
- Check contract address is correct
- Verify wallet has MATIC
- Check private key is valid

### Upload failing
- Verify Supabase storage bucket exists
- Check service role key
- Verify file size limits

## 📞 Support

For issues:
1. Check service logs
2. Verify environment variables
3. Test endpoints with `curl` or Postman
4. Review Supabase dashboard for database errors

## 🎉 Success!

Once deployed, you should have:
- ✅ Frontend on Vercel
- ✅ 5 services on Render
- ✅ Database on Supabase
- ✅ Contract on Polygon testnet
- ✅ CI/CD pipeline active

Happy building! 🎨

