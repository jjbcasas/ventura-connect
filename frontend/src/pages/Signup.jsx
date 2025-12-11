import { Link, /*useOutletContext,*/ useNavigate } from 'react-router-dom'
import { FaArrowLeft } from 'react-icons/fa'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const Signup = () => {
    const navigate = useNavigate()
    const [ userName, setUserName] = useState('')
    const [ email, setEmail] = useState('')
    const [ password, setPassword] = useState('')
    const [ confirmPassword, setConfirmPassword] = useState('')
    const { signup } = useAuth()

    const handleSubmit = async (e) => {
        e.preventDefault();

        const createUser = {
            userName,
            email,
            password,
            confirmPassword
        }
        
        const result = await signup(createUser)

        if ( result.success ) {
            navigate('/feed')
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
                            <fieldset className="fieldset w-full min-[340px]:w-xs bg-base-200 border border-base-300 p-4 mt-2 rounded-box">
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label htmlFor="userName" className="fieldset-label">User Name</label>
                                        <input 
                                                type="text" 
                                                className="input" 
                                                id="userName" 
                                                name="userName" 
                                                required
                                                value={userName}
                                                onChange={(e)=> setUserName(e.target.value)}
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
                                                value={email}
                                                onChange={(e)=> setEmail(e.target.value)}
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
                                                value={password}
                                                onChange={(e)=> setPassword(e.target.value)}
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
                                                value={confirmPassword}
                                                onChange={(e)=> setConfirmPassword(e.target.value)}
                                                />
                                    </div>
                                    <button type="submit" className="btn btn-primary">Submit</button>
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