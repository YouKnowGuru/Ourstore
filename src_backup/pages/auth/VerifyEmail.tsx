import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDispatch, useSelector } from 'react-redux';
import { verifyEmail } from '@/store/slices/authSlice';
import type { AppDispatch, RootState } from '@/store';
import { toast } from 'sonner';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading } = useSelector((state: RootState) => state.auth);

  const userId = location.state?.userId;
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!userId) {
      toast.error('Session expired. Please register again.');
      navigate('/register');
    }
  }, [userId, navigate]);

  if (!userId) return null;

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const otpString = otp.join('');
    if (otpString.length !== 6) {
      toast.error('Please enter the complete OTP');
      return;
    }

    try {
      await dispatch(verifyEmail({ userId, otp: otpString })).unwrap();
      toast.success('Email verified successfully!');
      navigate('/');
    } catch (error: any) {
      toast.error(error || 'Verification failed');
    }
  };

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-saffron"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-maroon/5 border border-maroon/10 text-maroon text-[10px] font-bold uppercase tracking-wider">
          <Mail className="w-3 h-3" />
          <span>Email Verification</span>
        </div>
        <h1 className="text-3xl font-display font-black text-gray-900">Verify Your Identity</h1>
        <p className="text-gray-500 font-medium max-w-xs mx-auto">
          We've sent a 6-digit code to your email. Enter it below to unlock your account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="flex justify-center gap-3">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 md:w-14 h-16 text-center text-2xl font-black bg-gray-50/50 border-2 border-gray-100 rounded-2xl focus:border-maroon/20 focus:ring-8 focus:ring-maroon/5 outline-none transition-all duration-300"
            />
          ))}
        </div>

        <div className="space-y-4">
          <Button
            type="submit"
            className="w-full h-16 bg-gradient-to-r from-maroon to-maroon-800 hover:from-maroon-800 hover:to-maroon-900 text-white rounded-2xl font-black shadow-lg shadow-maroon/20 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 group relative overflow-hidden"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span className="text-base">Verifying...</span>
              </div>
            ) : (
              <span className="text-base uppercase tracking-widest relative z-10">Verify Account</span>
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
          </Button>

          <div className="text-center">
            <p className="text-xs font-medium text-gray-400">
              Didn't receive the code?{' '}
              <button
                type="button"
                onClick={() => toast.info('A new OTP has been sent!')}
                className="text-maroon font-black hover:underline underline-offset-4 transition-all"
              >
                Resend New Code
              </button>
            </p>
          </div>
        </div>
      </form>

      <div className="text-center pt-2">
        <button
          onClick={() => navigate('/register')}
          className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          Back to Registration
        </button>
      </div>
    </div>
  );
};

export default VerifyEmail;
