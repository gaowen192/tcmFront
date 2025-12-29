import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import PostHistoryModal from '../components/PostHistoryModal';
import PostVersionDetailModal from '../components/PostVersionDetailModal';

const PostDetailPage = () => {
  const { t } = useTranslation();
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isCommentLoading, setIsCommentLoading] = useState(false);
  const [error, setError] = useState(null);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [commentsPerPage] = useState(10);
  const [totalComments, setTotalComments] = useState(0);
  // History modal states
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState(null);

  // No need for useEffect to check login status anymore - we'll use api methods directly

  // Fetch post details and comments
  useEffect(() => {
    const fetchPostDetails = async () => {
      try {
        setIsPageLoading(true);
        setError('');
        
        // Fetch post details
        console.log('=============== Fetching post details for postId:', postId);
        const postResponse = await api.get(`/tcm/posts/${postId}`);
        console.log('=============== Post API response data:', postResponse.data);
        
        // Handle API response structure similar to ForumPage
        if (postResponse.data && postResponse.data.code === 200) {
          setPost(postResponse.data.data);
        } else {
          // Handle API error response
          console.error('=============== Post API error:', postResponse.data.message);
          setError(postResponse.data.message || 'Failed to load post details');
        }
        
        // Fetch comments
        fetchComments();
      } catch (err) {
        console.error('=============== Failed to fetch post details:', err);
        setError('Failed to load post details. Please try again later.');
      } finally {
        setIsPageLoading(false);
      }
    };

    if (postId) {
      fetchPostDetails();
    }
  }, [postId]);

  // Fetch comments with pagination
  const fetchComments = async () => {
    try {
      console.log('=============== Fetching comments for postId:', postId, 'page:', currentPage);
      const commentsResponse = await api.get(`/tcm/replies/post/${postId}`, {
        params: {
          page: currentPage,
          size: commentsPerPage
        }
      });
      console.log('=============== Comments API response data:', commentsResponse.data);
      
      // Handle API response structure
      if (commentsResponse.data && commentsResponse.data.code === 200) {
        // Comments are in data.content with pagination info
        // Reverse the comments array to show newest first
        const fetchedComments = commentsResponse.data.data.content || [];
        setComments(fetchedComments.reverse());
        // Update total comments count for pagination
        setTotalComments(commentsResponse.data.data.totalElements || 0);
      } else {
        // Handle API error response
        console.error('=============== Comments API error:', commentsResponse.data.message);
        setComments([]);
        setTotalComments(0);
      }
    } catch (err) {
      console.error('=============== Failed to fetch comments:', err);
      setComments([]);
      setTotalComments(0);
    }
  };

  // Fetch comments when currentPage changes
  useEffect(() => {
    if (postId) {
      fetchComments();
    }
  }, [currentPage, postId]);

  // Handle comment submission
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim()) {
      alert('Please enter a comment');
      return;
    }

    if (!api.isLoggedIn()) {
      alert('Please login to comment');
      return;
    }

    try {
      setIsCommentLoading(true);
      const userId = api.getCurrentUserId();
      
      console.log('=============== Submitting comment for postId:', postId, 'userId:', userId);
      const response = await api.post(`/tcm/replies`, {
        id: 0,
        postId: postId,
        userId: userId,
        parentId: 0,
        replyToUserId: 0,
        content: newComment
      });
      
      console.log('=============== Comment API response:', response.data);
      
      // Handle API response structure
      if (response.data && response.data.code === 200) {
        // When a new comment is added, reset to page 1 to show the new comment
        setCurrentPage(1);
        // Add new comment to the beginning of the list
        setComments([response.data.data, ...comments]);
        setNewComment('');
        // Update total comments count
        setTotalComments(prev => prev + 1);
        // Comment count is now managed by comments.length, no need to update post.replyCount
        
        console.log('=============== Comment submitted successfully');
      } else {
        console.error('=============== Comment submission error:', response.data.message);
        alert(response.data.message || 'Failed to submit comment. Please try again later.');
      }
    } catch (err) {
      console.error('=============== Failed to submit comment:', err);
      alert('Failed to submit comment. Please try again later.');
    } finally {
      setIsCommentLoading(false);
    }
  };

  // Handle comment deletion
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      console.log('=============== Deleting comment with id:', commentId);
      const response = await api.delete(`/tcm/replies/${commentId}`);
      console.log('=============== Delete comment API response:', response.data);

      // Handle API response structure
      if (response.data && response.data.code === 200) {
        // Update comments list to remove deleted comment
        setComments(comments.filter(comment => comment.id !== commentId));
        // Decrement total comments count
        setTotalComments(prev => Math.max(0, prev - 1));
        
        // If we're on a page with no comments left, go to previous page
        if (comments.length === 1 && currentPage > 1) {
          setCurrentPage(prev => prev - 1);
        }
        
        console.log('=============== Comment deleted successfully');
      } else {
        console.error('=============== Delete comment API error:', response.data.message);
        alert(response.data.message || 'Failed to delete comment. Please try again later.');
      }
    } catch (err) {
      console.error('=============== Failed to delete comment:', err);
      alert('Failed to delete comment. Please try again later.');
    }
  };

  // Handle view version
  const handleViewVersion = (version) => {
    setSelectedVersion(version);
    setIsVersionModalOpen(true);
    setIsHistoryModalOpen(false);
  };

  if (isPageLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-green-600">Loading...</div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-6">
          {error || 'Post not found'}
        </div>
        <Link to="/forum" className="text-green-600 hover:text-green-800">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-1"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          Back to Forum
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button */}
      <Link to="/forum" className="text-green-600 hover:text-green-800 mb-6 inline-block">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-1"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
        Back to Forum
      </Link>

      {/* Post details */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-800">
            {post.title}
            {post.isUpdated === 1 && (
              <span className="ml-3 text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">已修改</span>
            )}
          </h1>
          {post.isUpdated === 1 && (
            <button
              onClick={() => setIsHistoryModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-all flex items-center gap-2 text-sm"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
              查看修改历史
            </button>
          )}
        </div>
        
        <div className="flex items-center text-sm text-gray-500 mb-6">
          <div className="flex items-center mr-4">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            {new Date(post.createdAt).toLocaleDateString()}
          </div>
          <div className="flex items-center mr-4">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
            用户{post.userId}
          </div>
          <div className="flex items-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
            {comments.length} comments
          </div>
        </div>

        <div className="prose max-w-none text-gray-700">
          <style>{`
            .post-content-html {
              line-height: 1.8;
            }
            .post-content-html p {
              margin-bottom: 1rem;
            }
            .post-content-html p:last-child {
              margin-bottom: 0;
            }
            .post-content-html h1, .post-content-html h2, .post-content-html h3,
            .post-content-html h4, .post-content-html h5, .post-content-html h6 {
              margin-top: 1.5rem;
              margin-bottom: 1rem;
              font-weight: bold;
            }
            .post-content-html ul, .post-content-html ol {
              margin: 1rem 0;
              padding-left: 2rem;
            }
            .post-content-html li {
              margin: 0.5rem 0;
            }
            .post-content-html img {
              max-width: 100%;
              height: auto;
              margin: 1rem 0;
            }
            .post-content-html a {
              color: #059669;
              text-decoration: underline;
            }
            .post-content-html a:hover {
              color: #047857;
            }
            .post-content-html code {
              background-color: #f3f4f6;
              padding: 0.2rem 0.4rem;
              border-radius: 0.25rem;
              font-family: monospace;
            }
            .post-content-html pre {
              background-color: #f3f4f6;
              padding: 1rem;
              border-radius: 0.5rem;
              overflow-x: auto;
              margin: 1rem 0;
            }
            .post-content-html blockquote {
              border-left: 4px solid #059669;
              padding-left: 1rem;
              margin: 1rem 0;
              font-style: italic;
              color: #6b7280;
            }
          `}</style>
          {post.content ? (() => {
            // Check if content already contains HTML tags
            const hasHtml = /<[^>]+>/.test(post.content);
            
            if (hasHtml) {
              // If content contains HTML, render it directly
              // The browser will handle HTML structure and segmentation
              return (
                <div 
                  className="post-content-html"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
              );
            } else {
              // If plain text, split by double newlines for paragraphs
              const segments = post.content.split(/\n\s*\n/).filter(segment => segment.trim());
              
              return segments.map((segment, index) => (
                <p 
                  key={index} 
                  className="mb-4 last:mb-0"
                  dangerouslySetInnerHTML={{ 
                    __html: segment.trim().replace(/\n/g, '<br>') 
                  }}
                />
              ));
            }
          })() : (
            <p className="text-gray-500">暂无内容</p>
          )}
        </div>

        {/* Post tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {typeof post.tags === 'string' ? (
              post.tags.split(',').map((tag, index) => (
                <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                  {tag.trim()}
                </span>
              ))
            ) : post.tags.map((tag, index) => (
              <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Comments section */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Comments ({comments.length})</h2>

        {/* Comment input form */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Leave a Comment</h3>
          <form onSubmit={handleCommentSubmit}>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write your comment..."
              className="w-full px-4 py-3 border border-green-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white shadow-sm mb-4"
              rows={4}
            ></textarea>
            {!api.isLoggedIn() && (
              <p className="text-sm text-gray-500 mb-4">You need to be logged in to comment.</p>
            )}
            <button
              type="submit"
              className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-all shadow-sm flex items-center gap-2"
              disabled={!newComment.trim() || isCommentLoading}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>
              Submit Comment
            </button>
          </form>
        </div>

        {/* Comments list */}
        <div className="space-y-6">
          {comments.length === 0 ? (
            <p className="text-gray-500">No comments yet. Be the first to comment!</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} id={`comment-${comment.id}`} className="border-b border-gray-200 pb-4 last:border-b-0">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                    {comment.avatar ? (
                      <img 
                        src={comment.avatar}
                        alt={comment.author}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.parentNode.replaceChild(
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-500 text-xs">👤</span>
                            </div>,
                            e.target
                          );
                        }}
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500 text-xs">👤</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-gray-700">{comment.author}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleDateString()}</span>
                        {api.getCurrentUserId() && comment.userId === parseInt(api.getCurrentUserId()) && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="bg-red-100 hover:bg-red-200 text-red-700 text-xs px-3 py-1 rounded-md transition-all border border-red-200 flex items-center gap-1"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              <line x1="10" y1="11" x2="10" y2="17"></line>
                              <line x1="14" y1="11" x2="14" y2="17"></line>
                            </svg>
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-600">{comment.content}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination controls */}
        {totalComments > commentsPerPage && (
          <div className="mt-8 flex justify-center">
            <nav className="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="bg-gray-50 hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-md transition-all border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
                Previous
              </button>
              <span className="px-4 py-2 text-gray-700 font-medium bg-white rounded-md">
                Page {currentPage} of {Math.ceil(totalComments / commentsPerPage)}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(totalComments / commentsPerPage)))}
                disabled={currentPage * commentsPerPage >= totalComments}
                className="bg-gray-50 hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-md transition-all border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                Next
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* Post history modal */}
      <PostHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        postId={postId}
        onViewVersion={handleViewVersion}
      />

      {/* Post version detail modal */}
      <PostVersionDetailModal
        isOpen={isVersionModalOpen}
        onClose={() => setIsVersionModalOpen(false)}
        postId={postId}
        version={selectedVersion}
      />
    </div>
  );
};

export default PostDetailPage;
