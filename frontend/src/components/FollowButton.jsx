import { useApp } from "../context/AppContext"
import { useChat } from "../context/ChatContext"
import Spinner from "./Spinner"
import useKeyboardSound from "../hooks/useKeyboardSound"


const FollowButton = ({classNameOne, followUser, userId}) => {
  const { loading } = useApp()
  const { playRandomKeyStrokeSound } = useKeyboardSound()
  const { isSoundEnabled } = useChat()

  return (
    <div className="w-20 mx-auto"> 
        <button
          className={`btn btn-soft btn-primary w-full ${classNameOne}`}
          type="button"
          onClick={()=>{
            followUser(userId)
            isSoundEnabled && playRandomKeyStrokeSound()
          }}
          disabled={loading[`followUser_${userId}`]}
        >
          {loading[`followUser_${userId}`] ? <Spinner size={20} /> : "Follow"}
        </button>
    </div>
  )
}

export default FollowButton
