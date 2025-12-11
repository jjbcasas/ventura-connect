import { /*useOutletContext,*/useNavigate, Link } from 'react-router-dom'
import { FaArrowLeft } from 'react-icons/fa'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
// import AlertMessages from '../components/AlertMessages'

const Login = () => {

    const navigate = useNavigate()
    const [ email, setEmail] = useState('')
    const [ password, setPassword ] = useState('')
    // const { setUser /*, setMessages*/ } = useOutletContext()
    const { login } = useAuth()

    const handleSubmit = async (e) => {
        e.preventDefault()

        const newLogin = {
            email,
            password
        }
        const result = await login(newLogin)

        if ( result.success ) {
            navigate('/feed')
        }
    }

    const handleClick = async(e) => {
        try {
            window.location.href = `/api/auth/google`
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <div>
            
            <div className="min-h-125 flex flex-col pt-10 px-2">
                <div className="min-[340px]:mx-auto pt-5">

                    {/* <!-- Back Button --> */}
                    <Link to={"/"} className="btn btn-primary w-20">
                        <FaArrowLeft />
                        Back 
                    </Link>

                    {/* <!-- Login Form --> */}
                    <fieldset className="fieldset w-full min-[340px]:w-xs sm:w-xs bg-base-200 border border-base-300 p-4 rounded-box">
                        <legend className="fieldset-legend">Login</legend>
                        <form onSubmit={handleSubmit}>

                            <label htmlFor='email' className="fieldset-label">Email</label>
                            <input 
                                type="email" 
                                name="email" 
                                id='email' 
                                className="input" 
                                placeholder="Email" 
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />

                            <label htmlFor='password' className="fieldset-label">Password</label>
                            <input 
                                type="password" 
                                name="password" 
                                id='password' 
                                className="input" 
                                placeholder="Password" 
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />

                            <button type="submit" className="btn btn-neutral mt-4">Login</button>
                            
                        </form>
                    </fieldset> 

                        {/* Google Login */}
                        <button onClick={handleClick} type='button' className="btn bg-white text-black border-[#e5e5e5] mx-auto w-full sm:w-xs mt-2"><svg aria-label="Google logo" width="16" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><g><path d="m0 0H512V512H0" fill="#fff"></path><path fill="#34a853" d="M153 292c30 82 118 95 171 60h62v48A192 192 0 0190 341"></path><path fill="#4285f4" d="m386 400a140 175 0 0053-179H260v74h102q-7 37-38 57"></path><path fill="#fbbc02" d="m90 341a208 200 0 010-171l63 49q-12 37 0 73"></path><path fill="#ea4335" d="m153 219c22-69 116-109 179-50l55-54c-78-75-230-72-297 55"></path></g></svg>
                            Login with Google
                        </button>
                        {/* <a href="/api/auth/google" className="btn bg-white text-black border-[#e5e5e5] mx-auto w-full sm:w-xs mt-2"><svg aria-label="Google logo" width="16" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><g><path d="m0 0H512V512H0" fill="#fff"></path><path fill="#34a853" d="M153 292c30 82 118 95 171 60h62v48A192 192 0 0190 341"></path><path fill="#4285f4" d="m386 400a140 175 0 0053-179H260v74h102q-7 37-38 57"></path><path fill="#fbbc02" d="m90 341a208 200 0 010-171l63 49q-12 37 0 73"></path><path fill="#ea4335" d="m153 219c22-69 116-109 179-50l55-54c-78-75-230-72-297 55"></path></g></svg>
                        Login with Google</a> */}

                </div>

            </div>

        </div>
    )
}

export default Login