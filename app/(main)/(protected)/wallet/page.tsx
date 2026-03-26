'use client';

import { useEffect, useState } from 'react';
import { Wallet, Coins, ArrowUpRight, ArrowDownLeft, RefreshCw, Gift, Clock, Share2, Copy, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/lib/hooks/useWallet';
import { useAuth } from '@/lib/hooks/useAuth';
import { formatPrice } from '@/lib/helpers';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function WalletPage() {
    const { user, isAuthenticated, refreshUser } = useAuth();
    const { wallet, isLoading, fetchWallet, convertPoints } = useWallet();
    const [pointsInput, setPointsInput] = useState('');
    const [converting, setConverting] = useState(false);
    const [copied, setCopied] = useState(false);
    const [hasRefreshedProfile, setHasRefreshedProfile] = useState(false);

    // Fetch wallet data once on mount
    useEffect(() => {
        fetchWallet();
    }, [fetchWallet]);

    // Refresh profile if referral code is missing
    useEffect(() => {
        if (isAuthenticated && !user?.referralCode && !hasRefreshedProfile) {
            setHasRefreshedProfile(true);
            refreshUser();
        }
    }, [isAuthenticated, user?.referralCode, hasRefreshedProfile, refreshUser]);

    const handleConvert = async () => {
        const pts = parseInt(pointsInput, 10);
        if (!pts || pts <= 0) return;
        setConverting(true);
        await convertPoints(pts);
        setPointsInput('');
        setConverting(false);
        fetchWallet();
    };

    const handleCopyCode = () => {
        const code = user?.referralCode || (wallet as any)?.referralCode;
        if (!code) return;
        navigator.clipboard.writeText(code);
        setCopied(true);
        toast.success('Referral code copied!');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = () => {
        const code = user?.referralCode || (wallet as any)?.referralCode;
        if (!code) return;
        const text = `Join me on Our Store and get extra points using my referral code: ${code} ! Signup here: ${window.location.origin}/register?ref=${code}`;
        if (navigator.share) {
            navigator.share({
                title: 'Our Store Referral',
                text: text,
                url: `${window.location.origin}/register?ref=${code}`
            });
        } else {
            handleCopyCode();
        }
    };

    const previewNu = wallet
        ? ((parseInt(pointsInput, 10) || 0) * 0.1).toFixed(2)
        : '0.00';

    return (
        <div className="pt-24 pb-20 bg-gray-50/30 min-h-screen">
            <div className="bhutan-container max-w-5xl">
                {/* Header */}
                <div className="mb-10">
                    <h1 className="text-4xl font-display font-black tracking-tight bg-gradient-to-r from-amber-500 to-amber-700 bg-clip-text text-transparent">
                        My Wallet
                    </h1>
                    <p className="text-gray-500 mt-1 font-medium">Earn points, convert to Nu., use at checkout</p>
                </div>

                {/* Balance Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                    {/* Points Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-3xl p-8 text-white shadow-xl shadow-amber-200 relative overflow-hidden"
                    >
                        <div className="absolute -right-6 -top-6 w-36 h-36 bg-white/10 rounded-full" />
                        <div className="absolute -right-2 -bottom-8 w-24 h-24 bg-white/5 rounded-full" />
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-4">
                                <Coins className="w-5 h-5 opacity-80" />
                                <span className="text-sm font-bold uppercase tracking-widest opacity-80">Points Balance</span>
                            </div>
                            <p className="text-5xl font-black tracking-tight">
                                {isLoading ? '...' : (wallet?.points ?? 0).toLocaleString()}
                            </p>
                            <p className="text-sm mt-2 opacity-70 font-medium">≈ Nu. {((wallet?.points ?? 0) * 0.1).toFixed(2)}</p>
                        </div>
                    </motion.div>

                    {/* Wallet Balance Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 relative overflow-hidden"
                    >
                        <div className="absolute -right-6 -top-6 w-36 h-36 bg-green-50 rounded-full" />
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-4">
                                <Wallet className="w-5 h-5 text-green-600" />
                                <span className="text-sm font-bold uppercase tracking-widest text-gray-400">Wallet Balance</span>
                            </div>
                            <p className="text-5xl font-black tracking-tight text-gray-900">
                                {isLoading ? '...' : `Nu. ${(wallet?.walletBalance ?? 0).toFixed(2)}`}
                            </p>
                            <p className="text-sm mt-2 text-gray-400 font-medium">Available to use at checkout</p>
                        </div>
                    </motion.div>
                </div>

                {/* Convert Points Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 mb-8"
                >
                    <h2 className="text-xl font-display font-black mb-2">Convert Points to Wallet Balance</h2>
                    <p className="text-gray-400 text-sm font-medium mb-6">1 point = Nu. 0.10 &bull; Minimum 100 points to convert</p>

                    <div className="flex flex-col sm:flex-row gap-4 items-end">
                        <div className="flex-1">
                            <label className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-2">Points to convert</label>
                            <input
                                type="number"
                                min="100"
                                max={wallet?.points ?? 0}
                                value={pointsInput}
                                onChange={e => setPointsInput(e.target.value)}
                                placeholder="e.g. 200"
                                className="w-full h-14 px-5 rounded-2xl border-2 border-gray-100 bg-gray-50 focus:bg-white focus:border-amber-400 focus:outline-none font-bold text-lg transition-all"
                            />
                        </div>
                        <div className="w-14 h-14 flex items-center justify-center text-2xl font-black text-gray-300 shrink-0 mb-0.5">→</div>
                        <div className="flex-1">
                            <label className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-2">You will receive</label>
                            <div className="w-full h-14 px-5 rounded-2xl border-2 border-green-100 bg-green-50 flex items-center font-black text-lg text-green-700">
                                Nu. {previewNu}
                            </div>
                        </div>
                        <Button
                            onClick={handleConvert}
                            disabled={converting || !pointsInput || parseInt(pointsInput) < 100 || parseInt(pointsInput) > (wallet?.points ?? 0)}
                            className="h-14 px-8 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-black shadow-lg shadow-amber-200 transition-all disabled:opacity-40 shrink-0"
                        >
                            {converting ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Convert'}
                        </Button>
                    </div>
                </motion.div>

                {/* Refer & Earn Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.22 }}
                    className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-3xl p-8 text-white shadow-xl shadow-indigo-200 mb-8 relative overflow-hidden"
                >
                    <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl" />
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                        <div className="flex-1">
                            <h2 className="text-2xl font-display font-black mb-2 flex items-center gap-2">
                                <Gift className="w-6 h-6 text-indigo-300" />
                                Refer & Earn Points
                            </h2>
                            <p className="text-indigo-100/80 font-medium text-sm">
                                Invite your friends to shop! They get an extra bonus, and you earn points when they verify their account.
                            </p>
                            
                            <div className="mt-8 flex flex-wrap gap-4">
                                <div className="bg-white/10 backdrop-blur-md border border-white/20 px-6 py-3 rounded-2xl flex items-center gap-4 group">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Your Referral Code</p>
                                        <p className="text-xl font-black tracking-widest">
                                            {user?.referralCode || (wallet as any)?.referralCode || 'GENERATING...'}
                                        </p>
                                    </div>
                                    <button 
                                        onClick={handleCopyCode}
                                        className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                                    >
                                        {copied ? <CheckCircle2 className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                                    </button>
                                </div>
                                <Button 
                                    onClick={handleShare}
                                    className="h-16 px-8 bg-white text-indigo-700 hover:bg-indigo-50 rounded-2xl font-black flex items-center gap-2 shadow-xl"
                                >
                                    <Share2 className="w-5 h-5" />
                                    Share Invite
                                </Button>
                            </div>
                        </div>
                        <div className="hidden md:block w-32 h-32 bg-indigo-500/30 rounded-full flex items-center justify-center border border-white/10">
                            <Gift className="w-16 h-16 text-indigo-200 animate-bounce" />
                        </div>
                    </div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
                >
                    {[
                        { icon: Gift, label: 'Sign Up Bonus', value: '50 pts', color: 'from-purple-400 to-purple-600' },
                        { icon: ArrowUpRight, label: 'Per Purchase', value: '5% in pts', color: 'from-blue-400 to-blue-600' },
                        { icon: Coins, label: 'Conversion Rate', value: '1 pt = Nu. 0.10', color: 'from-amber-400 to-amber-600' },
                    ].map(({ icon: Icon, label, value, color }) => (
                        <div key={label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shrink-0`}>
                                <Icon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{label}</p>
                                <p className="text-base font-black text-gray-900">{value}</p>
                            </div>
                        </div>
                    ))}
                </motion.div>

                {/* Transaction History */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden"
                >
                    <div className="p-6 border-b border-gray-50 flex items-center gap-3">
                        <Clock className="w-5 h-5 text-gray-400" />
                        <h2 className="text-lg font-display font-black">Transaction History</h2>
                    </div>

                    {isLoading ? (
                        <div className="p-12 text-center text-gray-400 font-medium">Loading...</div>
                    ) : !wallet?.transactions?.length ? (
                        <div className="p-12 text-center text-gray-400 font-medium">No transactions yet. Start earning points!</div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {wallet.transactions.map(tx => (
                                <div key={tx._id} className="flex items-center gap-4 p-5 hover:bg-gray-50/50 transition-colors">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                        tx.type === 'credit' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'
                                    }`}>
                                        {tx.type === 'credit'
                                            ? <ArrowUpRight className="w-5 h-5" />
                                            : <ArrowDownLeft className="w-5 h-5" />
                                        }
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-gray-900 truncate text-sm">{tx.description}</p>
                                        <p className="text-xs text-gray-400 font-medium mt-0.5">
                                            {new Date(tx.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        {tx.amount > 0 && (
                                            <p className={`font-black text-sm ${tx.type === 'credit' ? 'text-green-600' : 'text-red-500'}`}>
                                                {tx.type === 'credit' ? '+' : '-'} Nu. {tx.amount.toFixed(2)}
                                            </p>
                                        )}
                                        {tx.points && tx.points !== 0 && (
                                            <p className="text-xs font-bold text-amber-500">
                                                {tx.points > 0 ? '+' : ''}{tx.points} pts
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
