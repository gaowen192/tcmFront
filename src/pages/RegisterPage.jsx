import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { register, getEmailVerificationCode, getPhoneVerificationCode } from '../services/api';
import { useTranslation } from 'react-i18next';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  // Form state
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    phone: '',
    phoneVerificationCode: '',
    email: '',
    emailVerificationCode: '',
    userType: '0' // Default to student/enthusiast (value 0)
  });
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Verification code countdown
  const [emailCountdown, setEmailCountdown] = useState(0);
  const [phoneCountdown, setPhoneCountdown] = useState(0);
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };
  
  // Validate form
  const validateForm = () => {
    if (!formData.username.trim()) {
      setError('用户名不能为空');
      return false;
    }
    
    if (formData.username.length < 3) {
      setError('用户名至少需要3个字符');
      return false;
    }
    
    if (!formData.password) {
      setError('密码不能为空');
      return false;
    }
    
    if (formData.password.length < 6) {
      setError('密码至少需要6个字符');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不一致');
      return false;
    }
    
    // Check if at least one of phone or email is provided
    if (!formData.phone && !formData.email) {
      setError('请提供手机号或邮箱');
      return false;
    }
    
    // Check if verification code is provided for the selected method
    if (formData.phone && !formData.phoneVerificationCode) {
      setError('请输入手机验证码');
      return false;
    }
    
    if (formData.email && !formData.emailVerificationCode) {
      setError('请输入邮箱验证码');
      return false;
    }
    
    return true;
  };
  
  // Handle email verification code request
  const handleGetEmailCode = async () => {
    if (!formData.email) {
      setError('请先输入邮箱');
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('请输入有效的邮箱地址');
      return;
    }
    
    try {
      setIsSubmitting(true);
      const response = await getEmailVerificationCode(formData.email);
      
      // Auto-fill verification code if response is successful
      if (response && response.code === 200) {
        setFormData(prev => ({
          ...prev,
          emailVerificationCode: response.data.verificationCode || ''
        }));
      }
      
      setSuccess('邮箱验证码已发送');
      
      // Start countdown
      setEmailCountdown(60);
    } catch (err) {
      setError(err.message || '获取验证码失败，请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle phone verification code request
  const handleGetPhoneCode = async () => {
    if (!formData.phone) {
      setError('请先输入手机号');
      return;
    }
    
    // Validate phone format (simple validation for Chinese phone numbers)
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(formData.phone)) {
      setError('请输入有效的手机号');
      return;
    }
    
    try {
      setIsSubmitting(true);
      const response = await getPhoneVerificationCode(formData.phone);
      
      // Auto-fill verification code if response is successful
      if (response && response.code === 200) {
        setFormData(prev => ({
          ...prev,
          phoneVerificationCode: response.data.verificationCode || ''
        }));
      }
      
      setSuccess('手机验证码已发送');
      
      // Start countdown
      setPhoneCountdown(60);
    } catch (err) {
      setError(err.message || '获取验证码失败，请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError('');
      
      const response = await register(formData);
      
      if (response && response.code === 200) {
        setSuccess('注册成功！正在跳转到首页...');
        
        // Redirect to homepage after 2 seconds
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        setError(response.message || '注册失败，请稍后重试');
      }
    } catch (err) {
      setError(err.message || '注册失败，请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Countdown timers
  useEffect(() => {
    if (emailCountdown > 0) {
      const timer = setTimeout(() => {
        setEmailCountdown(emailCountdown - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [emailCountdown]);
  
  useEffect(() => {
    if (phoneCountdown > 0) {
      const timer = setTimeout(() => {
        setPhoneCountdown(phoneCountdown - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [phoneCountdown]);
  
  return (
    <div className="min-h-screen bg-[#fcfbf7] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-bold">中</span>
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">{t('register.title')}</h2>
          <p className="mt-2 text-sm text-gray-600">{t('register.subtitle')}</p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Error message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-md transition-all duration-300 animate-fadeIn">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Success message */}
          {success && (
            <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-md shadow-md transition-all duration-300 animate-fadeIn">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">{success}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Username */}
          <div className="rounded-md -space-y-px">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                {t('register.username')}
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 hover:border-gray-400 shadow-sm"
                placeholder={t('register.usernamePlaceholder')}
                value={formData.username}
                onChange={handleChange}
              />
            </div>
          </div>
          
          {/* Password */}
          <div className="rounded-md -space-y-px">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                {t('register.password')}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 hover:border-gray-400 shadow-sm"
                placeholder={t('register.passwordPlaceholder')}
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>
          
          {/* User Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('register.userType')}
            </label>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex items-center">
                <input
                  id="userType0"
                  name="userType"
                  type="radio"
                  value="0"
                  checked={formData.userType === '0'}
                  onChange={handleChange}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                />
                <label htmlFor="userType0" className="ml-2 block text-sm text-gray-700">
                  {t('register.userTypeStudent')}
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="userType1"
                  name="userType"
                  type="radio"
                  value="1"
                  checked={formData.userType === '1'}
                  onChange={handleChange}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                />
                <label htmlFor="userType1" className="ml-2 block text-sm text-gray-700">
                  {t('register.userTypeExpert')}
                </label>
              </div>
            </div>
          </div>
          
          {/* Confirm Password */}
          <div className="rounded-md -space-y-px">
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                {t('register.confirmPassword')}
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 hover:border-gray-400 shadow-sm"
                placeholder={t('register.confirmPasswordPlaceholder')}
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>
          
          {/* Phone section */}
          <div className="rounded-md -space-y-px">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                {t('register.phone')} <span className="text-red-500">*</span> / {t('register.email')} <span className="text-red-500">*</span>
              </label>
              <div className="flex space-x-2">
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 hover:border-gray-400"
                  placeholder="13800138000"
                  value={formData.phone}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={handleGetPhoneCode}
                  disabled={phoneCountdown > 0 || isSubmitting}
                  className={`px-4 py-2 border border-transparent text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ${phoneCountdown > 0 || isSubmitting 
                    ? 'bg-green-400 text-white cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500'}`}
                >
                  {phoneCountdown > 0 ? `${phoneCountdown}s` : t('register.getCode')}
                </button>
              </div>
            </div>
          </div>
          
          {/* Phone verification code */}
          {formData.phone && (
            <div className="rounded-md -space-y-px">
              <div>
                <label htmlFor="phoneVerificationCode" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('register.phoneVerificationCode')}
                </label>
                <input
                  id="phoneVerificationCode"
                  name="phoneVerificationCode"
                  type="text"
                  className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 hover:border-gray-400 shadow-sm"
                  placeholder="123456"
                  value={formData.phoneVerificationCode}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}
          
          {/* Email section */}
          <div className="rounded-md -space-y-px">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1 hidden">
                {t('register.email')}
              </label>
              <div className="flex space-x-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 hover:border-gray-400"
                  placeholder="user@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={handleGetEmailCode}
                  disabled={emailCountdown > 0 || isSubmitting}
                  className={`px-4 py-2 border border-transparent text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ${emailCountdown > 0 || isSubmitting 
                    ? 'bg-green-400 text-white cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500'}`}
                >
                  {emailCountdown > 0 ? `${emailCountdown}s` : t('register.getCode')}
                </button>
              </div>
            </div>
          </div>
          
          {/* Email verification code */}
          {formData.email && (
            <div className="rounded-md -space-y-px">
              <div>
                <label htmlFor="emailVerificationCode" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('register.emailVerificationCode')}
                </label>
                <input
                  id="emailVerificationCode"
                  name="emailVerificationCode"
                  type="text"
                  className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 hover:border-gray-400 shadow-sm"
                  placeholder="123456"
                  value={formData.emailVerificationCode}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}
          
          {/* Register button */}
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${isSubmitting 
                ? 'bg-green-400 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'}`}
            >
              {isSubmitting ? t('register.submitting') : t('register.register')}
            </button>
          </div>
          
          {/* Login link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              {t('register.alreadyHaveAccount')} 
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="font-medium text-green-600 hover:text-green-500"
              >
                {t('register.login')}
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;