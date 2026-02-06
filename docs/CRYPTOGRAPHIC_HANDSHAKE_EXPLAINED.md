# Cryptographic Handshake & Integrity Verification: Protocol Architecture

> **Note:** This document describes the *designed cryptographic protocol* and the interactions defined by the Leo Smart Contract. The current React Frontend is a UI prototype and may mock some of these steps (like the explicit "Verify" tab) for demonstration purposes.

## 1. Overview
This document details the cryptographic "handshake" protocol used in A&A to verify the authenticity of commercial quotes without revealing their contents to the public network. It combines **Client-Side Hashing**, **Zero-Knowledge Proofs (Leo/Aleo)**, and **On-Chain State Validation**.

## 2. The Actors
*   **Issuer (User A)**: The business creating the quote.
*   **Frontend (React App)**: The local application running in the browser (No backend server).
*   **Aleo Wallet**: The browser extension managing private keys and generating ZK proofs.
*   **Recipient (User B)**: The client receiving the quote.

## 3. Detailed Workflow

### Phase 1: Local Generation (The "Secret")
**Step:** `Generate PDF (RAM) & Hash`

1.  **Input:** The Issuer fills in the Quote details (Client Name: "SpaceX", Amount: "$50,000", Items...).
2.  **PDF-in-RAM:** Using `jsPDF`, the frontend generates the PDF binary data entirely within the browser's memory. *Critically, this file is never sent to a centralized server.*
3.  **Hashing:** The frontend immediately runs a **SHA-256** hash function on the binary PDF data.
    *   `Hash = SHA256(PDF_Binary)`
    *   This `Hash` acts as the unique digital fingerprint of the document. Changing a single pixel in the PDF would completely change this hash.

### Phase 2: The Zero-Knowledge Commitment (On-Chain)
**Step:** `Sign 'create_quote(Hash)'` -> `Confirmed (ZK Proof)`

1.  **Transition Call:** The frontend constructs a transaction for the Leo Smart Contract function `create_quote`.
    *   **Input 1:** `recipient` (Address of User B)
    *   **Input 2:** `content_hash` (The SHA-256 fingerprint we just generated)
    *   **Input 3:** `amount` (Optional public metadata)
2.  **ZK Proof Generation:** The Aleo Wallet takes these inputs and generates a Zero-Knowledge Proof locally.
    *   **What it proves:** "I accept the transition constraints without revealing my private key."
3.  **On-Chain Record:** The transaction is broadcast. A new `QuoteRecord` is created on the Aleo Blockchain.
    *   **Encryption:** The record is encrypted specifically for the **Recipient's** view key. Only the recipient can see this record exists.
    *   **Public Data:** The network sees a valid transaction occurred, but cannot see the `content_hash` or the business details.

### Phase 3: Off-Chain Transmission
**Step:** `Send PDF (Off-Chain)`

1.  **Issuer Action:** The Issuer downloads the exact PDF byte-stream that was hashed.
2.  **Transmission:** This file is sent to the Recipient (Email, Slack, etc.).
    *   *Note: This mimics the "Invoicing" step in real business.*

### Phase 4: The Handshake (Verification)
**Step:** `Upload PDF` -> `Fetch Record` -> `Privacy Check`

*This is the logic where "Demo Mode" and "Real Mode" converge to enforce security.*

1.  **Input:** The Recipient drags the received PDF into the "Verify" zone.
2.  **Re-Hashing:** The App calculates `SHA256(Received_File)`.
3.  **The Privacy Filter (Critical Security Step):**
    *   The App queries the available Records (from Blockchain or Secure Local Storage).
    *   **It strictly filters records:** `Record.owner == Current_Wallet_Address`.
    *   *If User A (Issuer) tries to verify:* The record exists, but `Record.owner` is User B. The App **hides** the record. -> **Verification Failed.**
    *   *If User B (Recipient) tries to verify:* The record exists and `Record.owner` matches User B. The App **reveals** the record.
4.  **Match:** If a visible record matches the `SHA256` hash, the green "Verified" badge appears.

## 4. Why this is Secure (Demo & Live)

### The "Two-Wallet" Requirement
By strictly enforcing the address check in the frontend logic (and inherently by the protocol encryption on-chain), we ensure:
*   **Confidentiality:** Even if the Issuer (User A) has the file, they cannot generate the cryptographic proof of *ownership* because the record was transferred to User B.
*   **Authenticity:** Only the exact file content generates the correct hash to unlock the record.

### Demo Mode Simulation
In the "Local Demo Mode" (when blockchain is offline/unfunded):
1.  We save the `Record` JSON to browser storage.
2.  We explicitly tag it with `owner: recipient_address`.
3.  During verification, we **simulate the view key constraint** by filtering the list:
    ```javascript
    const myRecords = allRecords.filter(r => r.owner === connectedWalletAddress);
    ```
4.  This creates a faithful representation of the ZK-Privacy experience: you must *be* the recipient to see the proof.

## 5. Performance Notes: The "Cost" of Privacy
You may notice a delay (15-60s) during the "Broadcasting to Aleo" step. This is **not** network lag; it is **Computation**.

### Why it takes time
Unlike Ethereum (where you sign ~1KB of data and send it), Aleo requires your device to **generate a Zero-Knowledge Proof** locally before sending anything.
*   **The Work:** Your browser is mathematically proving "I have valid inputs for the `create_quote` function" without revealing the inputs.
*   **The Benefit:** This is why the network *never* sees your business data. The latency is the price of absolute privacy.

### Handling it in the App
To ensure a smooth user experience even if the proof generation is slow or the testnet is congested:
1.  **Optimistic Updates:** We show the "Generating..." state immediately.
2.  **Demo Fallback:** If the user rejects the slow transaction or the network fails, the App **automatically falls back** to the Local Demo Mode so the presentation flow remains uninterrupted.
