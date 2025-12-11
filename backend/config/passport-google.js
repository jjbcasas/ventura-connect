import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import mongoose from 'mongoose'
import User from '../models/User.js'
import passport from 'passport'
import dotenv from 'dotenv'
import path from 'path'
dotenv.config({ path: './backend/config/.env'})

export default function(passport){
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`,
    },
    async ( accessToken, refreshToken, profile, done) => {
        try {
            // Check if the user already exists based on their Google ID
            let user = await User.findOne({ googleId: profile.id })
            if (user) {
                done(null, user);
              } else {
                // If the user doesn't exist, create a new user in your database
                const user =  await new User({
                  googleId: profile.id,
                  userName: profile.displayName,
                  email: profile.emails ? profile.emails[0].value : null,
                  profileImage: profile.photos[0].value
                  // You might want to store other profile information as needed
                });
                const savedUser = await user.save();
                return done(null, savedUser);
              }
            } catch (err) {
              return done(err);
            }
    }
    ))
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });
      
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (err) {
            done(err, null);
        }
    });
}