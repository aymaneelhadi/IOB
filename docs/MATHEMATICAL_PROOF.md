# A&A: The Mathematical Mechanism

This document explains the cryptographic and mathematical principles that guarantee the security and privacy of the A&A Commercial application.

---

## 1. The Core Equation: Proof of Integrity

The fundamental security of this application relies on a property called **Collision Resistance** provided by the SHA-256 Hashing Algorithm.

Let $D$ be the commercial quote (the PDF document).
Let $H$ be the cryptographic hash function (SHA-256).
Let $h$ be the hash stored on the blockchain.

The equation is:
$$H(D) = h$$

### Why this works
The SHA-256 function maps data of arbitrary size to a fixed size (256 bits). It has the following mathematical properties:

1.  **Deterministic:** The same document $D$ will *always* produce the same hash $h$.
2.  **Avalanche Effect:** If you change a single bit in $D$ (e.g., changing $50,000 to $50,001), the resulting hash $h'$ will be completely different/uncorrelated to $h$.
    $$H(D_{modified}) \neq H(D_{original})$$
3.  **Pre-image Resistance:** Given $h$, it is computationally infeasible to find $D$. This means looking at the blockchain tells you *nothing* about the document contents.

**Conclusion:** The presence of $h$ on the blockchain is mathematical proof that a document $D$ existed at time $T$, without revealing what $D$ is.

---

## 2. Zero-Knowledge Proof (ZKP)

The Aleo blockchain allows us to prove statements without revealing the underlying data. In our `create_quote` transition, we are essentially proving the following statement to the network validators:

**"I know a private key $K_{sender}$ that signed a transaction containing a hash $h$ and an amount $A$, and I assign this record to owner $K_{recipient}$."**

### The Commitment Scheme
When we create a `QuoteRecord`, we are creating a **Pedersen Commitment** or similar cryptographic commitment depending on the specific field type in Aleo.

The state on the blockchain is not the raw data. It is a commitment $C$:
$$C = Commit(Data, Randomness)$$

*   **Hiding:** The commitment $C$ reveals nothing about the `Data` (the hash and amount).
*   **Binding:** The sender cannot change the `Data` after committing to $C$.

When the recipient "sees" the record, they use their private key to "open" the commitment and recover the Data.

---

## 3. The "Integrity Lock" Logic

We can formalize the security model as a logical proof:

**Axiom 1:** The Blockchain is immutable. Once $h$ is written, it cannot be changed.
**Axiom 2:** The User holds the PDF file $D$.
**Axiom 3:** $H(x)$ is collision-resistant.

**Proof of Authenticity:**
1.  User claims PDF $D$ is the one agreed upon.
2.  Verifier (or Smart Contract logic) calculates $h' = H(D)$.
3.  Verifier reads $h$ from the Blockchain.
4.  IF $h' == h$, THEN $D$ must be the original document.

If the User tries to cheat by sending a fake PDF $D_{fake}$ (where they changed the price):
$$H(D_{fake}) \neq h$$
The check fails.

---

## 4. Summary

The application does not rely on "trusting" the software. It relies on the probability of finding a SHA-256 collision, which is:

$$P(collision) \approx \frac{1}{2^{128}}$$

This is a probability so low that it is virtually impossible (lower than the probability of picking a specific atom in the observable universe). Thus, the system is **mathematically secure**.
