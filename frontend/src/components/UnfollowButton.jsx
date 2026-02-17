import { useApp } from "../context/AppContext"
import { useChat } from "../context/ChatContext"
import Spinner from "./Spinner"
import useKeyboardSound from "../hooks/useKeyboardSound"

const UnfollowButton = ({classNameOne, unfollowUser, userId}) => {
  const { loading } = useApp()
  const { playRandomKeyStrokeSound } = useKeyboardSound()
  const { isSoundEnabled } = useChat()

  return (
    <div className="w-20 mx-auto">
        <button
          className={`btn btn-soft btn-primary w-full ${classNameOne}`}
          type="button"
          onClick={()=> {
            unfollowUser(userId)
            isSoundEnabled && playRandomKeyStrokeSound()
          }}
          disabled={loading[`unfollowUser_${userId}`]} 
        >
          {loading[`unfollowUser_${userId}`] ? <Spinner size={20} /> : "Unfollow"}
        </button>
    </div>
  )
}

export default UnfollowButton
