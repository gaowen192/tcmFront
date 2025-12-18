import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { fetchArticles, likeArticle } from '../services/api';

const ProfessionalArticlesPage = () => {
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [searchTitle, setSearchTitle] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [likedArticles, setLikedArticles] = useState({}); // Track liked status for each article
  const [likingArticles, setLikingArticles] = useState({}); // Track liking status for each article

  // Removed debounce functions as automatic search is disabled

  // Handle search input change
  const handleSearchInputChange = (e) => {
    setSearchTitle(e.target.value);
    // Don't call debouncedSearch directly here - use useEffect instead
  };

  // Handle search form submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    setIsSearching(true);
    loadArticles();
  };

  // Fetch articles from API
  const loadArticles = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {
        page: currentPage,
        pageSize: pageSize,
        title: searchTitle
      };
      const response = await fetchArticles(params);
      if (response && response.code === 200) {
        setArticles(response.data.articles);
        setTotalPages(response.data.totalPages);
        setTotalElements(response.data.totalElements);
      } else {
        setError('Failed to fetch articles: ' + response.message);
      }
    } catch (err) {
      console.error("=============== Error loading articles:", err);
      setError('Failed to connect to the server. Please check your network connection and try again later.');
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  };

  // Removed automatic search functionality - search only on button click or Enter

  // Handle like article
  const handleLike = async (articleId) => {
    // Check if already liking
    if (likingArticles[articleId]) {
      return;
    }

    try {
      setLikingArticles(prev => ({ ...prev, [articleId]: true }));
      
      // Call the likeArticle API
      const response = await likeArticle(articleId);
      
      if (response && response.code === 200) {
        // Update articles list with new like count
        setArticles(prevArticles => 
          prevArticles.map(article => 
            article.id === articleId 
              ? { ...article, likeCount: likedArticles[articleId] ? article.likeCount - 1 : article.likeCount + 1 }
              : article
          )
        );
        
        // Toggle liked status
        setLikedArticles(prev => ({
          ...prev,
          [articleId]: !prev[articleId]
        }));
      } else {
        console.error("=============== Failed to like article:", response.message);
        // You might want to show an error message to the user here
      }
    } catch (error) {
      console.error("=============== Error liking article:", error);
      // You might want to show an error message to the user here
    } finally {
      setLikingArticles(prev => ({ ...prev, [articleId]: false }));
    }
  };

  // Load articles when dependencies change (except searchTitle - search only on button click or Enter)
  useEffect(() => {
    loadArticles();
  }, [currentPage, pageSize]);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  return (
    <div className="container mx-auto max-w-5xl p-4">
      <h1 className="text-3xl font-bold mb-4 text-green-800">专业文章</h1>
      
      {/* Search Bar */}
      <div className="mb-6">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="搜索文章标题..."
              value={searchTitle}
              onChange={handleSearchInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 animate-spin">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
            )}
          </div>
          <button
            type="submit"
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            搜索
          </button>
        </form>
      </div>

      {/* Articles List */}
      {isLoading ? (
        /* Skeleton loading */
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <div className="md:flex">
                <div className="md:w-1/4 bg-gray-200 animate-pulse">
                  <div className="w-full h-48"></div>
                </div>
                <div className="p-4 md:w-3/4">
                  <div className="h-6 bg-gray-200 rounded animate-pulse mb-3 w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-full"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-full"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-4 w-2/3"></div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-5 bg-gray-200 rounded animate-pulse w-16"></div>
                    ))}
                  </div>
                  <div className="flex justify-between">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                    <div className="flex gap-4">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-4 bg-gray-200 rounded animate-pulse w-12"></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        /* Error state */
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-4 text-center">
          <div className="text-red-600 text-4xl mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-red-800 mb-2">获取文章失败</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => loadArticles()} 
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            重试
          </button>
        </div>
      ) : articles.length === 0 ? (
        /* Empty state */
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <div className="text-gray-400 text-4xl mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">没有找到文章</h3>
          <p className="text-gray-600 mb-4">
            {searchTitle ? `没有找到与"${searchTitle}"相关的文章` : "目前还没有发布任何文章"}
          </p>
          {searchTitle && (
            <button 
              onClick={() => {
                setSearchTitle('');
                setCurrentPage(1);
                loadArticles();
              }} 
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              清除搜索
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {articles.map((article) => (
            <div key={article.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="md:flex">
                {/* Cover Image */}
                {article.coverImage && (
                  <div className="md:w-1/4">
                    <Link to={`/professional-articles/${article.id}`}>
                      <img
                      src={`/api/uploads/${article.coverImage.includes('uploads/') ? article.coverImage.split('uploads/')[1] : article.coverImage}`} 
                      alt={article.title}
                        className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105 cursor-pointer"
                        loading="lazy"
                      />
                    </Link>
                  </div>
                )}
                
                {/* Article Content */}
                <div className={`p-4 ${article.coverImage ? 'md:w-3/4' : 'w-full'}`}>
                  <Link to={`/professional-articles/${article.id}`} className="block">
                    <h3 className="text-xl font-semibold mb-2 text-green-800 hover:text-green-600 transition-colors">{article.title}</h3>
                  </Link>
                  <p className="text-gray-600 mb-3 line-clamp-2">{article.content}</p>
                  
                  {/* Tags */}
                  {article.tags && (
                    <div className="mb-3 flex flex-wrap gap-2">
                      {article.tags.split(',').map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {/* Meta Info */}
                  <div className="flex flex-wrap justify-between items-center text-sm text-gray-500">
                    <div>发布日期: {formatDate(article.publishedAt)}</div>
                    <div className="flex gap-4">
                      <span>浏览: {article.viewCount}</span>
                      <span>
                      
                        <button 
                          onClick={() => handleLike(article.id)}
                          disabled={likingArticles[article.id]}
                          className={`ml-1 flex items-center gap-1 ${likedArticles[article.id] ? 'text-green-600 font-semibold' : 'text-gray-500 hover:text-green-600'}`}
                        >
                          {article.likeCount}
                          {likingArticles[article.id] ? (
                            <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill={likedArticles[article.id] ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                            </svg>
                          )}
                        </button>
                      </span>
                      <span>评论: {article.commentCount}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-600">
            共 {totalElements} 篇文章，第 {currentPage} / {totalPages} 页
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              上一页
            </button>
            
            {/* Page Numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page => 
                page === 1 || 
                page === totalPages || 
                (page >= currentPage - 2 && page <= currentPage + 2)
              )
              .map((page, index, arr) => (
                <>
                  {index > 0 && arr[index - 1] !== page - 1 && (
                    <span className="px-4 py-2 border rounded-lg">...</span>
                  )}
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 border rounded-lg ${currentPage === page ? 'bg-green-600 text-white' : ''}`}
                  >
                    {page}
                  </button>
                </>
              ))}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              下一页
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfessionalArticlesPage;