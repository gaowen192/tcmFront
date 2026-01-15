import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import api from '../services/api';

const PostVersionDetailModal = ({ isOpen, onClose, postId, version }) => {
  const [versionData, setVersionData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch specific version data when modal opens or version/postId changes
  useEffect(() => {
    if (isOpen && postId && version) {
      fetchVersionData();
    }
  }, [isOpen, postId, version]);

  const fetchVersionData = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await api.getPostVersion(postId, version);
      if (response.code === 200) {
        setVersionData(response.data || null);
      } else {
        setError(response.message || 'Failed to fetch version data');
      }
    } catch (err) {
      console.error('=============== Failed to fetch post version:', err);
      setError('Failed to fetch version data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl my-8 mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">版本 {version}</h2>
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

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-green-600">Loading...</div>
          </div>
        ) : !versionData ? (
          <div className="text-center py-12 text-gray-500">
            版本数据不存在
          </div>
        ) : (
          <div>
            {/* Post details */}
            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-800 mb-2">标题</h3>
              <p className="text-gray-700">{versionData.title}</p>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-800 mb-2">修改时间</h3>
              <p className="text-gray-500 text-sm">
                {new Date(versionData.historyCreatedAt).toLocaleString()}
              </p>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-800 mb-2">内容</h3>
              <div className="text-gray-700 border border-gray-100 rounded-md p-4 bg-gray-50">
                {/* Check if content already contains HTML tags */}
                {(() => {
                  const hasHtml = /<[^>]+>/.test(versionData.content);
                  
                  if (hasHtml) {
                    // If content contains HTML, render it directly
                    return (
                      <div 
                        className="post-content-html"
                        dangerouslySetInnerHTML={{ __html: versionData.content }}
                      />
                    );
                  } else {
                    // Render Markdown content
                    return <ReactMarkdown>{versionData.content}</ReactMarkdown>;
                  }
                })()}
              </div>
            </div>

            {/* Post tags */}
            {versionData.tags && versionData.tags.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-2">标签</h3>
                <div className="flex flex-wrap gap-2">
                  {typeof versionData.tags === 'string' ? (
                    versionData.tags.split(',').map((tag, index) => (
                      <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                        {tag.trim()}
                      </span>
                    ))
                  ) : versionData.tags.map((tag, index) => (
                    <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <button 
                onClick={onClose} 
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostVersionDetailModal;