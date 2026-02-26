import { 
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback
} from 'react';
import toast from 'react-hot-toast';
import { io } from "socket.io-client"

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Very important!
  const [ socket, setSocket ] = useState(null)
  const [ onlineUsers, setOnlineUser ] = useState([])
  const SOCKET_URL = import.meta.env.VITE_BACKEND_URL
  
  // Function for Socket Connection
  const connectSocket = useCallback( () => {
    // We check user?._id here as a guard
    if (!user?._id) return

    setSocket( prevSocket => {
      // If a socket already exists and is connected, do nothing!
      if ( prevSocket?.connected ) return prevSocket
      // If an old socket exists but is disconnected, clean it up first
      if ( prevSocket ) prevSocket.disconnect()
      // Initialize the socket
      const newSocket = io( SOCKET_URL , {
        withCredentials: true,
        transports: ["websocket"], // Force WebSocket only, skip polling
        upgrade: false
      })
      return newSocket
    } )
  },[ user?._id ])

  // Function for Socket Disconnect
  const disconnectSocket = useCallback( () => {
    // Clear the online users list immediately
    setOnlineUser([])
    setSocket((prevSocket) => {
      // This looks at the current socket value without needing it in [deps]
      if (prevSocket?.connected) {
        prevSocket.disconnect();
      }
      return null; // Sets state to null
    })
  }, [ ])

  // Function to Check Auth Status on initial app load
  const checkAuthStatus = useCallback( async ( signal ) => {
      try {
          setIsLoading(true); // Start loading
          const res = await fetch(`/api/user`, {
            method: 'GET',
            credentials: 'include',
            signal: signal
          })
          const data = await res.json()

          if (data.isAuthenticated && data.user) {
            // State update
            setUser(data.user)
            setIsAuthenticated(true)
              // toast.success(data.message || 'Welcome back!');
          } else {
            // State Cleanup
              setUser(null);
              setIsAuthenticated(false);
              // toast.error(data.message || 'You are not logged in.');
          }
      } catch (error) {
        if ( error.name === 'AbortError') {
                  console.log('Request was cancelled');
                  return; // Stop execution, no state should be set.
              }

          setUser(null);
          setIsAuthenticated(false)
          console.error('Error checking auth status:', error);
          // toast.error('Failed to connect to authentication server.');
      }finally {
          // This runs whether try succeeded OR catch ran
          if (!signal?.aborted) {
            setIsLoading(false)
          }
    }
  },[ ])

  // Function for User Signup
  const signup = useCallback(async (createUser) => {
    try {
        const res = await fetch(`/api/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(createUser),
            credentials: 'include'
        });

        const data = await res.json(); // Parse the JSON response

        if ( res.ok ) {
            if ( data.user ) {
              setUser(data.user)
              setIsAuthenticated(true);
              toast.success(data.message)
              return { success: true }
            }
        } else {
          // 1. State Cleanup (For safety)
          setUser(null)
          setIsAuthenticated(false)
          // 2. User Notification (The Toast)
          toast.error(data.message)
          // 3. Developer Logging (The Console)
          console.error('Signup failed:',data.message)
          // 4. Component Notification (The Throw)
          throw new Error(data.message || "Signup failed" )
        }
    } catch (error) {
      // 1. State Cleanup (For safety)
        setUser(null)
        setIsAuthenticated(false)
        // 2. User Notification (The Toast)
        if (error.name !== 'Error') { 
          toast.error('Could not connect to the server')
        }
        // 3. Developer Logging (The Console)
        console.error('Network error during signup:', error)
        // Re-throw to propagate error to the caller
        throw error
    }
  },[ ])

  // Function to handle user login
  const login = useCallback(async (/*email, password*/loginForm) => {
    try {
      const res = await fetch(`/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginForm),
        credentials: 'include'
      });
      const data = await res.json();

      if (res.ok && data.isAuthenticated && data.user) {
        // 1. Update state
        setUser(data.user)
        setIsAuthenticated(true)
        // navigate('/feed'); // Redirect to feed on successful login
        // 2. User Notification (The Toast)
        toast.success(data.message || 'Logged in successfully!')
        // 3. Return status
        return { success: true }
      } else {
        // Handle login errors (e.g., incorrect credentials)
        // 1. State Cleanup (For safety)
        setUser(null);
        setIsAuthenticated(false)
        // 2. User Notification (The Toast)
        toast.error(data.message || 'Login failed. Please try again.')
        // 3. Developer Logging (The Console)
        console.error('Login failed:',data.message)
        // 4. Component Notification (The Throw)
        throw new Error(data.message || "Login failed" )
      }
    } catch (error) {
      // 1. State Cleanup (For safety)
      setUser(null)
      setIsAuthenticated(false)
      // 3. Developer Logging (The Console)
      console.error('Error during login:', error)
      // 2. User Notification (The Toast)
      if (error.name !== 'Error') { 
        toast.error('Could not connect to the server');
      }
      // Re-throw to propagate error to the caller
      throw error
    }
  },[ ])

  // Function for Google Login
  const googleLogin = useCallback( async( response ) => {
    try {
      const res = await fetch(`/api/google`,{
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: response.credential }),
        credentials: "include"
      })
      const data = await res.json()

      if ( res.ok && data.isAuthenticated && data.user ) {
        // 1. Update state
        setUser(data.user)
        setIsAuthenticated(true)
        // navigate('/feed'); // Redirect to feed on successful login
        // 2. User Notification (The Toast)
        toast.success(data.message || 'Logged in successfully!')
        // 3. Return status
        return { success: true }
      } else {
        // Handle login errors (e.g., incorrect credentials)
        // 1. State Cleanup (For safety)
        setUser(null);
        setIsAuthenticated(false)
        // 2. User Notification (The Toast)
        toast.error(data.message || 'Login failed. Please try again.')
        // 3. Developer Logging (The Console)
        console.error('Login failed:',data.message)
        // 4. Component Notification (The Throw)
        throw new Error(data.message || "Login failed" )
      }
    } catch (error) {
      // 1. State Cleanup (For safety)
      setUser(null)
      setIsAuthenticated(false)
      // 3. Developer Logging (The Console)
      console.error("Google login failed: ", error)
      // 2. User Notification (The Toast)
      if (error.name !== 'Error') { 
        toast.error('Could not connect to the server');
      }
      // Re-throw to propagate error to the caller
      throw error
    }
  }, [])

  // Function for User Logout
  const logout = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/logout`, {
        method: 'POST', // Logout is typically a POST request
        credentials: 'include'
      });
      const data = await res.json()

      if ( res.ok ) {
        // navigate('/'); // Redirect to login after logout
        toast.success(data.message || 'Logged out successfully!')
      } else {
        console.log('Error during logout:', data.message )
        toast.error(data.message || 'Logout failed.')
      }
    } catch (error) {
      console.error('Error during logout:', error);
      toast.error('Network error during logout.')
      // Even if error, typically log out on client side
    } finally {
      setUser(null);
      setIsAuthenticated(false)
      setIsLoading(false)
      // Call the socket disconnect here
      disconnectSocket()
      // Clear chat data so the next person who logs in on this computer 
      // doesn't see your old notifications for a split second
    }
  },[ disconnectSocket ])

  // Run checkAuthStatus once on component mount
  useEffect(() => {
    const controller = new AbortController()
    checkAuthStatus(controller.signal)
    
    return () => {
      controller.abort()
    }
  }, [ checkAuthStatus ])

  // Run UseEffect for Socket Connection and Disconnection
  useEffect(() => {
  // If we have a user and no active socket, connect!
  if (user?._id && !socket) {
    connectSocket();
  }

  // If the user is gone, disconnect!
  if (!user?._id && socket) {
    disconnectSocket();
  }

  // CLEANUP: If the component unmounts, kill the socket
  return () => {
    // Only wipe data if the user is actually logging out
    // (i.e., user ID is now null)
    if (!user?._id) {
        setOnlineUser([])
        // ONLY disconnect here if the component is truly unmounting 
        // or if the user ID actually changed to null.
        if (socket) {
            socket.disconnect();
            setSocket(null);
        }
    }
  }
}, [ user?._id, connectSocket, disconnectSocket ])

  // This effect manages the Socket EVENT LISTENERS
  useEffect(() => {
    if (!socket) return;

    // 1. Define the function with a name
    const handleOnlineUsers = ( userIds ) => {
        setOnlineUser(userIds)
      }
    // 2. Start listening for online users event
      socket.on("getOnlineUsers", handleOnlineUsers)

    // 3. CLEANUP: This is where you disconnect "getOnlineUsers"
    return () => {
      socket.off("getOnlineUsers", handleOnlineUsers)
    }
  }, [socket]) // Runs whenever a new socket is created

  const authContextValue = useMemo(() => ({
    user,
    setUser,
    isAuthenticated,
    isLoading,
    setIsLoading,
    signup,
    login,
    googleLogin,
    logout,
    checkAuthStatus,
    onlineUsers,
    socket
  }), [user, setUser, isAuthenticated, isLoading, setIsLoading, signup, login, googleLogin, logout, checkAuthStatus, onlineUsers, socket ]); // Include functions in dependency array

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);