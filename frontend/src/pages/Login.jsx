import { useNavigate, Link } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google';
import { FaArrowLeft } from 'react-icons/fa'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

const Login = () => {

    const navigate = useNavigate()
    const [ formData, setFormData ] = useState({ email: "", password:"" })
    // const [ email, setEmail] = useState('')
    // const [ password, setPassword ] = useState('')
    // const { setUser /*, setMessages*/ } = useOutletContext()
    const { login, googleLogin } = useAuth()

    // Handle Login
    const handleSubmit = async (e) => {
        e.preventDefault()

        if ( !formData.email || !formData.password ) return
        // const newLogin = {
        //     email,
        //     password
        // }
        
        try {
            const result = await login(formData)

            if ( result.success ) {
                navigate('/feed')
            }
        } catch (error) {
            console.error("Failed logging in:", error)
        }
    }

    // Handle Google Login
    const handleGoogle = async (response) => {
        try {
            const result = await googleLogin(response);
            if (result.success) navigate('/feed'); // Add navigation here too!
        } catch (error) {
            console.error("Google login failed", error);
        }
    };

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
                                value={formData.email}
                                onChange={(e)=> setFormData(prevData => ({ ...prevData, email: e.target.value }))}
                            />

                            <label htmlFor='password' className="fieldset-label">Password</label>
                            <input 
                                type="password" 
                                name="password" 
                                id='password' 
                                className="input" 
                                placeholder="Password" 
                                required
                                value={formData.password}
                                onChange={(e)=> setFormData( prevData => ({ ...prevData, password: e.target.value }))}
                            />

                            <button type="submit" className="btn btn-neutral mt-4">Login</button>
                            
                        </form>
                    </fieldset> 

                    <div className="flex justify-center items-center w-full">
                        {/* Google Login */}
                        <GoogleLogin
                            onSuccess={handleGoogle}
                            onError={() => console.log('Login Failed')}
                            useOneTap={false} // Optional: shows a nice little prompt for users
                            // OneTap is what usually triggers FedCM
                            theme="filled_blue" // Makes it look professional
                            shape="pill"
                            container_props={{ style: { display: "flex", justifyContent: "center", width: "100%" } }}
                        />
                    </div>
                </div>

            </div>

        </div>
    )
}

export default Login