import { useApp } from "../context/AppContext"
import { useChat } from "../context/ChatContext"
import Spinner from "./Spinner"
import { ThumbsDown } from 'lucide-react'
import useKeyboardSound from "../hooks/useKeyboardSound"

const UnlikeButton = ({ unlikePost, postId, className}) => {
  const { loading } = useApp()
  const { playRandomKeyStrokeSound } = useKeyboardSound()
  const { isSoundEnabled } = useChat()

  return (
    <>
        <button
          type="button"
          onClick={()=> {
            unlikePost(postId)
            isSoundEnabled && playRandomKeyStrokeSound()
          }}
          className={className}
          disabled={loading[`unlikePost_${postId}`]}
        >
          {loading[`unlikePost_${postId}`]
          ? <Spinner size={20} />
          : <ThumbsDown className="h-5"/>}
        </button>
    </>
  )
}

export default UnlikeButton
