import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api, { getUserReplies } from '../../services/api';

const RepliesTab = ({ currentPage, setCurrentPage, setTotalPages, setTotalItems, itemsPerPage }) => {
  const [userReplies, setUserReplies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch user replies
  const fetchUserRepliesData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('=============== Calling getUserReplies...');
      const isLoggedIn = api.isLoggedIn();
      console.log('=============== Is user logged in:', isLoggedIn);
      
      // 后端使用1-based页码，所以直接传递currentPage参数
      const data = await getUserReplies(currentPage, itemsPerPage);
      console.log('=============== User Replies Data:', JSON.stringify(data, null, 2));
      
      // 初始化默认值
      let replies = [];
      let totalPages = 0;
      let totalElements = 0;
      
      // 处理新的API数据结构
      if (data && data.code === 200) {
        if (data.data && typeof data.data === 'object') {
          // 结构：{ data: { content: [], totalPages: 0, totalElements: 0 } }
          replies = Array.isArray(data.data.content) ? data.data.content : [];
          totalPages = Number(data.data.totalPages) || 0;
          totalElements = Number(data.data.totalElements) || 0;
        }
      }
      
      // 确保replies是数组
      replies = Array.isArray(replies) ? replies : [];
      
      // 设置状态
      setUserReplies(replies);
      setTotalPages(totalPages);
      setTotalItems(totalElements);
      
      console.log('=============== Fetch Results:');
      console.log('=============== - Replies count:', replies.length);
      console.log('=============== - Total Pages:', totalPages);
      console.log('=============== - Total Elements:', totalElements);
      console.log('=============== - Replies content sample:', JSON.stringify(replies.slice(0, 2), null, 2));
      
    } catch (err) {
      console.error('=============== Failed to fetch user replies:', err);
      console.error('=============== Error message:', err.message);
      console.error('=============== Error response:', err.response?.data);
      setError('获取回复记录失败，请稍后重试');
      setUserReplies([]);
      setTotalPages(0);
      setTotalItems(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserRepliesData();
  }, [currentPage]);

  // 获取回复目标对应的显示名称和链接
  const getReplyTargetInfo = (reply) => {
    // 根据返回的回复数据，有postId字段，说明是帖子回复
    if (reply.postId) {
      return {
        typeName: '帖子回复',
        url: `/post/${reply.postId}#reply-${reply.id}`
      };
    }
    // 如果未来有其他类型的回复，可以在这里扩展
    return {
      typeName: '回复',
      url: '#'
    };
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">我的回复记录</h2>
      
      {isLoading ? (
        <div className="bg-white rounded-lg p-8 text-center text-gray-500 border border-gray-100">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mb-2"></div>
          <p>加载回复记录中...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 rounded-lg p-8 text-center text-red-500 border border-red-100">
          <p>{error}</p>
          <button 
            onClick={fetchUserRepliesData}
            className="mt-3 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
          >
            重试
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {userReplies.length > 0 ? (
            <div className="space-y-4">
              {userReplies.map((reply, index) => {
                const targetInfo = getReplyTargetInfo(reply);
                return (
                  <div key={reply.id || index} className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      <div className="flex-1">
                        <p className="text-gray-800 font-medium mb-2">{reply.content}</p>
                        <div className="text-sm text-gray-500 space-y-1">
                          <p>回复类型: {targetInfo.typeName}</p>
                          <p>发布于: {reply.createdAt ? new Date(reply.createdAt).toLocaleString('zh-CN') : '未知时间'}</p>
                          <p>点赞数: {reply.likeCount || 0}</p>
                          <p className="mt-2">
                            <Link 
                              to={targetInfo.url} 
                              className="text-green-600 hover:text-green-800 hover:underline"
                            >
                              查看原文
                            </Link>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-gray-50 p-8 rounded-lg text-center text-gray-500 border border-gray-100">
              <p>暂无回复记录</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RepliesTab;