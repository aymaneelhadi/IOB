import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AleoWalletProvider } from './aleo-config';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <AleoWalletProvider>
            <QueryClientProvider client={queryClient}>
                <App />
            </QueryClientProvider>
        </AleoWalletProvider>
    </React.StrictMode>,
)
