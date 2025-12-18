import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api, { getUserVideoComments } from '../../services/api';

const VideoCommentsTab = ({ currentPage, setCurrentPage, setTotalPages, setTotalItems, itemsPerPage }) => {
  console.log('=============== VideoCommentsTab Component Rendered');
  console.log('=============== VideoCommentsTab Props:', { currentPage, itemsPerPage });
  
  const [userComments, setUserComments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch user comments
  const fetchUserComments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('=============== Calling getUserVideoComments...');
      const isLoggedIn = api.isLoggedIn();
      console.log('=============== Is user logged in:', isLoggedIn);
      
      // 后端使用1-based页码，所以直接传递currentPage参数
      const data = await getUserVideoComments(currentPage, itemsPerPage);
      console.log('=============== User Comments Data:', data);
      
      // Check data structure
      if (data && data.data) {
        // Check if content exists
        if (data.data.content) {
          console.log('=============== Raw comments data:', data.data.content);
          console.log('=============== Number of comments returned:', data.data.content.length);
          
          // Log comment types to debug filtering
          const commentTypes = data.data.content.map(comment => comment.commentType);
          console.log('=============== Comment types found:', commentTypes);
          
          // Log all comments for debugging
          console.log('=============== All comments received:', data.data.content);
          
          // For debugging: show all comments without filtering
        const videoComments = data.data.content;
        console.log('=============== Number of comments to show:', videoComments.length);
        
        // Show all comments for debugging
        const commentsToShow = videoComments;
          
          setUserComments(commentsToShow);
          setTotalPages(data.data.totalPages || 0);
          setTotalItems(data.data.totalElements || 0);
          console.log('=============== Set userComments with', commentsToShow.length, 'comments');
          console.log('=============== Total Pages:', data.data.totalPages, 'Total Items:', data.data.totalElements);
        } else {
          console.error('=============== No content in response:', data.data);
          setUserComments([]);
          setTotalPages(0);
          setTotalItems(0);
        }
      } else {
        console.error('=============== Invalid data format:', data);
        setUserComments([]);
        setTotalPages(0);
        setTotalItems(0);
      }
    } catch (err) {
      console.error('=============== Failed to fetch user comments:', err);
      console.error('=============== Error details:', err.message, err.response?.data);
      setError('获取评论记录失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserComments();
  }, [currentPage]);

  // Get video target info with error handling
  const getVideoTargetInfo = (comment) => {
    console.log('=============== Processing comment for target info:', comment.id, 'Has videoId:', !!comment.videoId);
    return {
      typeName: comment.videoId ? '视频' : '内容',
      url: comment.videoId ? `/video/${comment.videoId}` : '#'
    };
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">我的视频评论记录</h2>

      
      {isLoading ? (
        <div className="bg-white rounded-lg p-8 text-center text-gray-500 border border-gray-100">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mb-2"></div>
          <p>加载评论记录中...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 rounded-lg p-8 text-center text-red-500 border border-red-100">
          <p>{error}</p>
          <button 
            onClick={fetchUserComments}
            className="mt-3 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
          >
            重试
          </button>
        </div>
      ) : userComments.length > 0 ? (
        <div className="space-y-4">
          {userComments.map((comment) => {
            const videoInfo = getVideoTargetInfo(comment);
            return (
              <div key={comment.id} className="bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="p-4">
                  {/* 评论内容 */}
                  <div className="text-gray-700 mb-3">
                    {comment.content}
                  </div>
                  
                  {/* 评论对象信息 */}
                  <div className="bg-gray-50 p-3 rounded-md">
                    <div className="flex items-center text-sm">
                      <span className="text-gray-500 mr-2">评论于</span>
                      <Link 
                        to={videoInfo.url}
                        className="text-green-600 hover:text-green-700 font-medium"
                      >
                        {videoInfo.typeName}
                      </Link>
                      <span className="text-gray-500 mx-2">•</span>
                      <span className="text-gray-500">
                        {new Date(comment.createdAt).toLocaleString('zh-CN')}
                      </span>
                    </div>
                    
                    {/* 目标内容预览 */}
                    {comment.targetTitle && (
                      <div className="mt-2 text-xs text-gray-600">
                        <span className="text-gray-500 mr-1">视频标题:</span>
                        <Link 
                          to={videoInfo.url}
                          className="hover:text-green-600 line-clamp-1"
                        >
                          {comment.targetTitle}
                        </Link>
                      </div>
                    )}
                  </div>
                  
                  {/* 操作按钮 */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link 
                      to={videoInfo.url}
                      className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md transition-colors"
                    >
                      查看详情
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500 border border-gray-100">
          暂无评论记录
        </div>
      )}
    </div>
  );
};

export default VideoCommentsTab;