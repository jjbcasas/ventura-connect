import {
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
    const [loading, setLoading] = useState({}); // Very important!
    const [ userResults, setUserResults ] = useState([])
    const { user, setUser } = useAuth()

    const setSpecificLoading = ( key, value ) => {
        setLoading(prev => ({ ...prev, [key]: value }));
    }

    const addPost = useCallback( async (formData, apiUrl) => {
        try {
            setSpecificLoading('addPost', true )
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
                    return true
                }
            } else {
                console.error('Error adding a post:', data.message)
                toast.error(data.message)
                // The server didn't "crash" the code, but you want to treat it like a crash.
                // Hence the use of new Error() to create a brand new error
                throw new Error(data.message)
            }

        } catch (error) {
            console.error('Error adding a post:', error)
            // Only toast here if it's a network/system failure.
            // If it was a server error, the 'else' block already toasted the specific message.
            if (error.name !== 'Error') { 
                toast.error('Could not connect to the server');
            }
            throw error /* re-throwing the one you just caught hence just throw error */
        } finally {
            // This runs regardless of success or failure
            // We only reach here if the request wasn't aborted
            setSpecificLoading('addPost', false )
        }
    }, [] )

    const deletePost = useCallback( async (postId, callback, apiUrl) => {
        try {
            setSpecificLoading(`deletePost_${postId}`, true )
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
        } finally {
            // This runs regardless of success or failure
            // We only reach here if the request wasn't aborted
            setSpecificLoading(`deletePost_${postId}`, false )
        }
    }, [] )

    const addComment = useCallback( async(comment, postId, apiUrl) => {
        try {
            setSpecificLoading(`addComment_${postId}`, true )
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
                    return true
                }
            } else {
                console.error('Error adding a comment:', data.message || 'Unknown error')
                toast.error(data.message)
                // The server didn't "crash" the code, but you want to treat it like a crash.
                // Hence the use of new Error() to create a brand new error
                throw new Error(data.message)
            }
        } catch (error) {
            console.error('Error adding a comment:', error)
            // Only toast here if it's a network/system failure.
            // If it was a server error, the 'else' block already toasted the specific message.
            if (error.name !== 'Error') {
                toast.error('Could not connect to the server')
            }
            throw error /* re-throwing the one you just caught hence just throw error */
        } finally {
            // This runs regardless of success or failure
            // We only reach here if the request wasn't aborted
            setSpecificLoading(`addComment_${postId}`, false )
        }
    }, [] )

    const followUser = useCallback( async ( userId, callback, apiUrl ) => {
        try {
            setSpecificLoading(`followUser_${userId}`, true )
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
        } finally {
            // This runs regardless of success or failure
            // We only reach here if the request wasn't aborted
            setSpecificLoading(`followUser_${userId}`, false )
        }
    }, [] )

    const unfollowUser = useCallback( async ( userId, apiUrl, callback ) => {
        try {
            setSpecificLoading(`unfollowUser_${userId}`, true )
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
        } finally {
            // This runs regardless of success or failure
            // We only reach here if the request wasn't aborted
            setSpecificLoading(`unfollowUser_${userId}`, false )
        }
    }, [] )

    const likePost = useCallback( async (postId, callback, apiUrl ) => {
        try {
            setSpecificLoading(`likePost_${postId}`, true )
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
        } finally {
            // This runs regardless of success or failure
            // We only reach here if the request wasn't aborted
            setSpecificLoading(`likePost_${postId}`, false )
        }
    }, [] )

    const unlikePost = useCallback( async ( postId, callback, apiUrl ) => {
        try {
            setSpecificLoading(`unlikePost_${postId}`, true )
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
        } finally {
            // This runs regardless of success or failure
            // We only reach here if the request wasn't aborted
            setSpecificLoading(`unlikePost_${postId}`, false )
        }
    }, [] )

    const uploadPhoto = useCallback( async (formData, apiUrl, onFailure ) => {
        try {
            setSpecificLoading(`uploadPhoto`, true )
            const res = await fetch(apiUrl, {
                method: 'PATCH',
                credentials: 'include',
                body: formData
            })
            const data = await res.json()

            if ( res.ok ){
                if ( data.newProfileImage.profileImage ){
                    setUser( prevUser => ({...prevUser, profileImage: data.newProfileImage.profileImage}))
                    setAccountUser( prevAccountUser => (
                        prevAccountUser?._id === data.newProfileImage?._id
                            ? {...prevAccountUser, profileImage: data.newProfileImage.profileImage}
                            : prevAccountUser
                    ))
                    toast.success(data.message)
                    return true
                }
            } else {
                console.error('Error uploading photo:', data.message)
                toast.error(data.message)
                if (onFailure) onFailure(); // <-- Reset the preview if the server says "No"
                // The server didn't "crash" the code, but you want to treat it like a crash.
                // Hence the use of new Error() to create a brand new error
                throw new Error(data.message)
            }
        } catch (error) {
            console.error('Error uploading photo:', error)
            if (onFailure) onFailure(); // <-- Reset the preview if the internet is down
            // Only toast here if it's a network/system failure.
            // If it was a server error, the 'else' block already toasted the specific message.
            if (error.name !== 'Error') { 
                toast.error('Could not connect to the server')
            }
            throw error /* re-throwing the one you just caught hence just throw error */
        } finally {
            // This runs regardless of success or failure
            // We only reach here if the request wasn't aborted
            setSpecificLoading(`uploadPhoto`, false )
        }
    }, [ ] )

    const searchUser = useCallback( async ( name, signal ) => {
        if (!name) return; // Don't search if the input is empty
        setSpecificLoading(`searchUser`, true )
        try {
            const res = await fetch(`/api/feed/search?name=${name}`, {
                credentials: 'include',
                signal
            })
            const data = await res.json()

            if ( res.ok ) {
                if ( data?.searchResult ){
                    setUserResults(data?.searchResult || [] )
                }
            } else {
                console.log('Error searching user: ', data.message)
            }
        } catch (error) {
            // Check if it's a cancellation first
            if ( error.name === 'AbortError') {
                // Silently stop. No console log needed in production, 
                // but helpful during dev.
                console.log('Request was cancelled')
                return // Stop execution, no state should be set.
            }
            console.log('Error searching user: ', error.message)
            toast.error('Could not connect to the server')
        } finally {
            if (!signal?.aborted) {
                setSpecificLoading('searchUser', false)
            }
        }
    }, [])

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
        searchUser,
        userResults,
        setUserResults,
        loading
    }), [ addPost, posts, setPosts, deletePost, addComment, comments, setComments, accountUser, setAccountUser, likePost, unlikePost, followUser, unfollowUser, uploadPhoto, searchUser, userResults, setUserResults, loading ])
  return (
    
    <AppContext.Provider value={appContextValue}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)