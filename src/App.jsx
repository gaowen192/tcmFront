import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProfessionalArticlesPage from './pages/ProfessionalArticlesPage';
import ForumPage from './pages/ForumPage';
import PostDetailPage from './pages/PostDetailPage';
import VideoPlaybackPage from './pages/VideoPlaybackPage';
import ArticleDetailPage from './pages/ArticleDetailPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import MeridianFlowPage from './pages/MeridianFlowPage';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './components/LanguageSwitcher';
import LoginModal from './components/LoginModal';
import { login } from './services/api';
import './App.css';
import React, { useState, useEffect } from 'react';

function AppContent() {
  const { t } = useTranslation();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Update activeTab based on current location
  useEffect(() => {
    const path = location.pathname;
    if (path === '/') {
      setActiveTab('home');
    } else if (path.startsWith('/professional-articles')) {
      setActiveTab('professionalArticles');
    } else if (path.startsWith('/forum')) {
      setActiveTab('forum');
    } else if (path.startsWith('/profile')) {
      setActiveTab('profile');
    }
  }, [location.pathname]);

  // Check login status on component mount
  useEffect(() => {
    checkLoginStatus();
  }, []);

  // Check if user is logged in by verifying token existence
  const checkLoginStatus = () => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    if (token && username) {
      setIsLoggedIn(true);
      setCurrentUser(username);
      console.log('=============== User is logged in:', username);
    } else {
      setIsLoggedIn(false);
      setCurrentUser(null);
      console.log('=============== User is not logged in');
    }
  };

  // Handle logout
