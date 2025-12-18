import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const NotificationsTab = ({ currentPage, setCurrentPage, setTotalPages, setTotalItems, itemsPerPage }) => {
  const [userNotifications, setUserNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch user notifications
  const fetchUserNotifications = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('=============== Calling getUserNotifications...');
      const isLoggedIn = api.isLoggedIn();
      console.log('=============== Is user logged in:', isLoggedIn);
      
      if (!isLoggedIn) {
        console.error('=============== User not logged in');
        setError('请先登录');
        setUserNotifications([]);
        setTotalPages(0);
        setTotalItems(0);
        return;
      }
      
      // 使用1-based页码调用API
      const response = await api.getUserNotifications(currentPage, itemsPerPage);
      console.log('=============== User Notifications Data:', response);
      
      if (response && response.data) {
        setUserNotifications(response.data.content || []);
        setTotalPages(response.data.totalPages || 0);
        setTotalItems(response.data.totalElements || 0);
        console.log('=============== Set userNotifications with', response.data.content?.length || 0, 'items');
        console.log('=============== Total Pages:', response.data.totalPages, 'Total Items:', response.data.totalElements);
      } else {
        console.error('=============== Invalid data format:', response);
        setUserNotifications([]);
        setTotalPages(0);
        setTotalItems(0);
      }
    } catch (err) {
      console.error('=============== Failed to fetch user notifications:', err);
      console.error('=============== Error details:', err.message, err.response?.data);
      setError('获取通知记录失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 当组件挂载或currentPage变化时获取通知
  useEffect(() => {
    fetchUserNotifications();
  }, [currentPage]);
  
  // 添加一个依赖项来确保在切换到通知标签页时获取数据
  useEffect(() => {
    fetchUserNotifications();
  }, []);

  // 获取通知类型图标和颜色
  const getNotificationTypeInfo = (type) => {
    switch (type.toLowerCase()) {
      case 'like':
        return {
          icon: '❤️',
          color: 'text-red-500',
          backgroundColor: 'bg-red-50',
          text: '点赞'
        };
      case 'point':
        return {
          icon: '🎁',
          color: 'text-yellow-500',
          backgroundColor: 'bg-yellow-50',
          text: '积分'
        };
      case 'system':
        return {
          icon: '📢',
          color: 'text-purple-500',
          backgroundColor: 'bg-purple-50',
          text: '系统通知'
        };
      default:
        return {
          icon: '🔔',
          color: 'text-gray-500',
          backgroundColor: 'bg-gray-50',
          text: '通知'
        };
    }
  };

  // 获取通知跳转链接
  const getNotificationUrl = (notification) => {
    if (notification.relatedType === 'article') {
      return `/professional-articles/${notification.relatedId}`;
    } else if (notification.relatedType === 'video') {
      return `/video/${notification.relatedId}`;
    } else if (notification.relatedType === 'forum') {
      return `/forum/${notification.relatedId}`;
    } else if (notification.relatedType === 'user') {
      return `/profile/${notification.relatedId}`;
    }
    return '#';
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">我的通知列表</h2>
      
      {isLoading ? (
        <div className="bg-white rounded-lg p-8 text-center text-gray-500 border border-gray-100">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mb-2"></div>
          <p>加载通知列表中...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 rounded-lg p-8 text-center text-red-500 border border-red-100">
          <p>{error}</p>
          <button 
            onClick={fetchUserNotifications}
            className="mt-3 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
          >
            重试
          </button>
        </div>
      ) : userNotifications.length > 0 ? (
        <div className="space-y-4">
          {userNotifications.map((notification) => {
            const typeInfo = getNotificationTypeInfo(notification.type);
            const url = getNotificationUrl(notification);
            
            return (
              <div key={notification.id} className={`bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow ${notification.isRead ? 'opacity-75' : 'border-green-200 bg-green-50'}`}>
                <div className="p-4">
                  <div className="flex items-start space-x-4">
                    {/* 通知类型图标 */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${typeInfo.backgroundColor} ${typeInfo.color} text-xl flex-shrink-0`}>
                      {typeInfo.icon}
                    </div>
                    
                    {/* 通知内容 */}
                    <div className="flex-1 min-w-0">
                      {/* 通知标题 */}
                      <div className="text-gray-900 font-medium mb-1">
                        {notification.title}
                      </div>
                      
                      {/* 通知内容 */}
                      <div className="text-gray-700 mb-2">
                        {notification.content}
                      </div>
                      
                      {/* 通知时间 */}
                      <div className="mt-2 text-xs text-gray-500">
                        {new Date(notification.createdAt).toLocaleString('zh-CN')}
                      </div>
                    </div>
                  </div>
                  
                  {/* 操作按钮 */}
                  {url !== '#' && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link 
                        to={url}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md transition-colors"
                      >
                        查看详情
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500 border border-gray-100">
          暂无通知记录
        </div>
      )}
    </div>
  );
};

export default NotificationsTab;