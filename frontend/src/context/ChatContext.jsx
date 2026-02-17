import {
    createContext,
    useContext,
    useState,
    useMemo,
    useCallback
} from 'react'
import toast from 'react-hot-toast'
import { useAuth } from './AuthContext'
import { useEffect } from 'react'

const ChatContext = createContext(null)

export const ChatProvider = ({ children }) => {
    const { user, socket } = useAuth()
    const [ allContacts, setAllContacts ] = useState([])
    const [ chats, setChats ] = useState([])
    const [ messages, setMessages ] = useState([])
    const [ activeTab, setActiveTab ] = useState("chats")
    const [ selectedUser, setSelectedUser ] = useState(null)
    const [ unreadMessages, setUnreadMessages ] = useState([])
    const [loading, setLoading] = useState({
        getChatPartners: true,

    })
    const [ isSoundEnabled, setIsSoundEnabled ] = useState(() => {
        const saved = localStorage.getItem("isSoundEnabled");
    
        // 1. If it's the first visit (null), default to true
        if (saved === null) return true;

        // 2. Convert the string "true" or "false" into a real boolean
        return saved === "true"; 
    })

    const setSpecificLoading = useCallback(( key, value ) => {
        setLoading(prev => ({ ...prev, [key]: value }));
    },[])

    const toggleSound = useCallback(() => {
        setIsSoundEnabled( prev => {
            const nextValue = !prev
            try {
                localStorage.setItem("isSoundEnabled", String(nextValue))
                return nextValue
            } catch (error) {
                console.error("Could not save sound preference:", error);
                toast.error("Settings couldn't be saved")
                return prev
            }
        })
    }, [])

    const getAllContacts = useCallback(async(signal) => {
        try {
            setSpecificLoading(`getAllContacts`, true )
            const res = await fetch('/api/messages/contacts',{
                credentials: 'include',
                signal
            })
            const data = await res.json()

            if ( res.ok ) {
                if ( data?.myContacts ) {
                    setAllContacts(data.myContacts)
                }
            } else {
                console.error('Error fetching data:', data.message)
                toast.error(data.message)
            }

        } catch (error) {
            // Check if it's a cancellation first
            if ( error.name === 'AbortError') {
                // Silently stop. No console log needed in production, 
                // but helpful during dev.
                console.log('Request was cancelled')
                return // Stop execution, no state should be set.
            }

            console.error('Error fetching data:',error)
            toast.error('Could not connect to the server')
        } finally {
            if (!signal?.aborted) {
                setSpecificLoading(`getAllContacts`, false);
            }
        }
    }, [])

    const getChatPartners = useCallback(async (signal) => {
        try {
            setSpecificLoading(`getChatPartners`, true )
            const res = await fetch('/api/messages/chats',{
                credentials: 'include',
                signal
            })
            const data = await res.json()

            if ( res.ok ) {
                if ( data?.chatPartners ) {
                    setChats(data.chatPartners)
                }
            } else {
                console.error('Error fetching data:', data.message)
                toast.error(data.message)
            }

        } catch (error) {
            // 1. Check if it's a cancellation first
            if ( error.name === 'AbortError') {
                // Silently stop. No console log needed in production, 
                // but helpful during dev.
                console.log('Request was cancelled');
                return; // Stop execution, no state should be set.
            }

            console.error('Error fetching data:',error)
            toast.error('Could not connect to the server' )
        } finally {
            if (!signal?.aborted) {
                setSpecificLoading(`getChatPartners`, false);
            }
        }
    }, [])

    const getMessagesByUserId = useCallback(async(userId) => {
        try {
            setSpecificLoading('getMessagesByUserId', true)
            const res = await fetch(`/api/messages/${userId}`,{
                credentials: "include"
            })
            const data = await res.json()

            if ( res.ok ) {
                if ( data?.messages ) {
                    setMessages(data.messages.reverse())
                }
            } else {
                console.error('Error fetching data:', data.message)
                toast.error(data.message)
            }
        } catch (error) {
            console.error('Error fetching data:',error)
            toast.error('Could not connect to the server' )
        }finally {
            setSpecificLoading(`getMessagesByUserId`, false )
        }
    },[])

    const sendMessage = useCallback( async( messageData ) => {
        if (!user?._id || !selectedUser?._id) return; // Guard clause
        const tempId = `temp-${Date.now()}`
        let previewUrl
        // Grab the file out of the box
        if (messageData.get("file")){
            //  Create a temporary URL so the browser can display the local file
            previewUrl = URL.createObjectURL(messageData.get("file"))
        }

        const optimisticMessage = {
            _id: tempId,
            senderId: {
                _id:user._id,
                userName:user.userName,
                profileImage: user.profileImage
            },
            receiverId: {
                _id: selectedUser._id,
                userName:selectedUser.userName,
                profileImage: selectedUser.profileImage
            },
            text: messageData.get("text"),
            image: previewUrl,
            createdAt: new Date().toISOString()
        }

        // immediately updates UI by adding the optMsg
        setMessages( prevMsgs => [...prevMsgs, optimisticMessage])

        try {
            setSpecificLoading('sendMessage', true)
            const res = await fetch(`/api/messages/send/${selectedUser._id}`,{
                method: "POST",
                credentials: "include",
                body: messageData
            })
            const data = await res.json()

            if ( res.ok ) {
                if ( data?.fullMessage ) {
                    // 1. Remove the tempId and State update
                    setMessages(prevMessages => {
                        const withoutTemp = prevMessages.filter( msg => msg._id !== tempId )

                        const hasReal = withoutTemp.some( msg => msg._id === data.fullMessage?._id )
                        
                        if ( hasReal ) return withoutTemp

                        return [ ...withoutTemp, data?.fullMessage]
                    })
                    // Delay memory cleanup to prevent broken image icons during re-renders.
                    if (previewUrl) setTimeout(() => URL.revokeObjectURL(previewUrl), 1000)
                    return { success: true }
                }
            } else {
                // State Cleanup
                setMessages(prevMsg => (
                    prevMsg.filter( msg => msg._id !== tempId )
                ))
                if (previewUrl) URL.revokeObjectURL(previewUrl); // Revoke immediately on error
                // User Notification
                toast.error(data.message)
                // Developer Logging
                console.error('Error fetching data:', data.message)
                // Component Notification (The Throw)
                throw new Error(data.message || "Failed to send message")
            }

        } catch (error) {
            // removes optimistic message on failure and State Cleanup
            setMessages(prevMsg => (
                prevMsg.filter( msg => msg._id !== tempId )
            ))
            if (previewUrl) URL.revokeObjectURL(previewUrl); // Revoke immediately on error
            // User Notification
            if (error.name !== 'Error') { 
                toast.error('Could not connect to the server');
            }
            // Developer Logging
            console.error('Error sending message:',error)
            // Re-throw to propagate error to the caller
            throw error
        }finally {
            setSpecificLoading('sendMessage', false);
        }
    },[selectedUser?._id,user?._id])

    const subscribeToMessages = useCallback( () => {
        if (!selectedUser || !socket ) return

        // Define the function handler - Real-time Socket Updates and Message Deduplication
        const handleNewMessage = ( newMessage )=> {
            const isMessageSentFromSelectedUser = newMessage.senderId?._id === selectedUser?._id
            // const isMessageSentByUser = newMessage.senderId === user._id
            const isMessageSentByMeToSelectedUser = newMessage.senderId?._id === user?._id && newMessage.receiverId?._id === selectedUser?._id
            if ( !isMessageSentFromSelectedUser && !isMessageSentByMeToSelectedUser ) return

            setMessages(prev => {
                let changed = false
                const filtered = prev.filter(msg => {
                    // If real ID matches, it's a duplicate (ignore) (for multi-tab sync)
                    if (msg._id === newMessage._id) return false

                    // Remove if it's a TEMP id and the content matches (The "Swap")
                    if (msg._id.startsWith("temp-") && msg.text?.trim() === newMessage.text?.trim() && !changed ) {
                        changed = true; // Mark that we've found the swap
                        return false;       // Remove this temp message
                    }

                    return true;
                });
                return [...filtered, newMessage];
            })

            // Only play sound if the message came from the OTHER person
            const isMessageFromSomeoneElse = newMessage.senderId._id !== user._id

            if ( isSoundEnabled && isMessageFromSomeoneElse ) {
                const notificationSound = new Audio("/sounds/notification.mp3") /* Try putting this on top of the file for optimization if it will work */

                notificationSound.currentTime = 0 // Reset to start
                notificationSound.play().catch(error=> console.log("Audio play failed: ", error))
            }
        }

        // 2. Start the listener
        socket.on("newMessage", handleNewMessage)

        // 3. RETURN the cleanup function
        return () => {
            // You are passing the specific function (handleNewMessage)
            // It does NOT kill other listeners on other pages that might be listening for the same event name but using different functions.
            socket.off("newMessage", handleNewMessage)
        }
    }, [ selectedUser, socket, isSoundEnabled, user?._id ])

    const messageCountNotification = useCallback( () => {
        if ( !socket || !user?._id ) return
        
        const handleMessageCount = (newMessage) => {
            const myMessages = newMessage?.receiverId?._id === user?._id

            // If it's not for me, return
            if ( !myMessages ) return

            // If I'm currently chatting with this person, don't increase count
            if (selectedUser?._id === newMessage?.senderId?._id) return

            
            setUnreadMessages( prevMsg => {
                const existingEntry = prevMsg.find(item => item._id === newMessage?.senderId?._id)
                if (existingEntry) {
                    return prevMsg.map( prev => {
                        if ( prev?._id === newMessage?.senderId?._id ) {
                            return { ...prev, count: prev.count + 1 }
                        }
                        return prev
                    })
                } else {
                    return [ ...prevMsg, { _id: newMessage?.senderId?._id, count: 1 }]
                }
            })
                  // if ( newMessage.isRead === "false" ) return prevCount + 1
        }

        socket.on("newMessage", handleMessageCount )
        return () => {
            socket.off("newMessage", handleMessageCount)
            // setMessageCount(0)
        }

    }, [ socket, user?._id, selectedUser ])

    const getUnreadMessage = useCallback( async (signal) => {
        try {
            const res = await fetch("/api/messages/unreadCount", {
                credentials: 'include',
                signal
            })
            const data = await res.json()
                if ( res.ok ) {
                        setUnreadMessages(data?.unreadCount || [])
                } else {
                    console.log("Error fetching data: ", data.message)
                    toast.error(data.message)
                }
        } catch (error) {
            if ( error.name === 'AbortError') {
                    console.log('Request was cancelled');
                    return; // Stop execution, no state should be set.
                }
            console.log("Error fetching data: ", error.message )
            toast.error("Could not connect to the server")
        }
    }, [])

    const updateUnreadCount = useCallback( async ( chatPartnerId ) => {
        try {
            const res = await fetch(`/api/messages/readMessages/${chatPartnerId}`, {
                credentials: 'include',
                method: "PATCH"
            })
            const data = await res.json()

            if ( res.ok ) {
                console.log(data.message)
            }
        } catch (error) {
            console.log("Error in updating messages: ", error.message)
            toast.error("Could not connect to the server")
        }
    }, [ ])

    const loadOldMessages = useCallback( async ( createdAtId, signal ) => {
            try {
                setSpecificLoading(`loadOldMessages`, true )
                const res = await fetch(`/api/messages/oldMessages/${selectedUser?._id}?timestamp=${createdAtId}`,{
                    credentials: "include",
                    signal
                })
                const data = await res.json()

                
                if (res.ok) {
                    if ( data.nextTenMessages && data.nextTenMessages.length > 0 ) {
                        const reverseMessages = data.nextTenMessages.reverse()
                        setMessages( msgs => [ ...reverseMessages, ...msgs, ])
                    } else {
                        console.log(data.message)
                    }
                }
    
            } catch (error) {
                if ( error.name === 'AbortError') {
                    console.log('Request was cancelled');
                    return; // Stop execution, no state should be set.
                }
                console.log("Error fetching data: ", error.message )
                toast.error("Could not connect to the server")
            } finally {
                if (!signal?.aborted) {
                    setSpecificLoading(`loadOldMessages`, false)
                }
            }
        }, [selectedUser?._id])

    useEffect(() =>{
        const controller = new AbortController()

        // Uncomment this if you logged in a new user and sees a flicker of the old users data(friends and chats). Use/change 'user' object instead of 'user?._id'.
        if (!user?._id) {
            // When the user logs out, the ChatProvider cleans up itself!
            setUnreadMessages([]);
            setChats([]);
            setAllContacts([]);
            setSelectedUser(null);
            return
        }

        // Database Fetch (HTTP - No socket needed)
        if ( user?._id ) {
            getUnreadMessage(controller.signal)
        }
        const unsubscribe = messageCountNotification()

        return () => { 
            if ( unsubscribe ) unsubscribe()
            controller?.abort()
        }
    }, [user?._id, getUnreadMessage, messageCountNotification])

    const chatContextValue = useMemo(()=> ({
        allContacts,
        setAllContacts,
        chats,
        setChats,
        messages,
        setMessages,
        activeTab,
        setActiveTab,
        selectedUser,
        setSelectedUser,
        isSoundEnabled,
        toggleSound,
        // setTabs,
        // setUsers,
        getAllContacts,
        getChatPartners,
        setSpecificLoading,
        getMessagesByUserId,
        sendMessage,
        subscribeToMessages,
        // unsubscribeFromMessages,
        messageCountNotification,
        getUnreadMessage,
        unreadMessages,
        setUnreadMessages,
        updateUnreadCount,
        loadOldMessages,
        loading
    }), [ allContacts, setAllContacts, chats, setChats, messages, setMessages, activeTab, setActiveTab, selectedUser, setSelectedUser, isSoundEnabled, toggleSound, /*setTabs, setUsers,*/ getAllContacts, getChatPartners, loading, setSpecificLoading, getMessagesByUserId, sendMessage, subscribeToMessages, messageCountNotification, getUnreadMessage, unreadMessages, setUnreadMessages, updateUnreadCount, loadOldMessages/*, unsubscribeFromMessages*/ ])

    return (
        <ChatContext.Provider value={chatContextValue}>
            {children}
        </ChatContext.Provider>
    )
}

export const useChat = () => useContext(ChatContext)