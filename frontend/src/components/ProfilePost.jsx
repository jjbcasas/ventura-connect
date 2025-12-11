import AddComment from './AddComment'
import Comment from './Comment'
import { Link } from "react-router-dom"
import LikeButton from './LikeButton'
import UnlikeButton from './UnlikeButton'
import DeleteButton from './DeleteButton'

const ProfilePost = ({ user, post, accountUser, comments, likePost, unlikePost, deletePost, addComment }) => {    
  return (
    <li className="card bg-base-100 shadow-sm w-full mb-4">
        <figure>
            <Link to={`/post/${post?._id}`}>
                <img src={post?.image}/>
            </Link>
        </figure>

        <div className="card-body flex flex-row w-full p-2 sm:p-6">
        {/* <!-- for users with avatar --> */}
        { accountUser?.profileImage ? (
            <div className="flex flex-wrap w-2/6 justify-between">
                <div className="avatar w-full">
                    <div className="w-14 rounded-full">
                        <img src={accountUser?.profileImage} />
                    </div>
                    <h2 className="card-title justify-self-end py-2 pl-5">{post?.userName?.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</h2>
                </div>
            </div>
        ) : (
            // <!-- for users without avatar -->
            <div className="flex flex-wrap w-2/6 avatar avatar-placeholder m-2">
                <div className="bg-neutral text-neutral-content w-14 rounded-full ">
                    <span className="text-3xl">{ post?.userName?.split(' ').map(word => word.charAt(0).toUpperCase()).join(' ') }</span>
                </div>
                <h2 className="card-title justify-self-end py-2 pl-5">{post?.userName?.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') }</h2>
            </div>
        )}

            {/* <!-- Like or Unlike Button --> */}
            <div className="card-actions w-4/6 flex flex-nowrap justify-end">
                <h3 className="pt-2 sm:w-1/4 md:w-1/3 lg:w-1/4 text-center">Likes: {post?.likes}</h3>

                { user?.likedPostId.includes(post?._id) ? (
                    <UnlikeButton unlikePost={unlikePost} postId={post?._id} className= 'btn btn-primary sm:w-1/4 md:w-1/3 lg:w-1/4'/>
                ) : (
                    <LikeButton likePost={likePost} postId={post?._id} className= 'btn btn-primary sm:w-1/4 md:w-1/3 lg:w-1/4' />
                )}

                {/* <!-- Delete button for login users only --> */}
                { post?.user?._id === user?._id &&
                    < DeleteButton deletePost={deletePost} postId={post?._id} className='btn btn-primary sm:w-1/4 md:w-1/3 lg:w-1/4'/>
                }
            </div>
        </div>

        {/* <!-- Post Details --> */}
        <div className="flex flex-wrap w-1/2 pl-6">
            <div className="w-full">
                <h2 className="card-title">{post?.title}</h2>
                <p>{post?.caption}</p>
            </div>
        </div>

        {/* <!-- Comments Section --> */}
        <div className="py-2 px-6">
            <h2 className="pt-4">Comments</h2>
            {/* <!-- Comment Form --> */}
            <AddComment addComment={addComment} postId={post?._id}/>
            <ul>
                {comments.map( comment => (
                    comment.postId === post?._id &&
                        <Comment key={comment?._id} comment={comment} accountUser={accountUser} padding='py-2'/>
                ))}
            </ul>
        </div>
    </li>
  )
}

export default ProfilePost
