import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useState } from 'react';

const StripeSuccess = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get('session_id'); // Grabs the ID from the URL
    const creatorId = searchParams.get('creator_id'); // Grabs the ID from the URL
    const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
    
    // useEffect(() => {
    //     if (sessionId) {
    //         console.log("Verifying payment for session:", sessionId);
    //         // You could call your backend here to confirm the payment 
    //         // before showing the success message.
    //     }
    // }, [sessionId]);
    
    useEffect(() => {
        let timer;
        const verifyPayment = async () => {
            if (!sessionId) {
                setStatus('error');
                return;
            }

            try {
                const res = await fetch(`/api/tip/verify?sessionId=${sessionId}`,{
                    credentials: "include"
                })

                const data = await res.json()

                if (res.ok && data.success) {
                    setStatus('success')
                    // Trigger the success toast
                    toast.success(`Success! $${data.amount} tip received.`, {
                        duration: 5000,
                        icon: '💰',
                    });

                    // Redirect after a delay
                    timer = setTimeout(() => {
                        navigate(`/profile/${creatorId}`);
                    }, 4000);
                } else {
                    setStatus('error');
                }
            } catch (error) {
                setStatus('error');
                console.error("Payment Failed: ". error.message)
                toast.error("We couldn't verify your payment.");
            }

        }
        
        verifyPayment();

        return () => { 
            if ( timer ) clearTimeout(timer);
        }
    }, [ sessionId, navigate]);

    if (status === 'loading') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                <p className="text-gray-600 font-medium">Verifying your tip...</p>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
                <h1 className="text-2xl font-bold text-red-600 mb-2">Verification Failed</h1>
                <p className="text-gray-600 mb-4">We couldn't find a valid payment session.</p>
                <button onClick={() => navigate(`/profile/${creatorId}`)} className="text-indigo-600 underline">Back to Feed</button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm">
                <div className="text-5xl mb-4 text-green-500">✅</div>
                <h1 className="text-3xl font-bold mb-2">Thank You!</h1>
                <p className="text-gray-600">Your payment was verified successfully.</p>
                <p className="text-sm text-gray-400 mt-6 italic">Redirecting you back...</p>
            </div>

            <button 
                onClick={() => navigate(`/profile/${creatorId}`)} 
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors underline underline-offset-4"
            >
                Click here if you aren't redirected
            </button>
        </div>
    );
};

export default StripeSuccess;