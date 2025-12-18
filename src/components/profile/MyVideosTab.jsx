import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const MyVideosTab = ({ currentPage, setCurrentPage, setTotalPages, setTotalItems, itemsPerPage }) => {
  const [userVideos, setUserVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState(null);

  // Fetch user uploaded videos
  const fetchUserVideos = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('=============== Calling getUserVideos...');
      const isLoggedIn = api.isLoggedIn();
      console.log('=============== Is user logged in:', isLoggedIn);
      
      if (!isLoggedIn) {
        console.error('=============== User not logged in');
        setError('请先登录');
        setUserVideos([]);
        setTotalPages(0);
        setTotalItems(0);
        return;
      }
      
      // 使用1-based页码调用API
      const response = await api.getUserVideos(currentPage, itemsPerPage);
      console.log('=============== User Videos Data:', response);
      
      if (response && response.data) {
        // 适配API实际返回的数据结构
        const videos = response.data.content || response.data.videos || [];
        setUserVideos(videos);
        setTotalPages(response.data.totalPages || 0);
        setTotalItems(response.data.totalElements || 0);
        console.log('=============== Set userVideos with', videos.length, 'items');
        console.log('=============== Total Pages:', response.data.totalPages, 'Total Items:', response.data.totalElements);
      } else {
        console.error('=============== Invalid data format:', response);
        setUserVideos([]);
        setTotalPages(0);
        setTotalItems(0);
      }
    } catch (err) {
      console.error('=============== Failed to fetch user videos:', err);
      console.error('=============== Error details:', err.message, err.response?.data);
      setError('获取上传视频记录失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserVideos();
  }, [currentPage]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">我的上传视频列表</h2>
      
      {isLoading ? (
        <div className="bg-white rounded-lg p-8 text-center text-gray-500 border border-gray-100">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mb-2"></div>
          <p>加载上传视频列表中...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 rounded-lg p-8 text-center text-red-500 border border-red-100">
          <p>{error}</p>
          <button 
            onClick={fetchUserVideos}
            className="mt-3 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
          >
            重试
          </button>
        </div>
      ) : userVideos.length > 0 ? (
        <div className="relative">
          {/* 网格布局容器 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {userVideos.map((video) => (
              <div key={video.id} className="bg-white border border-gray-100 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="p-4">
                  <Link to={`/video/${video.id}`} className="block">
                    <div className="relative w-full h-36 bg-gray-100 overflow-hidden">
                      {video.thumbnailPath ? (
                        <img 
                          src={`/api/uploads/${video.thumbnailPath.includes('uploads/') ? video.thumbnailPath.split('uploads/')[1] : video.thumbnailPath}`} 
                          alt={video.title}
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
                    <h3 className="font-bold text-gray-800 mt-2 mb-2 line-clamp-2">{video.title}</h3>
                  </Link>
                  <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
                    <span>上传日期: {new Date(video.createdAt).toLocaleDateString('zh-CN')}</span>
                  </div>
                  <div className="flex gap-2">
                    <Link 
                      to={`/video/${video.id}`}
                      className="flex-1 text-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md transition-colors"
                    >
                      播放视频
                    </Link>
                    <button
                      onClick={() => {
                        setSelectedVideoId(video.id);
                        setIsDeleteModalOpen(true);
                      }}
                      className="flex-1 text-center px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-md transition-colors"
                    >
                      删除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500 border border-gray-100">
          暂无上传视频记录
        </div>
      )}

      {/* 删除确认模态框 */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">确认删除</h3>
              <p className="text-gray-600 mb-6">您确定要删除这个视频吗？此操作不可恢复。</p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={async () => {
                    try {
                      setIsLoading(true);
                      await api.deleteVideo(selectedVideoId);
                      // 刷新视频列表
                      fetchUserVideos();
                      setIsDeleteModalOpen(false);
                    } catch (err) {
                      console.error('=============== Delete video failed:', err);
                      setError(err.message || '删除视频失败');
                      setIsDeleteModalOpen(false);
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
                >
                  确认删除
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyVideosTab;