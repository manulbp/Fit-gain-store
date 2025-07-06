import React, { createContext, useContext, useState } from 'react';
import { StoreContext } from './StoreContext';

export const UserContext = createContext();

const UserContextProvider = ({ children }) => {
  const { serverURL } = useContext(StoreContext);
  const [authToken, setAuthToken] = useState(localStorage.getItem('authToken'));
  const [User, setUser] = useState({
    user: JSON.parse(localStorage.getItem('user')) || null,
    admin: JSON.parse(localStorage.getItem('admin')) || null,
  });

  const loginUser = async (email, password) => {
    if (!email || !password) {
      throw new Error('Please fill in both email and password.');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Please enter a valid email address.');
    }
    const response = await fetch(`${serverURL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }
    if (data.success) {
      console.log(data)
      const userData = {
        email,
        name: data.name,
        role: data.role,
        id: data.id || null,
      };
      if (data.role === 'admin') {
        setUser({ user: null, admin: userData });
        localStorage.removeItem('user');
        localStorage.setItem('admin', JSON.stringify(userData));
      } else if (data.role === 'user') {
        setUser({ user: userData, admin: null });
        localStorage.removeItem('admin');
        localStorage.setItem('user', JSON.stringify(userData));
      }
      setAuthToken(data.token);
      localStorage.setItem('authToken', data.token);
      return true;
    } else {
      throw new Error(data.message || 'Invalid login credentials');
    }
  };

  const registerUser = async (name, email, password) => {
    if (!name || !email || !password) {
      throw new Error('Please fill in all fields.');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Please enter a valid email address.');
    }
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters.');
    }
    const response = await fetch(`${serverURL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }
    if (data.success) {
      const userData = { email, role: 'user', id: data.id , name: data.name};
      setUser({ user: userData, admin: null });
      localStorage.removeItem('admin');
      localStorage.setItem('user', JSON.stringify(userData));
      setAuthToken(data.token);
      localStorage.setItem('authToken', data.token);
      return true;
    } else {
      throw new Error(data.message || 'Registration failed');
    }
  };

  const logoutUser = () => {
    setUser({ user: null, admin: null });
    localStorage.removeItem('user');
    localStorage.removeItem('admin');
    localStorage.removeItem('authToken');
    setAuthToken(null);
  };

  return (
    <UserContext.Provider value={{ User, loginUser, registerUser, logoutUser, authToken, setAuthToken }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContextProvider;