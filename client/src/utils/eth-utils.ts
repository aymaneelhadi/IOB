import { isAddress } from 'viem';

export const validateEthAddress = (address: string): boolean => {
    return isAddress(address);
};

export const formatEthAddress = (address: string): string => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
};
