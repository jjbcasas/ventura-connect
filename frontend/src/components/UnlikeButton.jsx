const UnlikeButton = ({ unlikePost, postId, className}) => {
  return (
    <>
        <button type="button" onClick={()=> unlikePost(postId) } className={className}>Unlike</button>
    </>
  )
}

export default UnlikeButton
