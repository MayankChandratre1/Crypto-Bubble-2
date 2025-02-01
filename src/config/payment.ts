import { createConfig, http } from 'wagmi';
import { mainnet, polygon } from 'wagmi/chains';
import { getDefaultWallets } from '@rainbow-me/rainbowkit';

// Replace with your actual project ID from WalletConnect
const projectId = 'YOUR_WALLET_CONNECT_PROJECT_ID';

const chains = [mainnet, polygon];

const { connectors } = getDefaultWallets({
  appName: 'CoinChart Premium',
  projectId,
  chains,
});

export const wagmiConfig = createConfig({
  chains,
  connectors,
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
  },
});

export { chains };

export const subscriptionPlans = {
  premium: {
    id: 'premium',
    name: 'CoinChart Premium',
    price: 49,
    description: 'Access to Buy Signals & two Premium TradingView scripts'
  },
  test: {
    id: 'test',
    name: 'Test',
    price: 1,
    description: 'Testing CoinChart subscription'
  }
};