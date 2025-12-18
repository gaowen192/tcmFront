import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api, { saveWatchRecord, likeVideo } from '../services/api';
import RelatedVideosList from '../components/RelatedVideosList';

// Comment list component with pagination
const CommentList = ({ videoId, isLoggedIn, onOpenLoginModal }) => {
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  // New state for comment input
  const [commentContent, setCommentContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch comments from API
  const fetchComments = async (page) => {
    setIsLoading(true);
    try {
      const response = await api.getVideoComments(videoId, page, pageSize);
      console.log('=============== Comments API Response:', response);
      if (response && response.code === 200) {
        setComments(response.data.content || []);
        // Ensure totalPages is properly set
        const totalComments = response.data.totalElements || response.data.total || 0;
        const calculatedTotalPages = Math.max(1, Math.ceil(totalComments / pageSize));
        setTotalPages(response.data.totalPages || calculatedTotalPages);
        setCurrentPage(page);
      }
    } catch (error) {
      console.log('=============== Failed to fetch comments:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (videoId) {
      fetchComments(1);
    }
  }, [videoId, pageSize]);

  // Handle comment submission
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    
    if (!commentContent.trim()) return;
    
    // Check if user is logged in
    if (!isLoggedIn) {
      onOpenLoginModal();
      return;
    }
    
    try {
      setIsSubmitting(true);
      const currentUserId = api.getCurrentUserId();
      
      // Prepare comment data
      const commentData = {
        videoId: parseInt(videoId),
        userId: parseInt(currentUserId),
        content: commentContent.trim(),
        replyToCommentId: 0, // No reply for now
        status: 1 // Active status
      };
      
      // Submit comment
      const response = await api.createVideoComment(commentData);
      
      if (response && response.code === 200) {
        // Clear input field
        setCommentContent('');
        // Refresh comments
        fetchComments(currentPage);
      }
    } catch (error) {
      console.log('=============== Failed to submit comment:', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle page change
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      fetchComments(page);
    }
  };

  // Generate pagination buttons
  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    pages.push(
      <button
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1 || isLoading}
        className="px-3 py-1 mx-1 rounded border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50"
      >
        上一页
      </button>
    );

    // First page button if needed
    if (startPage > 1) {
      pages.push(
        <button
          key="first"
          onClick={() => handlePageChange(1)}
          disabled={isLoading}
          className="px-3 py-1 mx-1 rounded border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(
          <span key="ellipsis1" className="px-3 py-1 mx-1">...</span>
        );
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          disabled={isLoading}
          className={`px-3 py-1 mx-1 rounded border ${currentPage === i ? 'border-green-600 bg-green-50 text-green-600' : 'border-gray-300 bg-white hover:bg-gray-50'} disabled:opacity-50`}
        >
          {i}
        </button>
      );
    }

    // Last page button if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="ellipsis2" className="px-3 py-1 mx-1">...</span>
        );
      }
      pages.push(
        <button
          key="last"
          onClick={() => handlePageChange(totalPages)}
          disabled={isLoading}
          className="px-3 py-1 mx-1 rounded border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          {totalPages}
        </button>
      );
    }

    // Next button
    pages.push(
      <button
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages || isLoading}
        className="px-3 py-1 mx-1 rounded border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50"
      >
        下一页
      </button>
    );

    return pages;
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">视频评论</h3>
      
      {/* Comment Input Form */}
      <div className="bg-white border border-gray-100 rounded-lg p-4 mb-6">
        <form onSubmit={handleCommentSubmit}>
          <div className="mb-3">
            <textarea
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="写下您的评论..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              rows={3}
              disabled={isSubmitting}
            ></textarea>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className={`px-4 py-2 rounded-md font-medium transition-colors ${isSubmitting ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'} text-white`}
              disabled={isSubmitting}
            >
              {isSubmitting ? '发布中...' : '发布评论'}
            </button>
          </div>
        </form>
      </div>
      

      
      {isLoading ? (
        <div className="text-center py-6">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
          <p className="mt-2 text-gray-600">加载评论中...</p>
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-white border border-gray-100 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">用户 {comment.userId || '匿名'}</span>
                <span className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleString('zh-CN')}</span>
              </div>
              <p className="text-gray-700">{comment.content}</p>
              <div className="flex items-center mt-2 text-xs text-gray-500">
                <span className="flex items-center mr-4">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                  {comment.likeCount} 点赞
                </span>
                {comment.replyToCommentId > 0 && (
                  <span>回复评论 #{comment.replyToCommentId}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-lg p-8 text-center">
          <p className="text-gray-500">暂无评论</p>
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-end items-center mt-6 space-x-1">
        {renderPagination()}
      </div>
    </div>
  );
};

const VideoPlaybackPage = ({ isLoggedIn, onOpenLoginModal }) => {
  const { videoId } = useParams();
  const [video, setVideo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  // Update like count when video data changes
  useEffect(() => {
    if (video) {
      setLikeCount(video.likeCount || 0);
    }
  }, [video]);

  // Fetch video details
  useEffect(() => {
    if (videoId) {
      fetchVideoDetails(videoId);
    }
  }, [videoId]);

  const fetchVideoDetails = async (videoId) => {
    setIsLoading(true);
    try {
      // Note: We need to implement this API endpoint in api.js
      const response = await api.getVideoDetails(videoId);
      if (response && response.code === 200) {
        setVideo(response.data);
      }
    } catch (error) {
      console.log('=============== Failed to fetch video details:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle video play event
  const handleVideoPlay = async (videoId) => {
    // Only save watch record if user is logged in
    if (isLoggedIn) {
      try {
        await saveWatchRecord(videoId);
        console.log('=============== Watch record saved successfully');
      } catch (error) {
        console.log('=============== Failed to save watch record:', error.message);
      }
    }
  };

  // Handle like button click
  const handleLike = async () => {
    try {
      // Check if user is logged in
      if (!isLoggedIn) {
        onOpenLoginModal();
        return;
      }

      // Call like video API
      await likeVideo(videoId);
      
      // Update local state
      setIsLiked(true);
      setLikeCount(prevCount => prevCount + 1);
    } catch (error) {
      if (error.code === 401) {
        onOpenLoginModal();
      } else {
        console.error('=============== Failed to like video:', error);
        alert('点赞失败，请稍后重试');
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">视频播放</h1>
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Video Player and Comments */}
        <div className="lg:w-2/3">
          {isLoading ? (
            <div className="bg-gray-100 border border-gray-200 rounded-lg h-80 flex items-center justify-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <p className="ml-2 text-gray-600">加载视频中...</p>
            </div>
          ) : video ? (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="relative pb-[56.25%]"> {/* 16:9 aspect ratio */}
                <video 
                  src={`/api/${video.filePath}`} 
                  className="absolute top-0 left-0 w-full h-full object-contain"
                  controls
                  autoPlay
                  onPlay={() => handleVideoPlay(videoId)}
                ></video>
              </div>
              <div className="p-4">
                <h2 className="text-xl font-bold text-gray-800 mb-2">{video.title}</h2>
                <p className="text-gray-600 mb-4">{video.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>发布于: {new Date(video.createdAt).toLocaleDateString('zh-CN')}</span>
                  <div className="flex items-center space-x-4">
                    <span>播放量: {video.viewCount}</span>
                    <button 
                      onClick={handleLike}
                      className={`flex items-center ${isLiked ? 'text-red-500' : 'text-gray-500'} hover:text-red-500 transition-colors`}
                      aria-label="点赞"
                    >
                      <svg className="w-4 h-4 mr-1" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                      </svg>
                      点赞: {likeCount}
                    </button>
                    <span>评论: {video.commentCount}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
              <p className="text-gray-500">视频不存在或已被删除</p>
            </div>
          )}

          {/* Comments Section */}
          <CommentList videoId={videoId} isLoggedIn={isLoggedIn} onOpenLoginModal={onOpenLoginModal} />
        </div>

        {/* Right: Related Videos */}
        <div className="lg:w-1/3">
          <RelatedVideosList />
        </div>
      </div>
    </div>
  );
};

export default VideoPlaybackPage;