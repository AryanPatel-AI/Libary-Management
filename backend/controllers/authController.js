const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const { OAuth2Client } = require('google-auth-library');
const crypto = require('crypto');
const emailService = require('../utils/emailService');

// Generate JWT token
const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists with this email');
  }

  // Generate Verification Token
  const verificationToken = crypto.randomBytes(20).toString('hex');
  
  // Set token expiration to 24 hours
  const verificationTokenExpire = Date.now() + 24 * 60 * 60 * 1000;

  // Create user with unverified status
  const user = await User.create({ 
    name, 
    email, 
    password, 
    phone,
    isVerified: false,
    verificationToken,
    verificationTokenExpire
  });

  if (user) {
    try {
      // Dispatch Verification Email
      await emailService.sendVerificationEmail(user.email, user.name, verificationToken);
      console.log(`[DEBUG] Verification Link for ${user.email}: http://localhost:3001/verify-email?token=${verificationToken}`);

      res.status(201).json({
        success: true,
        message: 'Registration successful! Please check your email to verify your account.'
      });
    } catch (emailError) {
      // Rollback user creation
      await User.findByIdAndDelete(user._id);
      console.error('Email sending failed, user creation rolled back:', emailError);
      res.status(500).json({
        success: false,
        message: 'Registration failed due to email service error. Please try again or contact support.'
      });
    }
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Verify Email Token
// @route   GET /api/auth/verify/:token
// @access  Public
const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;

  const user = await User.findOne({
    verificationToken: token,
    verificationTokenExpire: { $gt: Date.now() }
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired verification token');
  }

  // Mark user as verified
  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpire = undefined;
  await user.save();

  res.json({
    success: true,
    message: 'Email successfully verified. You can now log in.'
  });
});

// @desc    Login user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user and include password for comparison
  const user = await User.findOne({ email }).select('+password');

  if (user && (await user.matchPassword(password))) {
    // Check if verified
    if (!user.isVerified) {
      res.status(401);
      throw new Error('Please verify your email before logging in.');
    }

    // Check if password change is required
    if (user.forcePasswordChange) {
      res.status(403);
      throw new Error('Password change required. Please update your password.');
    }

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
        membershipDate: user.membershipDate,
        purchasedBooks: user.purchasedBooks,
        token: generateToken(user._id)
      }
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
        membershipDate: user.membershipDate,
        purchasedBooks: user.purchasedBooks,
        createdAt: user.createdAt
      }
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update current user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Update allowed fields
  user.name = req.body.name || user.name;
  user.phone = req.body.phone || user.phone;

  // Only update email if changed and not taken
  if (req.body.email && req.body.email !== user.email) {
    const emailTaken = await User.findOne({ email: req.body.email });
    if (emailTaken) {
      res.status(400);
      throw new Error('Email is already in use');
    }
    user.email = req.body.email;
    user.isVerified = false;
    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.verificationToken = verificationToken;
    user.verificationTokenExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    // Send verification email
    await emailService.sendVerificationEmail(user.email, user.name, verificationToken);
  }

  // Update password if provided
  if (req.body.password) {
    user.password = req.body.password;
  }

  const updatedUser = await user.save();

  res.json({
    success: true,
    data: {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      avatar: updatedUser.avatar,
      role: updatedUser.role,
      membershipDate: updatedUser.membershipDate,
      purchasedBooks: updatedUser.purchasedBooks
    }
  });
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.matchPassword(currentPassword))) {
    res.status(400);
    throw new Error('Current password is incorrect');
  }

  user.password = newPassword;
  user.forcePasswordChange = false; // Reset the flag
  await user.save();

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
});

const googleLogin = asyncHandler(async (req, res) => {
  const { token } = req.body;
  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        password: crypto.randomBytes(16).toString('hex'),
        isVerified: true,
        avatar: picture
      });
    } else {
      // Update avatar if it changed or was empty
      if (picture && user.avatar !== picture) {
        user.avatar = picture;
        await user.save();
      }
    }

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
        membershipDate: user.membershipDate,
        purchasedBooks: user.purchasedBooks,
        token: generateToken(user._id)
      }
    });
  } catch (error) {
    res.status(401);
    throw new Error('Invalid Google token');
  }
});

module.exports = { registerUser, loginUser, getProfile, updateProfile, verifyEmail, changePassword, googleLogin };
