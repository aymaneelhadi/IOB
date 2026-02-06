# A&A Commercial: Comprehensive Project Guide

> **Authors:** Aymane El Hadi & Aymane Lachhab
> **Version:** 1.0
> **Date:** January 2026

---

## 1. Executive Summary

**A&A Commercial** is a decentralized application (dApp) built on the **Aleo Blockchain** that enables businesses to issue legally binding, immutable commercial quotes (devis) while maintaining absolute privacy.

By leveraging Aleo's **Zero-Knowledge Proofs (ZKPs)**, A&A solves the critical conflict between blockchain transparency and business confidentiality. It allows companies to prove a quote was sent and accepted without ever revealing the client's name, the pricing, or the terms to the public network.

---

## 2. The Problem: The "Privacy Paradox"

In the current blockchain landscape, businesses face a dilemma:

*   **Public Blockchains (Ethereum, Solana):** Offer security and immutability, but **0% Privacy**. If a supplier sends a quote on Ethereum, the entire world (including competitors) sees the price. This negates competitive advantage.
*   **Web2 Solutions (DocuSign, QuickBooks):** Offer privacy, but **Zero Immutability**. You must trust a central server not to be hacked or manipulated.

Businesses need the security of a blockchain with the confidentiality of a private server.

---

## 3. The Solution: A&A Commercial

We utilize the **Aleo Network**, a privacy-first blockchain, to create a system where:
1.  **Transactions are Verified:** The network confirms the quote follows all rules (e.g., valid signature, positive amount).
2.  **Data is Hidden:** The actual contents (Prices, Client Names) are encrypted inside a Zero-Knowledge Proof.

**Result:** A verifiable, legally binding "State of Truth" shared between two parties, with no data leakage to third parties.

---

## 4. Technical Architecture

A&A follows a **"Zero-Server"** architecture to ensure maximum privacy. We do not store user data on any centralized backend.

```mermaid
graph LR
    User[User (Browser)] -- "1. Input Data" --> ReactApp[React Frontend Client]
    ReactApp -- "2. Generate PDF & Hash (In-Memory)" --> JS_Lib[jsPDF + SHA256]
    JS_Lib -- "3. Request Sign" --> Wallet[Leo Wallet Extension]
    Wallet -- "4. ZK Proof Generation" --> LocalProver[Local ZK Prover]
    LocalProver -- "5. Submit Transaction" --> AleoNet[Aleo Blockchain (Testnet)]
    AleoNet -- "6. Sync State" --> Wallet
```

### Key Architectural Decisions:
*   **Thick Client:** All logic (PDF generation, Hashing) happens in the user's browser (Client-Side).
*   **Direct Blockchain Communication:** The frontend communicates directly with the blockchain via the Wallet Adapter.
*   **No Database:** There is no SQL/NoSQL database. The Blockchain is the only state.

---

## 5. Component Deep Dive

### A. The Frontend (Client)
*   **Path:** `/client`
*   **Stack:** React, Vite, TypeScript, TailwindCSS.
*   **Wallet Adapter:** `@demox-labs/aleo-wallet-adapter-react`.
*   **Function:**
    *   Manages user input.
    *   Generates PDFs in-memory using `jsPDF`.
    *   Computes SHA-256 hashes of the documents.
    *   Constructs transaction payloads for the Leo Wallet.

### B. The Smart Contract (Backend)
*   **Path:** `/commercial_devis`
*   **Language:** Leo
*   **Logic:**
    *   **Struct `Quote`**:
        ```leo
        struct Quote {
            issuer: address,
            recipient: address,
            content_hash: field, // The 'Fingerprint' of the document
            amount: u64,
            status: u8,          // 0=Draft, 1=Sent, 2=Accepted
        }
        ```
    *   **Transition `create_quote`**: Takes the hash and amount, creates a record owned by the recipient.
    *   **Transition `accept_quote`**: Allows the recipient to lock the state as "Accepted".

