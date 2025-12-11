import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const Logout = () => {
    const { logout } = useAuth()
    const navigate = useNavigate()

    useEffect(()=> {
        const performLogout = async () => {
            await logout()
            navigate('/')
        }
        performLogout()
    }, [])

  return (
    <h1 className="text-lg min-h-125 justify-center flex items-center">
      Logging out...
    </h1>
  )
}

export default Logout
