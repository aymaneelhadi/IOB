# A&A: The Future of B2B Transactions

**Presented by:** Aymane El Hadi & Aymane Lachhab

---

## 1. The "Big Picture" Pitch

**What is this?**
This is a **Decentralized Commercial Quote (Devis) Application** built on the **Aleo Blockchain**.

**Why Aleo?**
Unlike Ethereum where data is public, Aleo uses **Zero-Knowledge Proofs (ZKPs)**. We can prove a transaction happened without revealing sensitive business data (prices, client names).

**Value Proposition:**
"The private commercial layer for B2B. Legally binding, immutable quotes without exposing pricing strategy."

---

## 2. Architecture Overview

### A. The Frontend (Client)
*   **Tech**: React, Vite, TypeScript.
*   **Role**: User Interface for creating quotes.
*   **Wallet**: **Live integration** with Leo Wallet via `@demox-labs/aleo-wallet-adapter`.
*   **Network**: Connected to Aleo **Testnet Beta**.

### B. The Backend (Smart Contract)
*   **Tech**: Leo (Aleo's language).
*   **Logic**: Defines `QuoteRecord`.
*   **Privacy**: Records are encrypted; only the recipient can decrypt them.

---

## 3. Step-by-Step User Flow

1.  **Initialization**: `run_app.bat` builds the contract and starts the UI.
2.  **Connection**: 
    *   Click "Select Wallet" → Choose "Leo Wallet".
    *   Approve the connection in the wallet extension popup.
    *   Your address appears in the header once connected.
3.  **Creation**: 
    *   User inputs data (e.g., "SpaceX", "$50k").
    *   App hashes the PDF content (unique fingerprint).
    *   Calls `create_quote` on-chain.
4.  **The Record**: A `QuoteRecord` is created on-chain. Status: 'Sent'.
5.  **Acceptance**: Recipient calls `accept_quote`, updating status to 'Accepted'.

---

## 4. Technical Deep Dive (Code Highlight)

The core logic lies in the `Quote` structure in `main.leo`:

```leo
struct Quote {
    issuer: address,
    recipient: address,
    content_hash: field, // Proves content integrity
    amount: u64,
    status: u8,
}
```

**Key Concept**: We don't store the PDF on-chain. We store the **hash** (`content_hash`). If the document changes, the hash breaks. This guarantees integrity.

---

## 5. Future Roadmap

1.  **Full Encryption**: Private fields so miners can't see the 'Amount'.
2.  **Auto PDF**: Generate PDFs directly from React.
3.  **Multi-Sig**: CEO + CFO approval for large quotes.

---

## 6. Technical Stack

**A&A** is a privacy-first invoicing tool built with:
*   **Frontend**: React + TypeScript + Vite
*   **Blockchain**: Aleo Testnet Beta
*   **Wallet**: Leo Wallet (via official adapter SDK)
*   **Smart Contract**: Leo programming language
*   **Privacy**: Zero-Knowledge Proofs for business confidentiality

## 7. Summary

**A&A** demonstrates the future of B2B transactions: legally binding, immutable quotes with complete privacy. Unlike traditional blockchain solutions, sensitive business data (prices, client names) remains encrypted while still being verifiable on-chain.

*Built by Aymane El Hadi & Aymane Lachhab*