### C. Deep Dive: ReactApp → jsPDF + SHA256 (In-Memory)
You asked specifically about: `ReactApp -- "Generate PDF & Hash" --> JS_Lib`. Here is exactly what happens in that step, which is the "Secret Sauce" of our privacy model.

#### 1. The Workflow
*   **Input**: The user types "SpaceX" and "$50,000" into the React form.
*   **Generation (jsPDF)**:
    *   Instead of sending this data to a server to create a PDF, the React app uses the `jsPDF` library to draw the PDF *programmatically* inside the browser's memory (RAM).
    *   It draws the logo, the lines, and the text (e.g., `doc.text('SpaceX', 10, 10)`).
    *   **Crucial**: This data exists ONLY in the user's RAM. It has not crossed the internet.
*   **Hashing (SHA-256)**:
    *   Once the PDF is generated in memory, we convert it to a binary string (Blob).
    *   We run a **SHA-256 Hashing Algorithm** on this binary string.
    *   The result is a fixed string (e.g., `a7f9...32d`). This is the "Digital Fingerprint".
*   **Transaction Construction**:
    *   The app takes this Fingerprint (`content_hash`) and sends it to the Leo Wallet.
    *   The Wallet creates the ZK Proof using this hash.

#### 2. Why "In-Memory" Matters?
*   **Privacy**: If we generated the PDF on a server, that server would see "SpaceX pays $50k". By doing it in-memory, no one sees it but the user.
*   **Trust**: The `content_hash` on the blockchain matches the PDF file exactly. If the user later sends the PDF to SpaceX via email, SpaceX can hash that file and see if it matches the blockchain record.
*   **Verification**: `Hash(Received PDF) == On-Chain Hash`.

> **Note on Current Prototype**: In the current version of the code (`App.tsx`), we use `jsPDF` to generate the file for download, but the *hashing and blockchain submission* steps are currently simulated (mocked) for the demo. The architecture described above is the target implementation for the Mainnet release.

### D. Cryptography & The "Integrity Lock"
How do we prove the PDF is real without storing it on-chain?
1.  **Hashing:** We generate a **SHA-256 Hash** of the PDF file content.
2.  **On-Chain Storage:** Only this hash (converted to a `field` type) is stored in the `QuoteRecord`.
3.  **Verification:** If the user presents a PDF, we hash it again. If `Hash(PDF) == OnChainHash`, the document is authentic. If a single pixel changes, the check fails.

---

## 6. Security Model

| Threat | Mitigation |
| :--- | :--- |
| **Server Hack** | **Impossible.** There is no central server to hack. |
| **Data Leak** | **Zero-Knowledge.** On-chain data is encrypted. Only the owner can decrypt it. |
| **Forgery** | **Cryptographic Signatures.** Only the private key holder can issue/accept quotes. |
| **Tampering** | **Immutability.** Once on-chain, the `content_hash` cannot be changed. |

---

## 7. User Workflow

1.  **Initialize:** User opens the web app.
2.  **Connect:** User connects their **Leo Wallet** (Testnet Beta).
3.  **Draft:** User enters quote details (Client: "SpaceX", Amount: "50,000").
4.  **Issue:** 
    *   App generates PDF & Hash.
    *   User signs the `create_quote` transaction in their wallet.
    *   Zero-Knowledge Proof is generated locally.
    *   Transaction is mined.
5.  **Receive:** The Recipient (SpaceX) sees a new `QuoteRecord` in their wallet.
6.  **Verify & Accept:** Recipient reviews the PDF (off-chain exchange) and verifies the hash matches their record, then calls `accept_quote`.

---

## 8. Development Roadmap

*   **Phase 1 (Current):** Prototype on Aleo Testnet Beta. Basic Quote lifecycle.
*   **Phase 2:** **IPFS Integration**. Storing the encrypted PDF bodies on decentralized storage so users don't have to email files manually.
*   **Phase 3:** **Multi-Signature**. Implementing 2-of-3 signatures for high-value quotes (CEO + CFO approval).
*   **Phase 4:** **Mainnet Launch**.

---

This document serves as the single source of truth for the functional and technical understanding of the **A&A Commercial** project.
