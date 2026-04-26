import React, { createContext, useState, useEffect } from 'react';
import API_URL from '../api/config';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check for user stored in localStorage on initial load
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
  }, []);

  const login = async (email, password) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    const text = await response.text();
    if (!text) throw new Error('Empty response from server');

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error('Invalid response from server');
    }
    
    if (response.ok) {
      localStorage.setItem('userInfo', JSON.stringify(data));
      localStorage.setItem('token', data.data.token);
      setUser(data);
    } else {
      throw new Error(data.message || 'Login failed');
    }
  };

  const register = async (name, email, password) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    
    const text = await response.text();
    if (!text) throw new Error('Empty response from server');

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error('Invalid response from server');
    }
    
    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }
    return data;
  };

  const googleLogin = async (credential) => {
    const response = await fetch(`${API_URL}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: credential }),
    });

    const text = await response.text();
    if (!text) throw new Error('Empty response from server');

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error('Invalid response from server');
    }

    if (response.ok) {
      localStorage.setItem('userInfo', JSON.stringify(data));
      localStorage.setItem('token', data.data.token);
      setUser(data);
      return data;
    } else {
      throw new Error(data.message || 'Google Login failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('userInfo');
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, register, googleLogin }}>
      {children}
    </AuthContext.Provider>
  );
};