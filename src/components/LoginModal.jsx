import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';

const LoginModal = ({ isOpen, onClose, onLogin }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Handle Google login
  const handleGoogleLogin = async (response) => {
    try {
      console.log('=============== Google login response:', response);
      
      // Send Google token to backend for verification
      const googleResponse = await axios.post('/api/google/callback', {
        token: response.credential
      });
      
      console.log('=============== Google login backend response:', googleResponse.data);
      
      if (googleResponse.data && googleResponse.data.code === 200) {
        // Google login successful, same as regular login
        const userData = googleResponse.data.data;
        
        // Save user information to localStorage
        localStorage.setItem('token', userData.accessToken);
        localStorage.setItem('username', userData.username);
        localStorage.setItem('realName', userData.realName);
        localStorage.setItem('userId', userData.userId);
        localStorage.setItem('role', userData.role);
        localStorage.setItem('userType', userData.userType);
        localStorage.setItem('status', userData.status);
        localStorage.setItem('tokenExpireTime', userData.tokenExpireTime);
        
        // Call onLogin to update app state
        onLogin(userData);
        
        // Close login modal
        onClose();
        
        // Show success message
        alert(googleResponse.data.message || 'Google登录成功！');
      } else {
        // Google login failed
        console.error('=============== Google login failed:', googleResponse.data.message);
        setError(googleResponse.data.message || 'Google登录失败，请稍后重试。');
      }
    } catch (error) {
      // Handle Google login errors
      console.error('=============== Google login error:', error);
      setError('Google登录失败，请检查网络连接或稍后重试。');
    }
  };

  // Handle Google login error
  const handleGoogleLoginError = (error) => {
    console.error('=============== Google login error:', error);
    setError('Google登录失败，请稍后重试。');
  };

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validate form
    if (!username.trim() || !password.trim()) {
      setError(t('login.errorMissingCredentials'));
      return;
    }

    // Call the onLogin callback with credentials
    onLogin({ username, password });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-green-50 border border-green-100 rounded-lg shadow-xl p-8 w-full max-w-md" style={{ backgroundColor: '#fcfbf7' }}>
        {/* 头部 - 添加中医图标 */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 w-10 h-10 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">{t('login.title')}</h2>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 中医装饰元素 */}
        <div className="text-center mb-6">
          <div className="inline-block bg-green-100 text-green-800 px-4 py-1 rounded-full text-sm font-medium mb-2">
            {t('login.badge')}
          </div>
          <p className="text-sm text-gray-600">{t('login.subtitle')}</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* 用户名输入 */}
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {t('login.username')}
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-green-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white shadow-sm"
              placeholder={t('login.usernamePlaceholder')}
            />
          </div>

          {/* 密码输入 */}
          <div className="mb-8">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              {t('login.password')}
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-green-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white shadow-sm"
              placeholder={t('login.passwordPlaceholder')}
            />
          </div>

          {/* 底部按钮 */}
          <div className="flex justify-between items-center">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-6 py-3 bg-white border border-green-200 text-gray-700 rounded-md hover:bg-green-100 transition-all shadow-sm"
            >
              {t('login.cancel')}
            </button>
            <button 
              type="submit" 
              className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-all shadow-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              {t('login.login')}
            </button>
          </div>
        </form>

        {/* Google 登录按钮 */}
        <div className="mt-6">
          <div className="flex items-center justify-center">
            <div className="h-px w-full bg-green-200"></div>
            <span className="px-3 text-sm text-gray-500">或使用</span>
            <div className="h-px w-full bg-green-200"></div>
          </div>
          <div className="mt-4">
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={handleGoogleLoginError}
              useOneTap
              theme="outline"
              size="large"
              text="signin_with"
              shape="rectangular"
              logo_alignment="left"
              width="100%"
            />
          </div>
        </div>

        {/* 注册按钮 */}
        <div className="mt-4">
          <button
            type="button"
            onClick={() => {
              onClose();
              navigate('/register');
            }}
            className="w-full px-6 py-3 bg-white border border-green-300 text-green-700 rounded-md hover:bg-green-50 transition-all shadow-sm"
          >
            <span className="text-sm font-medium">{t('login.noAccountRegister')}</span>
          </button>
        </div>
        
        {/* 中医风格底部装饰 */}
        <div className="mt-6 pt-6 border-t border-green-200 text-center">
          <div className="flex justify-center gap-2">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.01M15 10h1.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;