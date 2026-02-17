import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
    userName: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    // for Google Sign In
    googleId: {
      type: String
    },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'email_address must be a valid email']
    },
    password: {
      type: String,
      // required: true,
      minlength: 6,
      trim: true
    },
    followerId: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'User',
      // required: true,
      default: [],
      index: true // Makes searching fast for fields that you use frequently
    },
    // What is better like this or just populate?
    // followerId: {
    //  default: {} or null,
    //  type: new mongoose.Schema({
    //    user_id: { 
    //      type: [mongoose.Schema.Types.ObjectId],
    //      default: []
    //    },
    //    userName: {
    //       type: String,
    //       required: true,
    //       trim: true
    //    },
    //     profileImage: {
    //        type: String
    // }
    // })
    // }
    // Follow array templates
    // participants: [{
    //     required: true,
    //     type: new mongoose.Schema({
    //         user_id: { type: String, required: true, default: null },
    //         user_type: {
    //             type: String,
    //             required: true,
    //             enum: ['creator', 'sponsor']
    //         }
    //     }, {
    //         _id: false
    //     })
    // }]
    followingId: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'User',
      // required: true,
      default: [],
      index: true // Makes searching fast for fields that you use frequently
    },
    likedPostId: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Post',
      // required: true,
      default: []
    },
    cloudinaryId: {
      type: String,
    },
    profileImage: {
      type: String
    },
    stripeAccountId: {
      type: String,
      default: ""
    },
    // stripeOnboardingComplete: {
    //   type: Boolean,
    //   default: false
    // },
    createdAt: {
      type: Date,
      default: Date.now
    }
}/*, { //this is for automatic creation of createdAt and UpdatedAt
  timestamps: true
}*/)

// Password hash middleware
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) { return next() }
  
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})


// Helper method for validating user's password.
UserSchema.methods.comparePassword = function comparePassword(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    cb(err, isMatch)
  })
}

export default mongoose.model('User', UserSchema)