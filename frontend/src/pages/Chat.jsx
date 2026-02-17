import { useEffect } from "react"
import ActiveTabSwitch from "../components/ActiveTabSwitch"
import ChatContainer from "../components/ChatContainer"
import ChatList from "../components/ChatList"
import ContactList from "../components/ContactList"
import NoConvoPlaceholder from "../components/NoConvoPlaceholder"
import ProfileHeader from "../components/ProfileHeader"
import { useChat } from "../context/ChatContext"

const ChatPage = () => {
  const { activeTab, setActiveTab, selectedUser, setSelectedUser, setMessages, setMessageCount } = useChat()

  useEffect(()=> {
    return () => {  
      setSelectedUser(null)
      setMessages([])
      setActiveTab("chats")
    }
  }, [])

  return (
    <div className="relative w-full max-w-6xl h-[800px] flex">

      {/* Left side */}
      <div className="w-80 backdrop-blur-sm flex flex-col bg-white">
        
        <ProfileHeader />
        <ActiveTabSwitch />
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          { activeTab === "chats" ? <ChatList /> : <ContactList />}
        </div>

      </div>
        
      {/* Right Side */}
      <div className="flex-1 flex flex-col bg-slate-50 backdrop-blur-sm">
        { selectedUser ? <ChatContainer /> : <NoConvoPlaceholder /> }

      </div>
    </div>
  )
}

export default ChatPage
