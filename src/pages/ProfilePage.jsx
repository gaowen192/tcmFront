import React, { useEffect, useState } from 'react';
import VideoUploadModal from '../components/VideoUploadModal';
import ArticleUploadModal from '../components/ArticleUploadModal';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { getUserInfo, updateUserInfo } from '../services/api';
import EditProfileForm from '../components/EditProfileForm';
import ProfileTabsView from '../components/ProfileTabsView';

const ProfilePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({
    id: '',
    username: '',
    realName: '',
    userId: '',
    role: '',
    status: '',
    tokenExpireTime: '',
    userType: '0',
    email: '',
    phone: '',
    gender: 0,
    birthday: '',
    profession: '',
    hospital: '',
    department: '',
    title: '',
    licenseNumber: '',
    introduction: '',
    avatar: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  // 新增：直接编辑单个字段的状态
  const [editingField, setEditingField] = useState(null);
  const [editingValue, setEditingValue] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isVideoUploadModalOpen, setIsVideoUploadModalOpen] = useState(false);
  const [isArticleUploadModalOpen, setIsArticleUploadModalOpen] = useState(false);

  // 获取用户信息
  const fetchUserInfo = async () => {
    try {
      console.log("===============Fetching user info...");
      // 从localStorage获取userId
      const userId = localStorage.getItem('userId');
      console.log("===============Got userId from localStorage:", userId);
      
      if (!userId) {
        console.error("===============No userId found in localStorage");
        setError('未找到用户ID，请重新登录');
        navigate('/login');
        return;
      }
      
      const response = await getUserInfo(userId);
      console.log("===============User info response:", response);
      
      if (response && response.code === 200) {
        const userData = response.data || {};
        setUserInfo({
          ...userInfo,
          ...userData,
          // 确保专家特有字段存在
          profession: userData.profession || '',
          hospital: userData.hospital || '',
          department: userData.department || '',
          title: userData.title || '',
          licenseNumber: userData.licenseNumber || '',
          introduction: userData.introduction || ''
        });
        
        // 设置表单初始数据
        setFormData({
          username: userData.username || '',
          realName: userData.realName || '',
          email: userData.email || '',
          phone: userData.phone || '',
          gender: userData.gender || 'male',
          birthday: userData.birthday || '',
          // 确保专家特有字段存在于formData
          profession: userData.profession || '',
          hospital: userData.hospital || '',
          department: userData.department || '',
          title: userData.title || '',
          licenseNumber: userData.licenseNumber || '',
          introduction: userData.introduction || ''
        });
      } else {
        console.error("===============Failed to get user info:", response.message);
        setError(response.message || '获取用户信息失败');
        // 如果未登录或token过期，重定向到登录页
        if (response.code === 401) {
          navigate('/login');
        }
      }
    } catch (error) {
      console.error("===============Error fetching user info:", error);
      setError('网络错误，无法获取用户信息');
    } finally {
      setIsLoading(false);
    }
  };

  // 格式化日期
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}年${month}月${day}日`;
  };

  // 根据生日计算年龄
  const calculateAge = (birthday) => {
    if (!birthday) return '';
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    // 如果当前月份小于出生月份，或者月份相同但日期小于出生日期，则年龄减1
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  // 获取状态文本
  const getStatusText = (status) => {
    switch (status) {
      case 1:
        return '正常';
      case 2:
        return '禁用';
      default:
        return '未知';
    }
  };

  // 获取角色文本
  const getRoleText = (role) => {
    switch (role) {
      case 'admin':
        return '管理员';
      case 'doctor':
        return '医生';
      case 'user':
        return '用户';
      default:
        return '未知角色';
    }
  };

  // 编辑按钮点击事件
  const handleEditClick = () => {
    console.log("===============Edit button clicked");
    setIsEditing(true);
    setError('');
    setSuccess('');
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setIsEditing(false);
    setError('');
    setSuccess('');
    // 重置表单数据
    setFormData({
      username: userInfo.username || '',
      realName: userInfo.realName || '',
      email: userInfo.email || '',
      phone: userInfo.phone || '',
      gender: userInfo.gender || 'male',
      birthday: userInfo.birthday || '',
      profession: userInfo.profession || '',
      hospital: userInfo.hospital || '',
      department: userInfo.department || '',
      title: userInfo.title || '',
      licenseNumber: userInfo.licenseNumber || '',
      introduction: userInfo.introduction || ''
    });
  };

  // 处理输入变化
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 处理表单提交
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');
      console.log("===============Submitting form data:", formData);
      
      const updateData = {
        username: formData.username,
        realName: formData.realName,
        email: formData.email,
        phone: formData.phone,
        gender: formData.gender,
        birthday: formData.birthday,
        // 确保专家特有字段被包含
        profession: formData.profession,
        hospital: formData.hospital,
        department: formData.department,
        title: formData.title,
        licenseNumber: formData.licenseNumber,
        introduction: formData.introduction
      };
      
      const response = await updateUserInfo(updateData);
      console.log("===============Update response:", response);
      
      if (response && response.code === 200) {
        setSuccess('个人信息更新成功');
        setIsEditing(false);
        // 更新用户信息
        setUserInfo(prev => ({
          ...prev,
          ...updateData
        }));
        // 更新localStorage
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
          localStorage.setItem('user', JSON.stringify({
            ...storedUser,
            ...updateData
          }));
        }
      } else {
        setError(response.message || '更新失败');
      }
    } catch (error) {
      console.error("===============Error updating user info:", error);
      setError('网络错误，更新失败');
    }
  };

  // 开始编辑单个字段
  const handleStartEditField = (field, value) => {
    setEditingField(field);
    setEditingValue(value || '');
    setError('');
    setSuccess('');
  };

  // 取消编辑单个字段
  const handleCancelEditField = () => {
    setEditingField(null);
    setEditingValue('');
  };

  // 保存单个字段的更新
  const handleSaveEditField = async () => {
    if (!editingField) return;
    
    try {
      setIsUpdating(true);
      setError('');
      setSuccess('');
      
      // 准备更新数据
      const updateData = { [editingField]: editingValue };
      console.log("===============Updating single field:", updateData);
      
      // 调用更新接口
      const response = await updateUserInfo(updateData);
      console.log("===============Single field update response:", response);
      
      if (response && response.code === 200) {
        // 更新用户信息
        setUserInfo(prev => ({
          ...prev,
          [editingField]: editingValue
        }));
        // 更新localStorage
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
          localStorage.setItem('user', JSON.stringify({
            ...storedUser,
            [editingField]: editingValue
          }));
        }
        setSuccess('信息更新成功');
        setEditingField(null);
        setEditingValue('');
      } else {
        setError(response.message || '更新失败');
      }
    } catch (error) {
      console.error("===============Error updating single field:", error);
      setError('网络错误，更新失败');
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    fetchUserInfo();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fcfbf7] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">{t('profile.loading')}</p>
        </div>
      </div>
    );
  }

  // 渲染普通用户资料 (已迁移到UserProfileView组件)
  

  // 渲染专家资料 (已迁移到ExpertProfileView组件)
  

  // 处理头像上传
  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log("===============Uploading avatar:", file);
      // 这里可以添加头像上传逻辑
      // 例如：调用上传API并更新用户信息
    }
  };

  // 视频上传成功回调
  const handleVideoUploadSuccess = (result) => {
    console.log("===============Video upload success:", result);
    // 可以在这里添加成功后的处理逻辑，比如刷新视频列表等
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f9fa] to-[#e9ecef] py-6 px-4 sm:px-6 lg:px-8">
      {/* 视频上传弹窗 */}
      <VideoUploadModal
        isOpen={isVideoUploadModalOpen}
        onClose={() => setIsVideoUploadModalOpen(false)}
        onSuccess={handleVideoUploadSuccess}
      />
      <ArticleUploadModal
        isOpen={isArticleUploadModalOpen}
        onClose={() => setIsArticleUploadModalOpen(false)}
        onSuccess={() => {
          console.log("===============Article upload successful");
          // 可以添加文章上传成功后的逻辑，如刷新文章列表
        }}
      />
      <div className="max-w-4xl mx-auto">
        {/* 用户基本信息卡片 */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6 overflow-hidden border border-gray-100">
          {/* 卡片头部装饰 */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-teal-400 to-indigo-500"></div>
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
            {/* 左侧：头像区域 */}
            <div className="flex items-center">
              <div className="relative mr-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-100 to-indigo-100 flex items-center justify-center overflow-hidden shadow-md transition-transform duration-300 hover:scale-105">
                  {userInfo.avatar ? (
                    <img 
                      src={userInfo.avatar} 
                      alt="用户头像" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.parentNode.replaceChild(
                          <span className="text-3xl text-gray-400">👤</span>,
                          e.target
                        );
                      }}
                    />
                  ) : (
                    <span className="text-3xl text-gray-400">👤</span>
                  )}
                </div>
                {/* 上传头像按钮 */}
                <label className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 shadow-lg cursor-pointer hover:bg-gray-50 transition-all duration-300 hover:shadow-xl">
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleAvatarUpload}
                  />
                  <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </label>
              </div>
              
              {/* 用户类型标题 */}
              <div className="text-center md:text-left">
                <h1 className="text-xl font-bold text-gray-800 mb-1">
                  {userInfo.username || '未设置'}
                </h1>
                <p className="text-base text-gray-600 bg-gray-50 px-3 py-1 rounded-full inline-block">
              

 {userInfo.userType === 1 ? '中医师,专家' : '学生,爱好者'}
            

                </p>
              </div>
            </div>
            
            {/* 右侧：上传按钮区域 */}
            <div className="flex flex-wrap justify-center md:justify-end gap-2 w-full md:w-auto">
              <button 
                className="flex items-center justify-center px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full text-sm font-medium hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 shadow-sm hover:shadow-md"
                onClick={() => {
                  console.log("===============Upload Video button clicked");
                  setIsVideoUploadModalOpen(true);
                }}
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                上传视频
              </button>
              <button 
                className="flex items-center justify-center px-3 py-1.5 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-full text-sm font-medium hover:from-green-600 hover:to-teal-600 transition-all duration-300 shadow-sm hover:shadow-md"
                onClick={() => {
                  console.log("===============Upload Article button clicked");
                  setIsArticleUploadModalOpen(true);
                }}
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                上传文章
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans">
            {/* 真实姓名 */}
            <div className="bg-gradient-to-br from-white to-gray-50 p-3 rounded-md border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 flex items-center">
              <div className="flex items-center mr-3">
                <svg className="w-4 h-4 mr-1.5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-sm font-semibold text-gray-600 tracking-wider">真实姓名</span>
              </div>
              {editingField === 'realName' ? (
                <div className="flex items-center space-x-2 flex-1">
                  <input
                    type="text"
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="请输入真实姓名"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveEditField}
                    disabled={isUpdating}
                    className="px-2 py-1 bg-teal-500 text-white rounded text-xs hover:bg-teal-600 disabled:opacity-50"
                  >
                    {isUpdating ? '保存中...' : '保存'}
                  </button>
                  <button
                    onClick={handleCancelEditField}
                    className="px-2 py-1 bg-gray-300 text-gray-800 rounded text-xs hover:bg-gray-400"
                  >
                    取消
                  </button>
                </div>
              ) : (
                <span
                  className="text-sm text-gray-800 font-medium tracking-wide cursor-pointer hover:text-teal-500"
                  onClick={() => handleStartEditField('realName', userInfo.realName)}
                >
                  {userInfo.realName || '未设置'}
                </span>
              )}
            </div>

            {/* 邮箱 */}
            <div className="bg-gradient-to-br from-white to-gray-50 p-3 rounded-md border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 flex items-center">
              <div className="flex items-center mr-3">
                <svg className="w-4 h-4 mr-1.5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-semibold text-gray-600 tracking-wider">邮箱</span>
              </div>
              {editingField === 'email' ? (
                <div className="flex items-center space-x-2 flex-1">
                  <input
                    type="email"
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="请输入邮箱"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveEditField}
                    disabled={isUpdating}
                    className="px-2 py-1 bg-teal-500 text-white rounded text-xs hover:bg-teal-600 disabled:opacity-50"
                  >
                    {isUpdating ? '保存中...' : '保存'}
                  </button>
                  <button
                    onClick={handleCancelEditField}
                    className="px-2 py-1 bg-gray-300 text-gray-800 rounded text-xs hover:bg-gray-400"
                  >
                    取消
                  </button>
                </div>
              ) : (
                <span
                  className="text-sm text-gray-800 font-medium tracking-wide truncate cursor-pointer hover:text-teal-500"
                  onClick={() => handleStartEditField('email', userInfo.email)}
                >
                  {userInfo.email || '未设置'}
                </span>
              )}
            </div>

            {/* 电话 */}
            <div className="bg-gradient-to-br from-white to-gray-50 p-3 rounded-md border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 flex items-center">
              <div className="flex items-center mr-3">
                <svg className="w-4 h-4 mr-1.5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-sm font-semibold text-gray-600 tracking-wider">电话</span>
              </div>
              {editingField === 'phone' ? (
                <div className="flex items-center space-x-2 flex-1">
                  <input
                    type="tel"
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="请输入电话"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveEditField}
                    disabled={isUpdating}
                    className="px-2 py-1 bg-teal-500 text-white rounded text-xs hover:bg-teal-600 disabled:opacity-50"
                  >
                    {isUpdating ? '保存中...' : '保存'}
                  </button>
                  <button
                    onClick={handleCancelEditField}
                    className="px-2 py-1 bg-gray-300 text-gray-800 rounded text-xs hover:bg-gray-400"
                  >
                    取消
                  </button>
                </div>
              ) : (
                <span
                  className="text-sm text-gray-800 font-medium tracking-wide cursor-pointer hover:text-teal-500"
                  onClick={() => handleStartEditField('phone', userInfo.phone)}
                >
                  {userInfo.phone || '未设置'}
                </span>
              )}
            </div>

            {/* 性别 */}
            <div className="bg-gradient-to-br from-white to-gray-50 p-3 rounded-md border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 flex items-center">
              <div className="flex items-center mr-3">
                <svg className="w-4 h-4 mr-1.5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span className="text-sm font-semibold text-gray-600 tracking-wider">性别</span>
              </div>
              {editingField === 'gender' ? (
                <div className="flex items-center space-x-2 flex-1">
                  <select
                    value={editingValue}
                    onChange={(e) => setEditingValue(parseInt(e.target.value))}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    autoFocus
                  >
                    <option value="0">未设置</option>
                    <option value="1">男</option>
                    <option value="2">女</option>
                  </select>
                  <button
                    onClick={handleSaveEditField}
                    disabled={isUpdating}
                    className="px-2 py-1 bg-teal-500 text-white rounded text-xs hover:bg-teal-600 disabled:opacity-50"
                  >
                    {isUpdating ? '保存中...' : '保存'}
                  </button>
                  <button
                    onClick={handleCancelEditField}
                    className="px-2 py-1 bg-gray-300 text-gray-800 rounded text-xs hover:bg-gray-400"
                  >
                    取消
                  </button>
                </div>
              ) : (
                <span
                  className="text-sm text-gray-800 font-medium tracking-wide cursor-pointer hover:text-teal-500"
                  onClick={() => handleStartEditField('gender', userInfo.gender)}
                >
                  {userInfo.gender === 1 ? '男' : userInfo.gender === 2 ? '女' : '未设置'}
                </span>
              )}
            </div>

            {/* 生日 */}
            <div className="bg-gradient-to-br from-white to-gray-50 p-3 rounded-md border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 flex items-center">
              <div className="flex items-center mr-3">
                <svg className="w-4 h-4 mr-1.5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-semibold text-gray-600 tracking-wider">生日</span>
              </div>
              {editingField === 'birthday' ? (
                <div className="flex items-center space-x-2 flex-1">
                  <input
                    type="date"
                    value={editingValue ? new Date(editingValue).toISOString().split('T')[0] : ''}
                    onChange={(e) => setEditingValue(e.target.value)}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveEditField}
                    disabled={isUpdating}
                    className="px-2 py-1 bg-teal-500 text-white rounded text-xs hover:bg-teal-600 disabled:opacity-50"
                  >
                    {isUpdating ? '保存中...' : '保存'}
                  </button>
                  <button
                    onClick={handleCancelEditField}
                    className="px-2 py-1 bg-gray-300 text-gray-800 rounded text-xs hover:bg-gray-400"
                  >
                    取消
                  </button>
                </div>
              ) : (
                <span
                  className="text-sm text-gray-800 font-medium tracking-wide cursor-pointer hover:text-teal-500"
                  onClick={() => handleStartEditField('birthday', userInfo.birthday)}
                >
                  {formatDate(userInfo.birthday) || '未设置'}
                </span>
              )}
            </div>

            {/* 年龄 - 只读，基于生日计算 */}
            <div className="bg-gradient-to-br from-white to-gray-50 p-3 rounded-md border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 flex items-center">
              <div className="flex items-center mr-3">
                <svg className="w-4 h-4 mr-1.5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-semibold text-gray-600 tracking-wider">年龄</span>
              </div>
              <span className="text-sm text-gray-800 font-medium tracking-wide">
                {calculateAge(userInfo.birthday) || '未设置'}岁
              </span>
            </div>

            {/* 职称 - 可编辑 */}
            <div className="bg-gradient-to-br from-white to-gray-50 p-3 rounded-md border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 flex items-center">
              <div className="flex items-center mr-3">
                <svg className="w-4 h-4 mr-1.5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-sm font-semibold text-gray-600 tracking-wider">职称</span>
              </div>
              {editingField === 'title' ? (
                <div className="flex items-center space-x-2 flex-1">
                  <input
                    type="text"
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="请输入职称"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveEditField}
                    disabled={isUpdating}
                    className="px-2 py-1 bg-teal-500 text-white rounded text-xs hover:bg-teal-600 disabled:opacity-50"
                  >
                    {isUpdating ? '保存中...' : '保存'}
                  </button>
                  <button
                    onClick={handleCancelEditField}
                    className="px-2 py-1 bg-gray-300 text-gray-800 rounded text-xs hover:bg-gray-400"
                  >
                    取消
                  </button>
                </div>
              ) : (
                <span
                  className="text-sm text-gray-800 font-medium tracking-wide cursor-pointer hover:text-teal-500"
                  onClick={() => handleStartEditField('title', userInfo.title)}
                >
                  {userInfo.title || '未设置'}
                </span>
              )}
            </div>

            {/* 状态 - 只读 */}
            <div className="bg-gradient-to-br from-white to-gray-50 p-3 rounded-md border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 flex items-center">
              <div className="flex items-center mr-3">
                <svg className="w-4 h-4 mr-1.5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-semibold text-gray-600 tracking-wider">状态</span>
              </div>
              <span className="text-sm text-gray-800 font-medium tracking-wide">
                {getStatusText(userInfo.status)}
              </span>
            </div>
          </div>
        </div>

        {/* 条件渲染编辑表单或查看组件 */}
        {isEditing ? <EditProfileForm formData={formData} handleInputChange={handleInputChange} handleSubmit={handleSubmit} handleCancelEdit={handleCancelEdit} error={error} success={success} isExpert={true} /> : <ProfileTabsView userInfo={userInfo} handleEditClick={handleEditClick} />}
      </div>
    </div>
  );
};

export default ProfilePage;