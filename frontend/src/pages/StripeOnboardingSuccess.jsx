import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const StripeOnboardingSuccess = () => {
    const { user } = useAuth()
    const navigate = useNavigate();

    useEffect(() => {
        // Celebrate with a toast
        toast.success("Account Linked Successfully!", {
            icon: '🎊',
            duration: 6000
        });

        // Automatic redirect after the user has a moment to breathe
        const timer = setTimeout(() => {
            navigate(`/profile/${user._id}`);
        }, 5000);

        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
            <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-2xl border border-slate-100">
                {/* Success Icon Animation */}
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                </div>

                <h1 className="text-3xl font-extrabold text-slate-900 mb-4">
                    You're All Set!
                </h1>
                
                <p className="text-slate-600 mb-8 leading-relaxed">
                    Your Stripe Connect account is successfully linked. You can now receive tips and payments directly to your bank account.
                </p>

                <div className="space-y-4">
                    <button
                        onClick={() => navigate(`/profile/${user?._id}`)}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-indigo-200"
                    >
                        Go to Profile
                    </button>
                    
                    <p className="text-xs text-slate-400 italic">
                        Redirecting you automatically in a few seconds...
                    </p>
                </div>
            </div>

            {/* Support Link */}
            {/* <button 
                onClick={() => navigate('/settings')}
                className="mt-8 text-slate-500 hover:text-indigo-600 text-sm font-medium transition-colors"
            >
                Need to change your payout settings? Click here.
            </button> */}
        </div>
    );
};

export default StripeOnboardingSuccess;