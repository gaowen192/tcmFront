import React, { useState, useEffect } from 'react';

const PostModal = ({ isOpen, onClose, onSubmit, initialData = null }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [tags, setTags] = useState(initialData?.tags ? initialData.tags.join(',') : '');
  const [category, setCategory] = useState(initialData?.category || '');
  const [error, setError] = useState('');

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setContent(initialData.content || '');
      setTags(initialData.tags ? initialData.tags.join(',') : '');
      setCategory(initialData.category || '');
    } else {
      setTitle('');
      setContent('');
      setTags('');
      setCategory('');
    }
    setError('');
  }, [initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validate form
    if (!title.trim()) {
      setError('Please enter a post title');
      return;
    }

    if (!content.trim()) {
      setError('Please enter post content');
      return;
    }

    // Prepare post data
    const postData = {
      title,
      content,
      tags: tags.trim(),
      category: category.trim()
    };

    // Call the onSubmit callback with post data
    onSubmit(postData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl my-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{initialData ? 'Edit Post' : 'Create New Post'}</h2>
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

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter post title"
              maxLength={100}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <input
              type="text"
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter post category"
              maxLength={50}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              Content
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter post content"
              rows={8}
              minLength={10}
            ></textarea>
          </div>

          <div className="mb-6">
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter tags separated by commas (e.g., health, wellness, nutrition)"
            />
          </div>

          <div className="flex justify-end">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 mr-2 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Publish Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostModal;