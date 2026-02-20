import { useRef, useState } from "react"
import useKeyboardSound from "../hooks/useKeyboardSound"
import { useChat } from "../context/ChatContext"
import { ImageIcon, XIcon, SendIcon } from "lucide-react"

const MessageInput = () => {
  const { playRandomKeyStrokeSound } = useKeyboardSound()
  const [ text, setText ] = useState("")
  const [ imagePreview, setImagePreview ] = useState(null)
  const fileInputRef = useRef(null)
  const { sendMessage, isSoundEnabled } = useChat()

  const handleSendMessage = async (e) => {
    e.preventDefault()
    const file = fileInputRef.current.files[0]
    // or this, to Access the specific file input by its name attribute
    // const file = e.target.elements.image.files[0];
    
    if ( !text.trim() && !file) return
    if ( isSoundEnabled ) playRandomKeyStrokeSound()
      
      
    try {
      const formData = new FormData(/*file*/)
      if ( text ) formData.append("text", text)
      if ( file ) formData.append("file", file)

      const result = await sendMessage(formData)
  
      if ( result.success ) {
        setText("")
        setImagePreview(null)
        // Clear the input so the user can select the same file again if they want
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    } catch (error) {
      // If it fails, we DON'T clear the text. 
      // The user can try clicking "Send" again without re-typing.
      console.error("Failed to send message:", error)
    }

  }

  const handleImageChange = (e) => {
     const file = e.target.files[0];
     if ( !file ) return
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  }

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="p-4 border-t border-slate-700/50 rounded-xl bg-slate-400/50">
      {imagePreview && (
        <div className="max-w-3xl mx-auto mb-3 flex items-center">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-slate-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-200 hover:bg-slate-700"
              type="button"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      <form
        onSubmit={handleSendMessage}
        className="max-w-3xl mx-auto flex space-x-4"
        encType="multipart/form-data"
        >
        <input
          type="text"
          value={text}
          name="text"
          onChange={(e)=> {
            setText(e.target.value)
            isSoundEnabled && playRandomKeyStrokeSound()
          }}
          className="flex-1 bg-white border border-slate-700/50 rounded-lg py-2 px-4"
          placeholder="Type your message..."
        />
        <input
            type="file"
            accept="image/*"
            name="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={`btn btn-primary hover:text-slate-200 rounded-lg px-4 transition-colors ${
            imagePreview ? "text-cyan-200" : ""
          }`}
        >
          <ImageIcon className="w-5 h-5" />
        </button>
        <button
            type="submit"
            disabled={!text.trim() && !imagePreview}
            className="btn btn-soft btn-primary rounded-lg px-4 py-2 h-auto font-medium border border-slate-500/50 transition-all disabled:opacity-50 disabled:bg-slate-500/10 disabled:cursor-not-allowed disabled:pointer-events-auto"
        >
            <SendIcon className="w-5 h-5" />
        </button>
      </form>
    </div>
  )
}

export default MessageInput
