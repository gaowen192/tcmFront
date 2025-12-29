import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import api from '../services/api';
import PostModal from '../components/PostModal';

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
        
        // Transform API data to match component expectations
        const formattedPosts = postsData.map(post => {
          // Strip HTML tags and get plain text
          const plainText = stripHtmlTags(post.content);
          // Truncate to 150 characters
          const truncatedContent = plainText.substring(0, 150) + (plainText.length > 150 ? '...' : '');
          
          return {
            id: post.id,
            author: `用户${post.userId}`, // Since we don't have actual author names in API response
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

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
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
                placeholder="搜索帖子..."
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
              搜索
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

     


  


      {/* 加载状态 */}
      {isLoading && (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <p className="mt-2 text-gray-600">加载帖子中...</p>
        </div>
      )}

      {/* 帖子统计 */}
      <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
        <span>共 {totalPosts} 个帖子</span>
        <span>第 {currentPage} / {totalPages} 页</span>
      </div>

      {/* 帖子列表 */}
      <div className="space-y-4">
        {posts.length > 0 ? (
          posts.map((post) => (
            <div key={post.id} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
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
                <Link to={`/post/${post.id}`} className="hover:text-green-600 transition-colors">
                  {post.title}
                </Link>
              </h3>
              <p className="text-gray-600 mb-2">{post.content}</p>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <button 
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center cursor-pointer hover:text-red-500 transition-colors ${likedPosts.has(post.id) ? 'text-red-500' : 'text-gray-500'}`}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill={likedPosts.has(post.id) ? "currentColor" : "none"} xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                      </svg> 
                      {post.likes}
                    </button>
                    <Link to={`/post/${post.id}`} className="flex items-center text-gray-500 hover:text-green-600 transition-colors cursor-pointer">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg> {post.comments}
              </Link>
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
      
      {/* Modals */}
      <PostModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        onSubmit={handleCreatePost}
      />
    </div>
  );
}

export default ForumPage;