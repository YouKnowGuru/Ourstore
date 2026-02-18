import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Chrome, ArrowRight, Fingerprint } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '@/store/slices/authSlice';
import type { AppDispatch, RootState } from '@/store';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading } = useSelector((state: RootState) => state.auth);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await dispatch(login({ email, password })).unwrap();
      toast.success('Welcome back to Our Store!', {
        description: 'You have successfully signed in.',
        icon: <Fingerprint className="w-5 h-5 text-maroon" />,
      });
      const from = location.state?.from?.pathname || '/';
      navigate(from);
    } catch (error: any) {
      toast.error(error || 'Login failed');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Friendly Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-saffron/10 border border-saffron/20 text-saffron text-[10px] font-bold uppercase tracking-wider">
          <span>Secure Sign In</span>
        </div>
        <h2 className="text-3xl font-display font-black text-gray-900">Welcome Back</h2>
        <p className="text-gray-500 font-medium">Please enter your details to login.</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
        <div className="space-y-4">
          {/* Email Field */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block text-center mb-1">Email Address</Label>
            <div className="relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-gray-50/80 rounded-xl flex items-center justify-center group-focus-within:bg-maroon/10 transition-all duration-300">
                <Mail className="w-4 h-4 text-gray-400 group-focus-within:text-maroon transition-colors" />
              </div>
              <Input
                id="email"
                type="email"
                placeholder="name@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-16 px-14 text-center bg-gray-50/30 border-gray-100 text-gray-900 placeholder:text-gray-300 rounded-2xl focus:ring-8 focus:ring-maroon/5 focus:border-maroon/20 transition-all duration-500 font-medium text-base shadow-sm"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-1">
              <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Password</Label>
              <Link to="/forgot-password" title="Forgot password?" className="text-xs font-bold text-maroon hover:text-saffron transition-colors">
                Forgot password?
              </Link>
            </div>
            <div className="relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-gray-50/80 rounded-xl flex items-center justify-center group-focus-within:bg-maroon/10 transition-all duration-300">
                <Lock className="w-4 h-4 text-gray-400 group-focus-within:text-maroon transition-colors" />
              </div>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
        </div>


        {/* Remember Me */}
        <div className="flex items-center space-x-2 px-1">
          <Checkbox id="remember" className="rounded-md border-gray-200 data-[state=checked]:bg-maroon data-[state=checked]:border-maroon" />
          <label
            htmlFor="remember"
            className="text-xs font-medium text-gray-400 leading-none cursor-pointer"
          >
            Remember me on this device
          </label>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full h-16 bg-gradient-to-r from-maroon to-maroon-800 hover:from-maroon-800 hover:to-maroon-900 text-white rounded-2xl font-black shadow-lg shadow-maroon/20 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 group relative overflow-hidden"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span className="text-base">Logging in...</span>
            </div>
          ) : (
            <>
              <span className="text-base uppercase tracking-widest relative z-10">Sign In</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />
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
          onClick={() => window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/google`}
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
          New here?{' '}
          <Link
            to="/register"
            className="text-saffron font-black hover:underline underline-offset-4 transition-all"
          >
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
