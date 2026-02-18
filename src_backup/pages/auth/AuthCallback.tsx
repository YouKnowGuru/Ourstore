import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { getMe } from '@/store/slices/authSlice';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import type { AppDispatch } from '@/store';

const AuthCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const processedRef = useRef(false);

    useEffect(() => {
        if (processedRef.current) return;
        processedRef.current = true;

        const token = searchParams.get('token');
        const refresh = searchParams.get('refresh');
        const error = searchParams.get('error');

        if (error) {
            toast.error('Authentication Failed', {
                description: decodeURIComponent(error)
            });
            navigate('/login');
            return;
        }

        if (token && refresh) {
            // Store tokens
            localStorage.setItem('token', token);
            localStorage.setItem('refreshToken', refresh);

            // Update Redux state by fetching user profile
            dispatch(getMe())
                .unwrap()
                .then(() => {
                    toast.success('Successfully signed in with Google');
                    navigate('/');
                })
                .catch(() => {
                    toast.error('Failed to load user profile');
                    navigate('/login');
                });

        } else {
            toast.error('Authentication failed', {
                description: 'No tokens received from provider'
            });
            navigate('/login');
        }
    }, [searchParams, navigate, dispatch]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-500">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-maroon animate-spin" />
                </div>
                <h2 className="text-xl font-display font-bold text-gray-900">Completing Sign In...</h2>
                <p className="text-gray-500 text-sm">Please wait while we log you in</p>
            </div>
        </div>
    );
};

export default AuthCallback;
