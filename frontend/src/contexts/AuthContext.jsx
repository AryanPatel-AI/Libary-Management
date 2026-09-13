import React, { createContext, useState, useEffect } from 'react';
import API_URL from '../api/config';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const freshData = await response.json();
          // Merge fresh profile into stored shape (preserves token)
          const storedInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
          const merged = {
            ...storedInfo,
            data: {
              ...(storedInfo.data || {}),
              ...(freshData.data || freshData),
            }
          };
          localStorage.setItem('userInfo', JSON.stringify(merged));
          setUser(merged);
        } else {
          // Token is invalid or expired
          localStorage.removeItem('token');
          localStorage.removeItem('userInfo');
          setUser(null);
        }
      } catch (error) {
        console.error('Session restore failed:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
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
      if (data.data.refreshToken) {
        localStorage.setItem('refreshToken', data.data.refreshToken);
      }
      setUser(data);
      return data;
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
      if (data.data.refreshToken) {
        localStorage.setItem('refreshToken', data.data.refreshToken);
      }
      setUser(data);
      return data;
    } else {
      throw new Error(data.message || 'Google Login failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('userInfo');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, logout, register, googleLogin }}>
      {children}
    </AuthContext.Provider>
  );
};