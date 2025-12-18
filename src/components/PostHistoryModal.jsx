import React, { useState, useEffect } from 'react';
import api from '../services/api';

const PostHistoryModal = ({ isOpen, onClose, postId, onViewVersion }) => {
  const [histories, setHistories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch post histories when modal opens or postId changes
  useEffect(() => {
    if (isOpen && postId) {
      fetchHistories();
    }
  }, [isOpen, postId]);

  const fetchHistories = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await api.getPostHistories(postId);
      if (response.code === 200) {
        setHistories(response.data || []);
      } else {
        setError(response.message || 'Failed to fetch histories');
      }
    } catch (err) {
      console.error('=============== Failed to fetch post histories:', err);
      setError('Failed to fetch histories. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl my-8 mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">修改历史</h2>
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
        ) : histories.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            暂无修改历史
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            <ul className="divide-y divide-gray-200">
              {histories.map((history) => (
                <li key={history.id} className="py-4">
                  <button
                    onClick={() => onViewVersion(history.version)}
                    className="w-full text-left hover:bg-gray-50 p-3 rounded-md transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-lg text-blue-600">版本 {history.version}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(history.historyCreatedAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-gray-700 mb-1 line-clamp-1">
                      {history.title}
                    </div>
                    <div className="text-sm text-gray-500 line-clamp-2">
                      {history.content}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex justify-end mt-6">
          <button 
            onClick={onClose} 
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostHistoryModal;