import { useState, useRef } from "react"
import { useApp } from "../context/AppContext"
import { useChat } from "../context/ChatContext"
import toast from 'react-hot-toast'
import Spinner from "./Spinner"
import useKeyboardSound from "../hooks/useKeyboardSound"

const AddPost = ({width='w-full', classNameOne='mx-auto', addPost, divWidth = 'w-1/2'}) => {
    const fileInputRef = useRef(null)
    const [ title, setTitle] = useState('')
    const [ caption, setCaption] = useState('')
    const { loading } = useApp()
    const { playRandomKeyStrokeSound } = useKeyboardSound()
    const { isSoundEnabled } = useChat()
    // const [ image, setImage] = useState(null)

    const handleSubmit = async(e) => {
        e.preventDefault()
        
        // if(!image){
            //     console.log('No file selected')
            //     return
            // }
            // const newPost = {
                //     title,
            //     caption,
            //     image
            // }

            if ( isSoundEnabled ) playRandomKeyStrokeSound()
            const formData = new FormData(e.target)
            
            // Correctly check if a file was selected by checking its size
            const file = formData.get('file');

            if ( !file || file.size === 0) {
                console.log('No file selected');
                toast.error('Please select an image file.');
                return;
            }
            
        try {
            await addPost(formData)
            
            if( fileInputRef.current) {
                fileInputRef.current.value = ''
            }
           
            setTitle('')
            setCaption('')
        } catch (error) {
            console.error("Failed to add post:",error)
        }
    }

  return (
    <>
        <details>
            <summary className="mx-auto text-center">Add a post</summary>
            <fieldset className={`fieldset ${width} bg-base-200 border border-base-300 p-4 rounded-box mx-auto`}>
                <form onSubmit={handleSubmit} encType="multipart/form-data">
                    <div className="flex flex-wrap md:justify-center">
                        <div className={divWidth}>
                            <label htmlFor="title" className="fieldset-label">Title</label>
                            <input 
                                type="text" 
                                name="title" 
                                id="title" 
                                className="input w-full"
                                required
                                value={title}
                                onChange={(e) => {
                                    setTitle(e.target.value)
                                    isSoundEnabled && playRandomKeyStrokeSound()
                                }}
                                />
                        </div>
                        <div className={divWidth}>
                            <label 
                                htmlFor="caption" className="fieldset-label">
                                Caption
                            </label>
                            <textarea 
                                name="caption" 
                                id="caption"  
                                className="input pt-2 w-full" 
                                required
                                value={caption}
                                onChange={(e) => {
                                    setCaption(e.target.value)
                                    isSoundEnabled && playRandomKeyStrokeSound()
                                }}/>
                        </div>
                        <div className={`w-2/3`}>
                            <label 
                                htmlFor="imageUpload" className="fieldset-legend">
                                Image
                            </label>
                            <input 
                                type="file" 
                                name="file" 
                                id="imageUpload" className="file-input w-full" 
                                required
                                ref={ fileInputRef} />
                        </div>
                        <div className="w-1/3 pt-7 flex justify-end">
                            <button type="submit" className="btn btn-neutral" disabled={loading[`addPost`]} >
                                {loading['addPost'] ? <Spinner size={20} /> : "Post"}
                            </button>
                        </div>
                    </div>
                </form>
            </fieldset>
        </details>
    </>
  )
}

export default AddPost
