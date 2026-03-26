'use client';

import { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Search, 
  Filter, 
  RefreshCw, 
  ExternalLink, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle,
  MoreVertical,
  Calendar,
  Mail,
  Hash,
  ShoppingCart
} from 'lucide-react';
import { format } from 'date-fns';
import { adminAPI } from '@/lib/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const TransactionsPage = () => {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState<string | null>(null);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getTransactions({
        page,
        status: statusFilter,
        orderNo: searchQuery,
      });
      setTransactions(res.data.transactions);
      setTotal(res.data.total);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [page, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTransactions();
  };

  const handleRefreshStatus = async (orderNo: string) => {
    setIsRefreshing(orderNo);
    try {
      const res = await adminAPI.refreshTransactionStatus(orderNo);
      toast.success(`Status updated: ${res.data.status}`);
      fetchTransactions();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to refresh status');
    } finally {
      setIsRefreshing(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20 gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Success</Badge>;
      case 'FAILED':
        return <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500/20 gap-1.5"><XCircle className="w-3.5 h-3.5" /> Failed</Badge>;
      case 'PENDING':
        return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20 gap-1.5"><Clock className="w-3.5 h-3.5" /> Pending</Badge>;
      case 'INITIATED':
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20 gap-1.5"><AlertCircle className="w-3.5 h-3.5" /> Initiated</Badge>;
      case 'TIMEOUT':
        return <Badge className="bg-slate-500/10 text-slate-500 border-slate-500/20 hover:bg-slate-500/20 gap-1.5"><Clock className="w-3.5 h-3.5" /> Timeout</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="p-8 space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-saffron/10 flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-saffron" />
            </div>
            <h1 className="text-3xl font-display font-black tracking-tight text-gray-900">Payment Transactions</h1>
          </div>
          <p className="text-gray-500 font-medium ml-15">Monitor and manage all BFS Secure transactions</p>
        </div>
      </div>

      {/* Stats Cards (Simplified for now) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Transactions', value: total, color: 'blue' },
          { label: 'Successful', value: transactions.filter((t: any) => t.status === 'SUCCESS').length, color: 'emerald' },
          { label: 'Pending', value: transactions.filter((t: any) => t.status === 'PENDING' || t.status === 'INITIATED').length, color: 'amber' },
          { label: 'Failed', value: transactions.filter((t: any) => t.status === 'FAILED' || t.status === 'TIMEOUT').length, color: 'rose' },
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-3xl p-6 backdrop-blur-xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">{stat.label}</p>
            <p className={`text-3xl font-display font-black text-${stat.color}-500`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="bg-white border border-gray-200 rounded-[2rem] p-6 backdrop-blur-xl space-y-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-saffron transition-colors" />
            <Input 
              placeholder="Search by Order No (e.g. BFS...)" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 bg-gray-50 border-gray-300 rounded-2xl text-gray-900 placeholder:text-gray-400 focus:ring-saffron/20 focus:border-saffron/50 transition-all"
            />
          </form>

          <div className="flex gap-4">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-14 px-6 bg-gray-50 border border-gray-300 rounded-2xl text-gray-900 outline-none focus:ring-2 focus:ring-saffron/20 transition-all cursor-pointer min-w-[180px]"
            >
              <option value="" className="bg-[#1a1c23]">All Statuses</option>
              <option value="SUCCESS" className="bg-[#1a1c23]">Success</option>
              <option value="PENDING" className="bg-[#1a1c23]">Pending</option>
              <option value="FAILED" className="bg-[#1a1c23]">Failed</option>
              <option value="INITIATED" className="bg-[#1a1c23]">Initiated</option>
            </select>

            <Button 
              onClick={fetchTransactions}
              className="h-14 px-8 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-2xl font-bold transition-all border border-gray-300"
            >
              <RefreshCw className={`w-5 h-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-3">
            <thead>
              <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                <th className="px-6 py-4">Transaction Details</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="bg-gray-100 h-20 rounded-3xl" />
                  </tr>
                ))
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-20 text-gray-400 font-bold">No transactions found</td>
                </tr>
              ) : (
                transactions.map((txn: any) => (
                  <tr key={txn._id} className="group hover:translate-x-1 transition-transform duration-300">
                    <td className="px-6 py-5 bg-gray-50 border-y border-l border-gray-200 rounded-l-[1.5rem] first:rounded-l-[1.5rem]">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <Hash className="w-3.5 h-3.5 text-saffron" />
                          <span className="font-mono font-bold text-gray-900">{txn.orderNo}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 text-xs">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(txn.createdAt), 'MMM dd, yyyy • HH:mm')}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 bg-gray-50 border-y border-gray-200">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900 text-sm">{txn.remitterName || '—'}</span>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Mail className="w-3 h-3" />
                          {txn.remitterEmail}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 bg-gray-50 border-y border-gray-200 font-black text-gray-900">
                      Nu. {txn.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-5 bg-gray-50 border-y border-gray-200">
                      {getStatusBadge(txn.status)}
                    </td>
                    <td className="px-6 py-5 bg-gray-50 border-y border-r border-gray-200 rounded-r-[1.5rem] text-right">
                      <div className="flex items-center justify-end gap-2">
                        {(txn.status === 'PENDING' || txn.status === 'INITIATED') && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRefreshStatus(txn.orderNo)}
                            disabled={isRefreshing === txn.orderNo}
                            className="h-9 w-9 p-0 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 hover:text-amber-600 rounded-xl transition-all"
                            title="Refresh Status from BFS"
                          >
                            <RefreshCw className={`w-4 h-4 ${isRefreshing === txn.orderNo ? 'animate-spin' : ''}`} />
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-9 w-9 p-0 hover:bg-gray-200 text-gray-500 hover:text-gray-900 rounded-xl">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 bg-white border-gray-200 text-gray-900 rounded-xl p-2 shadow-2xl">
                            <DropdownMenuItem className="rounded-lg gap-2 cursor-pointer focus:bg-gray-100">
                              <ExternalLink className="w-4 h-4" /> View Order
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="rounded-lg gap-2 cursor-pointer focus:bg-gray-100"
                              onClick={() => {
                                if (txn.orderId?._id) {
                                  // Add logic to view order details
                                }
                              }}
                            >
                              <ShoppingCart className="w-4 h-4" /> Order Details
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > 0 && (
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest leading-none">
              Showing <span className="text-gray-900">{(page - 1) * 20 + 1}</span> to <span className="text-gray-900">{Math.min(page * 20, total)}</span> of <span className="text-gray-900">{total}</span> Transactions
            </p>
            <div className="flex gap-2">
              <Button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="h-10 px-4 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl disabled:opacity-30 transition-all font-bold"
              >
                Prev
              </Button>
              <Button
                disabled={page * 20 >= total}
                onClick={() => setPage(p => p + 1)}
                className="h-10 px-4 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl disabled:opacity-30 transition-all font-bold"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionsPage;
