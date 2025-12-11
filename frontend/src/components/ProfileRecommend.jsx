import { Link } from 'react-router-dom'

const ProfileRecommend = ({following, width='w-12'}) => {
    return (
        <li>
            {following.profileImage ? (
                <div className="avatar w-full p-2">
                    <div className={`rounded-full ${width}`}>
                        <Link to={`/profile/${following._id}`}>
                            <img src={following.profileImage}/>
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="avatar avatar-placeholder w-full p-2">
                    <div className={`bg-neutral text-neutral-content rounded-full ${width}`}>
                        <Link to={`/profile/${following._id}`}>
                            <span className="text-3xl">{following?.userName?.split(' ').map(word => word.charAt(0).toUpperCase())}</span>
                        </Link>
                    </div>
                </div>
            )}
        </li>
    )
}

export default ProfileRecommend
