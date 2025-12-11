import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Spinner from '../components/Spinner'

const ProtectedRoute = () => {
    const { isAuthenticated, isLoading } = useAuth()
    
    if ( isLoading ) {
          return <Spinner loading={isLoading} />
        }

    // If the user is authenticated, render the child routes
    // Otherwise, redirect them to the login page
    return isAuthenticated ? <Outlet /> : <Navigate to='/login' replace />
}

export default ProtectedRoute
