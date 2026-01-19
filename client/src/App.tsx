import { useState, useEffect } from 'react';
import { useWallet } from '@demox-labs/aleo-wallet-adapter-react';
import { toast, Toaster } from 'sonner';
import {
    LayoutDashboard,
    FileText,
    Settings,
    User,
    Plus,
    Search,
    Download,
    Share2,
    MoreHorizontal,
    ArrowUpRight,
    TrendingUp,
    Shield,
    BookOpen,
    Zap,
    Users
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AddressBook } from './components/AddressBook';
import { QuoteModal } from './components/QuoteModal';

// Types
type Quote = {
    id: string;
    clientName: string;
    clientAddress: string;
    amount: number;
    date: string;
    status: 'Pending' | 'Paid' | 'Rejected';
};

type View = 'dashboard' | 'quotes' | 'clients' | 'settings';

function App() {
    const { publicKey, connected, select, wallets } = useWallet();

    const [activeView, setActiveView] = useState<View>('dashboard');
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
    const [isAddressBookOpen, setIsAddressBookOpen] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState('');

    // Load mock data
    useEffect(() => {
        const mockQuotes: Quote[] = [
            { id: '1', clientName: 'Nebula Corp', clientAddress: 'aleo1...', amount: 5000, date: '2024-01-04', status: 'Pending' },
            { id: '2', clientName: 'Starlight Inc', clientAddress: 'aleo1...', amount: 12500, date: '2024-01-03', status: 'Paid' },
            { id: '3', clientName: 'Void Systems', clientAddress: 'aleo1...', amount: 3200, date: '2024-01-02', status: 'Rejected' },
            { id: '4', clientName: 'Astro Mining', clientAddress: 'aleo1...', amount: 18000, date: '2023-12-28', status: 'Paid' },
            { id: '5', clientName: 'Quantum Weave', clientAddress: 'aleo1...', amount: 750, date: '2023-12-20', status: 'Pending' },
        ];
        setQuotes(mockQuotes);
    }, []);

    const handleCreateQuote = (clientAddress: string, amount: string, name: string) => {
        const newQuote: Quote = {
            id: Math.random().toString(36).substr(2, 9),
            clientName: name || 'Unknown Client',
            clientAddress: clientAddress,
            amount: parseFloat(amount),
            date: new Date().toISOString().split('T')[0],
            status: 'Pending'
        };
        setQuotes([newQuote, ...quotes]);
        toast.success(`Quote created successfully for ${amount} USDC`);
    };

    const handleAddressSelect = (addr: string) => {
        setSelectedAddress(addr);
        setIsAddressBookOpen(false);
        setIsQuoteModalOpen(true);
    };

    const exportToCSV = () => {
        const headers = ['ID', 'Client', 'Address', 'Amount', 'Date', 'Status'];
        const csvContent = [
            headers.join(','),
            ...quotes.map(q => [q.id, q.clientName, q.clientAddress, q.amount, q.date, q.status].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'quotes_export.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Quotes exported to CSV');
    };

    const getBase64ImageFromURL = (url: string): Promise<string> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.setAttribute("crossOrigin", "anonymous");
            img.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext("2d");
                ctx?.drawImage(img, 0, 0);
                const dataURL = canvas.toDataURL("image/png");
                resolve(dataURL);
            };
            img.onerror = error => {
                reject(error);
            };
            img.src = url;
        });
    };

    const downloadPDF = async (quote: Quote) => {
        const doc = new jsPDF();

        // Colors from the design
        const darkBg = [20, 24, 33]; // Dark blue/black like #141821
        const goldText = [255, 215, 0]; // Gold color roughly
        const greenText = [0, 180, 0]; // Green for status

        // --- Header Section ---
        // Dark background rect
        doc.setFillColor(20, 24, 33);
        doc.rect(0, 0, 210, 40, 'F');

        try {
            const logoData = await getBase64ImageFromURL('/logo.png');
            doc.addImage(logoData, 'PNG', 15, 10, 15, 15); // Adjust dimensions as needed

            // Logo Text "A&A" Next to Logo
            doc.setFontSize(26);
            doc.setTextColor(255, 204, 0); // Yellow/Gold
            doc.setFont("helvetica", "bold");
            doc.text("A&A", 35, 20); // Moved x to accommodate logo
        } catch (e) {
            // Fallback if image fails
            doc.setFontSize(26);
            doc.setTextColor(255, 204, 0);
            doc.setFont("helvetica", "bold");
            doc.text("A&A", 15, 20);
        }

        // Subtitle
        doc.setFontSize(10);
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "normal");
        doc.text("Secure Commercial Quotes", 35, 28);

        // --- Info Section ---
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(9);

        // FROM
        doc.text("FROM:", 15, 60);
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text("A&A Inc.", 15, 66);
        doc.setFont("helvetica", "normal");
        doc.text("Aleo Blockchain Network", 15, 72);

        // BILL TO
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(9);
        doc.text("BILL TO:", 120, 60);
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text(`${quote.clientName} (${quote.clientAddress.slice(0, 6)}...)`, 120, 66);

        // Invoice Meta
        const startY = 90;
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(9);
        doc.text("Invoice ID:", 15, startY);
        doc.text("Date:", 15, startY + 6);
        doc.text("Status:", 15, startY + 12);

        doc.setTextColor(0, 0, 0);
        doc.text(quote.id, 40, startY);
        doc.text(quote.date, 40, startY + 6);

        doc.setTextColor(0, 180, 0); // Green
        doc.setFont("helvetica", "bold");
        doc.text(quote.status.toUpperCase(), 40, startY + 12);

        // --- Table Section ---
        autoTable(doc, {
            startY: 120,
            head: [['Description', 'Qty', 'Unit Price', 'Total']],
            body: [
                ['Commercial Service / Consultation', '1', `$${quote.amount.toLocaleString()}`, `$${quote.amount.toLocaleString()}`],
            ],
            headStyles: {
                fillColor: [20, 24, 33],
                textColor: [255, 204, 0], // Gold text in header
                fontStyle: 'bold',
            },
            bodyStyles: {
                textColor: [50, 50, 50],
            },
            styles: {
                lineColor: [200, 200, 200],
                lineWidth: 0.1,
            },
            theme: 'grid'
        });

        // --- Totals Section ---
        // @ts-ignore
        const finalY = doc.lastAutoTable.finalY + 10;

        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.setFont("helvetica", "normal");
        doc.text("Subtotal:", 140, finalY);
        doc.text("Tax (0%):", 140, finalY + 6);

        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "bold");
        doc.text("Total:", 140, finalY + 16);
        doc.text(`$${quote.amount.toLocaleString()}`, 170, finalY + 16);

        doc.save(`invoice_${quote.id}.pdf`);
        toast.success('Professional invoice downloaded');
    };

    const renderView = () => {
        switch (activeView) {
            case 'quotes':
                return (
                    <div className="space-y-6 animate-in slide-in-from-bottom-5 duration-500">
                        <div className="flex justify-between items-center">
                            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-cyan-400">All Quotes</h2>
                            <div className="flex gap-4">
                                <button onClick={exportToCSV} className="glass-button px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 hover:border-violet-500/40">
                                    <Share2 size={16} />
                                    <span>Export</span>
                                </button>
                                <button onClick={() => setIsQuoteModalOpen(true)} className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-bold hover:shadow-lg hover:shadow-violet-500/25 transition-all text-sm flex items-center gap-2">
                                    <Plus size={16} />
                                    <span>New Quote</span>
                                </button>
                            </div>
                        </div>

                        <div className="glass-panel rounded-2xl overflow-hidden border border-white/5">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-black/20 text-xs uppercase text-slate-500">
                                        <tr>
                                            <th className="px-6 py-4 text-left font-semibold tracking-wider">Client</th>
                                            <th className="px-6 py-4 text-left font-semibold tracking-wider">Amount</th>
                                            <th className="px-6 py-4 text-left font-semibold tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-left font-semibold tracking-wider">Date</th>
                                            <th className="px-6 py-4 text-right font-semibold tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {quotes.map((quote) => (
                                            <tr key={quote.id} className="hover:bg-white/5 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-slate-200 group-hover:text-violet-300 transition-colors">{quote.clientName}</div>
                                                    <div className="text-xs text-slate-500 font-mono">{quote.clientAddress.slice(0, 6)}...{quote.clientAddress.slice(-4)}</div>
                                                </td>
                                                <td className="px-6 py-4 font-mono text-cyan-300">${quote.amount.toLocaleString()}</td>
                                                <td className="px-6 py-4">
                                                    <StatusBadge status={quote.status} />
                                                </td>
                                                <td className="px-6 py-4 text-slate-500 text-sm">{quote.date}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => downloadPDF(quote)}
                                                            className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
                                                            title="Download Invoice"
                                                        >
                                                            <Download size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                );
            case 'clients':
                return (
                    <div className="space-y-6 animate-in slide-in-from-bottom-5 duration-500 h-[calc(100vh-140px)]">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-cyan-400">Client Management</h2>
                            <button
                                onClick={() => setIsAddressBookOpen(true)}
                                className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-bold hover:shadow-lg hover:shadow-violet-500/25 transition-all text-sm flex items-center gap-2"
                            >
                                <Plus size={16} />
                                <span>Add Client</span>
                            </button>
                        </div>
                        {/* Wrapper for the concept of 'Clients' management */}
                        <div className="glass-panel p-8 rounded-2xl flex flex-col items-center justify-center text-center space-y-4 min-h-[400px]">
                            <div className="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center mb-4">
                                <Users size={40} className="text-slate-600" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Client Directory</h3>
                            <p className="text-slate-400 max-w-md">Manage your client addresses and aliases securely. This data is stored locally in your browser.</p>
                            <button
                                onClick={() => setIsAddressBookOpen(true)}
                                className="glass-button px-6 py-3 rounded-xl text-cyan-400 hover:text-white hover:border-cyan-500/50 transition-all font-medium"
                            >
                                Open Address Book
                            </button>
                        </div>
                    </div>
                );
            case 'settings':
                return (
                    <div className="space-y-6 animate-in slide-in-from-bottom-5 duration-500">
                        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-cyan-400">Settings</h2>
                        <div className="glass-panel p-8 rounded-2xl">
                            <p className="text-slate-400">Preferences and configuration options coming soon.</p>
                        </div>
                    </div>
                );
            case 'dashboard':
            default:
                return (
                    <div className="space-y-6 animate-in slide-in-from-bottom-5 duration-500">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <StatCard label="Total Value Secured" value="$17,500" change="+12.5%" icon={<Zap className="text-yellow-400" />} />
                            <StatCard label="Active Quotes" value={quotes.filter(q => q.status === 'Pending').length.toString()} change="+2" neutral icon={<FileText className="text-cyan-400" />} />
                            <StatCard label="Pending Actions" value="3" change="-1" negative icon={<Shield className="text-violet-400" />} />
                        </div>

                        {/* Recent Quotes Table */}
                        <div className="glass-panel rounded-2xl overflow-hidden border border-white/5">
                            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                                <h3 className="font-bold text-lg text-slate-200">Recent Activity</h3>
                                <button onClick={() => setActiveView('quotes')} className="text-sm text-violet-400 hover:text-violet-300 transition-colors">View All</button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-black/20 text-xs uppercase text-slate-500">
                                        <tr>
                                            <th className="px-6 py-4 text-left font-semibold tracking-wider">Client</th>
                                            <th className="px-6 py-4 text-left font-semibold tracking-wider">Amount</th>
                                            <th className="px-6 py-4 text-left font-semibold tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-left font-semibold tracking-wider">Date</th>
                                            <th className="px-6 py-4 text-right font-semibold tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {quotes.slice(0, 5).map((quote) => (
                                            <tr key={quote.id} className="hover:bg-white/5 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-slate-200 group-hover:text-violet-300 transition-colors">{quote.clientName}</div>
                                                    <div className="text-xs text-slate-500 font-mono">{quote.clientAddress.slice(0, 6)}...{quote.clientAddress.slice(-4)}</div>
                                                </td>
                                                <td className="px-6 py-4 font-mono text-cyan-300">${quote.amount.toLocaleString()}</td>
                                                <td className="px-6 py-4">
                                                    <StatusBadge status={quote.status} />
                                                </td>
                                                <td className="px-6 py-4 text-slate-500 text-sm">{quote.date}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => downloadPDF(quote)}
                                                            className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
                                                            title="Download Invoice"
                                                        >
                                                            <Download size={16} />
                                                        </button>
                                                        <button className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors">
                                                            <MoreHorizontal size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Export Action */}
                        <div className="flex justify-end">
                            <button
                                onClick={exportToCSV}
                                className="glass-button px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 hover:border-violet-500/40 hover:shadow-[0_0_15px_rgba(139,92,246,0.2)]"
                            >
                                <Share2 size={16} />
                                <span>Export to Excel</span>
                            </button>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen text-slate-100 font-sans selection:bg-violet-500/30">
            <Toaster position="top-center" richColors theme="dark" closeButton className="glass-panel" />

            {/* Glass Sidebar */}
            <aside className="fixed left-4 top-4 bottom-4 w-20 lg:w-64 glass-panel rounded-2xl flex flex-col z-20 transition-all duration-300">
                <div className="p-6 flex items-center justify-center lg:justify-start gap-4 cursor-pointer" onClick={() => setActiveView('dashboard')}>
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-cyan-600 rounded-lg blur opacity-50 group-hover:opacity-100 transition duration-200"></div>
                        <div className="relative w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center ring-1 ring-white/10 overflow-hidden">
                            <img src="/logo.png" alt="A&A Logo" className="w-full h-full object-cover" />
                        </div>
                    </div>
                    <span className="text-xl font-bold tracking-tight hidden lg:block bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">A&A <span className="text-xs font-normal text-slate-500 block">Commercial</span></span>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2">
                    <NavItem
                        icon={<LayoutDashboard size={20} />}
                        label="Dashboard"
                        active={activeView === 'dashboard'}
                        onClick={() => setActiveView('dashboard')}
                    />
                    <NavItem
                        icon={<FileText size={20} />}
                        label="Quotes"
                        badge={quotes.length.toString()}
                        active={activeView === 'quotes'}
                        onClick={() => setActiveView('quotes')}
                    />
                    <NavItem
                        icon={<User size={20} />}
                        label="Clients"
                        active={activeView === 'clients'}
                        onClick={() => setActiveView('clients')}
                    />
                    <div className="pt-6 pb-2 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:block">System</div>
                    <NavItem
                        icon={<Settings size={20} />}
                        label="Preferences"
                        active={activeView === 'settings'}
                        onClick={() => setActiveView('settings')}
                    />
                </nav>

                <div className="p-4 mt-auto">
                    <div className="glass-card p-3 rounded-xl flex items-center gap-3 cursor-pointer group border border-white/5 hover:border-violet-500/30">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-violet-600 to-cyan-600 flex items-center justify-center text-sm font-bold shadow-lg shadow-violet-500/20">
                            AL
                        </div>
                        <div className="flex-1 min-w-0 hidden lg:block">
                            <div className="text-sm font-medium truncate group-hover:text-violet-400 transition-colors">Admin User</div>
                            <div className="text-xs text-slate-400 truncate">{connected ? `${publicKey?.slice(0, 6)}...${publicKey?.slice(-4)}` : 'Offline'}</div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="pl-28 lg:pl-72 pr-4 py-4 min-h-screen transition-all duration-300">
                {/* Floating Header */}
                <header className="glass-panel rounded-2xl h-16 px-6 mb-8 flex items-center justify-between sticky top-4 z-10 transition-all">
                    <div className="flex items-center gap-4 flex-1">

                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsAddressBookOpen(true)}
                            className="glass-button px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 hover:text-cyan-400"
                        >
                            <BookOpen size={18} />
                            <span className="hidden sm:inline">Address Book</span>
                        </button>

                        <button
                            onClick={() => {
                                if (!connected) {
                                    const leo = wallets.find(w => w.adapter.name === 'Leo Wallet');
                                    if (leo) select(leo.adapter.name);
                                }
                            }}
                            className="relative group px-4 py-2 rounded-xl text-sm font-bold overflow-hidden transition-all"
                        >
                            <div className={`absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity ${connected ? 'bg-emerald-500' : 'bg-violet-500'}`}></div>
                            <div className={`absolute inset-0 blur-xl opacity-20 ${connected ? 'bg-emerald-500' : 'bg-violet-500'}`}></div>
                            <span className={`relative flex items-center gap-2 ${connected ? 'text-emerald-400' : 'text-violet-400'}`}>
                                {connected ? (
                                    <>
                                        <span className="w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.5)]"></span>
                                        {publicKey?.slice(0, 6)}...{publicKey?.slice(-4)}
                                    </>
                                ) : (
                                    <>Connect Wallet</>
                                )}
                            </span>
                        </button>
                    </div>
                </header>

                <div className="max-w-[1600px] mx-auto">
                    {activeView === 'dashboard' && (
                        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6 animate-in fade-in duration-500">
                            <div>
                                <h1 className="text-5xl font-bold mb-2 tracking-tight">
                                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-cyan-400 to-white neon-text">{quotes.length}</span>
                                    <span className="text-slate-400 text-3xl ml-2 font-light">Total Quotes</span>
                                </h1>
                                <p className="text-slate-400 text-lg max-w-xl">Manage your commercial quotes and on-chain invoices with next-gen zero-knowledge privacy.</p>
                            </div>
                            <button
                                onClick={() => setIsQuoteModalOpen(true)}
                                className="group relative px-6 py-3 rounded-xl font-bold text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all transform hover:-translate-y-0.5 overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-cyan-600"></div>
                                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="relative flex items-center gap-2">
                                    <Plus size={20} />
                                    <span>Create Quote</span>
                                </div>
                            </button>
                        </div>
                    )}

                    <div className="grid grid-cols-12 gap-8">
                        {/* Main Feed / Content View */}
                        <div className="col-span-12 lg:col-span-9">
                            {renderView()}
                        </div>

                        {/* Right Sidebar */}
                        <div className="col-span-12 lg:col-span-3 space-y-6">
                            {/* Market Widget */}
                            <div className="glass-card rounded-2xl p-6">
                                <div className="flex items-center gap-2 mb-4 text-violet-400">
                                    <TrendingUp size={20} />
                                    <h3 className="font-bold">Market Pulse</h3>
                                </div>
                                <div className="space-y-4">
                                    <NewsItem title="Aleo Mainnet Launch Imminent" time="2h ago" />
                                    <NewsItem title="DeFi TVL Reaches All-Time High" time="4h ago" />
                                    <NewsItem title="ZK-Rollups gaining traction in B2B" time="1d ago" />
                                </div>
                            </div>

                            {/* Security Widget */}
                            <div className="relative rounded-2xl p-6 overflow-hidden border border-white/10 group">
                                <div className="absolute inset-0 bg-gradient-to-br from-violet-900/50 to-slate-900/50 backdrop-blur-md"></div>
                                <div className="absolute -right-10 -top-10 w-32 h-32 bg-violet-500/20 rounded-full blur-3xl group-hover:bg-violet-500/30 transition-colors"></div>

                                <div className="relative z-10">
                                    <Shield className="w-8 h-8 text-cyan-400 mb-3 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
                                    <h3 className="font-bold text-lg mb-1 text-white">ZK Privacy Active</h3>
                                    <p className="text-sm text-slate-400 mb-4">Your financial data is encrypted and validated without revealing sensitive details.</p>
                                    <button className="text-sm font-medium text-cyan-400 hover:text-cyan-300 hover:underline">View Proofs</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Modals */}
            <QuoteModal
                isOpen={isQuoteModalOpen}
                onClose={() => setIsQuoteModalOpen(false)}
                onCreate={handleCreateQuote}
                initialAddress={selectedAddress}
            />

            {isAddressBookOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <AddressBook
                        onSelect={handleAddressSelect}
                        onClose={() => setIsAddressBookOpen(false)}
                    />
                </div>
            )}
        </div>
    );
}

