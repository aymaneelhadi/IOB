export async function calculateSHA256(data: ArrayBuffer | string): Promise<string> {
    const buffer = typeof data === 'string'
        ? new TextEncoder().encode(data)
        : data;

    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return hashHex;
}

export async function fileToHash(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    // We can also convert to BigInt string if needed by Leo, but hex is standard first step
    // Leo 'field' type often expects a numeric representation, so we might need conversion.
    // For this prototype, we'll return the Hex string and let the caller handle BigInt conversion if strictly needed,
    // though usually fitting a full SHA256 into a single Field element requires splitting or specific encoding.
    // For simplicity in this demo, we will treat the hash as a simple field input (implying it might be truncated or mapped).
    return calculateSHA256(arrayBuffer);
}
