import React, { useState, useEffect } from 'react';
import { CheckCircle, Shield } from 'react-feather';
import '../App.css';

const LoginScreen = ({ setCurrentUser, setCurrentView }) => {
  const [credentials, setCredentials] = useState({ username: '', password: '', shopId: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setCurrentView('card_management');
    }
  }, [setCurrentView]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      const response = await fetch('https://bingoapi-qtai.onrender.com/loginshop', {  // adjust URL as needed
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shopId: credentials.shopId,
          username: credentials.username,
          password: credentials.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }

      const data = await response.json();
      // Assuming response returns { access_token, user: { name, role, shopId, permissions } }
      const { access_token, user } = data;

      // Store token in localStorage/sessionStorage if needed
      localStorage.setItem('token', access_token);
      localStorage.setItem('shopid', credentials.shopId);

      setCurrentUser(user);
      setCurrentView('card_management');
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-10 md:p-16 lg:p-24">
      <div className="flex flex-col md:flex-row w-full max-w-6xl bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
        {/* Left side - Branding / Illustration */}
        <div className="hidden md:flex flex-col justify-center items-center flex-1 bg-gradient-to-tr from-blue-600 to-purple-700 p-12">
          <h1 className="text-white text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-300 to-white">
            Halo Bingo
          </h1>
          <p className="text-white/80 text-lg max-w-xs text-center">
            Advanced Shop Management Suite<br />Control your shop, manage games & cards easily.
          </p>
        </div>

        {/* Right side - Login Form */}
        <form onSubmit={handleLogin} className="flex-1 p-10 md:p-16">
          <div className="text-center mb-12">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent text-4xl font-extrabold mb-4 md:hidden">
              Halo Bingo
            </div>
            <p className="text-white/70 text-lg md:text-xl">
              Advanced Shop Management Suite
            </p>
          </div>

          <div className="space-y-8">
            <div>
              <label className="block text-white/80 text-base font-semibold mb-3">Shop ID</label>
              <input
                type="text"
                value={credentials.shopId}
                onChange={(e) => setCredentials({ ...credentials, shopId: e.target.value })}
                className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-4 focus:ring-blue-500 transition"
                placeholder="Enter Shop ID"
                required
              />
            </div>

            <div>
              <label className="block text-white/80 text-base font-semibold mb-3">Username</label>
              <input
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-4 focus:ring-blue-500 transition"
                placeholder="Enter username"
                required
              />
            </div>

            <div>
              <label className="block text-white/80 text-base font-semibold mb-3">Password</label>
              <input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-4 focus:ring-blue-500 transition"
                placeholder="Enter password"
                required
              />
            </div>

            {errorMsg && (
              <p className="text-red-400 text-center font-semibold">{errorMsg}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                  Authenticating...
                </div>
              ) : (
                'Login to Shop'
              )}
            </button>
          </div>

          <div className="mt-10 pt-8 border-t border-white/20">
            <div className="flex items-center justify-center space-x-8 text-sm text-white/60">
              <div className="flex items-center">
                <CheckCircle size={18} className="mr-2" />
                Secure Login
              </div>
              <div className="flex items-center">
                <Shield size={18} className="mr-2" />
                Encrypted
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;
