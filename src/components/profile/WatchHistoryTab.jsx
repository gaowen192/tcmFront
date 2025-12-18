import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api, { getVideoLikeAndWatchHistory } from '../../services/api';

const WatchHistoryTab = ({ currentPage, setCurrentPage, setTotalPages, setTotalItems, itemsPerPage }) => {
  const [watchHistory, setWatchHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch video like and watch history
  const fetchWatchHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('=============== Calling getVideoLikeAndWatchHistory...');
      const isLoggedIn = api.isLoggedIn();
      console.log('=============== Is user logged in:', isLoggedIn);
      const userId = api.getCurrentUserId();
      console.log('=============== Current user ID:', userId);
      
      // 后端使用1-based页码，所以直接传递currentPage参数
      const data = await getVideoLikeAndWatchHistory(currentPage, itemsPerPage);
      console.log('=============== Watch History Data:', data);
      
      if (data && data.data) {
        setWatchHistory(data.data.content || []);
        setTotalPages(data.data.totalPages || 0);
        setTotalItems(data.data.totalElements || 0);
        console.log('=============== Set watchHistory with', data.data.content?.length || 0, 'items');
        console.log('=============== Total Pages:', data.data.totalPages, 'Total Items:', data.data.totalElements);
      } else {
        console.error('=============== Invalid data format:', data);
        setWatchHistory([]);
        setTotalPages(0);
        setTotalItems(0);
      }
    } catch (err) {
      console.error('=============== Failed to fetch watch history:', err);
      console.error('=============== Error details:', err.message, err.response?.data);
      setError('获取观看记录失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchHistory();
  }, [currentPage]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">觀看紀錄</h2>
      
      {isLoading ? (
        <div className="bg-white rounded-lg p-8 text-center text-gray-500 border border-gray-100">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mb-2"></div>
          <p>加载观看记录中...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 rounded-lg p-8 text-center text-red-500 border border-red-100">
          <p>{error}</p>
          <button 
            onClick={fetchWatchHistory}
            className="mt-3 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
          >
            重试
          </button>
        </div>
      ) : watchHistory.length > 0 ? (
        <div className="relative">
          {/* 网格布局容器 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {watchHistory.map((record) => (
              <div key={record.id} className="bg-white border border-gray-100 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="p-4">
                  <Link to={`/video/${record.videoId}`} className="block">
                    <div className="relative w-full h-36 bg-gray-100 overflow-hidden">
                      {record.thumbnailPath ? (
                        <img 
                          src={`/api/uploads/${record.thumbnailPath.includes('uploads/') ? record.thumbnailPath.split('uploads/')[1] : record.thumbnailPath}`} 
                          alt={record.title}
                          className="w-full h-full object-cover transition-transform hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <h3 className="font-bold text-gray-800 mt-2 mb-2 line-clamp-2">{record.title}</h3>
                  </Link>
                  <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
                    <span>观看日期: {new Date(record.watchDate || record.createdAt).toLocaleDateString('zh-CN')}</span>
                  </div>
                  <Link 
                    to={`/video/${record.videoId}`}
                    className="block w-full text-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md transition-colors"
                  >
                    播放视频
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500 border border-gray-100">
          暂无觀看紀錄
        </div>
      )}
    </div>
  );
};

export default WatchHistoryTab;