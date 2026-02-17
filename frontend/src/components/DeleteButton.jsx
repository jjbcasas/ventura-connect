import { useApp } from "../context/AppContext"
import Spinner from "./Spinner"
import { Trash2 } from 'lucide-react'

const DeleteButton = ({ deletePost, postId, className }) => {
  const { loading } = useApp()

  const onDeleteClick = async (postId) => {
        const confirm = window.confirm(
            'Are you sure you want to delete this post?'
        )

        if ( !confirm ) return

        await deletePost(postId)
    }

  return (
    <>
      <button type="button" className={className} onClick={()=> onDeleteClick(postId) } disabled={loading[`deletePost_${postId}`]} >
        {loading[`deletePost_${postId}`]
        ? <Spinner size={20} />
        : <Trash2 className="h-5"/> }
      </button>
    </>
  )
}

export default DeleteButton
