import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api, { likeVideo } from '../services/api';

// Video card component to prevent re-rendering of existing cards
const VideoCard = React.memo(({ video }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(video.likeCount || 0);

  // Handle like button click
  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      // Check if user is logged in
      if (!api.isLoggedIn()) {
        alert('请先登录');
        return;
      }

      // Call like video API
      await likeVideo(video.id);
      
      // Update local state
      setIsLiked(true);
      setLikeCount(prevCount => prevCount + 1);
    } catch (error) {
      if (error.code === 401) {
        alert('请先登录');
      } else {
        console.error('Failed to like video:', error);
        alert('点赞失败，请稍后重试');
      }
    }
  };

  return (
    <div className="bg-white border border-green-100 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow video-card">
      <div className="relative h-48 bg-gray-100">
        {video.thumbnailPath ? (
          <img 
            src={`/api/uploads/${video.thumbnailPath.includes('uploads/') ? video.thumbnailPath.split('uploads/')[1] : video.thumbnailPath}`} 
            alt={video.title} 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-16 h-16 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-3">
          <div className="text-white text-xs bg-black/60 px-2 py-1 rounded">
            播放量: {video.viewCount}
          </div>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-gray-800 mb-2 line-clamp-2">{video.title}</h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-3">{video.description}</p>
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>发布于: {new Date(video.createdAt).toLocaleDateString('zh-CN')}</span>
          <div className="flex items-center space-x-3">
            <button 
              onClick={handleLike}
              className={`flex items-center ${isLiked ? 'text-red-500' : 'text-gray-500'} hover:text-red-500 transition-colors`}
              aria-label="点赞"
            >
              <svg className="w-3 h-3 mr-1" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
              {likeCount}
            </button>
            <span className="flex items-center">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              {video.commentCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

const VideoList = React.memo(({ columns = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' }) => {
  const { t } = useTranslation();
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize] = useState(10);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef(null);
  const lastVideoRef = useRef(null);
  const videosGridRef = useRef(null);
  
  // Fetch videos from API
  const fetchVideos = useCallback(async () => {
    // Check if we're already loading or have no more videos
    if (isLoading || !hasMore) return;
    
    setIsLoading(true);
    try {
        console.log('=============== Fetching videos page:', currentPage);
        const response = await api.getVideos(currentPage, pageSize, 1);
        console.log('=============== Video data received:', response);
        
        // 适配 API 返回结构，确保能获取到正确的视频数据
        if (response && response.code === 200) {
          const videos = response.data?.content || response.data?.videos || [];
          setVideos(prevVideos => currentPage === 1 ? videos : [...prevVideos, ...videos]);
          const totalPages = response.data?.totalPages || 0;
          setTotalPages(totalPages);
          // 适配不同的 API 返回结构来检查是否有更多数据
          setHasMore(currentPage < totalPages);
        } else {
          setHasMore(false);
        }
      } catch (error) {
      console.error('=============== Error fetching videos:', error);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize]); // Removed isLoading and hasMore from dependencies
  
  // Initial fetch
  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);
  
  // Fetch next page when currentPage changes
  useEffect(() => {
    // Don't fetch on initial load (currentPage 0 is handled by the first useEffect)
    if (currentPage > 0) {
      fetchVideos();
    }
  }, [currentPage, fetchVideos]);
  
  // Intersection Observer for infinite scrolling
  useEffect(() => {
    // Only create observer if we have videos to observe and we're not on the initial page
    if (!hasMore || isLoading || videos.length === 0) return;
    
    // Create a dedicated loading trigger element at the bottom
    const loadingTrigger = document.createElement('div');
    loadingTrigger.className = 'loading-trigger';
    loadingTrigger.style.height = '200px'; // Add a buffer area
    loadingTrigger.style.width = '100%';
    
    // Append to the videos grid container using the ref
    if (videosGridRef.current) {
      videosGridRef.current.parentNode.appendChild(loadingTrigger);
    } else {
      // Fallback if ref is not available
      const videosContainer = document.querySelector('.video-card:last-child').closest('.grid');
      if (videosContainer) {
        videosContainer.parentNode.appendChild(loadingTrigger);
      } else {
        console.log('=============== Could not find videos container');
        return;
      }
    }
    
    const observer = new IntersectionObserver(
      entries => {
        // Only load more if the trigger element is visible and we're not already loading
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          setCurrentPage(prevPage => prevPage + 1);
        }
      },
      { threshold: 0.1 }
    );
    
    // Observe the dedicated trigger element
    observer.observe(loadingTrigger);
    
    return () => {
      observer.unobserve(loadingTrigger);
      // Remove the trigger element when component unmounts or dependencies change
      if (loadingTrigger.parentNode) {
        loadingTrigger.parentNode.removeChild(loadingTrigger);
      }
    };
  }, [hasMore, isLoading, videos.length]); // Added videos.length to dependencies

  return (
    <div className="mb-10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">{t('home.tcm.tcmVideoList')}</h2>
        <span className="text-sm text-gray-500">
          共 {totalPages} 页，已加载 {videos.length} 个视频
        </span>
      </div>
      
      {videos.length > 0 ? (
        <div>
          <div ref={videosGridRef} className={`grid ${columns} gap-6`}>
            {videos.map((video, index) => (
              <Link key={`${video.id}-${index}`} to={`/video/${video.id}`} className="block hover:no-underline">
                <VideoCard video={video} />
              </Link>
            ))}
          </div>
          
          {/* Infinite scroll loading indicator */}
          {isLoading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <p className="mt-2 text-gray-600">加载更多视频...</p>
            </div>
          )}
        </div>
      ) : isLoading ? (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <p className="mt-2 text-gray-600">加载视频中...</p>
        </div>
      ) : (
        <div className="bg-white border border-green-100 rounded-lg p-10 text-center">
          <p className="text-gray-500">暂无视频</p>
        </div>
      )}
      
      {/* No more videos message */}
      {!hasMore && videos.length > 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">已加载全部视频</p>
        </div>
      )}
    </div>
  );
});

export default VideoList;