import { useState, useRef } from "react"
import { useAuth } from "../context/AuthContext"
import { useApp } from "../context/AppContext"
// import { useChat } from "../context/ChatContext"
// import { Volume2Icon,VolumeOffIcon } from "lucide-react"
import toast from 'react-hot-toast'
import Upload from "../components/Upload"
// import Spinner from "./Spinner"

// const mouseClickSound = new Audio("/sounds/mouse-click.mp3")

const ProfileHeader = () => {
    const { user } = useAuth()
    // const { isSoundEnabled, toggleSound } = useChat()
    const { uploadPhoto, loading } = useApp()
    // const [ selectedImg, setSelectedImg ] = useState(null)

    const fileInputRef = useRef(null)

    // const handleImageUpload = async (e) => {
    //     const file = e.target.files[0]
    //     if(!file){
    //         // console.log('No file selected')
    //         // toast.error('Please select an image file.')
    //         return
    //     }
    //     if (!file.type.startsWith("image/")) {
    //         toast.error("Please select an image file");
    //         return;
    //     }

    //     // Create a local preview: Convert the file to a Base64 string so the user 
    //     // sees their new photo immediately without waiting for the server upload.
    //     const reader = new FileReader()
    //     reader.onloadend = () => setSelectedImg(reader.result) 
    //     // This updates the <img> src locally
    //     reader.readAsDataURL(file)

    //     // Handle the Upload (FormData)
    //     try {
    //         const formData = new FormData(/*file*/)
    //         formData.append("file",file)
            
    //         await uploadPhoto(formData, `/api/messages/uploadProfilePhoto`, ()=> setSelectedImg(null))

    //         // toast.success("Profile photo updated!");

    //         // Clear the input so the user can select the same file again if they want
    //         if (fileInputRef.current) {
    //             fileInputRef.current.value = '';
    //         }
    //     } catch (error) {
    //         console.error("Upload Error:", error);
    //         // toast.error(error.response?.data?.message || "Failed to upload photo.");
    //         // Optional: clear the preview if the upload failed
    //         // setSelectedImg(null)
    //     }
        
    //     // try {
    //     //             e.preventDefault()
        
    //     //             const formData = new FormData(e.target.files[0])
        
    //     //             if(!formData.get('file')){
    //     //                 console.log('No file selected')
    //     //                 toast.error('Please select an image file.')
    //     //                 return
    //     //             }
        
    //     //             uploadPhoto(formData)
                    
    //     //             if( fileInputRef.current) {
    //     //                 fileInputRef.current.value = ''
    //     //             }
        
    //     //         } catch (error) {
    //     //             console.error(error)
    //     //         }
    // }

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
