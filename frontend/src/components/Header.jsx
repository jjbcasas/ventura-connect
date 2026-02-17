import { Link, useParams, useLocation, /*useNavigate, useOutletContext*/ } from 'react-router-dom'
import Placeholder from './Placeholder'
import Avatar from './Avatar'
import { useChat } from "../context/ChatContext"
import { Volume2Icon,VolumeOffIcon } from "lucide-react"
import { useApp } from '../context/AppContext'
import { useEffect, useState } from 'react'

const mouseClickSound = new Audio("/sounds/mouse-click.mp3")

const Header = ({user /*, logout*/}) => {
  const { id } = useParams()
  const location = useLocation()
  const { isSoundEnabled, toggleSound, unreadMessages, } = useChat()
  const { searchUser, userResults, setUserResults, loading } = useApp()
  const [ searchName, setSearchName ] = useState("")
  const isFeed = location.pathname === '/feed'
  const shouldShowHeaderContent = 
    location.pathname === '/feed' || 
    location.pathname === `/post/${id}` || 
    location.pathname === `/profile/${id}` ||
    location.pathname === `/chat`
    const navLinks = [
    { name: "Feed", path: '/feed' },
    { name: "Profile", path: `/profile/${user?._id}` },
    { name: "Chat", path: '/chat' }
]
  // const { messageCountNotification, messageCount } = useChat()
  // const { logout } = useAuth()
  // const navigate = useNavigate()
  // const { setUser } = useOutletContext()

    // const handleClick = async () => {
    //   await logout()
    //   navigate('/')
    // }

  const totalNotif = unreadMessages.reduce((sum, msg) => sum + msg.count, 0)

  // Update the name state on change first
  const handleChange = async (e) => {
    setSearchName(e.target.value);
  }

    // Let useEffect handle the "waiting" and the "cleanup"
  useEffect(() => {
    if ( !searchName ) {
      setUserResults([])
      return
    }
    const controller = new AbortController()

    const timer = setTimeout(() => {
        searchUser(searchName, controller.signal);
    }, 300);

    // React calls this automatically if searchName changes OR component unmounts
    return () => {
      clearTimeout(timer);
      controller.abort();
    }
  }, [searchName, searchUser ])

  // This effect only handles clearing the bar when leaving the feed
  useEffect(()=> {
    if ( !isFeed ) {
      setSearchName("");
      setUserResults([]);
    }
  }, [ isFeed ])

  return (
    <header>
        <div className={`navbar bg-base-100 shadow-sm  w-full flex-1`}>
            <div className="flex-1">
                <Link to={user ? '/feed' : '/' } className="btn btn-ghost text-xl">Ventura Connect</Link>
            </div>

            { shouldShowHeaderContent &&
              <div className="flex justify-end items-center min-[610px]:flex-nowrap flex-wrap w-2/3 text-right">
                {/* Search Field */}
                { location.pathname === '/feed' &&
                    <div className="relative w-1/3"> 
                      {/* THE SEARCH BAR */}
                      <label className="input w-full flex items-center gap-2">
                        <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                          <g
                            strokeLinejoin="round"
                            strokeLinecap="round"
                            strokeWidth="2.5"
                            fill="none"
                            stroke="currentColor"
                          >
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="m21 21-4.3-4.3"></path>
                          </g>
                        </svg>
                        <input
                          type="text"
                          value={searchName}
                          required
                          placeholder="Search"
                          onChange={handleChange}
                        />
                        {/* CUSTOM X BUTTON */}
                        { searchName && (
                          <button 
                            onClick={()=> {
                              setUserResults([])
                              setSearchName("")
                            }} 
                            className="btn btn-ghost btn-xs btn-circle opacity-50 hover:opacity-100"
                          >
                            ✕
                          </button>
                        )}
                      </label>
                      {/* THE RESULTS DROPDOWN */}
                        {userResults?.length > 0 && (
                          <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-base-100 border border-base-300 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                            {loading['searchUser'] ? (
                              <div className="flex justify-center items-center py-2">
                                <span className="loading loading-dots loading-md"></span>
                              </div>
                            ) : (
                            <ul className="menu p-2 w-full">
                              {userResults.map((user) => (
                                <li key={user._id}>
                                  <Link
                                      className="flex items-center gap-3 py-2 px-4 hover:bg-base-200"
                                      to={`/profile/${user?._id}`}
                                      onClick={() => {
                                        setUserResults([])
                                        setSearchName("")
                                      }} // Closes dropdown when clicked
                                    >
                                  {/* <button className="flex items-center gap-3 hover:bg-base-200"> */}
                                      { user?.profileImage ? (
                                        <img 
                                          src={ user?.profileImage } 
                                          className="w-8 h-8 rounded-full object-cover shrink-0" 
                                          alt={user.userName}
                                        />
                                      ) : (
                                        <div className="avatar avatar-placeholder w-8 h-8">
                                          <div className="bg-neutral text-neutral-content w-24 rounded-full">
                                          <span className="text-3xl">
                                            { user?.userName?.split(' ').map(word => word.charAt(0).toUpperCase()).join('') }
                                          </span>
                                           </div>
                                        </div>
                                      )
                                      }
                                    <span className="font-medium text-sm truncate">
                                      {user.userName}
                                    </span>
                                  {/* </button> */}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                            )}
                          </div>
                        )}
                    </div>
                }

                {/* Sound Toggle Button */}
                <button className="m-4 self-center text-slate-400 hover:text-slate-600 transition-colors" onClick={()=> {
                    mouseClickSound.currentTime = 0 //reset to start
                    mouseClickSound.play().catch((error) => console.log("Audio play failed:", error))
                    toggleSound()
                    }}
                >
                    { isSoundEnabled ? (
                        <Volume2Icon className="size-6" />
                    ) : (
                        <VolumeOffIcon className="size-6" />
                    )}
                </button>
                
                { user?.profileImage ? 
                <Avatar classNameTwo='mx-auto' p='md:p-0' user={user}/>
                : <Placeholder classNameTwo='mx-auto' p='md:p-0' user={user} /> }
                  <ul className="menu menu-horizontal p-0 min-[350px]:px-1 flex-nowrap">
                    {/* <li>{
                          id === user?._id ?
                          <Link to={`/feed`}>Feed</Link>
                          :
                          <Link to={`/profile/${user?._id}`}>Profile</Link>
                        }
                    </li>
                    <li>
                      <Link to='/chat'>Chat</Link>
                    </li> */}
                        { location.pathname === '/feed' ?
                          <>
                            <li>
                              <Link to={`/profile/${user?._id}`}>Profile</Link>
                            </li>
                            <li>
                              <Link to='/chat'>
                                Chat
                                { totalNotif > 0 &&
                                  <div className="badge badge-xs">
                                    {totalNotif}
                                  </div>}
                              </Link>
                            </li>
                          </>
                          : location.pathname === `/post/${id}` || location.pathname === `/profile/${id}` ?
                            <>
                              <li>
                                <Link to={`/feed`}>Feed</Link>
                              </li>
                              <li>
                                <Link to='/chat'>
                                  Chat
                                  { totalNotif > 0 &&
                                    <div className="badge badge-xs">
                                      {totalNotif}
                                    </div>}
                                </Link>
                              </li>
                            </>
                          : location.pathname === `/chat` &&
                            <>
                              <li>
                                <Link to={`/feed`}>Feed</Link>
                              </li>
                              <li>
                                <Link to={`/profile/${user?._id}`}>Profile</Link>
                              </li>
                          </>
                          }
                          {/* // Inside your return: */}
                    {/* {navLinks.map(link => {
                        // Custom logic: Hide Profile link if we are on a Profile OR a Post page
                        if (link.name === "Profile") {
                            const isOnUserContent = location.pathname.includes('/profile/') || location.pathname.includes('/post/');
                            if (isOnUserContent) return null;
                        }

                        // Standard logic: Hide if exact match
                        if (location.pathname === link.path) return null;

                        return (
                            <li key={link.path}>
                                <Link to={link.path}>{link.name}</Link>
                            </li>
                        );
                    })} */}
                    <li>
                      <Link to={`/logout`}>Logout</Link>
                      {/* <button onClick={handleClick}>Logout</button> */}
                    </li>
                  </ul>

              </div>}
        </div>
    </header>
  )
}

export default Header
