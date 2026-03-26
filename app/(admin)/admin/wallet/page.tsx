'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Settings, Users, Coins, Wallet, Check, AlertCircle, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const AdminWallet = () => {
    const [settings, setSettings] = useState<any>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState('');

    const [modal, setModal] = useState<{ open: boolean; user: any; type: 'points' | 'wallet' }>({ open: false, user: null, type: 'points' });
    const [adjustment, setAdjustment] = useState('');
    const [reason, setReason] = useState('');

    const getAuthHeaders = useCallback(() => {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` })
        };
    }, []);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [settingsRes, usersRes] = await Promise.all([
                fetch('/api/admin/wallet-settings', { headers: getAuthHeaders() }),
                fetch('/api/admin/wallet-users', { headers: getAuthHeaders() }),
            ]);

            if (settingsRes.ok) {
                const data = await settingsRes.json();
                setSettings(data.settings);
            }
            if (usersRes.ok) {
                const data = await usersRes.json();
                setUsers(data.users);
            }
        } catch (error) {
            toast.error('Failed to load wallet data');
        } finally {
            setIsLoading(false);
        }
    }, [getAuthHeaders]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch('/api/admin/wallet-settings', {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(settings),
            });
            if (!res.ok) throw new Error('Failed to update settings');
            toast.success('Wallet settings updated successfully');
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleAdjustBalance = async () => {
        const val = parseFloat(adjustment);
        if (isNaN(val) || val === 0) return toast.error('Enter a valid adjustment value');

        try {
            const payload = {
                userId: modal.user._id,
                reason: reason || 'Admin manual adjustment',
                pointsAdjustment: modal.type === 'points' ? val : 0,
                walletAdjustment: modal.type === 'wallet' ? val : 0,
            };

            const res = await fetch('/api/admin/wallet-users', {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            toast.success('Balance updated successfully');
            setModal({ open: false, user: null, type: 'points' });
            setAdjustment('');
            setReason('');
            fetchData();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    if (isLoading) {
        return <div className="p-10 flex justify-center"><div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full" /></div>;
    }

    const filteredUsers = users.filter(u =>
        u.fullName.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-3xl font-display font-black text-gray-900 tracking-tight">Wallet & Rewards</h1>
                <p className="text-gray-500 font-medium tracking-wide">Manage the loyalty economy, point rules, and user balances.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* SETTINGS CARD */}
                <Card className="lg:col-span-1 border-none shadow-sm rounded-[2.5rem] bg-white overflow-hidden">
                    <CardHeader className="bg-amber-50/50 p-6 border-b border-amber-100 border-dashed">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <Settings className="w-5 h-5 text-amber-600" />
                            Economy Rules
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        {settings ? (
                            <form onSubmit={handleSaveSettings} className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 block">Point Conversion (Nu.)</label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            step="0.01"
                                            className="pl-8 rounded-xl bg-gray-50 border-gray-200"
                                            value={settings.pointToNuRate}
                                            onChange={e => setSettings({ ...settings, pointToNuRate: parseFloat(e.target.value) })}
                                        />
                                        <span className="absolute left-3 top-2.5 text-gray-400 font-bold">₹</span>
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-1">Value of 1 point in Ngultrum.</p>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 block">Min Withdraw Points</label>
                                    <Input
                                        type="number"
                                        className="rounded-xl bg-gray-50 border-gray-200"
                                        value={settings.minRedeemPoints}
                                        onChange={e => setSettings({ ...settings, minRedeemPoints: parseInt(e.target.value, 10) })}
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 block">Max Checkout % (0-100)</label>
                                    <Input
                                        type="number"
                                        className="rounded-xl bg-gray-50 border-gray-200"
                                        value={settings.maxRedeemPercentage}
                                        onChange={e => setSettings({ ...settings, maxRedeemPercentage: parseInt(e.target.value, 10) })}
                                    />
                                    <p className="text-[10px] text-gray-400 mt-1">Maximum portion of order payable by wallet.</p>
                                </div>

                                {/* Rewards Rates */}
                                <div className="pt-4 border-t border-dashed border-gray-200 space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-green-600 uppercase tracking-widest mb-1 block flex items-center gap-1">
                                            <TrendingUp className="w-3 h-3" /> Signup Bonus Points
                                        </label>
                                        <Input
                                            type="number"
                                            className="rounded-xl bg-green-50/50 border-green-200 focus:border-green-400"
                                            value={settings.signupPoints}
                                            onChange={e => setSettings({ ...settings, signupPoints: parseInt(e.target.value, 10) })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-green-600 uppercase tracking-widest mb-1 block">Purchase Reward (%)</label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            className="rounded-xl bg-green-50/50 border-green-200 focus:border-green-400"
                                            value={settings.purchasePointRate}
                                            onChange={e => setSettings({ ...settings, purchasePointRate: parseFloat(e.target.value) })}
                                        />
                                        <p className="text-[10px] text-gray-400 mt-1">Multiplier on order total (e.g., 0.05 = 5%).</p>
                                    </div>
                                    <div className="pt-2 border-t border-dashed border-green-100">
                                        <label className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1 block">Referrer Reward (Points)</label>
                                        <Input
                                            type="number"
                                            className="rounded-xl bg-indigo-50/50 border-indigo-200 focus:border-indigo-400"
                                            value={settings.referralRewardPoints}
                                            onChange={e => setSettings({ ...settings, referralRewardPoints: parseInt(e.target.value, 10) })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1 block">Referred User Bonus (Points)</label>
                                        <Input
                                            type="number"
                                            className="rounded-xl bg-indigo-50/50 border-indigo-200 focus:border-indigo-400"
                                            value={settings.referredSignupBonus}
                                            onChange={e => setSettings({ ...settings, referredSignupBonus: parseInt(e.target.value, 10) })}
                                        />
                                    </div>
                                </div>

                                <Button disabled={saving} className="w-full h-12 rounded-xl bg-gray-900 hover:bg-black font-bold tracking-wide mt-2">
                                    {saving ? 'Saving...' : 'Save Economy Rules'}
                                </Button>
                            </form>
                        ) : (
                            <div className="py-10 text-center space-y-4">
                                <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
                                <p className="text-sm font-bold text-gray-500">Failed to load economy rules.</p>
                                <Button size="sm" variant="outline" onClick={fetchData}>Try Again</Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* USER BALANCES */}
                <Card className="lg:col-span-2 border-none shadow-sm rounded-[2.5rem] bg-white overflow-hidden flex flex-col h-[700px]">
                    <CardHeader className="bg-gray-50/50 p-6 border-b border-gray-100 flex-shrink-0">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Users className="w-5 h-5 text-blue-600" />
                                User Balances
                            </CardTitle>
                            <Input
                                placeholder="Search users by name or email..."
                                className="w-full sm:w-64 rounded-xl bg-white"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 overflow-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50 sticky top-0 z-10 shadow-sm">
                                <tr>
                                    <th className="px-6 py-4 font-bold tracking-wider">User</th>
                                    <th className="px-6 py-4 font-bold tracking-wider text-right">Points</th>
                                    <th className="px-6 py-4 font-bold tracking-wider text-right">Nu. Balance</th>
                                    <th className="px-6 py-4 font-bold tracking-wider text-center">Admin Controls</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredUsers.map(user => (
                                    <tr key={user._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-gray-900">{user.fullName}</p>
                                            <p className="text-xs text-gray-400">{user.email}</p>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="inline-flex items-center gap-1 font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg">
                                                <Coins className="w-3.5 h-3.5" />
                                                {user.points ?? 0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="inline-flex items-center gap-1 font-black text-green-600 bg-green-50 px-2.5 py-1 rounded-lg">
                                                <Wallet className="w-3.5 h-3.5" />
                                                Nu. {(user.walletBalance ?? 0).toFixed(2)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center gap-2">
                                                <Button size="sm" variant="outline" className="h-8 text-xs font-bold rounded-lg border-amber-200 text-amber-600 hover:bg-amber-50 border-dashed" onClick={() => setModal({ open: true, user, type: 'points' })}>
                                                    ± Points
                                                </Button>
                                                <Button size="sm" variant="outline" className="h-8 text-xs font-bold rounded-lg border-green-200 text-green-600 hover:bg-green-50 border-dashed" onClick={() => setModal({ open: true, user, type: 'wallet' })}>
                                                    ± Wallet
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            </div>

            {/* ADJUSTMENT MODAL */}
            {modal.open && modal.user && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-3 mb-6">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${modal.type === 'points' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
                                {modal.type === 'points' ? <Coins /> : <Wallet />}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 leading-tight">Adjust {modal.type === 'points' ? 'Points' : 'Wallet'}</h3>
                                <p className="text-xs text-gray-500 mt-0.5">For {modal.user.fullName}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">
                                    Current {modal.type === 'points' ? 'Points' : 'Balance'}: {modal.type === 'points' ? (modal.user.points ?? 0) : `Nu. ${(modal.user.walletBalance ?? 0).toFixed(2)}`}
                                </label>
                                <Input
                                    type="number"
                                    placeholder="e.g. 500 or -500"
                                    value={adjustment}
                                    onChange={e => setAdjustment(e.target.value)}
                                    className="h-12 bg-gray-50 border-gray-200 focus:bg-white text-lg font-bold"
                                />
                                <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    Use negative numbers to deduct.
                                </p>
                            </div>
                            <div>
                                <Input
                                    type="text"
                                    placeholder="Reason for adjustment..."
                                    value={reason}
                                    onChange={e => setReason(e.target.value)}
                                    className="bg-gray-50 border-gray-200 focus:bg-white"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <Button variant="ghost" className="flex-1 rounded-xl" onClick={() => setModal({ open: false, user: null, type: 'points' })}>Cancel</Button>
                                <Button className="flex-1 rounded-xl bg-gray-900 hover:bg-black font-bold shadow-lg" onClick={handleAdjustBalance}>Confirm</Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminWallet;
