program commercial_devis.aleo {
    // 0u8 = Draft, 1u8 = Sent, 2u8 = Accepted
    
    struct Quote {
        issuer: address,
        recipient: address,
        content_hash: field, // Hash of the PDF/Data
        amount: u64,
        status: u8,
    }

    record QuoteRecord {
        owner: address,
        gates: u64,
        data: Quote,
    }

    // Create a new quote. 
    // The record is owned by the *recipient* so they can 'accept' it.
    // However, for the issuer to track it, we might want to issue two records or use a mapping.
    // For simplicity in this V1, we issue the record to the recipient.
    transition create_quote(
        public recipient: address, 
        public content_hash: field, 
        public amount: u64
    ) -> QuoteRecord {
        let quote_data: Quote = Quote {
            issuer: self.caller,
            recipient: recipient,
            content_hash: content_hash,
            amount: amount,
            status: 0u8, // Draft/Sent
        };

        return QuoteRecord {
            owner: recipient,
            gates: 0u64,
            data: quote_data,
        };
    }

    // Recipient accepts the quote.
    transition accept_quote(
        public quote_record: QuoteRecord
    ) -> QuoteRecord {
        // Ensure the caller is the recipient (implicit owner check usually, but good to be explicit in logic)
        assert_eq(self.caller, quote_record.data.recipient);

        let new_quote_data: Quote = Quote {
            issuer: quote_record.data.issuer,
            recipient: quote_record.data.recipient,
            content_hash: quote_record.data.content_hash,
            amount: quote_record.data.amount,
            status: 2u8, // Accepted
        };

        // We return the record to the SAME owner (recipient), 
        // effectively updating the status on-chain.
        // In a real app, we might want to send a notification record back to the issuer.
        return QuoteRecord {
            owner: self.caller,
            gates: 0u64,
            data: new_quote_data,
        };
    }
}
