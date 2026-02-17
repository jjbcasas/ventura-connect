import { useState, useRef } from 'react'
import { Gift, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import { useChat } from '../context/ChatContext'
import useKeyboardSound from '../hooks/useKeyboardSound'

const GiftButton = ({ stripePayment, marginTop = 0, creatorId, loading }) => {
    const { isSoundEnabled } = useChat()
    const { playRandomKeyStrokeSound } = useKeyboardSound()
    const [ amount, setAmount ] = useState('')
    const modalRef = useRef(null)

    const handlePayment = async (e) => {
        e.preventDefault()

        const finalAmount = Number(amount)
        if (!finalAmount || finalAmount <= 0.50) {
            toast.error("Minimum tip is $0.50");
            return
        }
        if ( isSoundEnabled ) playRandomKeyStrokeSound()

        // console.log("Processing payment for: $", finalAmount)
        
        // try {
            await stripePayment( creatorId, finalAmount )
            // const res = await fetch(`/api/tip/checkout-session/${creatorId}`, {
            //     method: 'POST',
            //     headers: {
            //         "Content-Type": "application/json"
            //     },
            //     body: JSON.stringify({finalAmount})
            // })

            // const data = await res.json()
            
            // if ( !res.ok ) {
            //     throw new Error( data.message || "Payment Failed. Please try again.")
            // }
            // if ( result ){
            //     if ( data.sessionUrl ) {
            //         window.location.href = data.sessionUrl
            //     }
            //     setAmount('')
            // }

        // } catch (error) {
        //     console.error("Payment processing error:", error)
        //     toast.error(error.message || "Something went wrong with the payment.")
        // }
    }

  return (
    // <button
    //     className={`btn btn-soft btn-warning ${marginTop}`}>
    //     <Gift />
    // </button>
    <>
        <button
            //  for The "Inner" Glow, use inset shadow
            className={`btn btn-outline btn-warning ${marginTop} ${ loading && 'loading'}`}
            onClick={()=> {
                modalRef.current?.showModal()
                isSoundEnabled && playRandomKeyStrokeSound()
            }}
            disabled={loading}
        >
            <Gift />
        </button>
        <dialog ref={modalRef} className="modal">
        <div className="modal-box">
            <form method="dialog">
                {/* if there is a button in form, it will close the modal */}
                <button
                    onClick={()=> setAmount('')}
                    className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                >
                    ✕
                </button>
            </form>
            <h3 className="font-bold text-lg text-center">Choose an amount</h3>
            <div className='flex justify-center gap-3 m-2'>
                {/* Preset Buttons */}
                { [ 5, 10, 20 ].map( val => (
                    <button
                        key={val}
                        type='button'
                        onClick={()=> {
                            setAmount(val)
                            isSoundEnabled && playRandomKeyStrokeSound()
                    }}
                    className={`w-1/6 btn btn-outline btn-warning ${Number(amount) === val ? "btn-active" : ""}`}
                    >
                        ${val}
                    </button>
                ))}
                {/* Custom input and submit */}
                <div className='w-2/6 flex gap-1'>
                    <input
                        type="number"
                        placeholder="Amount"
                        className='input w-1/2 mr-1 text-xs text-center'
                        value={amount}
                        onChange={(e)=> {
                            setAmount(e.target.value) 
                            isSoundEnabled && playRandomKeyStrokeSound()
                        }}
                    />
                    <button
                        type="button"
                        className='btn btn-primary w-1/2'
                        value={amount}
                        onClick={handlePayment}
                    >
                        <Check />
                    </button>
                </div>
            </div>
        </div>
        </dialog>
    </>
  )
}

export default GiftButton
