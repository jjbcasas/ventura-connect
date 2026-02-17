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
import GiftButton from "../components/GiftButton"
import StripeConnect from "../components/StripeConnect"
import StripeBalance from "../components/StripeBalance"

const Profile = () => {
    const [balance, setBalance] = useState({ available: 0, pending: 0, currency: 'usd' });
    const [loading, setLoading] = useState(true)
    const [ chargesEnabled, setChargesEnabled ] = useState(false)
    const [ stripeConnectLoading, setStripeConnectLoading] = useState(false)
    const [ paymentLoading, setPaymentLoading] = useState(false)
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
        uploadPhoto
    } = useApp()
    // const fileInputRef = useRef(null)
    // const [ selectedImg, setSelectedImg ] = useState(null)

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
                        setBalance({
                            available: data.available,
                            pending: data.pending,
                            currency: data.currency
                        })
                        setChargesEnabled(data.chargesEnabled)
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

    }, [id])

    const handleStripePayment = async ( creatorId, finalAmount ) => {
        setPaymentLoading(true)
        try {
            const res = await fetch(`/api/tip/checkout-session/${creatorId}`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({finalAmount}),
                credentials: "include"
            })
        
            const data = await res.json()
                    
            if ( !res.ok ) {
                // throw new Error( data.message || "Payment Failed. Please try again.")
                console.log( "Payment Error: ", data.message )
                toast.error( data.message )
            }
        
            if ( data.sessionUrl ) {
                window.location.href = data.sessionUrl
            }
        } catch (error) {
            console.error("Payment processing error:", error)
            toast.error( error.message || 'Could not connect to the server')
        } finally {
            setPaymentLoading(false)
        }
    }

    const handleStripeConnect = async () => {
        setStripeConnectLoading(true);
        try {
            const res = await fetch(`/api/tip/createAccount`,{
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include"
            })
            const data = await res.json()

            if (!res.ok) {
                // throw new Error(data.message || "Failed to start onboarding");
                console.log( "Onboarding Error: ", data.message )
                toast.error( data.message )
            }
            if ( data.url ) {
                // Send user to Stripe Express Dashboard
                window.location.href = data.url
            }
        } catch (error) {
            console.error("Onboarding Error:", error);
            toast.error( error.message || "Could not connect to the server");
        } finally {
            setStripeConnectLoading(false);
        }
    }

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

  return (
    <section className="flex flex-wrap justify-start min-h-125">
        { loading ? (
               <Spinner loading={loading} />
         ): (
            <>
                <section className="w-3/4 md:w-1/4 pt-4 pb-4 px-2">
                    <div className="flex md:flex-wrap sm:no-wrap flex-wrap justify-around">
                        <div className="w-full sm:w-1/3 md:w-full">
                        {/* Upload Button for User */}
                        { accountUser?._id === user?._id ? (
                            <Upload submitPhoto={(formData, selectedImg)=> uploadPhoto( formData, `/api/profile/uploadProfilePhoto`, selectedImg)} user={user} />
                            ) : (
                                accountUser?.profileImage ? (
                                    <Avatar
                                        src={accountUser?.profileImage}
                                        user={accountUser}
                                        classNameOne='w-full pt-10'
                                        classNameTwo="w-20 mx-auto"
                                    />
                                ) : /* No Profile Image */ (
                                    <Placeholder
                                        user={accountUser}
                                        classNameOne='w-full pt-10'
                                        classNameTwo='w-20 mx-auto'
                                    />
                                )
                            )
                        }
                        
                            {
                                accountUser?._id !== user?._id && (
                                    
                                    <div className="flex no-wrap px-12">
                                        { accountUser?.stripeAccountId && chargesEnabled && (
                                            <GiftButton
                                                stripePayment={handleStripePayment}
                                                creatorId={accountUser?._id}
                                                loading={paymentLoading}
                                                marginTop={"mt-2"}
                                            />
                                        ) }
                                        {accountUser?.followerId?.includes(user?._id) ? (
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
                                        )}
                                    </div>
                                    
                                )
                            }

                        {/* Profile Details */}
                        <div className='w-full'>
                            { accountUser?._id === user?._id &&
                                <p className="text-center"><strong>Email</strong>: { accountUser?.email } </p>}
                            <p className="text-center"><strong>User Name</strong>: { accountUser?.userName?.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') } </p>
                        </div>

                        </div>

                        { accountUser?._id === user?._id && 
                            <div className="w-full sm:w-2/3 md:w-full grow-1 px-2">
                                <AddPost width='w-full grow-2' classNameOne="pt-4 text-center" divWidth='w-full' addPost={(formData)=> addPost(formData, '/api/profile/createPost')} />
                            </div>}
                        </div>
                </section>

                <section className="w-full md:w-2/4 order-3 md:order-2 pt-4 px-1">
                    {/* Profile Feed for users without post */}
                    { posts.length === 0 ? (
                        <p className="text-center"><strong>No Post available</strong></p>
                    ) : (
                        // Profile Feed for users with post
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
                    )}
                </section>
                
                {/* Friends List Section of User */}
                <section className="w-1/4 order-2 md:order-3 px-2">
                    {/* Stripe UI */}
                    { accountUser?._id === user?._id && (
                        chargesEnabled ? (
                            <StripeBalance // Stripe Balance
                                available={balance?.available}
                                pending={balance?.pending}
                                currency={balance?.currency?.toUpperCase()}
                            />
                        ) : (
                            <StripeConnect // Stripe Onboarding
                                stripeConnect={handleStripeConnect}
                                loading={stripeConnectLoading}
                                userStatus={user?.stripeAccountId}
                            />
                        )
                    )}
                    {/* <Recommend /> */}
                    <h3 className="text-center pt-4"><strong>{ accountUser?._id === user?._id ? 'My Friends' : `${accountUser?.userName}'s Friends` }</strong></h3>
                    <div className="card w-full bg-base-100 card-xs shadow-sm">
                        <div className="card-body">
                                { (accountUser?.followingId?.length == 0 || !accountUser?.followingId )  ? (
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