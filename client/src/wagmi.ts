import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
    appName: 'A&A Commercial Quotes',
    projectId: 'YOUR_PROJECT_ID', // Replaced with a placeholder or public one if needed, but standard connects work without one for some wallets
    chains: [sepolia],
    ssr: false, // If your dApp uses server side rendering (SSR)
});
