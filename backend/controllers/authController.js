const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const { OAuth2Client } = require('google-auth-library');
const crypto = require('crypto');
const emailSender = require('../services/emailSender');
const axios = require('axios');

// Generate Access Token (Short-lived)
const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '15m', // 15 minutes for access token
  });
};

// Generate Refresh Token (Long-lived)
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d', // 7 days for refresh token
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
    // Dispatch Verification Email (Safe call - won't crash if SMTP missing)
    const emailResult = await emailSender.sendVerificationEmail(user.email, user.name, verificationToken);
    
    if (!emailResult.success && process.env.NODE_ENV === 'production') {
      console.warn(`[Auth] Verification email failed to send for ${user.email}. User can still verify if they have the link.`);
    }

    // In development or if SMTP is missing, we could auto-verify or just provide the token in response
    // For now, let's keep it simple: allow login if they know their password, 
    // BUT the current logic requires isVerified = true.
    // If SMTP is missing, we auto-verify for convenience.
    if (!emailResult.success) {
      user.isVerified = true;
      user.verificationToken = undefined;
      user.verificationTokenExpire = undefined;
      await user.save();
      console.log(`[Auth] SMTP missing or failed. Auto-verifying user: ${user.email}`);
    }

    res.status(201).json({
      success: true,
      message: emailResult.success 
        ? 'Registration successful! Please check your email to verify your account.'
        : 'Registration successful! (Auto-verified as email service is unavailable)',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
        refreshToken: generateRefreshToken(user._id)
      }
    });
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

    const accessToken = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token to user record
    user.refreshTokens = user.refreshTokens || [];
    user.refreshTokens.push(refreshToken);
    await user.save();

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
        token: accessToken,
        refreshToken: refreshToken
      }
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    res.status(401);
    throw new Error('Refresh token is required');
  }

  // Find user with this refresh token
  const user = await User.findOne({ refreshTokens: refreshToken });

  if (!user) {
    res.status(403);
    throw new Error('Invalid refresh token');
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    
    // Generate new tokens
    const newAccessToken = generateToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    // Replace old refresh token with new one (Token Rotation)
    user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);
    user.refreshTokens.push(newRefreshToken);
    await user.save();

    res.json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    // If refresh token is expired, remove it from user record
    user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);
    await user.save();
    res.status(403);
    throw new Error('Refresh token expired or invalid');
  }
});

// @desc    Logout user & clear refresh token
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  const user = await User.findById(req.user._id);

  if (user && refreshToken) {
    user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);
    await user.save();
  }

  res.json({
    success: true,
    message: 'Logged out successfully'
  });
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
    let payload;
    
    // Try to verify as ID Token first
    try {
      console.log('Attempting ID Token verification...');
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
      console.log('ID Token verification successful');
    } catch (idError) {
      // If ID token fails, try as Access Token
      console.log('ID Token verification failed, trying Access Token...');
      try {
        const response = await axios.get(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`);
        payload = response.data;
        console.log('Access Token verification successful');
      } catch (accessError) {
        console.error('Access Token verification failed:', accessError.response?.data || accessError.message);
        throw new Error('All Google verification methods failed');
      }
    }

    if (!payload) {
      res.status(401);
      throw new Error('Invalid Google token');
    }

    const { email, name, picture, sub } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name: name || 'Google User',
        email,
        password: crypto.randomBytes(16).toString('hex'),
        isVerified: true,
        avatar: picture
      });
    } else {
      // Update avatar if it changed or was empty
      if (picture && user.avatar !== picture) {
        user.avatar = picture;
      }
      // Ensure Google users are verified
      user.isVerified = true;
      await user.save();
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
    console.error('❌ Google Token Verification Error:', error.message);
    res.status(401);
    throw new Error('Invalid Google token: ' + error.message);
  }
});

module.exports = { registerUser, loginUser, refreshToken, logoutUser, getProfile, updateProfile, verifyEmail, changePassword, googleLogin };
