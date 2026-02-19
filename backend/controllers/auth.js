// import passport from 'passport'
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import path from 'path'
import { generateToken } from '../config/utils.js'
dotenv.config({ path: './backend/config/.env'})

    // This endpoint would primarily be used to check if a user is already authenticated
    // when the React app loads or navigates to a protected route.
  export const getUser = (req, res) => {
        // If req.user exists, it means Passport has successfully authenticated
        // the user and populated the req.user object from the session.
        // if (req.user) {
            // Send back the user data to the client.
            // The client-side React app will then use this data to update its auth state
            // and conditionally redirect to '/feed' or show the logged-in UI.
            // console.log(req.user)
            console.log('User fetched!')
            return res.status(200).json({
                isAuthenticated: true,
                user: {
                    _id: req.user._id,
                    userName: req.user.userName,
                    email: req.user.email,
                    // Include any other non-sensitive user data your frontend needs
                    profileImage: req.user.profileImage,
                    likedPostId: req.user.likedPostId,
                    followingId: req.user.followingId,
                    followerId: req.user.followerId,
                    stripeAccountId: req.user.stripeAccountId,
                    stripeOnboardingComplete: req.user.stripeOnboardingComplete
                },
                message: 'User is already logged in.'
                // user: req.user || null
            });
        // }

        // If req.user does not exist, the user is not authenticated.
        // Send a response indicating that the client needs to log in.
        // res.status(200).json({ // 200 OK because the request was processed successfully, just no user found
        //     isAuthenticated: false,
        //     user: null,
        //     message: 'No user authenticated. Please log in.'
        // });
    }
    
  export const postSignup = async (req, res, next) => {
    const { userName, email, password } = req.body

    try {
      if ( !userName || !email || !password ) {
        return res.status(400).json({
          message: 'All fields are required'
        })
      }
      
      if ( password.length < 6 ) {
        return res.status(400).json({
          message: 'Password must be at least 6 characters'
        })
      }
      
      // check if email is valid: regex
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if ( !emailRegex.test(email)) {
        return res.status(400).json({
          message: 'Invalid email format'
        })
      }

      const user = await User.findOne({ email })
      if ( user ) return res.status(400).json({
        message: "Email already exist"
      })

      const newUser = new User({
        userName,
        email,
        password
      })

      const savedUser = await newUser.save();

      if (!savedUser) {
        console.error('Signup failed due to invalid user object structure or failed saving attempt.', {
            reason: 'newUser object was null or undefined.',
            requestBody: req.body // Log the data that caused the failure
        });
        return res.status(400).json({ message: "Invalid user data" });
      }
      
        generateToken(savedUser._id, res)

        // Successful signup and login
        // Send back user data (e.g., sanitized user object, success message)
        res.status(201).json({ // 201 Created for successful resource creation
          message: 'Signup successful!',
          isAuthenticated: true,
          user: { // Send back relevant user data, e.g., for storing in client-side state
              _id: savedUser._id,
              userName: savedUser.userName,
              email: savedUser.email,
              followerId: savedUser.followerId,
              followingId: savedUser.followingId,
              likedPostId: savedUser.likedPostId,
              stripeAccountId: savedUser.stripeAccountId,
              stripeOnboardingComplete: savedUser.stripeOnboardingComplete
              // ... exclude sensitive info like password
          }
        })

    } catch (error) {
      console.error('Error in signup controller:', error)
      res.status(500).json({
        message: "Internal Server Error"
      })
    }
    // console.log(req.body)
    // const validationErrors = []
    // if (!validator.isEmail(req.body.email)) validationErrors.push({ msg: 'Please enter a valid email address.' })
    // if (!validator.isLength(req.body.password, { min: 8 })) validationErrors.push({ msg: 'Password must be at least 8 characters long' })
    // if (req.body.password !== req.body.confirmPassword) validationErrors.push({ msg: 'Passwords do not match' })
  
    // if (validationErrors.length) {
    //     // Return 400 Bad Request with a clear JSON object
    //     return res.status(400).json({
    //         message: validationErrors
    //     })
    // }
    // req.body.email = validator.normalizeEmail(req.body.email, { gmail_remove_dots: false })
  
    // const user = new User({
    //     userName: req.body.userName,
    //     email: req.body.email,
    //     password: req.body.password,
    //     followerId: [],
    //     followingId: [],
    //     likedPostId: [],
    // })
  
    //   try {
    //     const existingUser = await User.findOne({$or: [
    //       {email: req.body.email},
    //       {userName: req.body.userName}
    //     ]})
    //       if (existingUser) {
    //         // Return 409 Conflict with a clear JSON message
    //         return res.status(409).json({/* 409 Conflict for duplicate user */
    //             message: 'Account with that email address or username already exists.'
    //         })
    //       }

    //       const savedUser = await user.save()
    //       // After successful signup, log the user in using Passport's login method
    //     // Then send a JSON success response
    //       await req.logIn(savedUser, (err) => {
    //         if (err) {
    //             // If login itself fails after signup (rare, but handle it)
    //             console.error('Error during login after signup:', err)
    //             return res.status(500).json({
    //                 message: 'Signup successful, but login failed.'
    //             })
    //         }
    //         // Successful signup and login
    //         // Send back user data (e.g., sanitized user object, success message)
    //         res.status(201).json({ // 201 Created for successful resource creation
    //             message: 'Signup successful!',
    //             isAuthenticated: true,
    //             user: { // Send back relevant user data, e.g., for storing in client-side state
    //                 _id: savedUser._id,
    //                 userName: savedUser.userName,
    //                 email: savedUser.email,
    //                 followerId: [],
    //                 followingId: [],
    //                 likedPostId: [],
    //                 // ... exclude sensitive info like password
    //             }
    //         });
    //       })
    //   } catch (error) {
    //         console.error('Signup error', error)
    //         return res.status(500).json({ message: 'An unexpected server error occurred during signup.' })
    //   }
    
  }
    
  export const postLogin = async (req, res, next) => {
    const { email, password } = req.body

    if ( !email || !password ) {
      return res.status(400).json({
        message: "Email and password are required"
      })
    }

    try {
      const user = await User.findOne({ email })
      if ( !user ) return res.status(400).json({
        message: "Invalid credentials"
      }) // never tell the client which one is incorrect: password or email

      const isPasswordCorrect = await bcrypt.compare( password, user.password )
      if ( !isPasswordCorrect ) return res.status(400).json({
        message: "Invalid credentials"
      }) // never tell the client which one is incorrect: password or email

      generateToken(user._id, res)
  
      console.log('Successful Login')
      res.status(200).json({ // 201 Created for successful resource creation
        message: 'Success! You are logged in.',
        isAuthenticated: true,
        user: { // Send back relevant user data, e.g., for storing in client-side state
            _id: user._id,
            userName: user.userName,
            email: user.email,
            followerId: user.followerId,
            followingId: user.followingId,
            likedPostId: user.likedPostId,
            profileImage: user.profileImage,
            stripeAccountId: user.stripeAccountId,
            stripeOnboardingComplete: user.stripeOnboardingComplete
            // ... exclude sensitive info like password
        }
      })

    } catch (error) {
        console.error("Error in login controller: ", error)
        res.status(500).json({
          message: "Internal Server error"
        })
    }

    // const validationErrors = []
    // if (!validator.isEmail(req.body.email)) validationErrors.push({ msg: 'Please enter a valid email address.' })
    // if (validator.isEmpty(req.body.password)) validationErrors.push({ msg: 'Password cannot be blank.' })
  
    // if (validationErrors.length) {
    //   return res.status(400).json({ message: validationErrors })
    // }
    // req.body.email = validator.normalizeEmail(req.body.email, { gmail_remove_dots: false })
  
    // passport.authenticate('local', (err, user, info) => {
    //   if (err) { return next(err) }
    //   if (!user) {
    //     return res.status(401).json({ message: info.message })
    //   }
    //   req.logIn(user, (err) => {
    //     if (err) { return next(err) }
    //     console.log('Successful Login')
    //     res.status(200).json({ user, isAuthenticated: true, message: 'Success! You are logged in.' })
    //     // console.log(user)
    //   })
    // })(req, res, next)
  }

  export const logout = (_, res ) => {
    res.cookie("jwt", "", { maxAge:0 })
    res.status(200).json({
      message: "Logged out successfully"
    })
    // req.session.destroy((err) => {
    //   // This will handle both the Passport session cleanup and the express-session destruction.
    //     if (err) {
    //         console.error('Error destroying session:', err);
    //         return res.status(500).json({ message: 'Failed to destroy session.' });
    //     }

    //     // Remove req.user (Passport typically handles this, but a good safeguard)
    //     // req.user = null;

    //     // Instead of redirecting, send a JSON success response
    //     res.status(200).json({ message: 'Logout successful' });
        
    // });
  }

  export const googleLogin = async (req, res) => {
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const { token } = req.body; // The token sent from React

    try {
        // Verify the Google Token
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();

        // Find or Create User in MongoDB
        let user = await User.findOne({ email: payload.email });
        let isNewUser = false;

        if (!user) {
            user = await User.create({
                userName: payload.name,
                email: payload.email,
                profileImage: payload.picture,
                googleId: payload.sub
            });
            isNewUser = true;
        }

        // Generate your OWN JWT
        generateToken( user._id, res )

        res.status( isNewUser ? 201 : 200 ).json({
          message: isNewUser ? 'Successful Google Signup.' : 'Successful Google Login.',
              isAuthenticated: true,
              user: {
                _id: user._id,
                userName: user.userName,
                email: user.email,
                followerId: user.followerId,
                followingId: user.followingId,
                likedPostId: user.likedPostId,
                profileImage: user.profileImage
              }
        });

    } catch (error) {
      console.error("Google Auth Error:", error);
      res.status(400).json({ message: "Google auth failed" });
    }
  };