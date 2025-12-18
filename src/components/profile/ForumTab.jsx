import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import PostModal from '../PostModal';

const ForumTab = ({ currentPage, setCurrentPage, setTotalPages, setTotalItems, itemsPerPage }) => {
  const [userForumPosts, setUserForumPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);

  // Handle edit post
  const handleEditPost = (post) => {
    console.log('=============== Edit post:', post);
    setEditingPost(post);
    setIsEditModalOpen(true);
  };

  // Handle edit post submit
  const handleEditPostSubmit = async (updatedPostData) => {
    console.log('=============== Edit post submit:', updatedPostData);
    try {
      setIsLoading(true);
      
      // Prepare post data for update
      const postData = {
        ...updatedPostData,
        id: editingPost.id,
        userId: editingPost.userId,
        categoryId: editingPost.categoryId || 0,
        viewCount: editingPost.viewCount || 0,
        replyCount: editingPost.replyCount || 0,
        likeCount: editingPost.likeCount || 0,
        collectCount: editingPost.collectCount || 0,
        isTop: editingPost.isTop || 0,
        isEssence: editingPost.isEssence || 0,
        isHot: editingPost.isHot || 0,
        status: editingPost.status || 0,
        createdAt: editingPost.createdAt,
        updatedAt: new Date().toISOString(),
        lastReplyTime: editingPost.lastReplyTime || new Date().toISOString()
      };
      
      // Call update post API
      const response = await api.updatePost(editingPost.id, postData);
      console.log('=============== Edit post response:', response);
      
      // Update the post in the state
      setUserForumPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === editingPost.id ? response : post
        )
      );
      
      // Close the modal
      setIsEditModalOpen(false);
      setEditingPost(null);
    } catch (err) {
      console.error('=============== Failed to update post:', err);
      setError('更新帖子失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user forum posts
  const fetchUserForumPosts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('=============== Calling getUserForumPosts...');
      const isLoggedIn = api.isLoggedIn();
      console.log('=============== Is user logged in:', isLoggedIn);
      
      if (!isLoggedIn) {
        console.error('=============== User not logged in');
        setError('请先登录');
        setUserForumPosts([]);
        setTotalPages(0);
        setTotalItems(0);
        return;
      }
      
      // 使用1-based页码调用API
      const response = await api.getUserForumPosts(currentPage, itemsPerPage);
      console.log('=============== User Forum Posts Data:', response);
      
      // 根据实际API返回的数据结构调整
      if (response && response.data) {
        // 适配两种可能的数据结构：response.data.data或response.data
        const data = response.data.data || response.data;
        const posts = data.content || data;
        setUserForumPosts(Array.isArray(posts) ? posts : []);
        setTotalPages(data.totalPages || 0);
        setTotalItems(data.totalElements || 0);
        console.log('=============== Set userForumPosts with', posts.length, 'items');
        console.log('=============== Total Pages:', data.totalPages, 'Total Items:', data.totalElements);
      } else {
        console.error('=============== Invalid data format:', response);
        setUserForumPosts([]);
        setTotalPages(0);
        setTotalItems(0);
      }
    } catch (err) {
      console.error('=============== Failed to fetch user forum posts:', err);
      console.error('=============== Error details:', err.message, err.response?.data);
      setError('获取论坛帖子记录失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserForumPosts();
  }, [currentPage]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">我的论坛帖子列表</h2>
      
      {isLoading ? (
        <div className="bg-white rounded-lg p-8 text-center text-gray-500 border border-gray-100">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mb-2"></div>
          <p>加载论坛帖子列表中...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 rounded-lg p-8 text-center text-red-500 border border-red-100">
          <p>{error}</p>
          <button 
            onClick={fetchUserForumPosts}
            className="mt-3 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
          >
            重试
          </button>
        </div>
      ) : userForumPosts.length > 0 ? (
        <div className="space-y-4">
          {userForumPosts.map((post) => (
            <div key={post.id} className="bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-4">
                {/* 帖子标题 */}
                <Link to={`/post/${post.id}`} className="block">
                  <h3 className="text-lg font-semibold text-gray-800 hover:text-green-600 transition-colors">
                    {post.title}
                  </h3>
                </Link>
                
                {/* 帖子内容预览 */}
                <div className="mt-2 text-sm text-gray-600 line-clamp-3">
                  {post.content.replace(/<[^>]*>/g, '').substring(0, 200)}...
                </div>
                
                {/* 帖子标签 */}
                {post.tags && post.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {post.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                
                {/* 帖子统计信息 */}
                <div className="flex justify-between items-center mt-4 text-xs text-gray-500">
                  <div>
                    <span className="mr-4">发布日期: {new Date(post.createdAt).toLocaleDateString('zh-CN')}</span>
                    <span className="mr-4">回复数: {post.replyCount || 0}</span>
                    <span>浏览量: {post.viewCount || 0}</span>
                  </div>
                </div>
                
                {/* 操作按钮 */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link 
                    to={`/post/${post.id}`}
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md transition-colors"
                  >
                    查看详情
                  </Link>
                  <button 
                    onClick={() => handleEditPost(post)}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors"
                  >
                    修改
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500 border border-gray-100">
          暂无论坛帖子记录
        </div>
      )}

      {/* Edit Post Modal */}
      <PostModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingPost(null);
        }}
        onSubmit={handleEditPostSubmit}
        initialData={editingPost}
      />
    </div>
  );
};

export default ForumTab;