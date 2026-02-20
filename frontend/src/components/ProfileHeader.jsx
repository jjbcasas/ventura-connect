import { useState, useRef } from "react"
import { useAuth } from "../context/AuthContext"
import { useApp } from "../context/AppContext"
// import { useChat } from "../context/ChatContext"
import toast from 'react-hot-toast'
import Upload from "../components/Upload"

// const mouseClickSound = new Audio("/sounds/mouse-click.mp3")

const ProfileHeader = () => {
    const { user } = useAuth()
    // const { isSoundEnabled, toggleSound } = useChat()
    const { uploadPhoto, loading } = useApp()
    // const [ selectedImg, setSelectedImg ] = useState(null)

    const fileInputRef = useRef(null)

  return (
    <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center justify-center gap-3 border border-gray-400 rounded-xl bg-slate-500/20 text-slate-400 py-2">
            {/* <div className="flex items-center gap-3"> */}
                {/* Avatar */}
                {<Upload
                    submitPhoto={(formData, selectedImg)=> uploadPhoto( formData, `/api/messages/uploadProfilePhoto`, selectedImg)}
                    user={user}
                    className={"avatar-online"}
                />}
                
                {/* Username & Online text */}
                <div>
                    <h3 className="text-slate-800 font-medium text-base max-w-[180px] truncate">
                        {user?.userName}
                    </h3>
                    <p className="text-slate-600 text-xs">Online</p>
                </div>
            {/* </div> */}
            
            {/* Buttons */}
            {/* <div> */}
                {/* Sound Toggle Button */}
                {/* <button className="text-slate-400 hover:text-slate-200 transition-colors" onClick={()=> {
                    mouseClickSound.currentTime = 0 //reset to start
                    mouseClickSound.play().catch((error) => console.log("Audio play failed:", error))
                    toggleSound()
                    }}
                >
                    { isSoundEnabled ? (
                        <Volume2Icon className="size-5" />
                    ) : (
                        <VolumeOffIcon className="size-5" />
                    )}
                </button> */}
            {/* </div> */}
        </div>

    </div>
  )
}

export default ProfileHeader
