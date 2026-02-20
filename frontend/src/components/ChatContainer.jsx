import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { useAuth } from "../context/AuthContext"
import { useChat } from "../context/ChatContext"
import ChatHeader from "./ChatHeader"
import NoChatHistoryPlaceholder from "./NoChatHistoryPlaceholder"
// import Spinner from "./Spinner"
import MessageInput from "./MessageInput"
import MessageLoadingSkeleton from "./MessageLoadingSkeleton"

const formatMessageTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();

    // Check if it's the same day
    // toDateString is best for debugging/devs
    const isToday = date.toDateString() === now.toDateString();
    
    const timeOptions = { hour: "2-digit", minute: "2-digit", hour12: true }

    if (isToday) {
        // Returns local time (e.g., "02:30 PM" or "14:30")
        return date.toLocaleTimeString("en-US", timeOptions);
    }

    // Older than today: Show date + time
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        ...timeOptions
    }); // e.g., "Jan 7, 10:30 AM"
    
};

const ChatContainer = () => {
    const { selectedUser, getMessagesByUserId, messages, loading, subscribeToMessages, unsubscribeFromMessages, loadOldMessages } = useChat();
    const { user } = useAuth();
    const scrollRef = useRef(null);
    const messageEndRef = useRef(null);
    const topRef = useRef(null);
    const [prevHeight, setPrevHeight] = useState(0);
    const isInitialScrollDone = useRef(false)
    const lastMessageId = messages[messages.length - 1]?._id;

    useEffect(()=> {
        // getMessagesByUserId(selectedUser._id)
        // Reset state first when the user changes
        isInitialScrollDone.current = false;
        setPrevHeight(0); // Also good to reset this to avoid math bugs
        
        // initialize listener
        const unsubscribe = subscribeToMessages()

        // Clean up the listener when switching users or unmounting
        return () => unsubscribe?.()
    },[ /*getMessagesByUserId,*/ selectedUser?._id, subscribeToMessages/*, unsubscribeFromMessages*/ ])

    // Observer for the loading icon. When in view, run fetch.
    useEffect(() => {
        const controller = new AbortController()
        const observer = new IntersectionObserver(
            ( entries ) => {
                // Use a functional check inside the callback
                // ensures that the "load history" logic only becomes active after the user is looking at the initial messages
                if (entries[0].isIntersecting && isInitialScrollDone.current && messages.length >= 20 && !loading['loadOldMessages'] && 
                    !loading['getMessagesByUserId']) {

                    if (scrollRef.current) {
                        setPrevHeight(scrollRef.current.scrollHeight);
                    }
                    // Get the timestamp right when needed
                    const oldestMessageTimestamp = messages[0]?.createdAt;
                    if (oldestMessageTimestamp) {
                        loadOldMessages(oldestMessageTimestamp, controller.signal);
                    }
                }
            },
            { threshold: 0.1 } // Trigger only when fully visible
        )
        if (topRef.current) observer.observe(topRef.current);

        return () => {
            observer.disconnect();
            controller.abort();
        }
    }, [ messages.length, loadOldMessages, selectedUser?._id ])

    // THE FREEZE LOGIC: useLayoutEffect runs BEFORE the browser repaints
    useLayoutEffect(() => {
        if (prevHeight > 0 && !loading['loadOldMessages'] && scrollRef.current) {
            // create a ref copy of the ref or a pointer
            const container = scrollRef.current;
            // Calculate how much height was added
            const addedHeight = container.scrollHeight - prevHeight;
            
            // Push the scroll down by exactly that amount
            container.scrollTop = addedHeight;
            
            // Reset for next fetch
            setPrevHeight(0);
        }
    }, [messages, loading['loadOldMessages']]);

    // Scroll-to-view
    useEffect(() => {
        let timer
        // Only auto-scroll to bottom if we aren't loading historical messages
        if (messageEndRef.current && !loading['loadOldMessages']) {
            messageEndRef.current.scrollIntoView({ behavior: "smooth" })
            // Mark as done after the smooth scroll finishes
            timer = setTimeout(() => {
                isInitialScrollDone.current = true;
            }, 500);
        }

        // Cleanup function
        return () => {
            if (timer) clearTimeout(timer);
        }
    }, [lastMessageId])

  return (
    <>
        <ChatHeader />
        <div
            ref={scrollRef}
            className="flex-1 px-6 overflow-y-auto py-8 rounded-xl bg-slate-200/20"
            style={{ overflowAnchor: 'none' }}
        >
            { loading['getMessagesByUserId'] ? (
                <MessageLoadingSkeleton />
            ) : messages?.length > 0 ? (
                <div className="max-w-3xl mx-auto space-y-6">
                    {/* THE TRIPWIRE: Invisible element at the top */}
                    <div ref={topRef} className="h-1" />
                        {/* Show dots only when actually loading older messages */}
                        {loading['loadOldMessages'] && (
                            <div className="flex justify-center items-center py-2">
                                <span className="loading loading-dots loading-md"></span>
                            </div>
                        )}
                    { messages?.map( msg => (
                        <div
                            key={msg._id}
                            className={`chat ${ msg?.senderId?._id === user._id ? "chat-end" : "chat-start" }
                        `}>
                            <div className="chat-image avatar">
                                <div className="w-10 rounded-full">
                                <img
                                    alt="User Image"
                                    src={msg?.senderId?.profileImage}
                                />
                                </div>
                            </div>
                            <div className="chat-header">
                                { msg?.senderId?.userName}
                            </div>
                            <div
                                className={`chat-bubble relative ${msg?.senderId?._id === user._id
                                    ? "bg-slate-800 text-white"
                                    : "bg-slate-500/50 text-slate-50"
                                }`}
                            >
                                { msg.image && (
                                    <img
                                        src={msg.image}
                                        alt="Sent attachment"
                                        className="rounded-lg h-48 object-cover"
                                    />
                                )}
                                { msg.text && <p>{msg.text}</p>}
                                <time className="text-xs mt-1 opacity-75 flex items-center gap-1">
                                    { formatMessageTime(msg.createdAt)}
                                </time>
                            </div>

                        </div>
                    ))}
                    {/* Scroll Target */}
                    <div ref={messageEndRef}/>
                </div>
            ) : (
                <NoChatHistoryPlaceholder name={selectedUser.userName} />
            )}
        </div>
        <MessageInput />
    </>
  )
}

export default ChatContainer