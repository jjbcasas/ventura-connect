import { useEffect } from "react"
import { useChat } from "../context/ChatContext"
import UsersLoadingSkeleton from "./UsersLoadingSkeleton"
import NoChatsFound from "./NoChatsFound"
import { useAuth } from "../context/AuthContext"

const ContactList = () => {
    const { getAllContacts, allContacts, loading, selectedUser, setSelectedUser, setSpecificLoading, setMessages, getMessagesByUserId, updateUnreadCount, setUnreadMessages, unreadMessages } = useChat()
    const { onlineUsers } = useAuth()

    useEffect(()=> {
        const controller = new AbortController()

        getAllContacts(controller.signal)

        return () => {
            controller.abort(); // Cancels the request if you switch tabs mid-load
        }
    },[getAllContacts])
    
    if ( loading["getAllContacts"] ) return <UsersLoadingSkeleton />
    if ( !loading["getAllContacts"] && allContacts.length === 0 ) return <NoChatsFound />

  return (
    <>
      {allContacts.map( contact => {
        const userUnreadCount = unreadMessages.find( msg => msg?._id === contact?._id )
        return (
            <div
                key={contact._id}
                className={`${contact?._id === selectedUser?._id ? "bg-slate-500/20" : "bg-slate-50" } p-4 rounded-lg cursor-pointer hover:bg-slate-500/20 transition-colors`}
                onClick={ async ()=> {
                    setSelectedUser(contact)
                    // setSpecificLoading('getMessagesByUserId', true)
                    setMessages([])

                    // Immediately clear the count in Frontend State
                    setUnreadMessages(prev => prev.filter(item => item._id !== contact?._id))

                    try {
                        // Run these in parallel
                        await Promise.all([
                            getMessagesByUserId(contact._id),
                            // Tell Backend to mark as read
                            updateUnreadCount(contact._id)
                        ])
                    } catch (error) {
                        console.error("Failed to sync read status")
                        // Optional: If it fails, you could re-fetch the unread count
                    }
                }}
            >
                <div className="flex items-center gap-3">
                    <div className={`avatar ${onlineUsers.includes(contact._id) ? "avatar-online" : "avatar-offline"}`}>
                        <div className="bg-neutral text-neutral-content size-12 rounded-full">
                            {
                                contact?.profileImage ? (
                                    <img src={ contact?.profileImage } alt={contact?.userName} />
                                ) : (
                                    <span className="text-3xl size-full flex items-center justify-center ">
                                        { contact?.userName?.split(' ').map(word => word.charAt(0).toUpperCase()).join('') }
                                    </span>
                                )
                            }
                        </div>
                    </div>
                    <h4 className="text-slate-800 font-medium truncate">{contact.userName}</h4>

                    {/* Render count if it exists and is > 0 */}
                        { userUnreadCount?.count > 0 && (
                            <div className="badge badge-xs" >
                                {userUnreadCount?.count}
                            </div>
                        )}
                </div>
            </div>
        )})}
    </>
  )
}

export default ContactList
