import { useRef } from "react"
import toast from "react-hot-toast"

const Upload = ({ submitPhoto, title }) => {
    const fileInputRef = useRef(null)

    const handleSubmit = async (e) => {
        try {
            e.preventDefault()

            const formData = new FormData(e.target)

            if(!formData.get('file')){
                console.log('No file selected')
                toast.error('Please select an image file.')
                return
            }

            submitPhoto(formData)
            
            if( fileInputRef.current) {
                fileInputRef.current.value = ''
            }

        } catch (error) {
            console.error(error)
        }
    }

  return (
    <div>
        <details>
            <summary className="text-center">{title}</summary>
            <form onSubmit={handleSubmit} encType="multipart/form-data" className="bg-base-100 rounded-t-none p-2">
                <div>
                    <input 
                        type="file" 
                        name="file" 
                        className="file-input w-full"
                        ref={fileInputRef} />
                </div>
                <div className="text-center">
                    <button type="submit" className="btn btn-neutral mt-2 sm:mt-4 sm:w-full w-1/4">Upload</button>
                </div>
            </form>
        </details>
    </div>
  )
}

export default Upload