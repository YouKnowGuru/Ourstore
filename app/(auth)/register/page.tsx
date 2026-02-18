'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, User, Mail, Lock, Phone, UserPlus, ShieldCheck, Chrome } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { useDispatch } from 'react-redux';
import { register } from '@/lib/store/slices/authSlice';
import type { AppDispatch } from '@/lib/store';

const Register = () => {
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        setIsLoading(true);

        try {
            const result = await dispatch(register({
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                password: formData.password
            })).unwrap();

            toast.success('Welcome to Our Store family!', {
                description: 'Account created successfully. Please verify your email.',
            });

            // Backend returns userId directly in response
            router.push(`/verify-email?userId=${result.userId}`);
        } catch (error: any) {
            toast.error(error || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Friendly Header */}
            <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-maroon/5 border border-maroon/10 text-maroon text-[10px] font-bold uppercase tracking-wider">
                    <span>New Account</span>
                </div>
                <h2 className="text-3xl font-display font-black text-gray-900">Join Us Today</h2>
                <p className="text-gray-500 font-medium">Create your account to start shopping.</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div className="space-y-1.5 md:col-span-2">
                        <Label htmlFor="fullName" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block text-center mb-1">Full Name</Label>
                        <div className="relative group">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-gray-50/80 rounded-xl flex items-center justify-center group-focus-within:bg-maroon/10 transition-all duration-300">
                                <User className="w-4 h-4 text-gray-400 group-focus-within:text-maroon transition-colors" />
                            </div>
                            <Input
                                id="fullName"
                                name="fullName"
                                placeholder="Ex. Sonam Dorji"
                                value={formData.fullName}
                                onChange={handleChange}
                                className="h-16 px-14 text-center bg-gray-50/30 border-gray-100 text-gray-900 placeholder:text-gray-300 rounded-2xl focus:ring-8 focus:ring-maroon/5 focus:border-maroon/20 transition-all duration-500 font-medium text-base shadow-sm"
                                required
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                        <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block text-center mb-1">Email Address</Label>
                        <div className="relative group">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-gray-50/80 rounded-xl flex items-center justify-center group-focus-within:bg-saffron/10 transition-all duration-300">
                                <Mail className="w-4 h-4 text-gray-400 group-focus-within:text-saffron transition-colors" />
                            </div>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="name@email.com"
                                value={formData.email}
                                onChange={handleChange}
                                className="h-16 px-14 text-center bg-gray-50/30 border-gray-100 text-gray-900 placeholder:text-gray-300 rounded-2xl focus:ring-8 focus:ring-saffron/5 focus:border-saffron/20 transition-all duration-500 font-medium text-base shadow-sm"
                                required
                            />
                        </div>
                    </div>

                    {/* Phone */}
                    <div className="space-y-1.5">
                        <Label htmlFor="phone" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block text-center mb-1">Phone Number</Label>
                        <div className="relative group">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-gray-50/80 rounded-xl flex items-center justify-center group-focus-within:bg-bhutan-blue/10 transition-all duration-300">
                                <Phone className="w-4 h-4 text-gray-400 group-focus-within:text-bhutan-blue transition-colors" />
                            </div>
                            <Input
                                id="phone"
                                name="phone"
                                type="tel"
                                placeholder="17XXXXXX"
                                value={formData.phone}
                                onChange={handleChange}
                                className="h-16 px-14 text-center bg-gray-50/30 border-gray-100 text-gray-900 placeholder:text-gray-300 rounded-2xl focus:ring-8 focus:ring-bhutan-blue/5 focus:border-bhutan-blue/20 transition-all duration-500 font-medium text-base shadow-sm"
                                required
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-1.5">
                        <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block text-center mb-1">Password</Label>
                        <div className="relative group">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-gray-50/80 rounded-xl flex items-center justify-center group-focus-within:bg-maroon/10 transition-all duration-300">
                                <Lock className="w-4 h-4 text-gray-400 group-focus-within:text-maroon transition-colors" />
                            </div>
                            <Input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                className="h-16 px-14 text-center bg-gray-50/30 border-gray-100 text-gray-900 placeholder:text-gray-300 rounded-2xl focus:ring-8 focus:ring-maroon/5 focus:border-maroon/20 transition-all duration-500 font-medium text-base shadow-sm"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors p-1.5"
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
                                <ShieldCheck className="w-4 h-4 text-gray-400 group-focus-within:text-maroon transition-colors" />
                            </div>
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="h-16 px-14 text-center bg-gray-50/30 border-gray-100 text-gray-900 placeholder:text-gray-300 rounded-2xl focus:ring-8 focus:ring-maroon/5 focus:border-maroon/20 transition-all duration-500 font-medium text-base shadow-sm"
                                required
                            />
                        </div>
                    </div>
                </div>



                {/* Terms and Conditions */}
                <div className="flex items-start space-x-3 px-1">
                    <Checkbox id="terms" className="mt-1 rounded-md border-gray-200 data-[state=checked]:bg-maroon data-[state=checked]:border-maroon" required />
                    <Label
                        htmlFor="terms"
                        className="text-xs font-medium text-gray-400 leading-tight cursor-pointer"
                    >
                        I agree to the <Link href="/terms-and-conditions" className="text-maroon hover:underline">Terms and Conditions</Link> of the site.
                    </Label>
                </div>

                {/* Submit */}
                <Button
                    type="submit"
                    className="w-full h-16 bg-gradient-to-r from-maroon to-maroon-800 hover:from-maroon-800 hover:to-maroon-900 text-white rounded-2xl font-black shadow-lg shadow-maroon/20 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 group relative overflow-hidden"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span className="text-base text-white">Creating Account...</span>
                        </div>
                    ) : (
                        <>
                            <span className="text-base uppercase tracking-widest relative z-10">Create Account</span>
                            <UserPlus className="w-5 h-5 group-hover:rotate-12 transition-transform relative z-10" />
                        </>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
                </Button>

                {/* Social Login */}
                <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-100"></span>
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase font-black tracking-[0.2em]">
                        <span className="bg-white px-4 text-gray-300">Or continue with</span>
                    </div>
                </div>

                <Button
                    type="button"
                    variant="outline"
                    className="w-full h-14 rounded-xl border-gray-100 hover:bg-gray-50 hover:border-gray-200 transition-all duration-300 flex items-center justify-center gap-3 group"
                    onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/google`}
                >
                    <div className="w-6 h-6 flex items-center justify-center bg-white rounded-lg shadow-sm border border-gray-100 group-hover:scale-110 transition-transform">
                        <Chrome className="w-4 h-4 text-gray-600" />
                    </div>
                    <span className="font-bold text-gray-600 text-sm">Google Account</span>
                </Button>
            </form>

            {/* Footer Link */}
            <div className="text-center pt-4">
                <p className="text-gray-500 font-medium">
                    Already have an account?{' '}
                    <Link
                        href="/login"
                        className="text-maroon font-black hover:underline underline-offset-4 transition-all"
                    >
                        Log In here
                    </Link>
                </p>
            </div>
        </div >
    );
};

export default Register;
