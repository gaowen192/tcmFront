import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { fetchArticleDetail, likeArticle } from '../services/api';
import ArticleCommentComponent from '../components/ArticleCommentComponent';

const ArticleDetailPage = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  // Fetch article detail from API
  const loadArticleDetail = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchArticleDetail(id);
      if (response && response.code === 200) {
        setArticle(response.data);
        setLikeCount(response.data.likeCount || 0);
        // Assuming we'd have a liked status from API, using false as default for now
        setIsLiked(false);
      } else {
        setError('Failed to fetch article detail: ' + response.message);
      }
    } catch (err) {
      console.error("=============== Error loading article detail:", err);
      setError('Failed to connect to the server. Please check your network connection and try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle article like
  const handleLike = async () => {
    if (!article || isLiking) return;

    setIsLiking(true);
    try {
      const response = await likeArticle(article.id);
      if (response && response.code === 200) {
        setIsLiked(!isLiked);
        setLikeCount(prevCount => isLiked ? prevCount - 1 : prevCount + 1);
      } else {
        console.error("=============== Like article failed:", response.message);
        // Could show an error toast here
      }
    } catch (err) {
      console.error("=============== Error liking article:", err);
      // Could show an error toast here
    } finally {
      setIsLiking(false);
    }
  };

  // Load article detail when component mounts
  useEffect(() => {
    if (id) {
      loadArticleDetail();
    }
  }, [id]);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      {/* Back button */}
      <div className="mb-6">
        <Link 
          to="/professional-articles" 
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          返回文章列表
        </Link>
      </div>

      {/* Article Detail */}
      {isLoading ? (
        /* Skeleton loading */
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="h-8 bg-gray-200 rounded animate-pulse mb-4 w-3/4"></div>
          <div className="flex flex-wrap gap-2 mb-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-6 bg-gray-200 rounded animate-pulse w-20"></div>
            ))}
          </div>
          <div className="h-4 bg-gray-200 rounded animate-pulse mb-6 w-1/4"></div>
          <div className="h-40 bg-gray-200 rounded animate-pulse mb-6"></div>
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
          <div className="mt-8 flex justify-between">
            <div className="space-x-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-5 bg-gray-200 rounded animate-pulse w-24"></div>
              ))}
            </div>
          </div>
        </div>
      ) : error ? (
        /* Error state */
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 text-4xl mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-red-800 mb-2">获取文章失败</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => loadArticleDetail()} 
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            重试
          </button>
        </div>
      ) : article ? (
        /* Article content */
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          {/* Article Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-green-800 mb-4">{article.title}</h1>
            
            {/* Tags */}
            {article.tags && (
              <div className="flex flex-wrap gap-2 mb-4">
                {article.tags.split(',').map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            
            {/* Meta Info */}
            <div className="text-sm text-gray-500">
              <span>发布日期: {formatDate(article.publishedAt)}</span>
            </div>
          </div>

          {/* Cover Image */}
          {article.coverImage && (
            <div className="mb-8">
              <img
                src={`/api/uploads/${article.coverImage.includes('uploads/') ? article.coverImage.split('uploads/')[1] : article.coverImage}`}
                alt={article.title}
                className="w-full h-auto object-cover rounded-lg shadow-md"
                loading="lazy"
              />
            </div>
          )}

          {/* Article Content */}
          <div className="prose max-w-none mb-8">
            <style>{`
              .article-content-html, .article-content-markdown {
                line-height: 1.8;
              }
              .article-content-html p, .article-content-markdown p {
                margin-bottom: 1rem;
              }
              .article-content-html p:last-child, .article-content-markdown p:last-child {
                margin-bottom: 0;
              }
              .article-content-html h1, .article-content-html h2, .article-content-html h3,
              .article-content-html h4, .article-content-html h5, .article-content-html h6,
              .article-content-markdown h1, .article-content-markdown h2, .article-content-markdown h3,
              .article-content-markdown h4, .article-content-markdown h5, .article-content-markdown h6 {
                margin-top: 1.5rem;
                margin-bottom: 1rem;
                font-weight: bold;
              }
              .article-content-html h1, .article-content-markdown h1 {
                font-size: 2rem;
                border-bottom: 2px solid #e5e7eb;
                padding-bottom: 0.5rem;
              }
              .article-content-html h2, .article-content-markdown h2 {
                font-size: 1.5rem;
                border-bottom: 1px solid #e5e7eb;
                padding-bottom: 0.3rem;
              }
              .article-content-html h3, .article-content-markdown h3 {
                font-size: 1.25rem;
              }
              .article-content-html ul, .article-content-html ol,
              .article-content-markdown ul, .article-content-markdown ol {
                margin: 1rem 0;
                padding-left: 2rem;
              }
              .article-content-html li, .article-content-markdown li {
                margin: 0.5rem 0;
              }
              .article-content-html img, .article-content-markdown img {
                max-width: 100%;
                height: auto;
                margin: 1rem 0;
                border-radius: 0.5rem;
              }
              .article-content-html a, .article-content-markdown a {
                color: #059669;
                text-decoration: underline;
              }
              .article-content-html a:hover, .article-content-markdown a:hover {
                color: #047857;
              }
              .article-content-html code, .article-content-markdown code {
                background-color: #f3f4f6;
                padding: 0.2rem 0.4rem;
                border-radius: 0.25rem;
                font-family: 'Courier New', monospace;
                font-size: 0.9em;
              }
              .article-content-html pre, .article-content-markdown pre {
                background-color: #1f2937;
                color: #f9fafb;
                padding: 1rem;
                border-radius: 0.5rem;
                overflow-x: auto;
                margin: 1rem 0;
              }
              .article-content-html pre code, .article-content-markdown pre code {
                background-color: transparent;
                color: inherit;
                padding: 0;
              }
              .article-content-html blockquote, .article-content-markdown blockquote {
                border-left: 4px solid #059669;
                padding-left: 1rem;
                margin: 1rem 0;
                font-style: italic;
                color: #6b7280;
                background-color: #f9fafb;
                padding: 1rem;
                border-radius: 0.25rem;
              }
              .article-content-markdown table {
                width: 100%;
                border-collapse: collapse;
                margin: 1rem 0;
              }
              .article-content-markdown table th,
              .article-content-markdown table td {
                border: 1px solid #e5e7eb;
                padding: 0.5rem;
                text-align: left;
              }
              .article-content-markdown table th {
                background-color: #f3f4f6;
                font-weight: bold;
              }
              .article-content-markdown hr {
                border: none;
                border-top: 2px solid #e5e7eb;
                margin: 2rem 0;
              }
            `}</style>
            {article.content ? (() => {
              // Check if content already contains HTML tags
              const hasHtml = /<[^>]+>/.test(article.content);
              
              if (hasHtml) {
                // If content contains HTML, render it directly
                // The browser will handle HTML structure and segmentation
                return (
                  <div 
                    className="article-content-html text-gray-700"
                    dangerouslySetInnerHTML={{ __html: article.content }}
                  />
                );
              } else {
                // For non-HTML content, render as Markdown
                // Markdown can handle both markdown syntax and plain text gracefully
                return (
                  <div className="article-content-markdown text-gray-700">
                    <ReactMarkdown>{article.content}</ReactMarkdown>
                  </div>
                );
              }
            })() : (
              <p className="text-gray-500">暂无内容</p>
            )}
          </div>

          {/* Stats */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2 text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>浏览: {article.viewCount}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <button
                  onClick={handleLike}
                  disabled={isLiking}
                  className={`flex items-center gap-2 ${isLiked ? 'text-red-500' : 'text-gray-600'} hover:text-red-500 transition-colors`}
                >
                  <svg className="w-5 h-5" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span>{isLiking ? '...' : likeCount}</span>
                </button>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
             
              </div>
              <div className="flex items-center gap-2 text-gray-600">
              </div>
            </div>
          </div>

          {/* Comment Component */}
          <ArticleCommentComponent articleId={article.id} />
        </div>
      ) : (
        /* Not Found */
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <div className="text-gray-400 text-4xl mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.152 19.128a3 3 0 002.694 0M12 15.914a3 3 0 100-5.829m0 0L9.152 8.872a3 3 0 00-2.694 0M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">文章未找到</h3>
          <p className="text-gray-600 mb-4">
            抱歉，您请求的文章不存在或已被删除。
          </p>
          <Link 
            to="/professional-articles" 
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            返回文章列表
          </Link>
        </div>
      )}
    </div>
  );
};

export default ArticleDetailPage;