# UML Diagrams - A&A Commercial

This document contains the Use Case and Activity diagrams for the A&A Commercial application.

## 1. Use Case Diagram

This diagram illustrates the interactions between the actors (Issuer, Recipient, System) and the application's main functionalities.

```mermaid
graph LR
    %% Actors
    Issuer[\"👤 Issuer (Supplier)\"/]
    Recipient[\"👤 Recipient (Client)\"/]
    Blockchain[("🔗 Aleo Blockchain")]
    LocalSystem["⚙️ Wallet / Local Prover"]

    %% Use Cases
    subgraph "A&A Commercial App"
        UC1([Connect Wallet])
        UC2([Create Quote - Draft])
        UC3([Generate PDF - In Memory])
        UC4([Calculate Hash - SHA256])
        UC5([Sign Transaction - create_quote])
        UC6([Verify Integrity - Hash Check])
        UC7([Accept Quote - accept_quote])
    end

    %% Issuer Relations
    Issuer --> UC1
    Issuer --> UC2
    UC2 -. include .-> UC3
    UC3 -. include .-> UC4
    UC2 -. include .-> UC5

    %% System Relations
    UC5 -->|"Generates ZK Proof"| LocalSystem
    LocalSystem -->|"Submits Transaction"| Blockchain

    %% Recipient Relations
    Recipient --> UC1
    Recipient --> UC6
    Recipient --> UC7

    %% End Relations
    UC7 -->|"Records Agreement"| Blockchain

    %% Styles
    classDef actor fill:#f9f,stroke:#333,stroke-width:2px;
    class Issuer,Recipient actor;
    classDef system fill:#ececff,stroke:#9370db,stroke-width:2px;
    class Blockchain,LocalSystem system;
    classDef usecase fill:#fff,stroke:#333,stroke-width:1px,rx:5,ry:5;
    class UC1,UC2,UC3,UC4,UC5,UC6,UC7 usecase;
```

---

## 2. Sequence Diagram (Activity Flow)

This diagram details the complete flow of interactions, from quote creation to acceptance.

```mermaid
sequenceDiagram
    participant Issuer as 👤 Issuer
    participant System as 💻 Frontend
    participant Wallet as 🛡️ Aleo Wallet
    participant Recipient as 👤 Recipient

    %% Creation
    Issuer->>System: Input Details
    System->>System: Generate PDF (RAM) & Hash
    Issuer->>Wallet: Sign `create_quote(Hash)`
    Wallet-->>Issuer: Confirmed (ZK Proof)

    %% Transfer
    Issuer->>Recipient: Send PDF (Off-Chain)

    %% Verify
    Recipient->>System: Upload PDF
    System->>Wallet: Fetch Record & Compare Hash
    
    alt Match
        System-->>Recipient: ✅ Authentic
        Recipient->>Wallet: Sign `accept_quote`
        Wallet-->>Recipient: Confirmed
    else No Match
        System-->>Recipient: ❌ Modified!
    end
```
