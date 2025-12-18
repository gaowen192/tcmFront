import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getComments, addComment } from '../services/api';

const CommentComponent = ({ articleId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [commentsPerPage] = useState(3);
  const [totalComments, setTotalComments] = useState(0);

  // 格式化日期
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 获取当前页的评论
  const getCurrentComments = () => {
    const indexOfLastComment = currentPage * commentsPerPage;
    const indexOfFirstComment = indexOfLastComment - commentsPerPage;
    return comments.slice(indexOfFirstComment, indexOfLastComment);
  };

  // 处理页码变化
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // 渲染分页按钮
  const renderPagination = () => {
    const totalPages = Math.ceil(totalComments / commentsPerPage);
    const pageNumbers = [];

    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex justify-center mt-8">
        <nav aria-label="评论分页">
          <ul className="flex space-x-1">
            {pageNumbers.map(number => (
              <li key={number}>
                <button
                  onClick={() => handlePageChange(number)}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${currentPage === number ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  {number}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    );
  };

  // 处理评论提交
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      // 使用真实API调用提交评论
      await addComment(articleId, newComment);
      
      // 清空输入框
      setNewComment('');
      setCurrentPage(1); // 提交新评论后回到第一页
      
      // 重新加载评论列表，确保与服务器数据一致
      await loadComments();
    } catch (error) {
      console.error("=============== 评论提交失败:", error);
      alert("评论提交失败，请稍后重试");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 加载评论数据
  const loadComments = async () => {
    setIsLoading(true);
    try {
      // 使用真实API调用获取评论
      const response = await getComments(articleId, currentPage, commentsPerPage);
      console.log("=============== 评论数据:", response);
      // 根据API返回的实际格式提取数据
      setComments(response.data.comments || []);
      setTotalComments(response.data.total || 0);
    } catch (error) {
      console.error("=============== 加载评论失败:", error);
      // 加载失败时使用空数组
      setComments([]);
      setTotalComments(0);
    } finally {
      setIsLoading(false);
    }
  };

  // 初始化评论数据
  useEffect(() => {
    loadComments();
  }, [articleId, currentPage, commentsPerPage]);

  return (
    <div className="mt-12 bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-6 text-gray-800">评论 ({totalComments})</h3>
      
      {/* 评论提交表单 */}
      <div className="mb-8">
        <h4 className="text-lg font-medium mb-3 text-gray-700">发表评论</h4>
        <form onSubmit={handleSubmitComment} className="space-y-4">
          <div>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="分享您的看法..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              disabled={isSubmitting}
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors duration-200 font-medium"
              disabled={isSubmitting || !newComment.trim()}
            >
              {isSubmitting ? '提交中...' : '提交评论'}
            </button>
          </div>
        </form>
      </div>
      
      {/* 评论列表 */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="text-gray-500">加载评论中...</div>
          </div>
        ) : comments.length > 0 ? (
          comments.map(comment => (
            <div key={comment.id} className="border-b border-gray-200 pb-4">
              <div className="flex items-start gap-4">
                <Link to={`/profile/${comment.userId}`} className="flex-shrink-0">
                  {comment.avatar ? (
                    <img
                      src={comment.avatar}
                      alt={comment.userName}
                      className="w-10 h-10 rounded-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.parentNode.replaceChild(
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500">👤</span>
                          </div>,
                          e.target
                        );
                      }}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500">👤</span>
                    </div>
                  )}
                </Link>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <Link to={`/profile/${comment.userId}`} className="font-medium text-gray-800 hover:text-green-500">
                      {comment.userName}
                    </Link>
                    <span className="text-sm text-gray-500">{formatDate(comment.createdAt)}</span>
                  </div>
                  <p className="text-gray-700">{comment.content}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            暂无评论，快来发表您的看法吧！
          </div>
        )}
      </div>
      
      {/* 分页 */}
      {totalComments > commentsPerPage && renderPagination()}
    </div>
  );
};

export default CommentComponent;