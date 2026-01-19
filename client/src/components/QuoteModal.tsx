import { useState, useEffect } from 'react';
import { useWallet } from '@demox-labs/aleo-wallet-adapter-react';
import { toast } from 'sonner';
import { X, Wallet } from 'lucide-react';

type QuoteModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (address: string, amount: string, name: string) => void;
    initialAddress?: string;
};

export function QuoteModal({ isOpen, onClose, onCreate, initialAddress = '' }: QuoteModalProps) {
    const { connected } = useWallet();
    const [address, setAddress] = useState(initialAddress);
    const [amount, setAmount] = useState('');
    const [clientName, setClientName] = useState('');

    useEffect(() => {
        if (initialAddress) setAddress(initialAddress);
    }, [initialAddress]);

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (!connected) {
            toast.error('Please connect your wallet first!');
            toast.error("Please connect your Leo Wallet using the button in the header.");
            return;
        }

        if (!address || !amount || !clientName) {
            toast.error('Please fill in all fields');
            return;
        }

        onCreate(address, amount, clientName);
        setAddress('');
        setAmount('');
        setClientName('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
            <div className="glass-panel w-[400px] p-6 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 relative overflow-hidden">
                {/* Decorative background glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

                <div className="flex justify-between items-center mb-6 relative z-10">
                    <h2 className="text-xl font-bold text-white tracking-tight">Create New Quote</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors">
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
                            placeholder="e.g. Globex Corp"
                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all font-mono text-sm"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400">Client Address</label>
                        <div className="relative group">
                            <input
                                type="text"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="aleo1..."
                                className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all font-mono text-sm"
                            />
                            {address && (
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
                                placeholder="0.00"
                                className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all font-mono text-lg"
                            />
                        </div>
                    </div>

                    {!connected && (
                        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center gap-3 text-amber-200 text-sm">
                            <Wallet size={16} />
                            <span>Wallet connection required to proceed.</span>
                        </div>
                    )}

                    <div className="flex gap-3 mt-8 pt-2">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 px-4 rounded-xl bg-white/5 text-slate-300 font-medium hover:bg-white/10 transition-colors border border-white/5 hover:border-white/20"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={!connected}
                            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-bold hover:shadow-lg hover:shadow-violet-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0"
                        >
                            Create On-Chain
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
