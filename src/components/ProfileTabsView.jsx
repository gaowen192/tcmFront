import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import WatchHistoryTab from './profile/WatchHistoryTab';
import MyVideosTab from './profile/MyVideosTab';
import ArticlesTab from './profile/ArticlesTab';
import ForumTab from './profile/ForumTab';
import VideoCommentsTab from './profile/VideoCommentsTab';
import RepliesTab from './profile/RepliesTab';
import NotificationsTab from './profile/NotificationsTab';

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

const ProfileTabsView = ({ userInfo, handleEditClick }) => {
  const [activeTab, setActiveTab] = useState('watchHistory');
  
  // 切换tab时重置为第一页
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setCurrentPage(1);
  };
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  // 分页相关状态
  const [currentPage, setCurrentPage] = useState(1); // 页码从1开始
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 8; // 每页显示8个视频

  // 数据获取逻辑已迁移到各个tab组件中，不再需要这个useEffect

  // 分页处理函数
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const tabs = [
    { id: 'watchHistory', label: '觀看紀錄' },
    ...(userInfo.userType == 1 ? [{ id: 'myVideos', label: '我的上传视频列表' }] : []),
    ...(userInfo.userType == 1 ? [{ id: 'articles', label: '文章' }] : []),
    { id: 'forum', label: '論壇' },
    { id: 'comments', label: '视频评论' },
    { id: 'replies', label: '帖子回复' },
    { id: 'notifications', label: '通知中心' }
  ];
  
  // 添加调试信息
  console.log('=============== ProfileTabsView Active Tab:', activeTab);
  console.log('=============== ProfileTabsView Current Page:', currentPage);

  return (
    <div className="space-y-8">
      {/* 导航标签页 */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <div className="flex border-b border-gray-100">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`py-3 px-5 font-medium text-sm whitespace-nowrap transition-all ${activeTab === tab.id 
                  ? 'text-teal-600 border-b-2 border-teal-600' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                onClick={() => handleTabChange(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      {/* 标签页内容 */}
        <div className="p-5">
          {activeTab === 'watchHistory' && (
            <WatchHistoryTab 
              currentPage={currentPage} 
              setCurrentPage={setCurrentPage} 
              setTotalPages={setTotalPages}
              setTotalItems={setTotalItems}
              itemsPerPage={itemsPerPage} 
            />
          )}

          {activeTab === 'myVideos' && (
            <MyVideosTab 
              currentPage={currentPage} 
              setCurrentPage={setCurrentPage} 
              setTotalPages={setTotalPages}
              setTotalItems={setTotalItems}
              itemsPerPage={itemsPerPage} 
            />
          )}

          {activeTab === 'articles' && (
            <ArticlesTab 
              currentPage={currentPage} 
              setCurrentPage={setCurrentPage} 
              setTotalPages={setTotalPages}
              setTotalItems={setTotalItems}
              itemsPerPage={itemsPerPage} 
            />
          )}

          {activeTab === 'forum' && (
            <ForumTab 
              currentPage={currentPage} 
              setCurrentPage={setCurrentPage} 
              setTotalPages={setTotalPages}
              setTotalItems={setTotalItems}
              itemsPerPage={itemsPerPage} 
            />
          )}

          {activeTab === 'comments' && (
            <VideoCommentsTab 
              currentPage={currentPage} 
              setCurrentPage={setCurrentPage} 
              setTotalPages={setTotalPages}
              setTotalItems={setTotalItems}
              itemsPerPage={itemsPerPage} 
            />
          )}

          {/* Replies Tab */}
          {activeTab === 'replies' && (
            <div className="bg-white p-4 rounded-lg">
              <RepliesTab 
                currentPage={currentPage} 
                setCurrentPage={setCurrentPage} 
                setTotalPages={setTotalPages}
                setTotalItems={setTotalItems}
                itemsPerPage={itemsPerPage} 
              />
            </div>
          )}

          {activeTab === 'notifications' && (
            <NotificationsTab 
              currentPage={currentPage} 
              setCurrentPage={setCurrentPage} 
              setTotalPages={setTotalPages}
              setTotalItems={setTotalItems}
              itemsPerPage={itemsPerPage} 
            />
          )}

          {/* 分页导航 */}
          {totalItems > 0 && (
            <div className="flex justify-center items-center mt-4 space-x-4">
              {/* 上一页按钮 */}
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-md transition-colors ${currentPage === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}
              >
                上一页
              </button>
              
              {/* 分页指示器 */}
              <div className="flex space-x-2">
                {Array.from({ length: totalPages }, (_, index) => {
                  const pageNumber = index + 1;
                  return (
                    <button
                      key={pageNumber}
                      className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${pageNumber === currentPage ? 'bg-green-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-600'}`}
                      aria-label={`第${pageNumber}页`}
                      onClick={() => setCurrentPage(pageNumber)}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
              </div>
              
              {/* 下一页按钮 */}
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-md transition-colors ${currentPage === totalPages ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}
              >
                下一页
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileTabsView;