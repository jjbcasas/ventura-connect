import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import Spinner from "../components/Spinner"

const PublicRoute = () => {
  const { isAuthenticated, isLoading } = useAuth()

  if ( isLoading ) {
    return <Spinner loading={isLoading} />
  }

  // If the user is authenticated, redirect them to the feed page
  // Otherwise, render the child routes
  return isAuthenticated ? <Navigate to='/feed' replace /> : <Outlet />
}

export default PublicRoute
