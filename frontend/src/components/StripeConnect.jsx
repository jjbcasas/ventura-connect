const StripeConnect = ({ stripeConnect, loading, userStatus }) => {
  return (
    <div  className="card w-full bg-base-100 card-xs shadow-sm mt-2">
        <div className="card-body items-center text-center p-6">
            <div className="bg-indigo-50 p-3 rounded-full">
                {/* Simple Credit Card or Wallet Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
            </div>
            <h3 className="text-center text-sm pt-1">Link your bank account via Stripe to start receiving tips.</h3>
            <button
                className={`btn btn-primary w-full ${ loading ? 'loading' : '' }`}
                onClick={stripeConnect}
                disabled={loading}
            >
                {!loading && (
                    userStatus ? (
                        <span className="flex items-center gap-2">
                            Finish <span className="font-extrabold tracking-tight">stripe</span> Setup
                        </span>
                    ) : (
                        <span className="flex items-center gap-2">
                            Connect with <span className="font-extrabold tracking-tight">stripe</span>
                        </span>
                    )
                )}
            </button>
            <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-widest">
                Securely processed by Stripe
            </p>
        </div>
    </div>
  )
}

export default StripeConnect
