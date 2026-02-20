import { useState, useEffect, useRef } from "react"
import AddPost from "../components/AddPost"
import Post from '../components/Post'
import Spinner from "../components/Spinner"
import { /*useOutletContext,*/ Link } from "react-router-dom"
import ProfileRecommend from "../components/ProfileRecommend"
import toast from "react-hot-toast"
import { useAuth } from "../context/AuthContext"
import { useApp } from "../context/AppContext"

const Feed = () => {
    // const [posts, setPosts] = useState([])
    // const [comments, setComments] = useState([])
    // const { user, setUser } = useOutletContext()
    const [allUsers, setAllUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const fileInputRef = useRef(null)
    const { user, setUser } = useAuth()
    const {
        addPost,
        posts,
        setPosts,
        deletePost,
        addComment,
        comments,
        setComments,
        followUser,
        unfollowUser,
        likePost,
        unlikePost
    } = useApp()

    useEffect( () => {
        const controller = new AbortController()
        setLoading(true)
        const fetchData = async () => {
            try {
                const res = await fetch(`/api/feed`, {
                    credentials: 'include',
                    signal: controller.signal
                })
                const data = await res.json()

                if ( res.ok ) {
                    if ( data ) {
                        setPosts(data.posts)
                        setAllUsers(data.allUsers)
                        setComments(data.comments)
                    }
                } else {
                    console.error('Error fetching data:', data.message)
                    toast.error(data.message)
                }
            } catch (error) {
                if ( error.name === 'AbortError') {
                    console.log('Request was cancelled');
                    return; // Stop execution, no state should be set.
                }

                console.error('Error fetching data:',error)
                toast.error('Could not connect to the server')
            } finally {
                if (!controller.signal?.aborted) {
                    setLoading(false)
                }
            }
        }
        fetchData()

        return () => {
            controller.abort(); 
        }
    }, [])

    const handleFollowUser = ( userId ) => {
        const updatedUser = ( data ) => {
            if ( data.updatedFollowing ) {
                setUser( prevUser => ({...prevUser, followingId: data.updatedFollowing.followingId }))
                setAllUsers( prevAllUser => {
                    if (!prevAllUser) return []
                    return prevAllUser.map( user => 
                        user?._id === userId ?
                            { 
                                ...user,
                                followerId: data.updatedFollow.followerId
                            } : user
                    )
            })
                
                toast.success( data.message )
            }
        }

        followUser( userId, updatedUser, `/api/feed/followUser/` )
    }

    const handleUnfollowUser = ( postId ) => {
        const updatedUser = ( data ) => {
            if ( data.updatedUnfollowing ) {
                setUser( prevUser => ({...prevUser, followingId: data.updatedUnfollowing.followingId }))
                setAllUsers( prevAllUser => {
                    if (!prevAllUser) return []
                    return prevAllUser.map( user => 
                        user?._id === postId ?
                            { 
                                ...user,
                                followerId: data.updatedUnfollow.followerId
                            } : user
                    )
            })
                
                toast.success(data.message)
            }
        }

        unfollowUser( postId, `/api/feed/unfollowUser/`, updatedUser )
    }

    const handleLikePost = ( postId ) => {
        const updatedPost = ( data ) => {
            setPosts( prevPosts => prevPosts.map( post => (
                post._id === postId ?
                    { ...post, likes: data.updatedLike.likes }
                    : post
            )))

            toast.success(data.message)
        }

        likePost( postId, updatedPost, `/api/feed/likePost/` )
    }

    const handleUnlikePost = ( postId ) => {
        const updatedPost = ( data ) => {
            setPosts( prevPosts => prevPosts.map( post => (
                post?._id === postId ?
                    { ...post, likes: data.updatedLike.likes }
                    : post
            )))

            toast.success(data.message)
        }

        unlikePost( postId, updatedPost, `/api/feed/minusLike/` )
    }

  return (
    <section className="flex flex-wrap justify-evenly min-h-125">
        { loading ? (
            <Spinner loading={loading} />
        ) : (
            <>
                <div className="w-3/4 sm:w-2/3 pt-4">
                
                    <div className="w-full md:w-3/4 mx-auto grow-1 px-2">
                        <AddPost
                            addPost={(formData)=> addPost(formData, '/api/feed/createPost')}
                            fileInputRef={fileInputRef}
                            width='w-full grow-2'
                            divWidth='w-full'
                        />
                    </div>
                    <ul>
                        { posts.map((post) => (
                            <Post
                                key={post._id}
                                user={user}
                                post={post}
                                comments={comments}
                                likePost={handleLikePost}
                                unlikePost={handleUnlikePost} 
                                addComment={( comment, postId ) => addComment(comment, postId, '/api/feed/comments/')}
                                followUser={handleFollowUser}
                                unfollowUser={ handleUnfollowUser}
                                /*deletePost={handleDeletePost}*/
                            />
                        ))}
                    </ul>
                </div>

                {/* <!-- Right Section/Div --> */}
                <div className="w-1/4 sm:w-1/3 min-[340]:px-1">
                    {/* Recommend Section */}
                    <h3 className="text-[.6rem] sm:text-base text-center pt-4"><strong>Recommended people</strong></h3>
                    <div className="card w-full bg-base-96 card-xs shadow-sm">
                        <div className="card-body">
                            <ul className="flex flex-wrap justify-center">
                                { allUsers.map(users => (
                                    !users?.followerId?.includes(user._id) &&
                                        <ProfileRecommend
                                            key={users?._id}
                                            following={users}
                                            width='w-16'
                                        />
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </>
        )}
    </section>
  )
}

export default Feed