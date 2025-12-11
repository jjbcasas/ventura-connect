import { Link } from 'react-router-dom'

const Home = () => {
  return (
    <div>
        <div className="hero bg-base-200 min-h-125">
            <div className="hero-content text-center">
                <div className="max-w-md">
                    <h1 className="text-5xl font-bold">Let's Connect!</h1>
                    <p className="py-6">
                        Sharing the best local spots, events and hidden gems of Ventura County.
                    </p>
                    <Link to={"/login"} className="btn mr-2">Log In</Link>
                    <Link to={"/signup"} className="btn btn-primary">Sign Up!</Link>
                </div>
            </div>
        </div>
    </div>
  )
}

export default Home
