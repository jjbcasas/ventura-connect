import { Link, useParams, /*useNavigate, useOutletContext*/ } from 'react-router-dom'
import { useLocation, useNavigate } from 'react-router-dom'
import Placeholder from './Placeholder'
import Avatar from './Avatar'
// import { useAuth } from '../context/AuthContext'
// import toast from 'react-hot-toast'

const Header = ({user /*, logout*/}) => {
  const { id } = useParams()
  const location = useLocation()
  const shouldShowHeaderContent = 
    location.pathname === '/feed' || 
    location.pathname === `/post/${id}` || 
    location.pathname === `/profile/${id}`
  // const { logout } = useAuth()
  // const navigate = useNavigate()
  // const { setUser } = useOutletContext()

    // const handleClick = async () => {
    //   await logout()
    //   navigate('/')
    // }

  return (
    <header>
        <div className={`navbar bg-base-100 shadow-sm  w-full flex-1`}>
            <div className="flex-1">
                <Link to={user ? '/feed' : '/' } className="btn btn-ghost text-xl">Ventura Connect</Link>
            </div>

            { shouldShowHeaderContent &&
              <div className="flex-none w-2/3 min-[450px]:w-1/2 text-right">

                { user?.profileImage ? 
                <Avatar classNameTwo='mx-auto' user={user}/>
                : <Placeholder classNameTwo='mx-auto' user={user} /> }
                  <ul className="menu menu-horizontal p-0 min[350px]:px-1">
                    <li>{
                          id === user?._id ?
                          <Link to={`/feed`}>Feed</Link>
                          :
                          <Link to={`/profile/${user?._id}`}>Profile</Link>
                        }
                    </li>
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
