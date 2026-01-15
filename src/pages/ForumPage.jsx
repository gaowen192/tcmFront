import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import api from '../services/api';
import PostModal from '../components/PostModal';
import PostHistoryModal from '../components/PostHistoryModal';
import PostVersionDetailModal from '../components/PostVersionDetailModal';

function ForumPage({ isLoggedIn, onOpenLoginModal }) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('latest');
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  
  // State for modals
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  
  // State to track liked posts
  const [likedPosts, setLikedPosts] = useState(new Set());

  // State for post detail
  const [selectedPost, setSelectedPost] = useState(null);
  const [isPostDetailLoading, setIsPostDetailLoading] = useState(false);
  const [postDetailError, setPostDetailError] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isCommentLoading, setIsCommentLoading] = useState(false);
  const [currentCommentPage, setCurrentCommentPage] = useState(1);
  const [commentsPerPage] = useState(10);
  const [totalComments, setTotalComments] = useState(0);
  // History modal states
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState(null);

  const handleSearch = (e) => {
    e.preventDefault();
    // Reset to first page when searching
    setCurrentPage(1);
    console.log('=============== Searching for:', searchTerm);
  };

  const handleSortChange = (option) => {
    setSortOption(option);
    // Reset to first page when changing sort
    setCurrentPage(1);
    console.log('=============== Sorting by:', option);
  };

  // Fetch forum posts from real API with pagination
  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log('=============== Fetching forum posts from real API...');
      
      let response;
      let postsData;
      let total;
      let totalPages;
      
      // Use search API - only pass keyword parameter
      const keyword = searchTerm || '';
      response = await api.searchPosts(keyword, currentPage - 1, pageSize);
      
      if (response && response.code === 200) {
        postsData = response.data.content || response.data.list;
        total = response.data.totalElements || response.data.total;
        totalPages = response.data.totalPages || response.data.pages;
      }
      
      // Handle API response
      if (postsData) {
        // Helper function to strip HTML tags
        const stripHtmlTags = (html) => {
          if (!html) return '';
          // Create a temporary div element to parse HTML
          const tmp = document.createElement('div');
          tmp.innerHTML = html;
          // Get text content and replace multiple spaces/newlines with single space
          return (tmp.textContent || tmp.innerText || '').replace(/\s+/g, ' ').trim();
        };
        
        // Helper function to strip Markdown formatting
        const stripMarkdown = (text) => {
          if (!text) return '';
          let plainText = text;
          
          // Remove headings
          plainText = plainText.replace(/^#+\s/gm, '');
          
          // Remove bold/italic
          plainText = plainText.replace(/(\*\*|__)(.*?)\1/g, '$2');
          plainText = plainText.replace(/(\*|_)(.*?)\1/g, '$2');
          
          // Remove code blocks and inline code
          plainText = plainText.replace(/```[\s\S]*?```/g, '');
          plainText = plainText.replace(/`(.*?)`/g, '$1');
          
          // Remove blockquotes
          plainText = plainText.replace(/^>\s/gm, '');
          
          // Remove lists
          plainText = plainText.replace(/^(\*|-|\d+\.)\s/gm, '');
          
          // Remove links
          plainText = plainText.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
          
          // Remove images
          plainText = plainText.replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1');
          
          // Replace multiple spaces/newlines with single space
          return plainText.replace(/\s+/g, ' ').trim();
        };
        
        // Transform API data to match component expectations
        const formattedPosts = postsData.map(post => {
          // First strip HTML tags
          let plainText = stripHtmlTags(post.content);
          // Then strip Markdown formatting
          plainText = stripMarkdown(plainText);
          // Truncate to 150 characters
          const truncatedContent = plainText.substring(0, 150) + (plainText.length > 150 ? '...' : '');
          
          return {
            id: post.id,
            author: post.realName || post.userRealName || `用户${post.userId}`, // Use realName if available, fallback to userId
            date: new Date(post.createdAt).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
            replies: post.replyCount,
            title: post.title,
            content: truncatedContent,
            likes: post.likeCount,
            comments: post.replyCount, // Using reply count as comments
            views: post.viewCount,
            tags: post.tags ? post.tags.split(',').map(tag => `#${tag.trim()}`) : []
          };
        });
        
        setPosts(formattedPosts);
        setTotalPages(totalPages);
        setTotalPosts(total);
        
        console.log('=============== Posts fetched successfully:', formattedPosts.length);
        console.log('=============== Total pages:', totalPages);
        console.log('=============== Total posts:', total);
      } else {
        console.log('=============== API returned non-success response:', response?.data?.message || response?.message);
        setPosts([]);
      }
    } catch (error) {
      console.log('=============== Failed to fetch posts:', error.message);
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, sortOption, searchTerm]);

  // Handle post click to show details
  const handlePostClick = async (postId) => {
    setIsPostDetailLoading(true);
    setPostDetailError(null);
    
    try {
      console.log('=============== Fetching post details for postId:', postId);
      const postResponse = await api.get(`/tcm/posts/${postId}`);
      console.log('=============== Post API response data:', postResponse.data);
      
      if (postResponse.data && postResponse.data.code === 200) {
        setSelectedPost(postResponse.data.data);
        // Reset comment page and fetch comments
        setCurrentCommentPage(1);
        await fetchComments(postId, 1);
      } else {
        setPostDetailError(postResponse.data.message || 'Failed to load post details');
      }
    } catch (err) {
      console.error('=============== Failed to fetch post details:', err);
      setPostDetailError('Failed to connect to the server. Please check your network connection and try again later.');
    } finally {
      setIsPostDetailLoading(false);
    }
  };

  // Fetch comments with pagination
  const fetchComments = async (postId, page) => {
    try {
      console.log('=============== Fetching comments for postId:', postId, 'page:', page);
      const commentsResponse = await api.get(`/tcm/replies/post/${postId}`, {
        params: {
          page: page,
          size: commentsPerPage
        }
      });
      console.log('=============== Comments API response data:', commentsResponse.data);
      
      if (commentsResponse.data && commentsResponse.data.code === 200) {
        // Comments are in data.content with pagination info
        // Reverse the comments array to show newest first
        const fetchedComments = commentsResponse.data.data.content || [];
        setComments(fetchedComments.reverse());
        // Update total comments count for pagination
        setTotalComments(commentsResponse.data.data.totalElements || 0);
      } else {
        console.error('=============== Comments API error:', commentsResponse.data.message);
        setComments([]);
        setTotalComments(0);
      }
    } catch (err) {
      console.error('=============== Failed to fetch comments:', err);
      setComments([]);
      setTotalComments(0);
    }
  };

  // Handle comment submission
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim()) {
      alert('Please enter a comment');
      return;
    }

    if (!api.isLoggedIn()) {
      alert('Please login to comment');
      return;
    }

    try {
      setIsCommentLoading(true);
      const userId = api.getCurrentUserId();
      
      console.log('=============== Submitting comment for postId:', selectedPost.id, 'userId:', userId);
      const response = await api.post(`/tcm/replies`, {
        id: 0,
        postId: selectedPost.id,
        userId: userId,
        parentId: 0,
        replyToUserId: 0,
        content: newComment
      });
      
      console.log('=============== Comment API response:', response.data);
      
      if (response.data && response.data.code === 200) {
        // When a new comment is added, reset to page 1 to show the new comment
        setCurrentCommentPage(1);
        // Add new comment to the beginning of the list
        setComments([response.data.data, ...comments]);
        setNewComment('');
        // Update total comments count
        setTotalComments(prev => prev + 1);
        
        console.log('=============== Comment submitted successfully');
      } else {
        console.error('=============== Comment submission error:', response.data.message);
        alert(response.data.message || 'Failed to submit comment. Please try again later.');
      }
    } catch (err) {
      console.error('=============== Failed to submit comment:', err);
      alert('Failed to submit comment. Please try again later.');
    } finally {
      setIsCommentLoading(false);
    }
  };

  // Handle comment deletion
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      console.log('=============== Deleting comment with id:', commentId);
      const response = await api.delete(`/tcm/replies/${commentId}`);
      console.log('=============== Delete comment API response:', response.data);

      if (response.data && response.data.code === 200) {
        // Update comments list to remove deleted comment
        setComments(comments.filter(comment => comment.id !== commentId));
        // Decrement total comments count
        setTotalComments(prev => Math.max(0, prev - 1));
        
        // If we're on a page with no comments left, go to previous page
        if (comments.length === 1 && currentCommentPage > 1) {
          setCurrentCommentPage(prev => prev - 1);
        }
        
        console.log('=============== Comment deleted successfully');
      } else {
        console.error('=============== Delete comment API error:', response.data.message);
        alert(response.data.message || 'Failed to delete comment. Please try again later.');
      }
    } catch (err) {
      console.error('=============== Failed to delete comment:', err);
      alert('Failed to delete comment. Please try again later.');
    }
  };

  // Handle view version
  const handleViewVersion = (version) => {
    setSelectedVersion(version);
    setIsVersionModalOpen(true);
    setIsHistoryModalOpen(false);
  };

  // Handle post creation
  const handleCreatePost = async (postData) => {
    try {
      console.log('=============== Creating post:', postData.title);
      
      // Get userId from localStorage
      const userId = localStorage.getItem('userId');
      if (!userId) {
        alert('请先登录');
        return;
      }
      
      // Prepare post data for API
      const createPostData = {
        title: postData.title,
        content: postData.content,
        tags: postData.tags,
        userId: parseInt(userId),
        categoryId: 1, // Default category, adjust as needed
        status: 1
      };
      
      // Call create post API
      const response = await api.post('/tcm/posts', createPostData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('=============== Create post response:', response.data);
      
      if (response.data && response.data.code === 200) {
        // Close post modal
        setIsPostModalOpen(false);
        
        // Reset to first page and refresh posts to show the new post
        setCurrentPage(1);
        await fetchPosts();
        
        // Show success message
        alert('帖子发布成功！');
      } else {
        throw new Error(response.data?.message || '创建帖子失败');
      }
    } catch (error) {
      console.error('=============== Failed to create post:', error);
      alert(error.response?.data?.message || '创建帖子失败，请稍后重试');
    }
  };

  // Handle post button click - check login status first
  const handlePostButtonClick = () => {
    if (isLoggedIn) {
      // User is logged in, open post modal
      setIsPostModalOpen(true);
      console.log('=============== Opening post modal for logged in user');
    } else {
      // User is not logged in, show login prompt and open login modal
      alert('Please login first to create a post!');
      onOpenLoginModal();
      console.log('=============== User not logged in, opening login modal');
    }
  };
  
  // Handle like/unlike functionality
  const handleLike = async (postId) => {
    // Check if user is logged in
    if (!isLoggedIn) {
      console.log('=============== User not logged in, opening login modal');
      onOpenLoginModal();
      return;
    }
    
    try {
      // Get userId from localStorage
      const userId = localStorage.getItem('userId');
      console.log('=============== Getting userId from localStorage:', userId);
      
      const isCurrentlyLiked = likedPosts.has(postId);
      
      if (isCurrentlyLiked) {
        // Unlike - send DELETE request with userId parameter
        console.log('=============== Sending unlike request for post:', postId, 'with userId:', userId);
        await api.delete(`/tcm/posts/${postId}/like?userId=${userId}`);
        
        // Update liked state
        setLikedPosts(prev => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });
        
        // Update posts list
        setPosts(prevPosts => 
          prevPosts.map(post => 
            post.id === postId ? { ...post, likes: post.likes - 1 } : post
          )
        );
        
        // Update selected post if it's the one being unliked
        if (selectedPost && selectedPost.id === postId) {
          setSelectedPost(prev => ({
            ...prev,
            likeCount: (prev.likeCount || 0) - 1
          }));
        }
        
        console.log('=============== Successfully unliked post:', postId);
      } else {
        // Like - send POST request with userId parameter
        console.log('=============== Sending like request for post:', postId, 'with userId:', userId);
        await api.post(`/tcm/posts/${postId}/like?userId=${userId}`);
        
        // Update liked state
        setLikedPosts(prev => new Set(prev).add(postId));
        
        // Update posts list
        setPosts(prevPosts => 
          prevPosts.map(post => 
            post.id === postId ? { ...post, likes: post.likes + 1 } : post
          )
        );
        
        // Update selected post if it's the one being liked
        if (selectedPost && selectedPost.id === postId) {
          setSelectedPost(prev => ({
            ...prev,
            likeCount: (prev.likeCount || 0) + 1
          }));
        }
        
        console.log('=============== Successfully liked post:', postId);
      }
    } catch (error) {
      console.error('=============== Like operation failed:', error.message);
      alert('操作失败，请稍后重试');
    }
  };

  // Fetch posts when dependencies change
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Fetch comments when currentCommentPage changes
  useEffect(() => {
    if (selectedPost) {
      fetchComments(selectedPost.id, currentCommentPage);
    }
  }, [currentCommentPage, selectedPost]);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">{t('app.nav.forum')}</h1>
       <p className="text-gray-600 mb-4">
          这是智慧中医社群論壇，在这里您可以与其他用户交流中医知识、分享经验和提问。
        </p>
      {/* 搜索和排序区域 */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* 搜索框 */}
          <form onSubmit={handleSearch} className="flex items-center w-full md:flex-1">
            <div className="relative w-full">
              <input
                type="text"
                placeholder={t('home.tcm.searchPosts')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent w-full"
              />
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            <button
              type="submit"
              className="ml-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap"
            >
              {t('home.tcm.search')}
            </button>
          </form>

          {/* 右侧按钮组 */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-center md:justify-end">
            {/* 发布按钮 */}
            <button 
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 whitespace-nowrap"
              onClick={handlePostButtonClick}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              发布新帖子
            </button>

            {/* 排序选项 */}
            <div className="flex items-center space-x-2 whitespace-nowrap">
              <span className="text-sm text-gray-600">排序：</span>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${sortOption === 'latest' ? 'bg-white text-green-800 shadow-sm' : 'text-gray-600 hover:text-green-800'}`}
                  onClick={() => handleSortChange('latest')}
                >
                  最新
                </button>
                <button
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${sortOption === 'popular' ? 'bg-white text-green-800 shadow-sm' : 'text-gray-600 hover:text-green-800'}`}
                  onClick={() => handleSortChange('popular')}
                >
                  最热
                </button>
                <button
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${sortOption === 'mostReplies' ? 'bg-white text-green-800 shadow-sm' : 'text-gray-600 hover:text-green-800'}`}
                  onClick={() => handleSortChange('mostReplies')}
                >
                  最多回复
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 左右布局结构 */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* 左侧帖子列表 */}
        <div className="w-full lg:w-1/3">
          {/* 帖子统计 */}
          <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
            <span>共 {totalPosts} 个帖子</span>
            <span>第 {currentPage} / {totalPages} 页</span>
          </div>

          {/* 帖子列表 */}
          <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
            {isLoading ? (
              <div className="text-center py-10">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                <p className="mt-2 text-gray-600">加载帖子中...</p>
              </div>
            ) : posts.length > 0 ? (
              posts.map((post) => (
                <div 
                  key={post.id} 
                  className={`bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer ${selectedPost?.id === post.id ? 'ring-2 ring-green-500' : ''}`}
                  onClick={() => handlePostClick(post.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-300 rounded-full mr-3"></div>
                      <div>
                        <p className="font-medium text-gray-800">{post.author}</p>
                        <p className="text-sm text-gray-500">{post.date}</p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">回复: {post.replies}</div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 mb-2 line-clamp-2">{post.content}</p>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLike(post.id);
                          }}
                          className={`flex items-center cursor-pointer hover:text-red-500 transition-colors ${likedPosts.has(post.id) ? 'text-red-500' : 'text-gray-500'}`}
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill={likedPosts.has(post.id) ? "currentColor" : "none"} xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                          </svg> 
                          {post.likes}
                        </button>
                        <span className="flex items-center">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg> {post.comments}
                        </span>
                        <span className="flex items-center">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg> {post.views}
                        </span>
                      </div>
                    <div className="flex items-center space-x-2">
                      {post.tags && post.tags.length > 0 ? (
                        typeof post.tags === 'string' ? (
                          post.tags.split(',').map((tag, index) => (
                            <span key={index} className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">{tag.trim()}</span>
                          ))
                        ) : post.tags.map((tag, index) => (
                          <span key={index} className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">{tag}</span>
                        ))
                      ) : (
                        <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">#中医</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-lg shadow-md p-10 text-center">
                <p className="text-gray-500">暂无帖子</p>
              </div>
            )}
          </div>

          {/* 分页控件 */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <nav aria-label="Page navigation">
                <ul className="flex items-center space-x-1">
                  <li>
                    <button
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      上一页
                    </button>
                  </li>
                  
                  {/* 页码按钮，最多显示5个页码 */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNumber;
                    if (totalPages <= 5) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i;
                    } else {
                      pageNumber = currentPage - 2 + i;
                    }
                    
                    return (
                      <li key={pageNumber}>
                        <button
                          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${currentPage === pageNumber ? 'bg-green-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                          onClick={() => setCurrentPage(pageNumber)}
                        >
                          {pageNumber}
                        </button>
                      </li>
                    );
                  })}
                  
                  {/* 省略号 */}
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <li className="px-3 py-1 text-gray-400">...</li>
                  )}
                  
                  <li>
                    <button
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      下一页
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </div>

        {/* 右侧帖子详情 */}
        <div className="w-full lg:w-2/3">
          <div className="bg-white rounded-lg shadow-md p-6 min-h-[calc(100vh-300px)]">
            {isPostDetailLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-green-600">Loading...</div>
              </div>
            ) : postDetailError ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-6">
                {postDetailError}
              </div>
            ) : !selectedPost ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4 opacity-50">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                <h3 className="text-xl font-semibold">选择一个帖子查看详情</h3>
                <p className="mt-2 text-center max-w-md">从左侧列表中选择一个帖子，查看详细内容和评论</p>
              </div>
            ) : (
              <div>
                {/* Post details */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">
                      {selectedPost.title}
                      {selectedPost.isUpdated === 1 && (
                        <span className="ml-3 text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">已修改</span>
                      )}
                    </h2>
                    {selectedPost.isUpdated === 1 && (
                      <button
                        onClick={() => setIsHistoryModalOpen(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-all flex items-center gap-2 text-sm"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                        </svg>
                        查看修改历史
                      </button>
                    )}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-500 mb-6">
                    <div className="flex items-center mr-4">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                      {new Date(selectedPost.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center mr-4">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                      {selectedPost.realName || selectedPost.userRealName || `用户${selectedPost.userId}`}
                    </div>
                    <div className="flex items-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                      {comments.length} comments
                    </div>
                  </div>

                  <div className="prose max-w-none text-gray-700">
                    <style>{`
                      .post-content-html {
                        line-height: 1.8;
                      }
                      .post-content-html p {
                        margin-bottom: 1rem;
                      }
                      .post-content-html p:last-child {
                        margin-bottom: 0;
                      }
                      .post-content-html h1, .post-content-html h2, .post-content-html h3,
                      .post-content-html h4, .post-content-html h5, .post-content-html h6 {
                        margin-top: 1.5rem;
                        margin-bottom: 1rem;
                        font-weight: bold;
                      }
                      .post-content-html ul, .post-content-html ol {
                        margin: 1rem 0;
                        padding-left: 2rem;
                      }
                      .post-content-html li {
                        margin: 0.5rem 0;
                      }
                      .post-content-html img {
                        max-width: 100%;
                        height: auto;
                        margin: 1rem 0;
                      }
                      .post-content-html a {
                        color: #059669;
                        text-decoration: underline;
                      }
                      .post-content-html a:hover {
                        color: #047857;
                      }
                      .post-content-html code {
                        background-color: #f3f4f6;
                        padding: 0.2rem 0.4rem;
                        border-radius: 0.25rem;
                        font-family: monospace;
                      }
                      .post-content-html pre {
                        background-color: #f3f4f6;
                        padding: 1rem;
                        border-radius: 0.5rem;
                        overflow-x: auto;
                        margin: 1rem 0;
                      }
                      .post-content-html blockquote {
                        border-left: 4px solid #059669;
                        padding-left: 1rem;
                        margin: 1rem 0;
                        font-style: italic;
                        color: #6b7280;
                      }
                    `}</style>
                    {selectedPost.content ? (() => {
                      // Check if content already contains HTML tags
                      const hasHtml = /<[^>]+>/.test(selectedPost.content);
                      
                      if (hasHtml) {
                        // If content contains HTML, render it directly
                        return (
                          <div 
                            className="post-content-html"
                            dangerouslySetInnerHTML={{ __html: selectedPost.content }}
                          />
                        );
                      } else {
                        // Render Markdown content
                        return <ReactMarkdown>{selectedPost.content}</ReactMarkdown>;
                      }
                    })() : (
                      <p className="text-gray-500">暂无内容</p>
                    )}
                  </div>

                  {/* Post tags */}
                  {selectedPost.tags && selectedPost.tags.length > 0 && (
                    <div className="mt-6 flex flex-wrap gap-2">
                      {typeof selectedPost.tags === 'string' ? (
                        selectedPost.tags.split(',').map((tag, index) => (
                          <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                            {tag.trim()}
                          </span>
                        ))
                      ) : selectedPost.tags.map((tag, index) => (
                        <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Comments section */}
                <div className="border-t border-gray-200 pt-8">
                  <h3 className="text-xl font-bold text-gray-800 mb-6">Comments ({comments.length})</h3>

                  {/* Comment input form */}
                  <div className="mb-8">
                    <h4 className="text-lg font-semibold text-gray-700 mb-3">Leave a Comment</h4>
                    <form onSubmit={handleCommentSubmit}>
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write your comment..."
                        className="w-full px-4 py-3 border border-green-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white shadow-sm mb-4"
                        rows={4}
                      ></textarea>
                      {!api.isLoggedIn() && (
                        <p className="text-sm text-gray-500 mb-4">You need to be logged in to comment.</p>
                      )}
                      <button
                        type="submit"
                        className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-all shadow-sm flex items-center gap-2"
                        disabled={!newComment.trim() || isCommentLoading}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>
                        Submit Comment
                      </button>
                    </form>
                  </div>

                  {/* Comments list */}
                  <div className="space-y-6">
                    {comments.length === 0 ? (
                      <p className="text-gray-500">No comments yet. Be the first to comment!</p>
                    ) : (
                      comments.map((comment) => (
                        <div key={comment.id} id={`comment-${comment.id}`} className="border-b border-gray-200 pb-4 last:border-b-0">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                              {comment.avatar ? (
                                <img 
                                  src={comment.avatar}
                                  alt={comment.realName || comment.userRealName || comment.author || `用户${comment.userId}`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.parentNode.replaceChild(
                                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                        <span className="text-gray-500 text-xs">👤</span>
                                      </div>,
                                      e.target
                                    );
                                  }}
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                  <span className="text-gray-500 text-xs">👤</span>
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-semibold text-gray-700">{comment.realName || comment.userRealName || comment.author || `用户${comment.userId}`}</span>
                                <div className="flex items-center gap-3">
                                  <span className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                  {api.getCurrentUserId() && comment.userId === parseInt(api.getCurrentUserId()) && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteComment(comment.id);
                                      }}
                                      className="bg-red-100 hover:bg-red-200 text-red-700 text-xs px-3 py-1 rounded-md transition-all border border-red-200 flex items-center gap-1"
                                    >
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="3 6 5 6 21 6"></polyline>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                        <line x1="10" y1="11" x2="10" y2="17"></line>
                                        <line x1="14" y1="11" x2="14" y2="17"></line>
                                      </svg>
                                      Delete
                                    </button>
                                  )}
                                </div>
                              </div>
                              <p className="text-gray-600">{comment.content}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Pagination controls */}
                  {totalComments > commentsPerPage && (
                    <div className="mt-8 flex justify-center">
                      <nav className="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
                        <button
                          onClick={() => setCurrentCommentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentCommentPage === 1}
                          className="bg-gray-50 hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-md transition-all border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6"></polyline>
                          </svg>
                          Previous
                        </button>
                        <span className="px-4 py-2 text-gray-700 font-medium bg-white rounded-md">
                          Page {currentCommentPage} of {Math.ceil(totalComments / commentsPerPage)}
                        </span>
                        <button
                          onClick={() => setCurrentCommentPage(prev => Math.min(prev + 1, Math.ceil(totalComments / commentsPerPage)))}
                          disabled={currentCommentPage * commentsPerPage >= totalComments}
                          className="bg-gray-50 hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-md transition-all border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                        >
                          Next
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6"></polyline>
                          </svg>
                        </button>
                      </nav>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Modals */}
      <PostModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        onSubmit={handleCreatePost}
      />

      {/* Post history modal */}
      <PostHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        postId={selectedPost?.id}
        onViewVersion={handleViewVersion}
      />

      {/* Post version detail modal */}
      <PostVersionDetailModal
        isOpen={isVersionModalOpen}
        onClose={() => setIsVersionModalOpen(false)}
        postId={selectedPost?.id}
        version={selectedVersion}
      />
    </div>
  );
}

export default ForumPage;