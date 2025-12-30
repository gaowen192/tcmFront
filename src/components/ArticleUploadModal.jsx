import React, { useState } from 'react';
import api from '../services/api';

const ArticleUploadModal = ({ isOpen, onClose, onSuccess, article }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [tags, setTags] = useState('');
  const [coverImage, setCoverImage] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 设置初始值，如果是编辑模式
  React.useEffect(() => {
    if (isOpen && article) {
      setTitle(article.title || '');
      setContent(article.content || '');
      setCategoryId(article.categoryId ? article.categoryId.toString() : '');
      setTags(article.tags || '');
      setCoverImage(null);
      setCoverImagePreview(article.coverImage || '');
    } else if (isOpen) {
      // 重置表单
      setTitle('');
      setContent('');
      setCategoryId('');
      setTags('');
      setCoverImage(null);
      setCoverImagePreview('');
    }
  }, [isOpen, article]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate form
    if (!title.trim()) {
      setError('文章标题不能为空');
      setLoading(false);
      return;
    }

    if (!content.trim()) {
      setError('文章内容不能为空');
      setLoading(false);
      return;
    }

    if (!categoryId.trim()) {
      setError('分类ID不能为空');
      setLoading(false);
      return;
    }

    const userId = api.getCurrentUserId();
    if (!userId) {
      setError('用户未登录');
      setLoading(false);
      return;
    }

    try {
      // Create FormData for multipart upload
      const formData = new FormData();
      
      // Append individual fields as form parameters
      if (article?.id) {
        formData.append('id', article.id);
      }
      formData.append('title', title);
      formData.append('content', content);
      formData.append('userId', parseInt(userId));
      formData.append('userName', localStorage.getItem('username') || 'unknown');
      formData.append('categoryId', parseInt(categoryId));
      formData.append('tags', tags);
      
      // Optional fields with default values
      formData.append('viewCount', article ? article.viewCount || 0 : 0);
      formData.append('likeCount', article ? article.likeCount || 0 : 0);
      formData.append('commentCount', article ? article.commentCount || 0 : 0);
      formData.append('collectCount', article ? article.collectCount || 0 : 0);
      formData.append('authorIp', '');
      formData.append('status', 1);
      formData.append('isHot', article ? article.isHot || false : false);
      formData.append('isRecommended', article ? article.isRecommended || false : false);
      formData.append('seoTitle', title);
      formData.append('seoKeywords', tags);
      formData.append('seoDescription', content.substring(0, 100) + '...');
      
      // Date fields
      if (article?.createdAt) {
        formData.append('createdAt', article.createdAt);
      }
      formData.append('updatedAt', new Date().toISOString());
      if (article?.publishedAt) {
        formData.append('publishedAt', article.publishedAt);
      } else {
        formData.append('publishedAt', new Date().toISOString());
      }
      
      // Append file if exists
      if (coverImage) {
        formData.append('file', coverImage);
      }

      let result;
      // 根据是否有article参数决定是更新还是上传
      if (article) {
        result = await api.updateArticle(article.id, formData);
        console.log('=============== Article update successful:', result);
      } else {
        result = await api.uploadArticle(formData);
        console.log('=============== Article upload successful:', result);
      }
      
      // Reset form
      setTitle('');
      setContent('');
      setCategoryId('');
      setTags('');
      setCoverImage(null);
      setCoverImagePreview('');
      
      // Call success callback with the article data
      if (onSuccess) {
        onSuccess(result.data);
      }
      
      // Close modal
      onClose();
    } catch (err) {
      console.error(article ? '=============== Article update failed:' : '=============== Article upload failed:', err);
      setError(err.message || (article ? '文章更新失败，请重试' : '文章上传失败，请重试'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl my-8 mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{article ? '更新文章' : '上传文章'}</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              文章标题 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="输入文章标题"
              maxLength={100}
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              文章内容 <span className="text-red-500">*</span>
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="输入文章内容"
              rows={6}
              maxLength={5000}
            />
          </div>

          <div>
            <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">
              分类ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="categoryId"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="输入分类ID"
              maxLength={10}
            />
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
              文章标签
            </label>
            <input
              type="text"
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="输入文章标签，用逗号分隔"
              maxLength={100}
            />
          </div>

          <div>
            <label htmlFor="coverImage" className="block text-sm font-medium text-gray-700 mb-1">
              文章封面图片
            </label>
            <div className="mt-1 flex items-center gap-4">
              {coverImagePreview && (
                <div className="w-24 h-24 bg-gray-100 rounded-md overflow-hidden">
                  <img 
                    src={coverImagePreview} 
                    alt="Cover image preview" 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <input
                type="file"
                id="coverImage"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  setCoverImage(file);
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setCoverImagePreview(reader.result);
                    };
                    reader.readAsDataURL(file);
                  } else {
                    setCoverImagePreview('');
                  }
                }}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">上传图片用于文章封面</p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              disabled={loading}
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
              disabled={loading}
            >
              {loading ? (article ? '更新中...' : '上传中...') : (article ? '更新文章' : '上传文章')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ArticleUploadModal;