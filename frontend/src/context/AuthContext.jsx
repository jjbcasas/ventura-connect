import React, { 
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback
} from 'react';
// import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Very important!
  // const navigate = useNavigate();

  // const API_BASE_URL = 'http://localhost:5000'; // Your backend URL

  // Function to check auth status on initial app load
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
                setUser(data.user);
                setIsAuthenticated(true);
                // toast.success(data.message || 'Welcome back!');

                setIsLoading(false)
            } else {
                setUser(null);
                setIsAuthenticated(false);
                // toast.error(data.message || 'You are not logged in.');
                
                setIsLoading(false)
            }
        } catch (error) {
          if ( error instanceof Error && error.name === 'AbortError') {
                    console.log('Request was cancelled');
                    return; // Stop execution, no state should be set.
                }

            setUser(null);
            setIsAuthenticated(false);
            console.error('Error checking auth status:', error);
            // toast.error('Failed to connect to authentication server.');
            
            setIsLoading(false)
        }
    })

    // Function to handle user signup
    const signup = async (createUser) => {
      try {
          const res = await fetch(`/api/signup`, { // Assuming /signup is your backend route
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify(createUser),
              credentials: 'include'
          });

          const data = await res.json(); // Parse the JSON response
          console.log(data)

          if ( res.ok ) {
              if ( data.user ) {
                setUser(data.user)
                setIsAuthenticated(true);
                  // navigate('/feed')
                toast.success(data.message)
                return { success: true }
              }
          } else {
              console.error('Signup failed:',data.message)
              toast.error(data.message)
              return { success: false }
          }
      } catch (error) {
          console.error('Network error during signup:', error);
          toast.error('Could not connect to the server. Please try again.');
          return { success: false }
      }
    }

    // Function to handle user login
  const login = async (/*email, password*/loginForm) => {
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
        setUser(data.user);
        setIsAuthenticated(true);
        // navigate('/feed'); // Redirect to feed on successful login
        toast.success(data.message || 'Logged in successfully!');
        return { success: true }
      } else {
        // Handle login errors (e.g., incorrect credentials)
          setUser(null);
          setIsAuthenticated(false);
          toast.error(data.message || 'Login failed. Please try again.');
          console.error('Login failed:',data.message)
          return { success: false }
      }
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      console.error('Error during login:', error);
      toast.error('Network error during login. Server might be down.');
      return { success: false }
    }
  };

  // Function to handle user google login
  // const googleLogin = async (/*email, password, loginForm*/) => {
  //   try {
  //     const res = await fetch(`/api/auth/google`);
  //     const data = await res.json();

  //     if (res.ok && data.isAuthenticated && data.user) {
  //       setUser(data.user);
  //       setIsAuthenticated(true);
  //       // navigate('/feed'); // Redirect to feed on successful login
  //       toast.success(data.message || 'Logged in successfully!');
  //       return { success: true }
  //     } else {
  //       // Handle login errors (e.g., incorrect credentials)
  //         setUser(null);
  //         setIsAuthenticated(false);
  //         toast.error(data.message || 'Login failed. Please try again.');
  //         console.error('Login failed:',data.message)
  //         return { success: false }
  //     }
  //   } catch (error) {
  //     setUser(null);
  //     setIsAuthenticated(false);
  //     console.error('Error during login:', error);
  //     toast.error('Network error during login. Server might be down.');
  //     return { success: false }
  //   }
  // };

  // Function to handle user logout
  const logout = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/logout`, {
        method: 'POST', // Logout is typically a POST request
        credentials: 'include'
      });
      const data = await res.json()

      if ( res.ok ) {
        // navigate('/'); // Redirect to login after logout
        toast.success(data.message || 'Logged out successfully!');
      } else {
        console.log('Error during logout:', error)
        toast.error(data.message || 'Logout failed.')
      }
    } catch (error) {
      console.error('Error during logout:', error);
      toast.error('Network error during logout.')
      // Even if error, typically log out on client side
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false)
    }
  };

  // Run checkAuthStatus once on component mount
  useEffect(() => {
    const controller = new AbortController()
    checkAuthStatus(controller.signal)
    
    return () => {
      controller.abort(); 
    }
  }, []);

  const authContextValue = useMemo(() => ({
    user,
    setUser,
    isAuthenticated,
    isLoading,
    signup,
    login,
    logout,
    checkAuthStatus,
  }), [user, setUser, isAuthenticated, isLoading, signup, login, logout, checkAuthStatus]); // Include functions in dependency array

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);