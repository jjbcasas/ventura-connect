import { useChat } from "../context/ChatContext"

const ActiveTabSwitch = () => {
    const { activeTab, setActiveTab, setAllContacts, setChats, setSpecificLoading, /*getChatPartners, getAllContacts, selectedUser, setSelectedUser*/ } = useChat()

  return (
    <div className="tabs tabs-box flex justify-center p-2 m-2">
        <button
            onClick={()=> {
                if ( activeTab === "chats") return
                // setChats([])
                setSpecificLoading(`getChatPartners`, true )
                // getChatPartners()
                setActiveTab("chats")
            }}
            className={`tab w-1/2 text-slate-400 ${
                activeTab === "chats" && "bg-slate-500/20"
            }`}
        >
        Chats
        </button>
        <button
            onClick={()=> {
            if ( activeTab === "contacts") return
                // setAllContacts([])
                setSpecificLoading(`getAllContacts`, true )
                // getAllContacts()
                setActiveTab("contacts")
            }}
            className={`tab w-1/2 text-slate-400 ${
                activeTab === "contacts" && "bg-slate-500/20"
            }`}
        >
        Contacts
        </button>
    </div>
  )
}

export default ActiveTabSwitch
