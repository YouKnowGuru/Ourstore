'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Eye, EyeOff, ArrowLeft, Mail, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDispatch, useSelector } from 'react-redux';
import { resetPassword } from '@/lib/store/slices/authSlice';
import type { AppDispatch, RootState } from '@/lib/store';
import { toast } from 'sonner';

const ResetPasswordContent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const dispatch = useDispatch<AppDispatch>();
    const { isLoading } = useSelector((state: RootState) => state.auth);

    const userId = searchParams.get('userId');

    const [formData, setFormData] = useState({
        otp: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);

    if (!userId) {
        if (typeof window !== 'undefined') {
            router.push('/forgot-password');
        }
        return null;
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.otp || !formData.newPassword) {
            toast.error('Please fill in all fields');
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (formData.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        try {
            await dispatch(
                resetPassword({
                    userId,
                    otp: formData.otp,
                    newPassword: formData.newPassword,
                })
            ).unwrap();

            toast.success('Password reset successful!');
            router.push('/login');
        } catch (error: any) {
            toast.error(error || 'Failed to reset password');
        }
    };

    return (
        <div className="space-y-6">
            <button
                onClick={() => router.push('/forgot-password')}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-saffron"
            >
                <ArrowLeft className="w-4 h-4" />
                Back
            </button>

            <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-maroon/5 border border-maroon/10 text-maroon text-[10px] font-bold uppercase tracking-wider">
                    <Lock className="w-3 h-3" />
                    <span>Security Update</span>
                </div>
                <h1 className="text-3xl font-display font-black text-gray-900">Reset Password</h1>
                <p className="text-gray-500 font-medium">
                    Enter your 6-digit OTP and set a new secure password.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* OTP Code */}
                <div className="space-y-1.5">
                    <Label htmlFor="otp" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block text-center mb-1">OTP Code</Label>
                    <div className="relative group">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-gray-50/80 rounded-xl flex items-center justify-center group-focus-within:bg-maroon/10 transition-all duration-300">
                            <Mail className="w-4 h-4 text-gray-400 group-focus-within:text-maroon transition-colors" />
                        </div>
                        <Input
                            id="otp"
                            name="otp"
                            placeholder="000000"
                            value={formData.otp}
                            onChange={handleChange}
                            maxLength={6}
                            className="h-16 px-14 text-center bg-gray-50/30 border-gray-100 text-gray-900 placeholder:text-gray-300 rounded-2xl focus:ring-8 focus:ring-maroon/5 focus:border-maroon/20 transition-all duration-500 font-black text-2xl tracking-[0.5em] shadow-sm"
                            required
                        />
                    </div>
                </div>

                {/* New Password */}
                <div className="space-y-1.5">
                    <Label htmlFor="newPassword" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block text-center mb-1">New Password</Label>
                    <div className="relative group">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-gray-50/80 rounded-xl flex items-center justify-center group-focus-within:bg-maroon/10 transition-all duration-300">
                            <Lock className="w-4 h-4 text-gray-400 group-focus-within:text-maroon transition-colors" />
                        </div>
                        <Input
                            id="newPassword"
                            name="newPassword"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            value={formData.newPassword}
                            onChange={handleChange}
                            className="h-16 px-14 text-center bg-gray-50/30 border-gray-100 text-gray-900 placeholder:text-gray-300 rounded-2xl focus:ring-8 focus:ring-maroon/5 focus:border-maroon/20 transition-all duration-500 font-medium text-base shadow-sm"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1.5"
                        >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block text-center mb-1">Confirm Password</Label>
                    <div className="relative group">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-gray-50/80 rounded-xl flex items-center justify-center group-focus-within:bg-maroon/10 transition-all duration-300">
                            <Lock className="w-4 h-4 text-gray-400 group-focus-within:text-maroon transition-colors" />
                        </div>
                        <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="h-16 px-14 text-center bg-gray-50/30 border-gray-100 text-gray-900 placeholder:text-gray-300 rounded-2xl focus:ring-8 focus:ring-maroon/5 focus:border-maroon/20 transition-all duration-500 font-medium text-base shadow-sm"
                            required
                        />
                    </div>
                </div>

                <Button
                    type="submit"
                    className="w-full h-16 bg-gradient-to-r from-maroon to-maroon-800 hover:from-maroon-800 hover:to-maroon-900 text-white rounded-2xl font-black shadow-lg shadow-maroon/20 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 group relative overflow-hidden"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span className="text-base">Resetting...</span>
                        </div>
                    ) : (
                        <span className="text-base uppercase tracking-widest relative z-10">Reset Password</span>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
                </Button>
            </form>

            <div className="text-center pt-2">
                <button
                    onClick={() => router.push('/forgot-password')}
                    className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors group"
                >
                    <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                    Back to Recovery
                </button>
            </div>
        </div>
    );
};

export default function ResetPassword() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center p-8">
                <Loader2 className="w-8 h-8 text-maroon animate-spin" />
                <p className="mt-2 text-sm text-gray-500">Loading...</p>
            </div>
        }>
            <ResetPasswordContent />
        </Suspense>
    );
}
