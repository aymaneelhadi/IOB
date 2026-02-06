# Smart Contract Architecture Explained
**Contract Name:** `commercial_devis.aleo`

This document provides a line-by-line technical breakdown of the Leo smart contract that powers the **Two-Wallet Security** model.

## 1. Data Structures

### The `Quote` Struct
This is the "payload" or inner data of our digital asset. It contains the business logic.

```leo
struct Quote {
    issuer: address,      // Who sent it (Company A)
    recipient: address,   // Who receives it (Client B)
    content_hash: field,  // SHA-256 fingerprint of the PDF
    amount: u64,          // Usage amount (visible to owner only)
    status: u8,           // 0 = Pending, 2 = Accepted
}
```

### The `QuoteRecord`
In Aleo, data lives inside a **Record**. This is what handles the privacy and ownership encryption (ECIES).

```leo
record QuoteRecord {
    owner: address,  // CRITICAL: Controls who can decrypt/see this record
    gates: u64,      // Aleo gas fees (usually 0 for created records)
    data: Quote,     // The struct defined above
}
```

---

## 2. Transitions (The Functions)

### A. `create_quote` (The Sending Logic)
This function creates the digital asset and immediately transfers it to the client.

```leo
transition create_quote(
    public recipient: address, 
    public content_hash: field, 
    public amount: u64
) -> QuoteRecord {
    
    // 1. Pack the data
    let quote_data: Quote = Quote {
        issuer: self.caller,     // Automatically set to the Sender
        recipient: recipient,    // User input
        content_hash: content_hash,
        amount: amount,
        status: 0u8,             // Initial status: Draft/Sent
    };

    // 2. Mint the Record
    return QuoteRecord {
        owner: recipient,  // <--- THE LOCK
        gates: 0u64,
        data: quote_data,
    };
}
```
**Why this is Secure:**
By setting `owner: recipient`, the protocol encrypts the output specifically for the Client's public key.
*   **Issuer (Sender):** Can no longer "see" or spend this record. It disappears from their view.
*   **Recipient:** Can now see this record in their wallet and use it in the next step.

### B. `accept_quote` (The Handshake Logic)
This allows the client to "sign" the deal on-chain.

```leo
transition accept_quote(
    public quote_record: QuoteRecord // The input record (must be owned by caller)
) -> QuoteRecord {
    
    // 1. Integrity Check
    // "Is the person clicking 'Accept' actually the Recipient listed in the file?"
    assert_eq(self.caller, quote_record.data.recipient); 

    // 2. Update Status
    let new_quote_data: Quote = Quote {
        issuer: quote_record.data.issuer,
        recipient: quote_record.data.recipient,
        content_hash: quote_record.data.content_hash,
        amount: quote_record.data.amount,
        status: 2u8, // <--- Status changed to "Accepted"
    };

    // 3. Return to Owner
    // We send the updated record back to the recipient to keep as proof.
    return QuoteRecord {
        owner: self.caller,
        gates: 0u64,
        data: new_quote_data,
    };
}
```

## 3. Summary of Flow

1.  **Issuer** runs `create_quote(...)`.
    *   *Result:* A new persistent record is created on the blockchain.
    *   *Privacy:* It is encrypted for the **Recipient**.
2.  **Recipient** (and only Recipient) can now find this record.
3.  **Recipient** runs `accept_quote(record)`.
    *   *Check:* The contract enforces `self.caller == recipient`.
    *   *Result:* The record is consumed, and a new record with `status: 2 (Accepted)` is created.
