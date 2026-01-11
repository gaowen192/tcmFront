import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api, { fetchUserArticles } from '../../services/api';
import ArticleUploadModal from '../ArticleUploadModal';

const ArticlesTab = ({ currentPage, setCurrentPage, setTotalPages, setTotalItems, itemsPerPage }) => {
  const [userArticles, setUserArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);

  // Fetch user articles
  const loadUserArticles = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('=============== Calling fetchUserArticles...');
      const isLoggedIn = api.isLoggedIn();
      console.log('=============== Is user logged in:', isLoggedIn);
      
      // 从localStorage获取当前登录用户ID
      const userId = api.getCurrentUserId();
      console.log('=============== Current User ID:', userId);
      
      if (!userId) {
        throw new Error('User not logged in or missing ID');
      }
      
      // 使用新的fetchUserArticles函数，传递currentPage和userId参数
      const data = await fetchUserArticles({
        page: currentPage,
        pageSize: itemsPerPage,
        userId: userId  // 根据当前登录用户ID获取自己的文章列表
      });
      console.log('=============== User Articles Data:', data);
      
      // 更灵活的数据结构处理 - 根据实际API返回结构调整
      let articles = [];
      let totalPages = 0;
      let totalElements = 0;
      
      if (data && data.code === 200 && data.data) {
        // 结构：{ code: 200, message: "", data: { content: [], totalPages: 0, totalElements: 0 } }
        articles = Array.isArray(data.data.content) ? data.data.content : [];
        totalPages = Number(data.data.totalPages) || 0;
        totalElements = Number(data.data.totalElements) || 0;
      } else if (data && Array.isArray(data.content)) {
        // 兼容旧结构：{ content: [], totalPages: 0, totalElements: 0 }
        articles = data.content;
        totalPages = Number(data.totalPages) || 0;
        totalElements = Number(data.totalElements) || 0;
      } else if (Array.isArray(data)) {
        // 兼容更旧结构：[]
        articles = data;
        totalPages = articles.length > 0 ? 1 : 0;
        totalElements = articles.length;
      } else {
        console.error('=============== Unexpected data type:', typeof data);
      }
      
      // 确保articles是数组
      articles = Array.isArray(articles) ? articles : [];
      
      // 设置状态
      setUserArticles(articles);
      setTotalPages(totalPages);
      setTotalItems(totalElements);
      
      console.log('=============== Fetch Results:');
      console.log('=============== - Articles count:', articles.length);
      console.log('=============== - Total Pages:', totalPages);
      console.log('=============== - Total Elements:', totalElements);
      console.log('=============== - Articles content sample:', JSON.stringify(articles.slice(0, 2), null, 2));
    } catch (err) {
      console.error('=============== Failed to fetch user articles:', err);
      console.error('=============== Error details:', err.message, err.response?.data);
      setError('获取文章记录失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUserArticles();
  }, [currentPage]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">我的文章列表</h2>
      
      {isLoading ? (
        <div className="bg-white rounded-lg p-8 text-center text-gray-500 border border-gray-100">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mb-2"></div>
          <p>加载文章列表中...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 rounded-lg p-8 text-center text-red-500 border border-red-100">
          <p>{error}</p>
          <button 
            onClick={loadUserArticles}
            className="mt-3 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
          >
            重试
          </button>
        </div>
      ) : userArticles.length > 0 ? (
        <div className="space-y-4">
          {userArticles.map((article) => (
            <div key={article.id} className="bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-4">
                <div className="flex flex-col md:flex-row md:items-start space-y-3 md:space-y-0 md:space-x-4">
                  {/* 文章图片 */}
                  {article.coverImage && (
                    <div className="w-full md:w-48 h-32 overflow-hidden rounded-md bg-gray-100 flex-shrink-0">
                      <img 
                        src={`/api${article.coverImage.startsWith('/') ? article.coverImage : '/' + article.coverImage}`} 
                        alt={article.title}
                        className="w-full h-full object-cover transition-transform hover:scale-105"
                      />
                    </div>
                  )}
                  
                  {/* 文章内容 */}
                  <div className="flex-1">
                    <Link to={`/professional-articles/${article.id}`} className="block">
                      <h3 className="text-lg font-semibold text-gray-800 hover:text-green-600 transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                    </Link>
                    
                    <div className="mt-2 text-sm text-gray-600 line-clamp-2">
                      {(() => {
                        // Helper function to strip HTML tags
                        const stripHtmlTags = (html) => {
                          if (!html) return '';
                          const tmp = document.createElement('div');
                          tmp.innerHTML = html;
                          return (tmp.textContent || tmp.innerText || '').replace(/\s+/g, ' ').trim();
                        };

                        // Helper function to strip Markdown syntax
                        const stripMarkdown = (text) => {
                          if (!text) return '';
                          
                          // Remove code blocks (```code```)
                          text = text.replace(/```[\s\S]*?```/g, '');
                          
                          // Remove inline code (`code`)
                          text = text.replace(/`[^`]*`/g, '');
                          
                          // Remove headers (# ## ### etc.)
                          text = text.replace(/^#{1,6}\s+(.*)$/gm, '$1');
                          
                          // Remove bold/italic (**text** or __text__)
                          text = text.replace(/\*\*([^*]+)\*\*/g, '$1');
                          text = text.replace(/__([^_]+)__/g, '$1');
                          text = text.replace(/\*([^*]+)\*/g, '$1');
                          text = text.replace(/_([^_]+)_/g, '$1');
                          
                          // Remove links [text](url)
                          text = text.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');
                          
                          // Remove images ![alt](url)
                          text = text.replace(/!\[([^\]]*)\]\([^\)]+\)/g, '');
                          
                          // Remove list markers (-, *, 1., etc.)
                          text = text.replace(/^[\s]*[-*+]\s+/gm, '');
                          text = text.replace(/^[\s]*\d+\.\s+/gm, '');
                          
                          // Remove blockquotes (>)
                          text = text.replace(/^>\s+/gm, '');
                          
                          // Remove horizontal rules (---, ***)
                          text = text.replace(/^[-*]{3,}$/gm, '');
                          
                          // Remove strikethrough (~~text~~)
                          text = text.replace(/~~([^~]+)~~/g, '$1');
                          
                          // Remove reference-style links [text][ref]
                          text = text.replace(/\[([^\]]+)\]\[[^\]]+\]/g, '$1');
                          
                          // Clean up extra whitespace
                          text = text.replace(/\s+/g, ' ').trim();
                          
                          return text;
                        };

                        // Combined function to strip both HTML and Markdown
                        const stripContent = (content) => {
                          if (!content) return '';
                          
                          // First strip HTML tags if present
                          let text = stripHtmlTags(content);
                          
                          // Then strip Markdown syntax
                          text = stripMarkdown(text);
                          
                          return text;
                        };

                        const cleanContent = stripContent(article.content);
                        return cleanContent.length > 150 ? cleanContent.substring(0, 150) + '...' : cleanContent;
                      })()}
                    </div>
                    
                    <div className="flex justify-between items-center mt-4 text-xs text-gray-500">
                      <div>
                        <span className="mr-4">发布日期: {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('zh-CN') : '-'}</span>
                        <span className="mr-4">阅读量: {article.viewCount || 0}</span>
                        <span>点赞数: {article.likeCount || 0}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link 
                        to={`/professional-articles/${article.id}`}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md transition-colors"
                      >
                        查看详情
                      </Link>
                      <button
                        onClick={() => {
                          setSelectedArticle(article);
                          setIsUploadModalOpen(true);
                        }}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors"
                      >
                        更新
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500 border border-gray-100">
          暂无文章记录
        </div>
      )}

      {/* 更新文章模态框 */}
      <ArticleUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setSelectedArticle(null);
        }}
        onSuccess={(updatedArticle) => {
          // 更新文章列表中的对应文章
          setUserArticles(prevArticles => 
            prevArticles.map(article => 
              article.id === updatedArticle.id ? updatedArticle : article
            )
          );
          setIsUploadModalOpen(false);
          setSelectedArticle(null);
        }}
        article={selectedArticle}
      />
    </div>
  );
};

export default ArticlesTab;