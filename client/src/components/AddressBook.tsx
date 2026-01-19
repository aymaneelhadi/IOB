import { useState, useEffect } from 'react';
import { validateAleoAddress } from '../utils/aleo-utils';
import { Plus, Trash2, Copy, Check, X, Search } from 'lucide-react';
import { toast } from 'sonner';

export type Contact = {
    id: string;
    name: string;
    address: string;
};

type AddressBookProps = {
    onSelect: (address: string) => void;
    onClose: () => void;
};

export function AddressBook({ onSelect, onClose }: AddressBookProps) {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [newName, setNewName] = useState('');
    const [newAddress, setNewAddress] = useState('');

    useEffect(() => {
        const saved = localStorage.getItem('aleo_contacts');
        if (saved) {
            setContacts(JSON.parse(saved));
        }
    }, []);

    const saveContacts = (newContacts: Contact[]) => {
        setContacts(newContacts);
        localStorage.setItem('aleo_contacts', JSON.stringify(newContacts));
    };

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName || !newAddress) return;

        if (!validateAleoAddress(newAddress)) {
            toast.error("Invalid Aleo address format (must start with aleo1 and be 63 chars).");
            return;
        }

        const newContact: Contact = {
            id: Math.random().toString(36).substr(2, 9),
            name: newName,
            address: newAddress
        };

        const updated = [...contacts, newContact];
        saveContacts(updated);
        setNewName('');
        setNewAddress('');
        toast.success('Contact saved successfully');
    };

    const handleDelete = (id: string) => {
        const updated = contacts.filter(c => c.id !== id);
        saveContacts(updated);
        toast.success('Contact removed');
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Address copied to clipboard');
    };

    return (
        <div className="glass-panel w-[500px] max-h-[80vh] flex flex-col rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-tr from-violet-600 to-cyan-600 rounded-lg">
                        <Search size={20} className="text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Address Book</h2>
                        <p className="text-xs text-slate-400">Manage your trusted contacts</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors">
                    <X size={20} />
                </button>
            </div>

            <div className="p-6 flex-1 overflow-hidden flex flex-col">
                {/* Add New Contact Form */}
                <form onSubmit={handleAdd} className="flex gap-2 mb-6 bg-slate-900/50 p-4 rounded-xl border border-white/5 focus-within:border-violet-500/50 transition-colors">
                    <div className="flex-1 space-y-3">
                        <input
                            type="text"
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                            placeholder="Alias (e.g. Alice)"
                            className="w-full bg-transparent border-b border-white/10 px-2 py-2 text-white text-sm focus:outline-none focus:border-cyan-400 transition-colors placeholder:text-slate-600"
                            required
                        />
                        <input
                            type="text"
                            value={newAddress}
                            onChange={e => setNewAddress(e.target.value)}
                            placeholder="Aleo Address (aleo1...)"
                            className="w-full bg-transparent border-b border-white/10 px-2 py-2 text-white text-sm focus:outline-none focus:border-cyan-400 transition-colors placeholder:text-slate-600 font-mono"
                            required
                        />
                    </div>
                    <button type="submit" className="w-12 flex items-center justify-center bg-gradient-to-br from-violet-600 to-cyan-600 text-white rounded-lg hover:shadow-lg hover:shadow-cyan-500/20 transition-all font-bold">
                        <Plus size={24} />
                    </button>
                </form>

                {/* Contact List */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                    {contacts.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-500 space-y-4">
                            <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center">
                                <Search size={32} className="text-slate-600" />
                            </div>
                            <p className="text-sm">No contacts found.</p>
                        </div>
                    )}

                    {contacts.map(contact => (
                        <div key={contact.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:border-violet-500/30 hover:bg-slate-800/50 transition-all group">
                            <div className="min-w-0 flex-1 mr-4">
                                <div className="font-bold text-slate-200 group-hover:text-white transition-colors">{contact.name}</div>
                                <div className="text-xs text-slate-500 font-mono truncate group-hover:text-cyan-400/80 transition-colors">
                                    {contact.address}
                                </div>
                            </div>

                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    type="button"
                                    onClick={() => copyToClipboard(contact.address)}
                                    className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
                                    title="Copy Address"
                                >
                                    <Copy size={16} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onSelect(contact.address)}
                                    className="p-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 transition-colors"
                                    title="Use Address"
                                >
                                    <Check size={16} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleDelete(contact.id)}
                                    className="p-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

