import { useState } from "react"
import { useApp } from "../context/AppContext"
import { useChat } from "../context/ChatContext"
import toast from "react-hot-toast"
import Spinner from "./Spinner"
import useKeyboardSound from "../hooks/useKeyboardSound"

const AddComment = ({addComment, postId}) => {
  const [comment, setComment] = useState('')
  const { loading } = useApp()
  const { playRandomKeyStrokeSound } = useKeyboardSound()
  const { isSoundEnabled } = useChat()

  const handleSubmit = async(e) => {
    e.preventDefault()
    
    if ( isSoundEnabled ) playRandomKeyStrokeSound()
    // Validation (Guard Clause)
    if ( !comment ) {
      toast.error('Please add a comment')
      return
    }
    
    try {
      await addComment(comment, postId)
      setComment('')
    } catch (error) {
      console.error("Failed to add comment:", error)
    }
  }

  return (
    <div>
        <form onSubmit={handleSubmit}>
            <input
              type="text" 
              className="w-full mb-2 pl-1" 
              name="comment" 
              placeholder="Write comments here..." 
              required
              value={comment}
              onChange={(e)=> {
                setComment(e.target.value) 
                isSoundEnabled && playRandomKeyStrokeSound()
              }}/>
            <button type="submit" className="btn btn-primary" disabled={loading[`addComment_${postId}`]} >
              {loading[`addComment_${postId}`] ? <Spinner size={20} /> : "Submit"}
            </button>
        </form>
    </div>
  )
}

export default AddComment