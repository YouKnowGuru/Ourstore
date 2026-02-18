import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, Send, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDispatch } from 'react-redux';
import { forgotPassword } from '@/store/slices/authSlice';
import type { AppDispatch } from '@/store';
import { toast } from 'sonner';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setIsLoading(true);
    try {
      const result = await dispatch(forgotPassword(email)).unwrap();
      setIsSubmitted(true);
      toast.success('OTP sent to your email');
      // Store userId from response for reset password flow
      sessionStorage.setItem('resetUserId', result.userId);
    } catch (error: any) {
      toast.error(error || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    const userId = sessionStorage.getItem('resetUserId');
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 text-center">
        <div className="relative inline-block">
          <div className="w-24 h-24 mx-auto rounded-[2rem] bg-green-50 flex items-center justify-center border border-green-100/50 shadow-inner">
            <CheckCircle className="w-10 h-10 text-green-500 animate-bounce-slow" />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-lg shadow-sm border border-gray-50 flex items-center justify-center">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-3xl font-display font-black text-gray-900">Check Your Inbox</h2>
          <p className="text-gray-500 font-medium max-w-xs mx-auto">
            We've sent a secure reset code to <span className="text-gray-900 font-bold">{email}</span>
          </p>
        </div>

        <div className="space-y-4 pt-4">
          <Button
            onClick={() => navigate('/reset-password', { state: { userId } })}
            className="w-full h-20 bg-gray-900 hover:bg-black text-white rounded-[2rem] font-black shadow-xl shadow-gray-200 transform hover:scale-[1.01] transition-all flex items-center justify-center gap-3 group"
          >
            <span className="text-lg uppercase tracking-widest">Enter Reset Code</span>
            <ArrowLeft className="w-6 h-6 rotate-180 group-hover:translate-x-1 transition-transform" />
          </Button>

          <button
            onClick={() => setIsSubmitted(false)}
            className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors"
          >
            Didn't get the code? Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Friendly Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-saffron/10 border border-saffron/20 text-saffron text-[10px] font-bold uppercase tracking-wider">
          <KeyRound className="w-3 h-3" />
          <span>Account Recovery</span>
        </div>
        <h2 className="text-3xl font-display font-black text-gray-900">Forgot Password?</h2>
        <p className="text-gray-500 font-medium">No worries, we'll help you get back in.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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


        <Button
          type="submit"
          className="w-full h-16 bg-gradient-to-r from-maroon to-maroon-800 hover:from-maroon-800 hover:to-maroon-900 text-white rounded-2xl font-black shadow-lg shadow-maroon/20 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 group overflow-hidden relative"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span className="text-base">Sending Code...</span>
            </div>
          ) : (
            <>
              <span className="text-base uppercase tracking-widest relative z-10">Send Reset Code</span>
              <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform relative z-10" />
            </>
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
        </Button>
      </form>

      {/* Back to Login */}
      <div className="text-center pt-4">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          Back to Secure Sign In
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
