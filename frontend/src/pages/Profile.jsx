import { useState, useEffect } from "react"
import AddPost from "../components/AddPost"
import Spinner from "../components/Spinner"
import { /*useOutletContext,*/ useParams} from "react-router-dom"
import toast from 'react-hot-toast'
import Avatar from "../components/Avatar"
import Placeholder from "../components/Placeholder"
import Upload from "../components/Upload"
import FollowButton from "../components/FollowButton"
import ProfilePost from "../components/ProfilePost"
import ProfileRecommend from "../components/ProfileRecommend"
import UnfollowButton from "../components/UnfollowButton"
import { useAuth } from "../context/AuthContext"
import { useApp } from "../context/AppContext"

const Profile = () => {
    // const [posts, setPosts] = useState([])
    // const [comments, setComments] = useState([])
    // const [accountUser, setAccountUser] = useState({})
    // const [usersFriends, setUsersFriends] = useState([])
    // const { user, setUser /*, setMessages*/ } = useOutletContext()
    const [loading, setLoading] = useState(true)
    const { id } = useParams()
    const { user, setUser } = useAuth()
    const {
        addPost,
        posts,
        setPosts,
        deletePost,
        addComment,
        likePost,
        unlikePost,
        comments,
        setComments,
        accountUser,
        setAccountUser,
        followUser,
        unfollowUser,
        uploadPhoto,
        changePhoto
    } = useApp()

    useEffect( () => {
        const controller = new AbortController()
        setLoading(true)
        const fetchData = async () => {
            try {
                const res = await fetch(`/api/profile/${id}`, {
                  credentials: 'include',
                  signal: controller.signal
              })
                const data = await res.json()

                if ( res.ok ) {
                    if ( data ) {
                        setPosts(data.posts)
                        setComments(data.comments)
                        setAccountUser(data.accountUser)
                    }

                    setLoading(false)
                } else {
                    console.error('Error fetching data:', data.message)
                    toast.error(data.message)

                    setLoading(false)
                }
            } catch (error) {
                if ( error instanceof Error && error.name === 'AbortError') {
                    console.log('Request was cancelled');
                    return; // Stop execution, no state should be set.
                }

                console.error('Error fetching data:',error)
                toast.error('Could not connect to the server')
                
                setLoading(false)
            }
        }
        fetchData()

        return () => {
            controller.abort(); 
        }

    }, [id])

    const handleLikePost = ( postId ) => {
        const updatedPost = ( data ) => {
            setPosts( prevPosts => ( 
                prevPosts?.map( post => (
                    post?._id === postId ?
                        { ...post, likes: data.updatedLike.likes }
                        : post
            ))))
            setAccountUser( prevAccountUser => ( 
                prevAccountUser?._id === user?._id ?
                    {...prevAccountUser, likedPostId: data.updatedUser.likedPostId }
                    : prevAccountUser ))

            toast.success(data.message)
        }

        likePost( postId, updatedPost, `/api/profile/likePost/`)
    }

    const handleUnlikePost = ( postId ) => {
        const updatedPost = ( data ) => {
            setPosts( prevPosts => ( 
                prevPosts?.map( post => (
                    post?._id === postId ?
                        { ...post, likes: data.updatedLike.likes }
                        : post
            ))))

            setAccountUser( prevAccountUser => (
                prevAccountUser?._id === user?._id ?
                {...prevAccountUser, likedPostId: data.updatedUser.likedPostId }
                : prevAccountUser ))

            toast.success(data.message)
        }

        unlikePost( postId, updatedPost, `/api/profile/minusLikePost/`)
    }

    const handleFollowUser = ( postId ) => {
        const updatedUser = ( data ) => {
            if ( data.updatedFollow ) {
                setAccountUser( prevAccountUser => ({...prevAccountUser, followerId: data.updatedFollow.followerId}))
                toast.success(data.message)
            }
        }

        followUser( postId, updatedUser, '/api/profile/followUser/')
    }

    const handleUnfollowUser = ( postId ) => {
        const updatedUser = ( data ) => {
            if ( data.updatedUnfollow ) {
                setAccountUser( prevAccountUser => ({...prevAccountUser, followerId: data.updatedUnfollow.followerId }))
                toast.success(data.message)
            }
        }

        unfollowUser( postId, '/api/profile/unfollowUser/', updatedUser )
    }

    const handleDeletePost = ( postId ) => {
        const updatedPost = () => {
            setPosts( prevPosts => (
                prevPosts?.filter( post => (
                    post._id !== postId
            ))))
        }

        deletePost( postId, updatedPost, `/api/profile/deletePost/` )
    }

    // const addPost = async (formData) => {
    //     try {
    //         const res = await fetch(`/api/profile/createPost`, {
    //             method: 'POST',
    //             credentials: 'include',
    //             body: formData
    //         })
    //         const data = await res.json()

    //         if ( res.ok ) {
    //             if (data.post) {
    //                 setPosts([data.post, ...posts])
    //                 toast.success(data.message)
    //             }
    //         } else {
    //             console.error('Error adding a post:', data.message)
    //             toast.error(data.message)
    //         }
            
    //     } catch (error) {
    //         console.error('Error adding a post:', error)
    //         toast.error('Could not connect to the server')
    //     }
    // }

    // const followUser = async (userId) => {
    //     try {
    //         const res = await fetch(`/api/profile/followUser/${userId}`,{
    //             method: 'PUT',
    //             credentials: 'include',
    //         })
    //         const data = await res.json()
    
    //         if( res.ok ) {
    //             if ( data.updatedFollow ) {
    //                 setAccountUser({...accountUser, followerId: data.updatedFollow.followerId})
    //                 toast.success(data.message)
    //             }
    //         } else {
    //             console.error('Error following a user:', data.message || 'Unknown error')
    //             toast.error(data.message)
    //         }
    //     } catch (error) {
    //         console.error('Error following a user:', error)
    //         toast.error('Could not connect to the server')
    //     }
    // }

    // const unfollowUser = async (userId) => {
    //     try {
    //         const res = await fetch(`/api/profile/unfollowUser/${userId}`,{
    //             method: 'PUT',
    //             credentials: 'include',
    //         })
    //         const data = await res.json()
    
    //         if ( res.ok ) {
    //             if ( data.updatedUnfollow ) {
    //                 setAccountUser({...accountUser, followerId: data.updatedUnfollow.followerId })
    //                 toast.success(data.message)
    //             }
    //         } else {
    //             console.error('Error unfollowing a user:', data.message || 'Unknown error')
    //             toast.error(data.message)
    //         }
    //     } catch (error) {
    //         console.error('Error unfollowing a user:', error)
    //         toast.error('Could not connect to the server')
    //     }
    // }

    // const likePost = async (postId) => {
    //     try {
    //         const res = await fetch(`/api/profile/likePost/${postId}`,{
    //             method: 'PUT',
    //             credentials: 'include',
    //         })
    
    //         const data = await res.json()
    
    //         if ( res.ok ) {
    //             if ( data.updatedUser && data.updatedLike ) {
    //                 // setUser( prevUser => ({...prevUser, likedPostId: data.updatedUser.likedPostId}))
    //                 setPosts( prevPosts => ( prevPosts.map( post => (
    //                     post._id === postId ? { ...post, likes: data.updatedLike.likes } : post
    //                 ))))
    //                 // setAccountUser( prevAccountUser => ( prevAccountUser._id === user._id ? {...prevAccountUser, likedPostId: data.updatedUser.likedPostId } : {...prevAccountUser }))
    //                 toast.success(data.message)
    //             } else {
    //                 console.error('Error in liking post:', data.message || 'Unknown error')
    //                 toast.error(data.message)
    //             }
    //         }
    //     } catch (error) {
    //         console.error('Error in liking post:', error)
    //         toast.error('Could not connect to the server')
    //     }

    // }

    // const unlikePost = async (postId) => {
    //     try {
    //         const res = await fetch(`/api/profile/minusLikePost/${postId}`,{
    //             method: 'PUT',
    //             credentials: 'include',
    //         })
    
    //         const data = await res.json()
    
    //         if ( res.ok ) {
    //             if ( data.updatedUser && data.updatedLike ) {
    //                 setUser( prevUser => ({...prevUser, likedPostId: data.updatedUser.likedPostId}))
    //                 setPosts( prevPosts => ( prevPosts.map( post => (
    //                     post._id === postId ? { ...post, likes: data.updatedLike.likes } : post
    //                 ))))
    //                 setAccountUser( prevAccountUser => ( prevAccountUser._id === user._id ? {...prevAccountUser, likedPostId: data.updatedUser.likedPostId } : prevAccountUser ))
    //                 toast.success(data.message)
    //             }
    //         } else {
    //             console.error('Error in unliking post:', data.message || 'Unknown error')
    //             toast.error(data.message)
    //         }
    //     } catch (error) {
    //         console.error('Error in unliking post:', error)
    //         toast.error('Could not connect to the server')
    //     }
    // }

    // const deletePost = async (postId) => {
    //     try {
    //         const res = await fetch(`/api/profile/deletePost/${postId}`, {
    //             method: 'DELETE',
    //             credentials: 'include',
    //         })

    //         const data = await res.json()
            
    //         if ( res.status === 200 ) {
    //             setPosts(posts.filter( post => post._id !== postId))
    //             toast.success(data.message || 'Post deleted successfully!' )
    //         } else {
    //             console.error('Error deleting post:', data.message || 'Unknown error')
    //             toast.error(data.message)
    //         }
    //     } catch (error) {
    //         console.error('Error deleting post:', error)
    //         toast.error('Could not connect to the server')
    //     }
    // }

    // const addComment = async(comment, postId) => {
    //     try {
    //         const res = await fetch(`/api/profile/comments/${postId}`,{
    //             method: 'POST',
    //             credentials: 'include',
    //             headers: {
    //                 'Content-type': 'application/json'
    //             },
    //             body: JSON.stringify({comment}),
    //         })

    //         const data = await res.json()

    //         if ( res.ok ) {
    //             if (data.comment){
    //                 setComments([ data.comment, ...comments ])
    //                 toast.success(data.message)
    //             }
    //         } else {
    //             console.error('Error adding a comment:', data.message || 'Unknown error')
    //             toast.error(data.message)
    //         }
    //     } catch (error) {
    //         console.error('Error adding a comment:', error)
    //         toast.error('Could not connect to the server')
    //     }
    // }

    // const uploadPhoto = async (formData) => {
    //     try {
    //         const res = await fetch(`/api/profile/uploadProfilePhoto`, {
    //             method: 'PUT',
    //             credentials: 'include',
    //             body: formData
    //         })
    //         const data = await res.json()

    //         if ( res.ok ){
    //             if ( data.newProfileImage.profileImage ){
    //                 setUser({...user, profileImage: data.newProfileImage.profileImage})
    //                 setAccountUser(
    //                     accountUser._id === user._id
    //                         ? {...accountUser, profileImage: data.newProfileImage.profileImage}
    //                         : accountUser
    //                 )
    //                 toast.success(data.message)
    //             }
    //         } else {
    //             console.error('Error uploading photo:', data.message)
    //             toast.error(data.message)
    //         }
    //     } catch (error) {
    //         console.error('Error uploading photo:', error)
    //         toast.error('Could not connect to the server')
    //     }
    // }

    // const changePhoto = async (formData) => {
    //     try {
    //         const res = await fetch(`/api/profile/changeProfilePhoto`, {
    //             method: 'PUT',
    //             credentials: 'include',
    //             body: formData
    //         })
    //         const data = await res.json()

    //         if ( res.ok ){
    //             if ( data.newProfileImage.profileImage ){
    //                 setUser({...user, profileImage: data.newProfileImage.profileImage})
    //                 setAccountUser( accountUser._id === user._id ? {...accountUser, profileImage: data.newProfileImage.profileImage} : {...accountUser})
    //                 toast.success(data.message)
    //             }
    //         } else {
    //             console.error('Error uploading photo:', data.message)
    //             toast.error(data.message)
    //         }
    //     } catch (error) {
    //         console.error('Error uploading photo:', error)
    //         toast.error('Could not connect to the server')
    //     }
    // }

  return (
    <section className="flex flex-wrap justify-start min-h-125">
        { loading ? (
               <Spinner loading={loading} />
         ): (
            <>
                <section className="w-3/4 md:w-1/4 pt-4 pb-4 px-2">
                    <div className="flex md:flex-wrap sm:no-wrap flex-wrap justify-around">
                        <div className="w-full sm:w-1/3 md:w-full">
                        { accountUser?.profileImage ?

                            <Avatar
                                src={accountUser?.profileImage}
                                user={accountUser}
                                classNameOne='w-full pt-10'
                                classNameTwo="w-20 mx-auto"
                            />
                            : /* No Profile Image */
                            <Placeholder
                                user={accountUser}
                                classNameOne='w-full pt-10'
                                classNameTwo='w-20 mx-auto'
                            />
                        }
                        
                            {/* Upload Button for User */}
                            { accountUser?._id === user?._id ? (
                        
                                accountUser?.profileImage ? (
                                    
                                    <Upload
                                        submitPhoto={( formData ) => changePhoto( formData, `/api/profile/changeProfilePhoto` )}
                                        title='Change Photo'
                                    />
                                ) : (
                                    <Upload
                                        submitPhoto={( formData ) => uploadPhoto( formData, `/api/profile/uploadProfilePhoto`)}
                                        title='Add Photo'
                                    />
                                )
                                
                            ) : ( accountUser?.followerId?.includes(user?._id) ? (
                                        <UnfollowButton
                                            classNameOne='mt-2'
                                            userId={accountUser?._id}
                                            unfollowUser={ handleUnfollowUser }
                                        />
                                ):(
                                        <FollowButton
                                            classNameOne='mt-2'
                                            userId={accountUser?._id}
                                            followUser={handleFollowUser}
                                        />
                                )
                            )}

                        {/* Profile Details */}
                        { accountUser?._id === user?._id ? 
                            <div className='w-full'>
                                <p className="text-center"><strong>Email</strong>: { accountUser?.email } </p>
                                <p className="text-center"><strong>User Name</strong>: { posts[0]?.userName?.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') } </p>
                            </div>
                            : <p className="text-center"><strong>Email</strong>: { accountUser?.email } </p> }

                        </div>

                        { accountUser?._id === user?._id && 
                            <div className="w-full sm:w-2/3 md:w-full grow-1 px-2">
                                <AddPost width='w-full grow-2' classNameOne="pt-4 text-center" divWidth='w-full' addPost={(formData)=> addPost(formData, '/api/profile/createPost')} />
                            </div>}
                        </div>
                </section>
                
                {/* Profile Feed for users without post */}
                <section className="w-full md:w-2/4 order-3 md:order-2 pt-4 px-1">
                    <ul className="mt-5">
                        { posts.map((post) => (
                            <ProfilePost
                                key={post?._id}
                                post={post}
                                comments={comments}
                                user={user}
                                accountUser={accountUser}
                                likePost={handleLikePost}
                                unlikePost={handleUnlikePost}
                                deletePost={handleDeletePost} 
                                classNameOne="w-full"
                                addComment={( comment, postId ) => addComment( comment, postId, '/api/profile/comments/')}
                            />
                        ))}
                    </ul>            
                </section>
                
                {/* Friends List Section of User */}
                <section className="w-1/4 order-2 md:order-3 px-2">
                    {/* <Recommend /> */}
                    <h3 className="text-center pt-4"><strong>{ accountUser?._id === user?._id ? 'My Friends' : `${accountUser?.userName}'s Friends` }</strong></h3>
                    <div className="card w-full bg-base-100 card-xs shadow-sm">
                        <div className="card-body">
                                {accountUser?.followingId?.length == 0 ? (
                                    /* if without friends yet */
                                    <h3 className="text-center">No Friends yet</h3>
                                ) : ( /* if with friends */
                                    <ul className="flex flex-wrap justify-center">
                                        {accountUser?.followingId?.slice(0,4).map( following => (
                                            <ProfileRecommend key={following._id} following={following} /*onClick={handleClick}*/ />
                                        ))}
                                    </ul>
                                )}
                        </div>
                    </div>
                </section>
            </>
        )}
    </section>
  )
}

export default Profile