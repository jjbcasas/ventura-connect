import { Link, /*useOutletContext,*/ useNavigate } from 'react-router-dom'
import { FaArrowLeft } from 'react-icons/fa'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const Signup = () => {
    const navigate = useNavigate()
    const [ formData, setFormData ] = useState({ userName:"", email: "", password:"", confirmPassword:"" })
    // const [ userName, setUserName] = useState('')
    // const [ email, setEmail] = useState('')
    // const [ password, setPassword] = useState('')
    // const [ confirmPassword, setConfirmPassword] = useState('')
    const { signup } = useAuth()

    const handleSubmit = async (e) => {
        e.preventDefault();

        // const createUser = {
        //     userName,
        //     email,
        //     password,
        //     confirmPassword
        // }
        try {
            const result = await signup(/*createUser*/ formData )
    
            if ( result.success ) {
                navigate('/feed')
            }
        } catch (error) {
            console.error("Failed signing up:", error)
        }
    }

    return (
        <div>
            {/* Main Section  */}
            <main className="container min-h-125 p-2 mx-auto">
                <div className="row justify-content-center">
                    <section className="col-6 mt-5 w-full flex">
                        <section className="mx-auto">

                            {/* Back Button */}
                            <Link to="/" className="btn btn-primary">
                                <FaArrowLeft />
                                Back
                            </Link>

                            {/* Sign Up Form */}
                            <fieldset className="fieldset w-full min-[340px]:w-xs bg-base-200 border border-base-300 px-4 py-2 mt-2 rounded-box">
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label htmlFor="userName" className="fieldset-label">User Name</label>
                                        <input 
                                                type="text" 
                                                className="input" 
                                                id="userName" 
                                                name="userName" 
                                                required
                                                value={formData.userName}
                                                onChange={(e)=> /*setUserName(e.target.value)*/ setFormData( prevData => ({ ...prevData, userName: e.target.value }))}
                                            />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="exampleInputEmail1" className="fieldset-label">Email address</label>
                                        <input 
                                                type="email" 
                                                className="input" 
                                                id="exampleInputEmail1" 
                                                aria-describedby="emailHelp" 
                                                name="email" 
                                                required
                                                value={formData.email}
                                                onChange={(e)=> setFormData(prevData => ({ ...prevData, email: e.target.value }))}
                                            />
                                        <div id="emailHelp" className="form-text">We'll never share your email with anyone else.</div>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="password" className="fieldset-label">Password</label>
                                        <input 
                                                type="password" 
                                                className="input" 
                                                id="password" 
                                                name="password" 
                                                required
                                                value={formData.password}
                                                onChange={(e)=> setFormData( prevData => ({ ...prevData, password: e.target.value }))}
                                            />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="confirmPassword" className="fieldset-label">Confirm Password</label>
                                        <input 
                                                type="password" 
                                                className="input" 
                                                id="confirmPassword" 
                                                name="confirmPassword" 
                                                required
                                                value={formData.confirmPassword}
                                                onChange={(e)=> setFormData( prevData => ({ ...prevData, confirmPassword: e.target.value }))}
                                                />
                                    </div>
                                    <button type="submit" className="btn btn-primary">Submit</button>
                                    <div className="mt-2 text-center">
                                        <Link to="/login" className='hover:text-cyan-500 text-sm'>
                                            Already have an account?
                                        </Link>
                                    </div>
                                </form>
                            </fieldset>

                        </section>
                    </section>
                </div>
            </main>
        </div>
    )
}

export default Signup