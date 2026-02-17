const StripeBalance = ({ available = 0, pending = 0, currency = "USD" }) => {
    // Standard currency formatter for USD
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
    });

    return (
        <div className="stats shadow bg-base-100 w-full border border-slate-100 mt-3">
            {/* Available Balance */}
            <div className="stat">
                <div className="stat-title text-xs uppercase font-bold text-slate-500">Available Balance</div>
                <div className="stat-value text-2xl text-slate-800">
                    {formatter.format(available)}
                </div>
                <div className="stat-desc text-success">Ready for payout</div>
            </div>
            {/* Pending Balance */}
            <div className="stat">
                <div className="stat-title text-xs uppercase font-bold text-slate-500">Pending Balance</div>
                <div className="stat-value text-2xl text-slate-400">
                    {formatter.format(pending)}15
                </div>
                <div className="stat-desc">Processing by Stripe</div>
            </div>
        </div>
    );
};

export default StripeBalance;