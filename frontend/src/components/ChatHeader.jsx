import { useEffect } from "react"
import { useChat } from "../context/ChatContext"
import { XIcon } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import { Link } from "react-router-dom"

const ChatHeader = () => {
    const { selectedUser, setSelectedUser } = useChat()
    const { onlineUsers } = useAuth()
    const isOnline = onlineUsers.includes(selectedUser._id)

    useEffect(()=> {
        const handleEsc = (event) => {
            if ( event.key === "Escape") return setSelectedUser(null)
        }

        window.addEventListener("keydown", handleEsc)

        // Cleanup function
        return () => window.removeEventListener("keydown", handleEsc)
    },[setSelectedUser])

  return (
    <div className="flex justify-between items-center bg-slate-500/20 border-b border-slate-700/50 rounded-xl max-h-[84px] px-6 flex-1">
        <div className="flex items-center space-x-3">
            <div className={`avatar ${isOnline ? "avatar-online" : "avatar-offline"}`}>
                <div className="bg-neutral text-neutral-content w-12 rounded-full">
                    {
                        <Link to={`/profile/${selectedUser?._id}`} >
                            {selectedUser?.profileImage ? (
                                <img src={selectedUser.profileImage} className="w-full flex items-center justify-center" alt={selectedUser?.userName}/>
                            ) : (
                                <span className="text-3xl size-full flex items-center justify-center ">
                                    { selectedUser?.userName?.split(' ').map(word => word.charAt(0).toUpperCase()).join('') }
                                </span>
                            )}
                        </Link>
                    }
                </div>
            </div>
            <div>
                <h3 className="text-slate-800 font-medium">{selectedUser.userName}</h3>
                <p className="text-slate-600 text-sm">{ isOnline ? "Online" : "Offline" }</p>
            </div>
        </div>
        <button onClick={()=> setSelectedUser(null)}>
            <XIcon className="w-5 h-5 text-slate-400 hover:text-slate-200 transition colors cursor-pointer" />
        </button>
    </div>
  )
}

export default ChatHeader
