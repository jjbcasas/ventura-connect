import User from '../models/User.js'
import Tip from '../models/Tip.js'
import stripe from '../config/stripe.js'

export const checkoutSession = async ( req, res ) => {
    try {
        const tipper = await User.findById(req.user._id)
        const creator = await User.findById(req.params.id)
        const { finalAmount } = req.body
        
        const clientUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:5173' 
            : process.env.FRONTEND_URL

        if (!creator) return res.status(404).json({ message: "Creator not found" })
                
        const amount = Math.round(finalAmount * 100);
        if (amount < 50) return res.status(400).json({ message: "Tip must be at least $0.50" }) //Bad request

        if (!creator.stripeAccountId) {
            return res.status(400).json({ message: "This creator is not set up to receive payments yet." });
        }
        
        const account = await stripe.accounts.retrieve(creator.stripeAccountId);

        if (!account.details_submitted || !account.charges_enabled) {
            return res.status(400).json({ message: "Creator has not finished setting up their Stripe account." });
        }
                
        const session =  await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode:'payment',
            customer_email: tipper.email,
            client_reference_id: creator._id.toString(),
            line_items:[
                {
                    price_data: {
                        currency: 'usd',
                        unit_amount: amount,
                        product_data: {
                            name: `Support Tip for ${creator.userName}`,
                            description:'Thank you for your support!'
                        }
                    },
                    quantity: 1,
                }
            ],
            // Use metadata to pass info to the webhook later
            metadata: {
                // orderId:
                tipperId: tipper._id.toString(),
                creatorId: creator._id.toString(),
                amount: String(finalAmount)
            },
            payment_intent_data: {
                // You take 10% fee ($0.10 for every $1.00)
                application_fee_amount: Math.round(amount * 0.10), // Example: You take 10%
                transfer_data: {
                    destination: creator.stripeAccountId, // You must store this ID on your User model!
                },
            },
            success_url: `${clientUrl}/stripe-success?session_id={CHECKOUT_SESSION_ID}&creator_id=${creator._id}`,
            cancel_url: `${clientUrl}/profile/${req.params.id}`
        })

        // NOTE: If you save Tip.create() here, it's unverified. 
        // It's better to do this in a Webhook!
        // const tip = await Tip.create({
        //     tipperId: tipper._id,
        //     creatorId: creator._id,
        //     amount: req.body.amount
        //     // session: session.id
        // })

        res.status(200).json({
            sessionId: session.id,
            sessionUrl: session.url,
            message: "Success!"
        })
    } catch (error) {
        console.error("Payment error: ", error.message)
        res.status(500).json({message: "Server Error!"})
    }
}

export const createConnectAccount = async ( req, res ) => {
    try {
        const { _id: userId } = req.user;
        const user = await User.findById(userId)
        const clientUrl = process.env.NODE_ENV === 'development' 
            ? 'http://localhost:5173' 
            : process.env.FRONTEND_URL

        if (!user) return res.status(404).json({ message: "User not found" });

        // 1. Create the Connect Account in Stripe if they don't have one
        if (!user.stripeAccountId) {
            const account = await stripe.accounts.create({ type: 'express' });
            user.stripeAccountId = account.id;
            await user.save();
        }

        // 2. Create an Account Link (the URL the user visits to fill out Stripe info)
        const accountLink = await stripe.accountLinks.create({
            account: user.stripeAccountId,
            refresh_url: `${clientUrl}/profile/${userId}`,
            return_url: `${clientUrl}/stripe-onboarding-success`, // Redirect Page
            type: 'account_onboarding',
        });

        res.status(200).json({
            url: accountLink.url,
            message: "Start Stripe Onboading!"
        });
    } catch (error) {
        console.error("Error in creating a Stripe Account: ", error )
        res.status(500).json({ message: "Server Error"})
    }
}

export const verifySession = async (req, res) => {
    try {
        const { sessionId } = req.query;

        if (!sessionId) {
            return res.status(400).json({ success: false, message: "Session ID is required" });
        }

        // Retrieve the session from Stripe
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status === 'paid') {
            return res.status(200).json({ 
                success: true, 
                amount: session.amount_total / 100, // Stripe uses cents
                customer: session.customer_details.email 
            });
        } else {
            return res.status(400).json({ success: false, message: "Payment not completed" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error verifying payment", error: error.message });
    }
};

export const handleStripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error("Webhook Signature Verification Failed:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle Checkout Completion
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;

        // for Idempotency check
        // Check if we have already processed this specific session
        const existingTip = await Tip.findOne({ stripeSessionId: session.id });

        if (existingTip) {
            console.log(`Duplicate event received for session: ${session.id}. Skipping.`);
            return res.status(200).json({ received: true }); // Return 200 so Stripe stops retrying
        }
        
        try {
            // NOW save the tip to your database
            const tip = await Tip.create({
                tipperId: session.metadata.tipperId,
                creatorId: session.metadata.creatorId,
                amount: session.amount_total / 100,
                // status: 'completed',
                stripeSessionId: session.id
            });
    
            console.log("Tip saved successfully!");
        } catch (dbError) {
            console.error("Database Error while saving tip:", dbError.message)
        }
    }

    res.status(200).json({ received: true });
};

// export const resumeOnboarding = async (req, res) => {
//     try {
//         const { user } = req;
//         const clientUrl = process.env.NODE_ENV === 'development' 
//             ? 'http://localhost:5173' 
//             : process.env.FRONTEND_URL

//         if (!user.stripeAccountId) {
//             return res.status(400).json({ message: "No Stripe account found to resume." });
//         }

//         // Generate a new link for the existing account
//         const accountLink = await stripe.accountLinks.create({
//             account: user.stripeAccountId,
//             refresh_url: `${clientUrl}/profile/${user._id}`,
//             return_url: `${clientUrl}/stripe-onboarding-success`,
//             type: 'account_onboarding',
//         });

//         res.status(200).json({
//             url: accountLink.url,
//             message: "Continue your Onboarding."
//         });
//     } catch (error) {
//         console.error("Resume Onboarding Error:", error);
//         res.status(500).json({ message: "Could not generate onboarding link." });
//     }
// };