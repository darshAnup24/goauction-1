import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import authService from '../services/auth.service';
import toast from 'react-hot-toast';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('verifying'); // verifying, success, error

    const verifyEmail = useCallback(async (token) => {
        try {
            await authService.verifyEmail(token);
            setStatus('success');
            toast.success('Email verified successfully!');
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (error) {
            setStatus('error');
            toast.error('Email verification failed');
        }
    }, [navigate]);

    useEffect(() => {
        const token = searchParams.get('token');
        
        if (!token) {
            setStatus('error');
            toast.error('Invalid verification link');
            return;
        }

        verifyEmail(token);
    }, [searchParams, verifyEmail]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
                {status === 'verifying' && (
                    <>
                        <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <h2 className="text-2xl font-bold mb-2">Verifying Email...</h2>
                        <p className="text-gray-600">Please wait while we verify your email address.</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="text-green-600 text-6xl mb-4">✓</div>
                        <h2 className="text-2xl font-bold mb-2 text-green-600">Email Verified!</h2>
                        <p className="text-gray-600">Your email has been successfully verified. Redirecting to login...</p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="text-red-600 text-6xl mb-4">✕</div>
                        <h2 className="text-2xl font-bold mb-2 text-red-600">Verification Failed</h2>
                        <p className="text-gray-600 mb-4">We couldn't verify your email. The link may be expired or invalid.</p>
                        <button onClick={() => navigate('/login')} className="btn-primary">
                            Go to Login
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;
