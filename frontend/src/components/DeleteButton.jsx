const DeleteButton = ({ deletePost, postId, className }) => {
  const onDeleteClick = (postId) => {
        const confirm = window.confirm(
            'Are you sure you want to delete this post?'
        )

        if ( !confirm ) return

        deletePost(postId)
    }

  return (
    <>
      <button type="button" className={className} onClick={()=> onDeleteClick(postId) }>Delete</button>
    </>
  )
}

export default DeleteButton
