import { useState, useEffect } from 'react';
import { useWallet } from '@demox-labs/aleo-wallet-adapter-react';
import { Transaction, WalletAdapterNetwork, WalletNotConnectedError } from '@demox-labs/aleo-wallet-adapter-base';
import { toast } from 'sonner';
import { X, Wallet, Loader2 } from 'lucide-react';
import { calculateSHA256 } from '../utils/hashing';
import { PROGRAM_ID, hexToField } from '../utils/aleo-client';

type QuoteModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (address: string, amount: string, name: string, txId?: string) => void;
    initialAddress?: string;
};

export function QuoteModal({ isOpen, onClose, onCreate, initialAddress = '' }: QuoteModalProps) {
    const { wallet, publicKey, requestTransaction } = useWallet();
    const [address, setAddress] = useState(initialAddress);
    const [amount, setAmount] = useState('');
    const [clientName, setClientName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (initialAddress) setAddress(initialAddress);
    }, [initialAddress]);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!publicKey || !wallet) {
            toast.error('Please connect your wallet first!');
            return;
        }

        if (!address || !amount || !clientName) {
            toast.error('Please fill in all fields');
            return;
        }

        setIsSubmitting(true);
        const toastId = toast.loading('Generating Secure Document...');

        // Hoist variables for Demo Mode Access
        let contentHashField = '';
        let pdfBlob: Blob | null = null;
        let invoiceData: any = null;

        try {
            // 1. Generate the Verification PDF (The "Truth")
            invoiceData = {
                id: Math.random().toString(36).substr(2, 9),
                client: clientName,
                amount: parseFloat(amount),
                date: new Date().toISOString().split('T')[0],
                status: 'Pending'
            };

            const { generateInvoicePDF, downloadPDFBlob } = await import('../utils/invoiceGenerator');

            // Assign to hoisted variable
            pdfBlob = await generateInvoicePDF(invoiceData);

            // 2. Hash THIS exact PDF
            const pdfArrayBuffer = await pdfBlob.arrayBuffer();
            const hashHex = await calculateSHA256(pdfArrayBuffer);

            // Assign to hoisted variable
            contentHashField = hexToField(hashHex);

            console.log("Creation Hash (PDF):", hashHex);
            console.log("Creation Field:", contentHashField);

            toast.loading('Broadcasting to Aleo Blockchain...', { id: toastId });

            // 3. Construct the Aleo Transaction
            const amountInt = Math.floor(parseFloat(amount));
            const inputs = [
                address, // recipient
                contentHashField, // content_hash
                `${amountInt}u64` // amount
            ];

            console.log("Transaction Inputs:", inputs);

            const aleoTransaction = Transaction.createTransaction(
                publicKey,
                WalletAdapterNetwork.TestnetBeta,
                PROGRAM_ID,
                'create_quote',
                inputs,
                100000
            );

            // 4. Request Signature
            if (requestTransaction) {
                const txId = await requestTransaction(aleoTransaction);

                // 5. Success!
                downloadPDFBlob(pdfBlob, `Verified_Invoice_${invoiceData.id}.pdf`);

                toast.dismiss(toastId);
                toast.success('Transaction Broadcasted! File Downloaded.');

                onCreate(address, amount, clientName, txId);
                setAddress('');
                setAmount('');
                setClientName('');
                onClose();
            } else {
                throw new Error("Wallet does not support transaction request");
            }

        } catch (error: any) {
            console.error("Transaction Error Details:", error);

            // --- DEMO MODE FALLBACK ---
            // If the blockchain fails (no credits, etc), we simulate success for the demo.
            // We proceed only if we successfully generated the PDF and its hash.
            if (pdfBlob && contentHashField) {
                console.log("Activating Local Demo Mode...");
                const amountInt = Math.floor(parseFloat(amount));
                const mockRecord = {
                    _id: "demo_" + Math.random().toString(36).substr(2, 9),
                    owner: address,
                    spent: false,
                    data: {
                        content_hash: contentHashField,
                        amount: `${amountInt}u64`,
                        status: '0u8'
                    },
                    isMock: true
                };

                // Save to localStorage
                const existing = JSON.parse(localStorage.getItem('demo_records') || '[]');
                localStorage.setItem('demo_records', JSON.stringify([...existing, mockRecord]));

                // Download file anyway
                import('../utils/invoiceGenerator').then(({ downloadPDFBlob }) => {
                    if (pdfBlob) downloadPDFBlob(pdfBlob, `Verified_Invoice_${invoiceData?.id || 'demo'}.pdf`);
                });

                toast.dismiss(toastId);
                toast.warning('Network Error. Switched to Local Demo Mode.');
                onCreate(address, amount, clientName, "demo_tx_id");

                setAddress('');
                setAmount('');
                setClientName('');
                onClose();
            } else {
                toast.dismiss(toastId);
                toast.error(`Error: ${error.message || 'Verification Failed'}`);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
            <div className="glass-panel w-[400px] p-6 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 relative overflow-hidden">
                {/* Decorative background glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

                <div className="flex justify-between items-center mb-6 relative z-10">
                    <h2 className="text-xl font-bold text-white tracking-tight">Create New Quote</h2>
                    <button onClick={onClose} disabled={isSubmitting} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-4 relative z-10">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400">Client Name</label>
                        <input
                            type="text"
                            value={clientName}
                            onChange={(e) => setClientName(e.target.value)}
                            disabled={isSubmitting}
                            placeholder="e.g. Globex Corp"
                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all font-mono text-sm disabled:opacity-50"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400">Client Address</label>
                        <div className="relative group">
                            <input
                                type="text"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                disabled={isSubmitting}
                                placeholder="aleo1..."
                                className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all font-mono text-sm disabled:opacity-50"
                            />
                            {address && !isSubmitting && (
                                <button
                                    onClick={() => {
                                        setAddress('');
                                        setAmount('');
                                    }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400">Amount ($)</label>
                        <div className="relative">
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                disabled={isSubmitting}
                                placeholder="0.00"
                                className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all font-mono text-lg disabled:opacity-50"
                            />
                        </div>
                    </div>

                    {!publicKey && (
                        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center gap-3 text-amber-200 text-sm">
                            <Wallet size={16} />
                            <span>Wallet connection required to proceed.</span>
                        </div>
                    )}

                    <div className="flex gap-3 mt-8 pt-2">
                        <button
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="flex-1 py-3 px-4 rounded-xl bg-white/5 text-slate-300 font-medium hover:bg-white/10 transition-colors border border-white/5 hover:border-white/20 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={!publicKey || isSubmitting}
                            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-bold hover:shadow-lg hover:shadow-violet-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    <span>Proving...</span>
                                </>
                            ) : (
                                <span>Create On-Chain</span>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
