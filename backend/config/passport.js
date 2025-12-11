import { Strategy as LocalStrategy } from 'passport-local'
import mongoose from 'mongoose'
import User from '../models/User.js'

export default function (passport) {
    passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
      try {
        const user = await User.findOne({ email: email.toLowerCase() })
        if (!user) {
          return done(null, false, { message: `Email ${email} not found.` })
        }
        if (!user.password) {
          return done(null, false, { message: 'Your account was registered using a sign-in provider. To enable password login, sign in using a provider, and then set a password under your user profile.' })
        }

        const isMatch = await new Promise((resolve, reject) => {
          user.comparePassword(password, (err, match) => {
            if (err) {
              reject(err);
              return;
            }
            resolve(match);
          });
        });
  
        if (isMatch) {
          return done(null, user);
        } else {
          return done(null, false, { message: 'Invalid email or password.' });
        }
  
      } catch (err) {
        return done(err);
      }
    }));
  
    passport.serializeUser((user, done) => {
      done(null, user.id);
    });
  
    passport.deserializeUser(async (id, done) => {
      try {
        const user = await User.findById(id);
        done(null, user);
      } catch (err) {
        done(err, null);
        console.log(err)
      }
    });
  };