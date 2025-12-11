const FollowButton = ({classNameOne, followUser, userId}) => {

  return (
    <div className="w-20 mx-auto"> 
        <button className={`btn btn-soft btn-primary w-full ${classNameOne}`} type="button" onClick={()=>followUser(userId)}>Follow</button>
    </div>
  )
}

export default FollowButton
