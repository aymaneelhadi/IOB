# A&A (Aleo Commercial Devis)

> **Authors:** Aymane El Hadi & Aymane Lachhab

## 1. The "Big Picture" Pitch

**What is this?**
This is a **Decentralized Commercial Quote (Devis) Application** built on the **Aleo Blockchain**.

**Why Aleo?**
Unlike Ethereum or Solana where all transaction data (like prices and client names) is public, Aleo uses **Zero-Knowledge Proofs (ZKProofs)**. This means we can prove a transaction happened (a quote was sent) and verify its rules (e.g., "amount must be positive") *without* revealing the sensitive business data to the public.

**The Core Value Proposition:**
"We are building the private commercial layer for B2B. Companies can send legally binding, immutable quotes on the blockchain without exposing their pricing strategy to competitors."

---

## 2. Architecture Overview

The project consists of two main parts working together:

### A. The Frontend (Client)
*   **Tech**: React, Vite, TypeScript.
*   **Role**: This is the beautiful interface you see in the browser. It handles user input (Client Name, Amount) and manages the UI state.
*   **Wallet Integration**: **Fully integrated with Leo Wallet** using the official `@demox-labs/aleo-wallet-adapter`. The app connects to **Testnet Beta** and can sign real transactions.
*   **Features**: Custom logo, responsive design, and real-time wallet connection status.

### B. The Backend (Smart Contract)
*   **Tech**: Leo (Aleo's programming language).
*   **File**: `commercial_devis/src/main.leo`.
*   **Logic**:
    *   It defines a `QuoteRecord` structure: `{ owner, recipient, amount, status, content_hash }`.
    *   **Immutability**: Once a quote is created, it follows strict rules.
    *   **Privacy**: On Mainnet, these records are encrypted. Only the `owner` (recipient) can decrypt and see the details.

---

## 3. Step-by-Step User Flow (The Demo)

Walk your colleague through this flow:

### Step 1: Initialization
*   "We start the app using `run_app.bat`. This script checks for Node.js, builds the Leo contract, and launches the client server."

### Step 2: Connection
*   "Click **Select Wallet** → Choose **Leo Wallet**."
*   "The Leo Wallet extension will pop up asking you to approve the connection to **Testnet Beta**."
*   "After approval, your wallet address will be displayed in the header."

### Step 3: Creating a Quote (The 'Transition')
*   "I click **New Quote** and enter 'SpaceX' and '$50,000'."
*   "When I click **Create**, the frontend prepares a transaction for the `create_quote` function in our smart contract."
*   **Under the Hood**:
    *   The app takes the PDF/Data of the quote and hashes it (creates a unique fingerprint).
    *   It calls `create_quote(recipient_addr, hash, amount)`.
    *   This generates a `QuoteRecord` owned by the client.

### Step 4: The 'Record'
*   "The dashboard updates. This isn't just a database entry; it represents a record on the blockchain. The status is 'Sent' (0)."

### Step 5: Acceptance
*   "The client (recipient) would see this quote in their wallet. They can call the `accept_quote` function."
*   "This function checks `assert_eq(self.caller, quote_record.data.recipient)` to ensure ONLY the intended recipient can accept it."
*   "The status flips to 'Accepted' (2) on-chain."

---

## 4. Code Highlight

Open `commercial_devis/src/main.leo` and show him these lines to prove the logic:

```leo
struct Quote {
    issuer: address,
    recipient: address,
    content_hash: field, // This proves the document content without revealing it!
    amount: u64,
    status: u8,
}
```

**Talking Point:** "Look at `content_hash`. We don't store the PDF on the blockchain (too expensive/public). We store the *hash*. If anyone changes a comma in the PDF, the hash won't match. This guarantees the integrity of the document."

---

## 5. Future Roadmap
*   **Encryption**: Fully private fields so not even the miner knows the 'Amount'.
*   **PDF Generation**: Auto-generate the PDF file from the React frontend.
*   **Multi-Sig**: Require multiple signatures (e.g., CEO + CFO) to approve high-value quotes.

---

## 🛠️ Prerequisites & Installation

### Requirements
*   **Node.js**: [Download](https://nodejs.org/)
*   **Leo Wallet Extension**: [Install from Chrome Web Store](https://chromewebstore.google.com/)
    *   Make sure your wallet is configured for **Testnet Beta** network

### Quick Start
1.  **Run**: Double-click `run_app.bat` or run `npm install && npm run dev` in the `client` folder.
2.  **Access**: Open [http://localhost:5173](http://localhost:5173)
3.  **Connect**: Click "Select Wallet" and connect your Leo Wallet

### Wallet Configuration
*   **Network**: Testnet Beta
*   **Permissions**: The app requests `UponRequest` decrypt permission
*   **Smart Contract**: `commercial_devis.aleo` (deployment required for production)

---

## 🐳 Docker Deployment

### Using Docker Compose (Recommended)

```bash
# Build and start the container
docker-compose up -d

# Access the app at http://localhost:3000

# View logs
docker-compose logs -f

# Stop the container
docker-compose down
```

### Using Docker Directly

```bash
# Build the image
docker build -t aa-commercial-devis .

# Run the container
docker run -d -p 3000:80 --name aa-app aa-commercial-devis

# Access the app at http://localhost:3000
```

### Production Deployment

The Docker image uses:
- **Multi-stage build** for optimized image size
- **Nginx** for efficient static file serving
- **Gzip compression** for faster loading
- **Security headers** for enhanced protection
- **Client-side routing** support for React SPA

---

**Summary for Aymane:**
"It's a privacy-first invoicing tool. React for the UI, Aleo for the privacy/trust layer. We are using the `main.leo` program to mathematically prove that a quote was sent and accepted without leaking data."
# IOB
