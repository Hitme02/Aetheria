import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';
import { mainnet, polygon, sepolia, polygonAmoy } from 'viem/chains';

const alchemyUrl = import.meta.env.VITE_ALCHEMY_URL as string | undefined;

export const wagmiConfig = getDefaultConfig({
  appName: 'Aetheria',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'demo-project',
  chains: [sepolia, polygonAmoy, mainnet, polygon],
  transports: {
    [sepolia.id]: http(alchemyUrl || 'https://rpc.sepolia.org'),
    [polygonAmoy.id]: http(),
    [mainnet.id]: http(),
    [polygon.id]: http()
  },
  ssr: false
});

