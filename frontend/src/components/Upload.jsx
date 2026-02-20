import { useState, useRef } from "react"
import toast from "react-hot-toast"
import { useApp } from "../context/AppContext"

const Upload = ({ submitPhoto, user, className ="w-full flex items-center justify-center" }) => {
    const fileInputRef = useRef(null)
    const [ selectedImg, setSelectedImg ] = useState(null)
    const { loading } = useApp()

    const handleImageUpload = async (e) => {
            const file = e.target.files[0]
            if(!file){
                // console.log('No file selected')
                // toast.error('Please select an image file.')
                return
            }
            if (!file.type.startsWith("image/")) {
                toast.error("Please select an image file");
                return;
            }
    
            // Create a local preview: Convert the file to a Base64 string so the user 
            // sees their new photo immediately without waiting for the server upload.
            const reader = new FileReader()
            reader.onloadend = () => setSelectedImg(reader.result) 
            // This updates the <img> src locally
            reader.readAsDataURL(file)

            // Handle the Upload (FormData)
            try {
                const formData = new FormData(/*file*/)
                formData.append("file",file)
                
                await submitPhoto(formData, ()=> setSelectedImg(null))

                // toast.success("Profile photo updated!");

                // Clear the input so the user can select the same file again if they want
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            } catch (error) {
                console.error("Upload Error:", error)
            }
        }

  return (
    <>
        <div className={`avatar ${className}`}>
            <button
                className="size-14 rounded-full overflow-hidden relative group cursor-pointer"
                onClick={() => fileInputRef.current.click()}
                disabled={loading[`uploadPhoto`]}
            >
                {(selectedImg || user?.profileImage) ? (
                    <img src={selectedImg || user?.profileImage} className="w-full flex items-center justify-center "/>
                ) : (
                    <span className="text-3xl size-full flex items-center justify-center ">
                        { user?.userName?.split(' ').map(word => word.charAt(0).toUpperCase()).join('') }
                    </span>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="text-white text-xs">Change</span>
                </div>
            </button>

            <input
                type="file"
                name="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageUpload}
                className="hidden"
            />
        </div>
    </>
  )
}

export default Upload