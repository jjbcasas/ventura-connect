import React, {
    createContext,
    useContext,
    useState,
    useMemo,
    useCallback
} from 'react'
import toast from 'react-hot-toast'
import { useAuth } from "../context/AuthContext"

const AppContext = createContext(null)

export const AppProvider = ({ children }) => {
    const [ posts, setPosts ] = useState([])
    const [ comments, setComments ] = useState([])
    const [ accountUser, setAccountUser ] = useState({})
    const { user, setUser } = useAuth()

    const addPost = useCallback( async (formData, apiUrl) => {
        try {
            const res = await fetch(apiUrl, {
                method: 'POST',
                credentials: 'include',
                body: formData
            })
            const data = await res.json()

            if ( res.ok ) {
                if (data.post) {
                    setPosts(prevPosts => [data.post, ...prevPosts ])
                    toast.success(data.message)
                }
            } else {
                console.error('Error adding a post', data.message)
                toast.error(data.message)
            }

        } catch (error) {
            console.error('Error adding a post:', error)
            toast.error('Could not connect to the server')
        }
    }, [] )

    const deletePost = useCallback( async (postId, callback, apiUrl) => {
        try {
            const res = await fetch(`${apiUrl}${postId}`, {
                method: 'DELETE',
                credentials: 'include',
            })

            const data = await res.json()
            
            if ( res.status === 200 ) {
                callback()
                toast.success(data.message || 'Post deleted successfully!' )
                // setPosts(prevPosts => prevPosts.filter( post => post._id !== postId))
            } else {
                console.error('Error deleting post:', data.message || 'Unknown error')
                toast.error(data.message)
            }
        } catch (error) {
            console.error('Error deleting post:', error)
            toast.error('Could not connect to the server')
        }
    }, [] )

    const addComment = useCallback( async(comment, postId, apiUrl) => {
        try {
            const res = await fetch(`${apiUrl}${postId}`,{
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify({comment}),
            })

            const data = await res.json()

            if ( res.ok ) {
                if (data.comment){
                    setComments( prevComments => [ data.comment, ...prevComments ])
                    toast.success(data.message)
                }
            } else {
                console.error('Error adding a comment:', data.message || 'Unknown error')
                toast.error(data.message)
            }
        } catch (error) {
            console.error('Error adding a comment:', error)
            toast.error('Could not connect to the server')
        }
    }, [] )

    const followUser = useCallback( async ( userId, callback, apiUrl ) => {
        try {
            const res = await fetch(`${apiUrl}${userId}`,{
                method: 'PUT',
                credentials: 'include',
            })
            const data = await res.json()
    
            if( res.ok ) {
                callback( data )
                // if ( data.updatedFollowing ) {
                //     setUser( prevUser => ({...prevUser, followingId: data.updatedFollowing.followingId}))
                //     toast.success(data.message)
                // }
            } else {
                console.error('Error following a user:', data.message || 'Unknown error')
                toast.error(data.message)
            }
        } catch (error) {
            console.error('Error following a user:', error)
            toast.error('Could not connect to the server')
        }
    }, [] )

    const unfollowUser = useCallback( async ( userId, apiUrl, callback ) => {
        try {
            const res = await fetch(`${apiUrl}${userId}`,{
                method: 'PUT',
                credentials: 'include',
            })
            const data = await res.json()
    
            if ( res.ok ) {
                callback(data)
                // if ( data.updatedUnfollow ) {
                //     setAccountUser( prevAccountUser => ({...prevAccountUser, followerId: data.updatedUnfollow.followerId }))
                //     toast.success(data.message)
                // }
            } else {
                console.error('Error unfollowing a user:', data.message || 'Unknown error')
                toast.error(data.message)
            }
        } catch (error) {
            console.error('Error unfollowing a user:', error)
            toast.error('Could not connect to the server')
        }
    }, [] )

    const likePost = useCallback( async (postId, callback, apiUrl ) => {
        try {
            const res = await fetch(`${apiUrl}${postId}`,{
                method: 'PUT',
                credentials: 'include',
            })
            
            const data = await res.json()
            
            if ( res.ok ) {
                if ( data.updatedUser && data.updatedLike ) {
                    setUser( prevUser => ({...prevUser, likedPostId: data.updatedUser.likedPostId}))
                    callback(data)
                    // setter( prevPost => ( prevPost._id === postId ? { ...prevPost, likes: data.updatedLike.likes } : prevPost )
                    // )
                    // setAccountUser( prevAccountUser => ( 
                    //     prevAccountUser?._id === user?._id ?
                    //     {...prevAccountUser, likedPostId: data.updatedUser.likedPostId }
                    //     : prevAccountUser ))
                    // toast.success(data.message)
                } else {
                    console.error('Error in liking post:', data.message || 'Unknown error')
                    toast.error(data.message)
                }
            }
        } catch (error) {
            console.error('Error in liking post:', error)
            toast.error('Could not connect to the server')
        }

    }, [] )

    const unlikePost = useCallback( async ( postId, callback, apiUrl ) => {
        try {
            const res = await fetch(`${apiUrl}${postId}`,{
                method: 'PUT',
                credentials: 'include',
            })
    
            const data = await res.json()
            
            if ( res.ok ) {
                if ( data.updatedUser && data.updatedLike ) {
                    setUser( prevUser => ({...prevUser, likedPostId: data.updatedUser.likedPostId}))
                    callback( data )
                    // setPost( prevPost => ( prevPost._id === postId ? { ...prevPost, likes: data.updatedLike.likes } : prevPost ))
                    // setAccountUser( prevAccountUser => ( prevAccountUser?._id === user?._id ? {...prevAccountUser, likedPostId: data.updatedUser.likedPostId } : prevAccountUser ))
                    // toast.success(data.message)
                }
            } else {
                console.error('Error in unliking post:', data.message || 'Unknown error')
                toast.error(data.message)
            }
        } catch (error) {
            console.error('Error in unliking post:', error)
            toast.error('Could not connect to the server')
        }
        
    }, [] )

    const uploadPhoto = useCallback( async (formData, apiUrl) => {
        try {
            const res = await fetch(apiUrl, {
                method: 'PUT',
                credentials: 'include',
                body: formData
            })
            const data = await res.json()

            if ( res.ok ){
                if ( data.newProfileImage.profileImage ){
                    setUser( prevUser => ({...prevUser, profileImage: data.newProfileImage.profileImage}))
                    setAccountUser( prevAccountUser => (
                        prevAccountUser._id === user._id
                            ? {...prevAccountUser, profileImage: data.newProfileImage.profileImage}
                            : prevAccountUser
                    ))
                    toast.success(data.message)
                }
            } else {
                console.error('Error uploading photo:', data.message)
                toast.error(data.message)
            }
        } catch (error) {
            console.error('Error uploading photo:', error)
            toast.error('Could not connect to the server')
        }
    }, [] )

    const changePhoto = useCallback( async (formData, apiUrl ) => {
        try {
            const res = await fetch(apiUrl, {
                method: 'PUT',
                credentials: 'include',
                body: formData
            })
            const data = await res.json()

            if ( res.ok ){
                if ( data.newProfileImage.profileImage ){
                    setUser( prevUser => ({...prevUser, profileImage: data.newProfileImage.profileImage}))
                    setAccountUser( prevAccountUser => (
                        prevAccountUser._id === user._id
                            ? {...prevAccountUser, profileImage: data.newProfileImage.profileImage}
                            : prevAccountUser
                    ))
                    toast.success(data.message)
                }
            } else {
                console.error('Error uploading photo:', data.message)
                toast.error(data.message)
            }
        } catch (error) {
            console.error('Error uploading photo:', error)
            toast.error('Could not connect to the server')
        }
    }, [] )

    const appContextValue = useMemo(()=> ({
        posts,
        setPosts,
        comments,
        setComments,
        accountUser,
        setAccountUser,
        addPost,
        deletePost,
        addComment,
        likePost,
        unlikePost,
        followUser,
        unfollowUser,
        uploadPhoto,
        changePhoto
    }), [ addPost, posts, setPosts, deletePost, addComment, comments, setComments, accountUser, setAccountUser, likePost, unlikePost, followUser, unfollowUser, uploadPhoto, changePhoto ])
  return (
    
    <AppContext.Provider value={appContextValue}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)