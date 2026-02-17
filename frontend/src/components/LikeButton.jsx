import { useApp } from "../context/AppContext"
import { useChat } from "../context/ChatContext"
import Spinner from "./Spinner"
import { ThumbsUp } from "lucide-react"
import useKeyboardSound from "../hooks/useKeyboardSound"

const LikeButton = ({ likePost, className, postId}) => {
  const { loading } = useApp()
  const { playRandomKeyStrokeSound } = useKeyboardSound()
  const { isSoundEnabled } = useChat()
  
  return (
    <>
        <button
          type="button" 
          onClick={()=> {
            likePost(postId)
            isSoundEnabled && playRandomKeyStrokeSound()
            }}
            className={className}
            disabled={loading[`likePost_${postId}`]}
          >
          {loading[`likePost_${postId}`]
            ? <Spinner size={20} />
            : <ThumbsUp className="h-5 w-5"/>}
        </button>
    </>
  )
}

export default LikeButton
