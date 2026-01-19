
/**
 * Formats a number as a u64 Aleo integer string.
 * @param amount The number to format
 * @returns string like "5000u64"
 */
export const formatU64 = (amount: number | string): string => {
    return `${amount}u64`;
};

/**
 * Generates a mock field element for the content hash.
 * In a real app, this would be the Poseidon hash of the PDF file.
 * @returns string like "123456789field"
 */
export const generateContentHash = (): string => {
    // Generate a random number for the field
    const random = Math.floor(Math.random() * 1000000000);
    return `${random}field`;
};

/**
 * Validates an Aleo address.
 * Rules: Must start with 'aleo1' and be 63 characters long.
 * @param address The address to validate
 * @returns true if valid, false otherwise
 */
export const validateAleoAddress = (address: string): boolean => {
    if (!address) return false;
    if (!address.startsWith('aleo1')) return false;
    if (address.length !== 63) return false;
    return true;
};
