import { WalletAdapterNetwork } from '@demox-labs/aleo-wallet-adapter-base';

// Program ID - This should be the actual deployed program ID
export const PROGRAM_ID = 'commercial_devis.aleo';

export const formatAleoString = (str: string) => {
    // Basic helper to ensure inputs align with Leo expectations if needed
    return str;
};

// Helper to convert hex string to a BigInt string for Field inputs if needed
export const hexToField = (hex: string): string => {
    // This is a naive implementation. Real Leo fields are 253-bit. 
    // A full SHA256 (256-bit) might overflow a single field.
    // For this proof of concept, we validly assume we might truncate or use 2 fields in a real real prod app.
    // Here we'll take the first 30 bytes to be safe/simple for the demo "hash".
    return BigInt('0x' + hex.substring(0, 60)).toString() + 'field';
};
