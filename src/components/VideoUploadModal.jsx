import React, { useState } from 'react';
import api from '../services/api';

const VideoUploadModal = ({ isOpen, onClose, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [tags, setTags] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate form
    if (!title.trim()) {
      setError('视频标题不能为空');
      setLoading(false);
      return;
    }

    if (!categoryId.trim()) {
      setError('板块ID不能为空');
      setLoading(false);
      return;
    }

    if (!videoFile) {
      setError('视频文件不能为空');
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
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', videoFile);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('userId', userId);
      formData.append('categoryId', categoryId);
      formData.append('tags', tags);
      if (thumbnail) {
        formData.append('thumbnail', thumbnail);
      }

      // Upload video
      const result = await api.uploadVideo(formData);
      console.log('=============== Video upload successful:', result);
      
      // Reset form
      setTitle('');
      setDescription('');
      setCategoryId('');
      setTags('');
      setVideoFile(null);
      setThumbnail(null);
      
      // Call success callback
      if (onSuccess) {
        onSuccess(result);
      }
      
      // Close modal
      onClose();
    } catch (err) {
      console.error('=============== Video upload failed:', err);
      setError(err.message || '视频上传失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleVideoFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
    }
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnail(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl my-8 mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">上传视频</h2>
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
              视频标题 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="输入视频标题"
              maxLength={100}
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              视频描述
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="输入视频描述"
              rows={3}
              maxLength={500}
            />
          </div>

          <div>
            <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">
              板块ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="categoryId"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="输入板块ID"
              maxLength={10}
            />
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
              视频标签
            </label>
            <input
              type="text"
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="输入视频标签，用逗号分隔"
              maxLength={100}
            />
          </div>

          <div>
            <label htmlFor="videoFile" className="block text-sm font-medium text-gray-700 mb-1">
              视频文件 <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              id="videoFile"
              accept="video/*"
              onChange={handleVideoFileChange}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {videoFile && (
              <p className="mt-1 text-sm text-gray-500">已选择文件: {videoFile.name}</p>
            )}
          </div>

          <div>
            <label htmlFor="thumbnail" className="block text-sm font-medium text-gray-700 mb-1">
              视频封面图片
            </label>
            <input
              type="file"
              id="thumbnail"
              accept="image/*"
              onChange={handleThumbnailChange}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
            />
            {thumbnail && (
              <p className="mt-1 text-sm text-gray-500">已选择封面: {thumbnail.name}</p>
            )}
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
              {loading ? '上传中...' : '上传视频'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VideoUploadModal;