const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  setIsLoggedIn(false);
  setCurrentUser(null);
  setShowUserMenu(false);
  console.log('=============== User logged out');
  // Redirect to home page after logout
  window.location.href = '/';
};

  // Handle login
  const handleLogin = async (credentials) => {
    try {
      console.log('=============== Login attempt with:', credentials.username);
      
      // Call the actual login API
      const response = await login(credentials);
      
      if (response && response.code === 200) {
        // Login successful
        console.log('=============== Login successful:', response.data.username);
        
        // Save user information to localStorage
        localStorage.setItem('token', response.data.accessToken);
        localStorage.setItem('username', response.data.username);
        localStorage.setItem('realName', response.data.realName);
        localStorage.setItem('userId', response.data.userId);
        localStorage.setItem('role', response.data.role);
        localStorage.setItem('userType', response.data.userType);
        localStorage.setItem('status', response.data.status);
        localStorage.setItem('tokenExpireTime', response.data.tokenExpireTime);
        
        // Update login status
        checkLoginStatus();
        
        // Close login modal
        setIsLoginModalOpen(false);
        
        // Show success message
        alert(response.message || '登录成功！');
      } else {
        // Login failed - API returned error message
        console.error('=============== Login failed:', response.message);
        alert(response.message || '登录失败，请检查您的凭证。');
      }
    } catch (error) {
      // Handle API errors
      console.error('=============== Login API Error:', error);
      alert(error.message || '网络错误，请稍后重试。');
    }
  };
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  const navItems = [
    { id: 'home', label: t('app.nav.home'), icon: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>, path: '/' },
    { id: 'professionalArticles', label: '专业文章', icon: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>, path: '/professional-articles' },
    { id: 'forum', label: t('app.nav.forum'), icon: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>, path: '/forum' },
    { id: 'profile', label: isLoggedIn ? '个人中心' : '登录', icon: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>, path: isLoggedIn ? '/profile' : '#', action: isLoggedIn ? null : () => setIsLoginModalOpen(true) }
  ];
  
  return (
    <div className="min-h-screen bg-[#fcfbf7]">
        {/* Navigation */}
        <nav className="bg-white shadow-md">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <Link to="/" className="flex items-center gap-2 text-xl font-bold text-green-800">
                  <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="40" height="40" rx="8" fill="#10B981"/>
                    <text x="20" y="25" fontFamily="Arial, sans-serif" fontSize="22" fontWeight="bold" fill="white" textAnchor="middle">中</text>
                  </svg>
                  智慧中医
                  <span className="text-sm font-normal ml-1">Intelligent CM</span>
                </Link>
              </div>
              <div className="flex items-center rounded-lg space-x-2">
                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center space-x-2">
                  <Link 
                    to="/" 
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'home' ? 'bg-green-100 text-green-800' : 'text-gray-700 hover:bg-[rgb(240_253_244/var(--tw-bg-opacity,1))] hover:text-green-800'}`}
                    onClick={() => setActiveTab('home')}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                    {t('app.nav.home')}
                  </Link>
                  <Link 
                    to="/professional-articles" 
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'professionalArticles' ? 'bg-green-100 text-green-800' : 'text-gray-700 hover:bg-[rgb(240_253_244/var(--tw-bg-opacity,1))] hover:text-green-800'}`}
                    onClick={() => setActiveTab('professionalArticles')}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                    专业文章
                  </Link>
                  <Link 
                    to="/forum" 
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'forum' ? 'bg-green-100 text-green-800' : 'text-gray-700 hover:bg-[rgb(240_253_244/var(--tw-bg-opacity,1))] hover:text-green-800'}`}
                    onClick={() => setActiveTab('forum')}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                    {t('app.nav.forum')}
                  </Link>
                </div>
                
                {/* Desktop User Actions */}
                <div className="hidden md:flex items-center space-x-2">
                  <LanguageSwitcher />
                  
                  {/* User Profile/Login */}
                  {isLoggedIn ? (
                    <div className="relative">
                      <button 
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-green-800 hover:bg-green-100 transition-all"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        {currentUser}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                      </button>
                      
                      {/* User Menu Dropdown */}
                      {showUserMenu && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-10">
                          <Link 
                            to="/profile"
                            onClick={() => setShowUserMenu(false)}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-100 hover:text-green-800 transition-colors"
                          >
                            个人中心
                          </Link>
                          <button 
                            onClick={handleLogout}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-100 hover:text-green-800 transition-colors"
                          >
                            退出登录
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <button 
                      onClick={() => setIsLoginModalOpen(true)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-green-800 hover:bg-green-100 transition-all"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                      登录
                    </button>
                  )}
                </div>
                
                {/* Mobile Menu Toggle */}
                <button 
                  onClick={toggleMobileMenu}
                  className="md:hidden p-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-green-100 hover:text-green-800"
                  aria-label="Toggle menu"
                >
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden bg-white shadow-md border-t">
              <nav className="p-4 space-y-2 overflow-y-auto">
                {/* Mobile Navigation Links */}
                {navItems.map((item) => (
                  <Link
                    key={item.id}
                    to={item.path}
                    onClick={() => {
                      setActiveTab(item.id);
                      toggleMobileMenu();
                      if (item.action) {
                        item.action();
                      }
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium ${activeTab === item.id
                      ? 'bg-green-100 text-green-800'
                      : 'text-gray-700 hover:bg-[rgb(240_253_244/var(--tw-bg-opacity,1))] hover:text-green-800'}`}
                  >
                    {item.icon()}
                    {item.label}
                  </Link>
                ))}
                
                {/* Mobile Language Switcher */}
                <div className="pt-4 border-t border-gray-100">
                  <LanguageSwitcher />
                </div>
                
                {/* Mobile Logout Button (if logged in) */}
                {isLoggedIn && (
                  <button
                    onClick={() => {
                      handleLogout();
                      toggleMobileMenu();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                    退出登录
                  </button>
                )}
              </nav>
            </div>
          )}
        </nav>

        {/* Login Modal */}
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onLogin={handleLogin}
        />

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8" >
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/professional-articles" element={<ProfessionalArticlesPage />} />
            <Route path="/professional-articles/:id" element={<ArticleDetailPage />} />
            <Route path="/forum" element={<ForumPage isLoggedIn={isLoggedIn} onOpenLoginModal={() => setIsLoginModalOpen(true)} />} />
            <Route path="/post/:postId" element={<PostDetailPage />} />
            <Route path="/video/:videoId" element={<VideoPlaybackPage isLoggedIn={isLoggedIn} onOpenLoginModal={() => setIsLoginModalOpen(true)} />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/meridian-flow" element={<MeridianFlowPage />} />
          </Routes>
        </main>

        {/* Footer */}
        {/* <footer className="bg-white border-t mt-12">
          <div className="container mx-auto px-4 py-8">
            <p className="text-center text-gray-600">
              {t('app.footer')}
            </p>
          </div>
        </footer> */}
      </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
