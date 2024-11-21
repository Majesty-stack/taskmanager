const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // bcryptjs for password hashing

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true, // Ensure no duplicate emails
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  }
}, { timestamps: true });

// Hash the password before saving the user document
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next(); // If password is not modified, skip hashing
  try {
    this.password = await bcrypt.hash(this.password, 10); // Hash password with bcryptjs
    next();
  } catch (err) {
    next(err);
  }
});

// Compare the password during login
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
