import { useState } from "react"
import toast from "react-hot-toast"

const AddComment = ({addComment, postId}) => {
  const [comment, setComment] = useState('')

  const handleSubmit = (e) => {
    try {
      e.preventDefault()

      if ( !comment ) {
        toast.error('Please add a comment')
        return
      }

      addComment(comment, postId)
      // toast.success('Comment added successfully!')
      setComment('')
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div>
        <form onSubmit={handleSubmit}>
            <input
              type="text" 
              className="w-full mb-2 pl-1" 
              name="comment" 
              placeholder="Write comments here..." 
              // required
              value={comment}
              onChange={(e)=> setComment(e.target.value) }/>
            <button type="submit" className="btn btn-primary">Submit</button>
        </form>
    </div>
  )
}

export default AddComment