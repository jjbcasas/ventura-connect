import { Link, useLocation, useParams } from "react-router-dom"

const Avatar = ({ user, p = 'md:p-2 p-0', classNameOne, classNameTwo, link=`/profile/${user?._id}`, src= user?.profileImage, children }) => {
  const { id } = useParams()
  const location = useLocation()
  const shouldShowAvatarContent = location.pathname !== `/profile/${user?._id}`

  return (
    <div className={ `avatar ${p} ${classNameOne}` }>
        <div className= { `w-10 rounded-full ${classNameTwo}` }>
          { shouldShowAvatarContent ?
            <Link to={ link }>
              <img src={ src } />
            </ Link>
            : <img src={ src } />}
        </div>
        {children}
    </div>
  )
}

export default Avatar
