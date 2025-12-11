const LikeButton = ({ likePost, className, postId}) => {
  return (
    <>
        <button type="button" onClick={()=> likePost(postId) } className={className} >Like</button>
    </>
  )
}

export default LikeButton
