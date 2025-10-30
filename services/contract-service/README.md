# Contract Service

Smart contracts for Aetheria NFT minting.

## Contract

**AetheriaExhibitNFT.sol** - ERC-721 NFT contract for artworks

Features:
- Inherits from OpenZeppelin's ERC721URIStorage
- Minting restricted to contract owner
- Emits Minted event with creator, tokenId, and tokenURI

## Setup

```bash
npm install
```

## Configuration

Set environment variables in `.env`:

```bash
RPC_URL=https://rpc-amoy.polygon.technology
PRIVATE_KEY=your-private-key-here
POLYGONSCAN_API_KEY=your-api-key-here
```

## Compile

```bash
npm run compile
```

## Deploy

### Local Network

```bash
npm run deploy:local
```

### Polygon Amoy Testnet

```bash
npm run deploy:testnet
```

After deployment, update your `.env` files with the contract address.

## Verify

```bash
npm run verify
```

## Test

```bash
npm test
```

## Testnet Information

- **Network**: Polygon Amoy
- **Explorer**: https://amoy.polygonscan.com/
- **Faucet**: https://faucet.polygon.technology/

## Deployment Address

Update this after deploying:

```
CONTRACT_ADDRESS=0x...
```