// Subcomponents
function NavItem({ icon, label, active = false, badge, onClick }: { icon: any, label: string, active?: boolean, badge?: string, onClick?: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center justify-start gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${active ? 'bg-gradient-to-r from-violet-600/20 to-cyan-600/20 text-white border-l-2 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.1)]' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
        >
            <span className={active ? 'text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]' : ''}>{icon}</span>
            <span className="hidden lg:inline">{label}</span>
            {badge && <span className="ml-auto bg-violet-500/20 text-violet-300 text-[10px] px-2 py-0.5 rounded-full hidden lg:inline-block border border-violet-500/20">{badge}</span>}
        </button>
    );
}

function StatCard({ label, value, change, neutral, negative, icon }: { label: string, value: string, change: string, neutral?: boolean, negative?: boolean, icon?: any }) {
    return (
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
                {icon}
            </div>
            <h4 className="text-sm text-slate-400 font-medium mb-1">{label}</h4>
            <div className="flex items-end justify-between">
                <span className="text-2xl font-bold text-white tracking-tight">{value}</span>
                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg border ${negative ? 'bg-red-500/10 text-red-400 border-red-500/20' : neutral ? 'bg-slate-500/10 text-slate-400 border-slate-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]'}`}>
                    {(!neutral && !negative) && <ArrowUpRight size={12} />}
                    {change}
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles = {
        Pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]',
        Paid: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]',
        Rejected: 'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]',
    };
    return (
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles] || styles.Pending} backdrop-blur-md`}>
            {status}
        </span>
    );
}

function NewsItem({ title, time }: { title: string, time: string }) {
    return (
        <div className="flex justify-between items-start group cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-colors -mx-2">
            <div className="flex gap-3">
                <div className="w-1 h-full min-h-[40px] rounded-full bg-slate-700 group-hover:bg-gradient-to-b from-violet-500 to-cyan-500 transition-all"></div>
                <div>
                    <h4 className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">{title}</h4>
                    <span className="text-xs text-slate-500">{time}</span>
                </div>
            </div>
        </div>
    );
}

export default App;
