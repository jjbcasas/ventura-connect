import { Link, useLocation, useParams } from "react-router-dom"

const Placeholder = ({ user, classNameOne, classNameTwo, link= `/profile/${user?._id}`, children, padding='md:p-2 p-0' }) => {
  // const { id } = useParams()
  const location = useLocation()
  const shouldShowAvatarContent = location.pathname !== `/profile/${user?._id}`
  
  return (
    <div className={`avatar avatar-placeholder ${padding} ${classNameOne}`}>
      <div className={`bg-neutral text-neutral-content w-10 rounded-full ${classNameTwo}`}>

        { shouldShowAvatarContent ?
          <Link to={ link }>
            <span className="text-3xl">
              { user?.userName?.split(' ').map(word => word.charAt(0).toUpperCase()).join(' ') }
            </span>
          </Link>
          : <span className="text-3xl">
              { user?.userName?.split(' ').map(word => word.charAt(0).toUpperCase()).join(' ') }
            </span> }
      </div>
      {children}
    </div>
  )
}

export default Placeholder